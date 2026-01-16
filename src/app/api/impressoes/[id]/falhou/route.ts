import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { filamentoDesperdiciado } = body;

    // Buscar a impressão com seus filamentos
    const impressao = await db.impressao3D.findUnique({
      where: { id },
      include: {
        impressora: true,
        filamentos: {
          include: {
            filamento: true,
          },
        },
      },
    });

    if (!impressao) {
      return NextResponse.json(
        { error: "Impressão não encontrada" },
        { status: 404 }
      );
    }

    // Devolver o filamento não utilizado ao estoque
    // e descontar apenas o filamento desperdiçado real
    if (impressao.filamentos.length > 0) {
      const totalEstimado = impressao.filamentoTotalUsado;
      const totalRealmenteUsado = filamentoDesperdiciado || 0;
      const filamentoADevolver = totalEstimado - totalRealmenteUsado;

      for (const impFilamento of impressao.filamentos) {
        const proporcao = impFilamento.quantidadeUsada / totalEstimado;

        // Quantidade a devolver para este filamento
        const quantidadeADevolver = filamentoADevolver * proporcao;

        await db.filamento.update({
          where: { id: impFilamento.filamentoId },
          data: {
            pesoAtual: {
              increment: quantidadeADevolver, // Devolve o não utilizado
            },
          },
        });
      }
    }

    // Atualizar impressão para status "falhou"
    await db.impressao3D.update({
      where: { id },
      data: {
        status: "falhou",
        dataConclusao: new Date(),
        filamentoDesperdiciado: filamentoDesperdiciado || 0,
        observacoes: impressao.observacoes
          ? `${impressao.observacoes}\n\nFilamento desperdiçado: ${filamentoDesperdiciado}g`
          : `Filamento desperdiçado: ${filamentoDesperdiciado}g`,
      },
    });

    // Liberar a impressora
    await db.impressora.update({
      where: { id: impressao.impressoraId },
      data: {
        status: "disponivel",
      },
    });

    return NextResponse.json({
      message: "Impressão marcada como falhou com sucesso",
    });
  } catch (error) {
    console.error("Erro ao marcar impressão como falhou:", error);
    return NextResponse.json(
      { error: "Erro ao marcar impressão como falhou" },
      { status: 500 }
    );
  }
}
