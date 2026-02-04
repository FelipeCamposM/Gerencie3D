import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

interface UserTokenPayload {
  userId: number;
  email: string;
  role: string;
  name: string;
  iat: number;
  exp: number;
}

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader
      ?.split("; ")
      .find((row) => row.startsWith("auth-token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Token não encontrado" },
        { status: 401 }
      );
    }

    // Verificar se o token é válido
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as UserTokenPayload;

    // Buscar dados atualizados do usuário no banco
    const user = await db.usuario.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        primeiroNome: true,
        ultimoNome: true,
        email: true,
        role: true,
        imagemUsuario: true,
        impressoesRealizadas: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Converter imagemUsuario de Buffer para base64 string
    const userWithImage = {
      ...user,
      imagemUsuario: user.imagemUsuario
        ? Buffer.from(user.imagemUsuario).toString("base64")
        : null,
      createdAt: user.createdAt.toISOString(),
    };

    return NextResponse.json({
      user: userWithImage,
      token,
    });
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return NextResponse.json(
      { error: "Token inválido ou expirado" },
      { status: 401 }
    );
  }
}
