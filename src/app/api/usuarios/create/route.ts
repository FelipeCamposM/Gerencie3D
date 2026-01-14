import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log("Dados recebidos para criação:", data);

    if (
      !data.primeiroNome ||
      !data.ultimoNome ||
      !data.email ||
      !data.password
    ) {
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
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "E-mail já está em uso" },
        { status: 400 }
      );
    }

    const senhaHash = await bcrypt.hash(data.password, 10);

    const newUser = await db.usuario.create({
      data: {
        primeiroNome: data.primeiroNome,
        ultimoNome: data.ultimoNome,
        email: data.email,
        senhaHash,
        role: data.role || "user",
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

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
