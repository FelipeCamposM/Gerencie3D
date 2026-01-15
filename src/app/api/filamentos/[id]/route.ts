import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET - Buscar filamento por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filamento = await db.filamento.findUnique({
      where: { id },
      include: {
        comprador: {
          select: {
            id: true,
            primeiroNome: true,
            ultimoNome: true,
            email: true,
          },
        },
        ultimoUsuario: {
          select: {
            id: true,
            primeiroNome: true,
            ultimoNome: true,
          },
        },
        impressoes: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            impressao: {
              select: {
                id: true,
                nomeProjeto: true,
                dataInicio: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!filamento) {
      return NextResponse.json(
        { error: "Filamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(filamento);
  } catch (error) {
    console.error("Erro ao buscar filamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar filamento" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar filamento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updateData: Partial<{
      tipo: string;
      nomeCor: string;
      cor: string;
      pesoAtual: number;
      precoCompra: number;
      ultimaUtilizacao: Date;
    }> = {};
    if (data.tipo) updateData.tipo = data.tipo;
    if (data.nomeCor) updateData.nomeCor = data.nomeCor;
    if (data.cor) updateData.cor = data.cor;
    if (data.pesoAtual !== undefined)
      updateData.pesoAtual = parseFloat(data.pesoAtual);
    if (data.precoCompra !== undefined)
      updateData.precoCompra = parseFloat(data.precoCompra);
    if (data.ultimaUtilizacao)
      updateData.ultimaUtilizacao = new Date(data.ultimaUtilizacao);

    const filamento = await db.filamento.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(filamento);
  } catch (error) {
    console.error("Erro ao atualizar filamento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar filamento" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar filamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.filamento.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Filamento deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar filamento:", error);
    return NextResponse.json(
      { error: "Erro ao deletar filamento" },
      { status: 500 }
    );
  }
}
