import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    console.log('ID recebido para exclusão:', id);

    if (!id) {
      console.error('ID não fornecido na requisição');
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const deletedUser = await db.user_profiles.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json(
      { error: 'Usuário não encontrado ou erro ao excluir' },
      { status: 500 }
    );
  }
}
