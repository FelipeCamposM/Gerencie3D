import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

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

    return NextResponse.json(impressora);
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

    const impressora = await db.impressora.update({
      where: { id: parseInt(id) },
      data: {
        nome: data.nome,
        modelo: data.modelo,
        localizacao: data.localizacao,
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

// DELETE - Deletar impressora
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
