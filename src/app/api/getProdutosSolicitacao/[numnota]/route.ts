import { NextRequest, NextResponse } from "next/server";
import {
  getProdutosSolicitacao,
  getProdutosRetornados,
} from "@/utils/solicitacoes/produtos/produtos";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ numnota: string }> }
) {
  try {
    const { numnota } = await params;

    if (!numnota) {
      return NextResponse.json(
        { error: "Número da nota fiscal é obrigatório" },
        { status: 400 }
      );
    }

    console.log("Buscando produtos para NF:", numnota);

    // Buscar todos os produtos da nota fiscal
    const produtos = await getProdutosSolicitacao(numnota);

    // Buscar produtos retornados da nota fiscal
    const produtosRetornados = await getProdutosRetornados(numnota);

    return NextResponse.json({
      success: true,
      produtos: produtos,
      produtosRetornados: produtosRetornados,
      totalProdutos: produtos.length,
      totalRetornados: produtosRetornados.length,
    });
  } catch (error) {
    console.error("Erro ao buscar produtos da solicitação:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
