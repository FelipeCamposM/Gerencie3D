import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

interface UserTokenPayload {
  userId: number;
  email: string;
  role: string;
  user_level: string;
  name: string;
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json();
    
    console.log('ID e dados recebidos para edição:', id, data);

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
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

    // Verificar se é admin ou se está editando a própria conta
    const isEditingSelf = payload.userId === Number(id);
    const isAdmin = payload.user_level === 'adm';

    if (!isAdmin && !isEditingSelf) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar este usuário' },
        { status: 403 }
      );
    }

    // Se não é admin e está tentando alterar a senha, direcionar para o endpoint específico
    if (!isAdmin && isEditingSelf && data.password) {
      return NextResponse.json(
        { error: 'Para alterar sua senha, use a opção "Alterar Senha" no menu do perfil' },
        { status: 400 }
      );
    }

    // Se uma nova senha foi fornecida e é admin, fazer hash dela
    const updateData = { ...data };
    if (data.password && data.password.trim() !== '' && isAdmin) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(data.password, saltRounds);
    } else {
      // Se não foi fornecida senha ou não é admin, remover do objeto de atualização
      delete updateData.password;
    }

    const updatedUser = await db.user_profiles.update({
      where: { id: Number(id) },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erro ao editar usuário:', error);
    return NextResponse.json(
      { error: 'Usuário não encontrado ou erro ao editar' },
      { status: 500 }
    );
  }
}
