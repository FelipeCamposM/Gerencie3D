import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Endpoint para verificar e atualizar status de impressoras
export async function POST(request: NextRequest) {
  try {
    // Buscar todas as impressões em andamento
    const impressoesEmAndamento = await db.impressao3D.findMany({
      where: {
        status: "em_andamento",
      },
      include: {
        impressora: true,
      },
    });

    const now = new Date();
    const updates = [];

    for (const impressao of impressoesEmAndamento) {
      if (impressao.dataConclusao && new Date(impressao.dataConclusao) <= now) {
        // Atualizar status da impressão para concluída
        await db.impressao3D.update({
          where: { id: impressao.id },
          data: {
            status: "concluida",
            dataConclusao: now,
          },
        });

        // Atualizar status da impressora para disponível
        await db.impressora.update({
          where: { id: impressao.impressoraId },
          data: {
            status: "disponivel",
          },
        });

        updates.push({
          impressaoId: impressao.id,
          impressoraId: impressao.impressoraId,
          impressoraNome: impressao.impressora.nome,
        });
      }
    }

    return NextResponse.json({
      message: `${updates.length} impressora(s) atualizada(s)`,
      updates,
    });
  } catch (error) {
    console.error("Erro ao verificar status das impressões:", error);
    return NextResponse.json(
      { error: "Erro ao verificar status das impressões" },
      { status: 500 }
    );
  }
}
