import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const impressaoId = params.id;

    // Buscar a impressão
    const impressao = await prisma.impressao3D.findUnique({
      where: { id: impressaoId },
      include: {
        impressora: true,
      },
    });

    if (!impressao) {
      return NextResponse.json(
        { error: "Impressão não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se já está concluída
    if (impressao.status === "concluida") {
      return NextResponse.json(
        { error: "Esta impressão já foi finalizada" },
        { status: 400 }
      );
    }

    // Atualizar a impressão para concluída
    const impressaoAtualizada = await prisma.impressao3D.update({
      where: { id: impressaoId },
      data: {
        status: "concluida",
        dataConclusao: new Date(),
      },
    });

    // Atualizar a impressora para disponível
    await prisma.impressora.update({
      where: { id: impressao.impressoraId },
      data: {
        status: "disponivel",
      },
    });

    return NextResponse.json({
      message: "Impressão finalizada com sucesso",
      impressao: impressaoAtualizada,
    });
  } catch (error) {
    console.error("Erro ao finalizar impressão:", error);
    return NextResponse.json(
      { error: "Erro ao finalizar impressão" },
      { status: 500 }
    );
  }
}
