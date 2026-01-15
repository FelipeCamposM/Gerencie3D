import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// POST - Cadastro público de usuários
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { primeiroNome, ultimoNome, email, password } = body;

    // Validação de campos obrigatórios
    if (!primeiroNome || !ultimoNome || !email || !password) {
      return NextResponse.json(
        {
          error: "Todos os campos são obrigatórios",
        },
        { status: 400 }
      );
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Validar tamanho mínimo da senha
    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingUser = await db.usuario.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(password, 10);

    // Criar usuário com role padrão "user"
    const usuario = await db.usuario.create({
      data: {
        primeiroNome: primeiroNome.trim(),
        ultimoNome: ultimoNome.trim(),
        email: email.toLowerCase().trim(),
        senhaHash,
        role: "user", // Sempre criar como usuário comum
      },
      select: {
        id: true,
        primeiroNome: true,
        ultimoNome: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Conta criada com sucesso",
        usuario: {
          id: usuario.id,
          primeiroNome: usuario.primeiroNome,
          ultimoNome: usuario.ultimoNome,
          email: usuario.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return NextResponse.json(
      { error: "Erro ao criar conta. Tente novamente." },
      { status: 500 }
    );
  }
}
