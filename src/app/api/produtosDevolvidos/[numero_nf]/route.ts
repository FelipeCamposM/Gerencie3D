import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

interface ProdutoDevolvido {
  cod_prod: number;
  descricao: string;
  quantidade_devolvida: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ numero_nf: string }> }
) {
  try {
    const { numero_nf } = await params;

    if (!numero_nf) {
      return NextResponse.json(
        { error: "Número da NF é obrigatório" },
        { status: 400 }
      );
    }

    // ESTRATÉGIA SIMPLIFICADA:
    // 1. Buscar solicitações aprovadas/finalizadas para esta NF
    // 2. Para cada uma, somar as quantidades dos produtos devolvidos
    // 3. Como não há FK, assumimos que produtos em returned_products
    //    são válidos apenas se há pelo menos uma solicitação aprovada

    // Buscar solicitações válidas (todas exceto recusadas/canceladas)
    const solicitacoesValidas = await db.solicitacoes.findMany({
      where: {
        numero_nf: numero_nf,
        status: {
          notIn: ['RECUSADA', 'CANCELADA', 'recusada', 'cancelada']
        }
      },
      select: {
        id: true,
        status: true
      }
    });

    // Se não há solicitações válidas, não há produtos devolvidos
    if (solicitacoesValidas.length === 0) {
      return NextResponse.json({
        produtos_devolvidos: []
      });
    }

    // Buscar produtos devolvidos para esta NF
    const produtosDevolvidos = await db.returned_products.findMany({
      where: {
        numeronf: numero_nf,
      }
    });

    // Agrupar e somar quantidades por produto
    const produtosAgrupados = produtosDevolvidos.reduce((acc, produto) => {
      const key = produto.cod_prod.toString();
      if (!acc[key]) {
        acc[key] = {
          cod_prod: produto.cod_prod,
          descricao: produto.descricao,
          quantidade_devolvida: 0
        };
      }
      acc[key].quantidade_devolvida += produto.quantidade;
      return acc;
    }, {} as Record<string, ProdutoDevolvido>);

    return NextResponse.json({
      produtos_devolvidos: Object.values(produtosAgrupados)
    });
  } catch (error) {
    console.error("Erro ao buscar produtos devolvidos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
