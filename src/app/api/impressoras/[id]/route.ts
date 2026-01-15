import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

// GET - Buscar impressora por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const impressora = await db.impressora.findUnique({
      where: { id: parseInt(id) },
      include: {
        ultimoUsuario: {
          select: {
            id: true,
            primeiroNome: true,
            ultimoNome: true,
            email: true,
          },
        },
        ultimaImpressao: true,
        impressoes: {
          take: 10,
          orderBy: {
            dataInicio: "desc",
          },
          include: {
            usuario: {
              select: {
                id: true,
                primeiroNome: true,
                ultimoNome: true,
              },
            },
          },
        },
      },
    });

    if (!impressora) {
      return NextResponse.json(
        { error: "Impressora não encontrada" },
        { status: 404 }
      );
    }

    // Converter Bytes para base64
    const impressoraComImagem = {
      ...impressora,
      imagemImpressora: impressora.imagemImpressora
        ? `data:image/jpeg;base64,${Buffer.from(
            impressora.imagemImpressora
          ).toString("base64")}`
        : null,
    };

    return NextResponse.json(impressoraComImagem);
  } catch (error) {
    console.error("Erro ao buscar impressora:", error);
    return NextResponse.json(
      { error: "Erro ao buscar impressora" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar impressora
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Converter base64 para Buffer se houver imagem
    let imagemBuffer = undefined;
    if (data.imagemImpressora !== undefined) {
      if (data.imagemImpressora === null) {
        imagemBuffer = null;
      } else if (data.imagemImpressora) {
        // Remover o prefixo data:image/...;base64,
        const base64Data = data.imagemImpressora.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        imagemBuffer = Buffer.from(base64Data, "base64");
      }
    }

    const impressora = await db.impressora.update({
      where: { id: parseInt(id) },
      data: {
        nome: data.nome,
        modelo: data.modelo,
        localizacao: data.localizacao,
        imagemImpressora: imagemBuffer,
        gastoEnergiaKwh: data.gastoEnergiaKwh
          ? parseFloat(data.gastoEnergiaKwh)
          : undefined,
        precoEnergiaKwh: data.precoEnergiaKwh
          ? parseFloat(data.precoEnergiaKwh)
          : undefined,
        status: data.status,
        ultimoUso: data.ultimoUso ? new Date(data.ultimoUso) : undefined,
      },
    });

    return NextResponse.json(impressora);
  } catch (error) {
    console.error("Erro ao atualizar impressora:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar impressora" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar impressora (apenas admin)
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
        { error: "Configuração do servidor inválida" },
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
            "Acesso negado. Apenas administradores podem deletar impressoras.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    await db.impressora.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Impressora deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar impressora:", error);
    return NextResponse.json(
      { error: "Erro ao deletar impressora" },
      { status: 500 }
    );
  }
}
