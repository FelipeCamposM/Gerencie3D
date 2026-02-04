import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log("Tentativa de login para:", data.email);

    if (!data.email || !data.password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar usuário pelo email
    const user = await db.usuario.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
        primeiroNome: true,
        ultimoNome: true,
        email: true,
        role: true,
        senhaHash: true,
        imagemUsuario: true,
        impressoesRealizadas: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email ou senha inválidos" },
        { status: 401 }
      );
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(data.password, user.senhaHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email ou senha inválidos" },
        { status: 401 }
      );
    }

    // Gerar token JWT com expiração maior
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: `${user.primeiroNome} ${user.ultimoNome}`,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" } // 1 dia ao invés de 24h
    );

    // Retornar dados do usuário (sem a senha) e o token
    const userResponse = {
      id: user.id,
      primeiroNome: user.primeiroNome,
      ultimoNome: user.ultimoNome,
      email: user.email,
      role: user.role,
      imagemUsuario: user.imagemUsuario
        ? Buffer.from(user.imagemUsuario).toString("base64")
        : null,
      impressoesRealizadas: user.impressoesRealizadas,
      createdAt: user.createdAt.toISOString(),
    };

    const response = NextResponse.json({
      message: "Login realizado com sucesso",
      user: userResponse,
      token,
    });

    // Definir cookie com o token (7 dias)
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    });

    return response;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
