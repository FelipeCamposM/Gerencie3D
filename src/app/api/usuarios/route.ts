import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET - Listar usuários
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");

    const usuarios = await db.usuario.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        primeiroNome: true,
        ultimoNome: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        primeiroNome: "asc",
      },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}

// POST - Criar usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { primeiroNome, ultimoNome, email, password, role } = body;

    // Validação de campos obrigatórios
    if (!primeiroNome || !ultimoNome || !email || !password) {
      return NextResponse.json(
        {
          error:
            "Campos obrigatórios: primeiroNome, ultimoNome, email, password",
        },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingUser = await db.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "E-mail já está em uso" },
        { status: 400 }
      );
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(password, 10);

    // Criar usuário
    const usuario = await db.usuario.create({
      data: {
        primeiroNome,
        ultimoNome,
        email,
        senhaHash,
        role: role || "user",
      },
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

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
