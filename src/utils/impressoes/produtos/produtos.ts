import db from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

export interface ProdutoSolicitacao {
  id: number;
  cod_prod: number;
  descricao: string;
  quantidade: number;
  punit: number | Decimal;
  numeronf: string;
  created_at: Date;
}

export interface ProdutosResponse {
  success: boolean;
  produtos: ProdutoSolicitacao[];
  produtosRetornados: ProdutoSolicitacao[];
  totalProdutos: number;
  totalRetornados: number;
}

export async function getProdutosSolicitacao(
  numeroNF: string
): Promise<ProdutoSolicitacao[]> {
  try {
    console.log("Buscando produtos para NF:", numeroNF);

    const produtos = await db.products.findMany({
      where: {
        numeronf: numeroNF,
      },
      select: {
        id: true,
        cod_prod: true,
        descricao: true,
        quantidade: true,
        punit: true,
        numeronf: true,
        created_at: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    console.log("Produtos encontrados:", produtos.length);
    return produtos;
  } catch (error) {
    console.error("Erro ao buscar produtos da solicitação:", error);
    throw new Error("Falha ao buscar produtos da solicitação");
  }
}

export async function getProdutosRetornados(
  numeroNF: string
): Promise<ProdutoSolicitacao[]> {
  try {
    console.log("Buscando produtos retornados para NF:", numeroNF);

    const produtosRetornados = await db.returned_products.findMany({
      where: {
        numeronf: numeroNF,
      },
      select: {
        id: true,
        cod_prod: true,
        descricao: true,
        quantidade: true,
        punit: true,
        numeronf: true,
        created_at: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    console.log("Produtos retornados encontrados:", produtosRetornados.length);
    return produtosRetornados;
  } catch (error) {
    console.error("Erro ao buscar produtos retornados:", error);
    throw new Error("Falha ao buscar produtos retornados");
  }
}

// Função para buscar produtos via API (frontend)
export async function fetchProdutosSolicitacao(
  numeroNF: string
): Promise<ProdutosResponse> {
  try {
    console.log("Fazendo requisição para produtos da NF:", numeroNF);

    const response = await fetch(`/api/getProdutosSolicitacao/${numeroNF}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Produtos recebidos da API:", data);

    return data;
  } catch (error) {
    console.error("Erro ao buscar produtos da solicitação:", error);
    throw new Error("Falha ao buscar produtos da solicitação");
  }
}
