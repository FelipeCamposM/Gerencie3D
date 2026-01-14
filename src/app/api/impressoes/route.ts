import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET - Listar todas as impressões
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const usuarioId = searchParams.get("usuarioId");
    const impressoraId = searchParams.get("impressoraId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) where.status = status;
    if (usuarioId) where.usuarioId = parseInt(usuarioId);
    if (impressoraId) where.impressoraId = parseInt(impressoraId);

    const impressoes = await db.impressao3D.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            primeiroNome: true,
            ultimoNome: true,
            email: true,
          },
        },
        impressora: {
          select: {
            id: true,
            nome: true,
            modelo: true,
          },
        },
        filamentos: {
          include: {
            filamento: {
              select: {
                id: true,
                tipo: true,
                cor: true,
              },
            },
          },
        },
      },
      orderBy: {
        dataInicio: "desc",
      },
    });

    return NextResponse.json(impressoes);
  } catch (error) {
    console.error("Erro ao buscar impressões:", error);
    return NextResponse.json(
      { error: "Erro ao buscar impressões" },
      { status: 500 }
    );
  }
}

// POST - Criar nova impressão
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Buscar dados da impressora para calcular custos
    const impressora = await db.impressora.findUnique({
      where: { id: parseInt(data.impressoraId) },
    });

    if (!impressora) {
      return NextResponse.json(
        { error: "Impressora não encontrada" },
        { status: 404 }
      );
    }

    // Calcular custo de energia
    const tempoEmHoras = parseFloat(data.tempoImpressao) / 60;
    const custoEnergia =
      tempoEmHoras * impressora.gastoEnergiaKwh * impressora.precoEnergiaKwh;

    // Calcular custo de filamento (será atualizado quando adicionar filamentos)
    let custoFilamento = 0;

    if (data.filamentos && data.filamentos.length > 0) {
      for (const filamentoData of data.filamentos) {
        const filamento = await db.filamento.findUnique({
          where: { id: filamentoData.filamentoId },
        });

        if (filamento) {
          const custoPorGrama = filamento.precoCompra / filamento.pesoInicial;
          custoFilamento +=
            custoPorGrama * parseFloat(filamentoData.quantidadeUsada);
        }
      }
    }

    const custoTotal = custoEnergia + custoFilamento;
    const precoVenda = data.precoVenda ? parseFloat(data.precoVenda) : null;
    const lucro = precoVenda ? precoVenda - custoTotal : null;

    // Criar impressão
    const impressao = await db.impressao3D.create({
      data: {
        nomeProjeto: data.nomeProjeto,
        tempoImpressao: parseInt(data.tempoImpressao),
        filamentoTotalUsado: parseFloat(data.filamentoTotalUsado || 0),
        custoTotal,
        custoEnergia,
        custoFilamento,
        precoVenda,
        lucro,
        status: data.status || "em_andamento",
        observacoes: data.observacoes,
        dataInicio: data.dataInicio ? new Date(data.dataInicio) : new Date(),
        dataConclusao: data.dataConclusao ? new Date(data.dataConclusao) : null,
        usuarioId: parseInt(data.usuarioId),
        impressoraId: parseInt(data.impressoraId),
      },
    });

    // Adicionar filamentos usados
    if (data.filamentos && data.filamentos.length > 0) {
      for (const filamentoData of data.filamentos) {
        await db.impressaoFilamento.create({
          data: {
            quantidadeUsada: parseFloat(filamentoData.quantidadeUsada),
            impressaoId: impressao.id,
            filamentoId: filamentoData.filamentoId,
          },
        });

        // Atualizar peso atual do filamento
        await db.filamento.update({
          where: { id: filamentoData.filamentoId },
          data: {
            pesoAtual: {
              decrement: parseFloat(filamentoData.quantidadeUsada),
            },
            ultimaUtilizacao: new Date(),
            ultimoUsuarioId: parseInt(data.usuarioId),
          },
        });
      }
    }

    // Calcular data de conclusão baseada no tempo de impressão
    const dataInicio = data.dataInicio ? new Date(data.dataInicio) : new Date();
    const dataConclusaoPrevista = new Date(
      dataInicio.getTime() + parseInt(data.tempoImpressao) * 60 * 1000
    );

    // Atualizar a data de conclusão prevista na impressão se ainda não foi definida
    if (!data.dataConclusao && data.status === "em_andamento") {
      await db.impressao3D.update({
        where: { id: impressao.id },
        data: {
          dataConclusao: dataConclusaoPrevista,
        },
      });
    }

    // Atualizar impressora
    await db.impressora.update({
      where: { id: parseInt(data.impressoraId) },
      data: {
        ultimoUso: dataInicio,
        ultimoUsuarioId: parseInt(data.usuarioId),
        ultimaImpressaoId: impressao.id,
        filamentoTotalUsado: {
          increment: parseFloat(data.filamentoTotalUsado || 0),
        },
        // Impressora fica "em_uso" quando a impressão é criada
        status: data.status === "concluida" ? "disponivel" : "em_uso",
      },
    });

    return NextResponse.json(
      {
        ...impressao,
        dataConclusao: data.dataConclusao || dataConclusaoPrevista,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar impressão:", error);
    return NextResponse.json(
      { error: "Erro ao criar impressão" },
      { status: 500 }
    );
  }
}
