import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

interface UserTokenPayload {
  userId: number;
  email: string;
  role: string;
}

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    console.log(
      "Dados recebidos - currentPassword:",
      currentPassword ? "****" : "vazio",
      "newPassword:",
      newPassword ? "****" : "vazio"
    );

    if (!currentPassword || !newPassword) {
      console.log("Erro: Campos vazios");
      return NextResponse.json(
        { error: "Senha atual e nova senha são obrigatórias" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      console.log("Erro: Senha muito curta");
      return NextResponse.json(
        { error: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader
      ?.split("; ")
      .find((row) => row.startsWith("auth-token="))
      ?.split("=")[1];

    if (!token) {
      console.log("Erro: Token não encontrado");
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

    console.log("Payload do token:", {
      userId: payload.userId,
      email: payload.email,
    });

    // Buscar o usuário atual
    const user = await db.usuario.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      console.log("Erro: Usuário não encontrado no banco");
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    console.log("Usuário encontrado:", user.email);

    // Verificar se a senha atual está correta
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.senhaHash
    );

    console.log("Senha atual válida:", isCurrentPasswordValid);

    if (!isCurrentPasswordValid) {
      console.log("Erro: Senha atual incorreta");
      return NextResponse.json(
        { error: "Senha atual incorreta" },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar a senha no banco
    await db.usuario.update({
      where: { id: payload.userId },
      data: {
        senhaHash: hashedNewPassword,
      },
    });

    return NextResponse.json({
      message: "Senha alterada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
