import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";

// GET - Buscar usuário por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const usuario = await db.usuario.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        primeiroNome: true,
        ultimoNome: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        impressorasUsadas: {
          select: {
            id: true,
            nome: true,
            modelo: true,
          },
          take: 5,
          orderBy: {
            ultimoUso: "desc",
          },
        },
        filamentosComprados: {
          select: {
            id: true,
            tipo: true,
            cor: true,
            dataCompra: true,
          },
          take: 5,
          orderBy: {
            dataCompra: "desc",
          },
        },
        impressoes: {
          select: {
            id: true,
            nomeProjeto: true,
            status: true,
            dataInicio: true,
            custoTotal: true,
          },
          take: 10,
          orderBy: {
            dataInicio: "desc",
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { primeiroNome, ultimoNome, email, password, role } = body;

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID de usuário inválido" },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const usuarioExistente = await db.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Se está alterando email, verificar se já existe
    if (email && email !== usuarioExistente.email) {
      const emailEmUso = await db.usuario.findUnique({
        where: { email },
      });

      if (emailEmUso) {
        return NextResponse.json(
          { error: "E-mail já está em uso" },
          { status: 400 }
        );
      }
    }

    // Preparar dados para atualização
    const updateData: Prisma.UsuarioUpdateInput = {};
    if (primeiroNome) updateData.primeiroNome = primeiroNome;
    if (ultimoNome) updateData.ultimoNome = ultimoNome;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    // Se está alterando senha, criar novo hash
    if (password) {
      updateData.senhaHash = await bcrypt.hash(password, 10);
    }

    const usuario = await db.usuario.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        primeiroNome: true,
        ultimoNome: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar usuário (apenas admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar se o usuário é admin
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "Configuração de servidor inválida" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as unknown as {
      role: string;
    };

    if (decoded.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Acesso negado. Apenas administradores podem deletar usuários.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID de usuário inválido" },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const usuario = await db.usuario.findUnique({
      where: { id: userId },
      include: {
        impressoes: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se tem impressões associadas
    if (usuario.impressoes.length > 0) {
      return NextResponse.json(
        {
          error:
            "Não é possível deletar usuário com impressões registradas. Considere desativar o usuário.",
        },
        { status: 400 }
      );
    }

    await db.usuario.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao deletar usuário" },
      { status: 500 }
    );
  }
}
