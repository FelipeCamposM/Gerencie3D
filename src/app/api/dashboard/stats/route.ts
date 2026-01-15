import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET - Obter estatísticas do dashboard
export async function GET() {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    // Buscar dados em paralelo
    const [
      totalImpressoras,
      impressorasDisponiveis,
      impressorasEmUso,
      impressorasManutencao,
      totalFilamentos,
      filamentosBaixoEstoque,
      impressoesHoje,
      impressoesMes,
      impressoesConcluidas,
      custoTotalMes,
      lucroTotalMes,
    ] = await Promise.all([
      db.impressora.count(),
      db.impressora.count({ where: { status: "disponivel" } }),
      db.impressora.count({ where: { status: "em_uso" } }),
      db.impressora.count({ where: { status: "manutencao" } }),
      db.filamento.count(),
      db.filamento.count({
        where: {
          pesoAtual: { lte: 200 }, // Menos de 200g
        },
      }),
      db.impressao3D.count({
        where: {
          dataInicio: { gte: hoje },
        },
      }),
      db.impressao3D.count({
        where: {
          dataInicio: {
            gte: inicioMes,
            lte: fimMes,
          },
        },
      }),
      db.impressao3D.count({
        where: {
          status: "concluida",
          dataInicio: {
            gte: inicioMes,
            lte: fimMes,
          },
        },
      }),
      db.impressao3D.aggregate({
        where: {
          dataInicio: {
            gte: inicioMes,
            lte: fimMes,
          },
        },
        _sum: {
          custoTotal: true,
        },
      }),
      db.impressao3D.aggregate({
        where: {
          dataInicio: {
            gte: inicioMes,
            lte: fimMes,
          },
          lucro: { not: null },
        },
        _sum: {
          lucro: true,
        },
      }),
    ]);

    // Buscar últimas impressões
    const ultimasImpressoes = await db.impressao3D.findMany({
      take: 5,
      orderBy: { dataInicio: "desc" },
      include: {
        usuario: {
          select: {
            primeiroNome: true,
            ultimoNome: true,
          },
        },
        impressora: {
          select: {
            nome: true,
          },
        },
      },
    });

    // Buscar filamentos com baixo estoque
    const filamentosBaixos = await db.filamento.findMany({
      where: {
        pesoAtual: { lte: 200 },
      },
      take: 5,
      orderBy: { pesoAtual: "asc" },
      include: {
        comprador: {
          select: {
            primeiroNome: true,
            ultimoNome: true,
          },
        },
      },
    });

    return NextResponse.json({
      impressoras: {
        total: totalImpressoras,
        disponiveis: impressorasDisponiveis,
        emUso: impressorasEmUso,
        manutencao: impressorasManutencao,
      },
      filamentos: {
        total: totalFilamentos,
        baixoEstoque: filamentosBaixoEstoque,
        filamentosBaixos,
      },
      impressoes: {
        hoje: impressoesHoje,
        mes: impressoesMes,
        concluidas: impressoesConcluidas,
        emAndamento: impressoesMes - impressoesConcluidas,
      },
      financeiro: {
        custoTotalMes: custoTotalMes._sum.custoTotal || 0,
        lucroTotalMes: lucroTotalMes._sum.lucro || 0,
      },
      atividades: {
        ultimasImpressoes,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}
