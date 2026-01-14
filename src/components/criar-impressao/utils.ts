export interface Produto {
  codprod: number;
  descricao: string;
  qt: number;
  punit: number;
}

export interface InfosNF {
  codcli: number;
  numcar: number;
  codusur: number;
  codcob: string;
  cobranca: string;
  cliente: string;
  codfilial: string;
  cgcent: string;
}

export interface ProdutoFormatado {
  codigo: string;
  descricao: string;
  quantidade: string;
  punit: string;
}

export async function fetchProdutosNF(numnota: string): Promise<Produto[]> {
  try {
    console.log(
      "Fazendo requisição para:",
      `/api/proxy/getProdutosNF/${numnota}`
    );
    const res = await fetch(`/api/proxy/getProdutosNF/${numnota}`);
    console.log("Status da resposta:", res.status);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const response = await res.json();
    console.log("Resposta completa da API produtos:", response);

    // Verificar se a resposta tem o formato esperado
    if (
      response.success &&
      response.produtos &&
      Array.isArray(response.produtos)
    ) {
      console.log("Produtos extraídos:", response.produtos);
      console.log("Total de produtos:", response.total);
      return response.produtos as Produto[];
    } else {
      console.error("Formato de resposta inesperado para produtos:", response);
      return [];
    }
  } catch (error) {
    console.error("Erro na função fetchProdutosNF:", error);
    return [];
  }
}

export async function fetchInfosNF(numnota: string): Promise<InfosNF | null> {
  try {
    console.log("Fazendo requisição para:", `/api/proxy/getInfosNF/${numnota}`);
    const res = await fetch(`/api/proxy/getInfosNF/${numnota}`);

    if (!res.ok) {
      console.error("Erro na requisição:", res.status, res.statusText);
      return null;
    }

    const response = await res.json();
    console.log("Resposta completa da API:", response);

    // Verificar se a resposta tem o formato esperado
    if (response.success && response.data) {
      console.log("Dados extraídos do campo 'data':", response.data);
      return response.data as InfosNF;
    } else {
      console.error("Formato de resposta inesperado:", response);
      return null;
    }
  } catch (error) {
    console.error("Erro na função fetchInfosNF:", error);
    return null;
  }
}

export function checkIdentificador(identificador: string): string {
  const cleaned = identificador.replace(/\D/g, "");

  if (cleaned.length > 11) {
    // Formata como CNPJ: 00.000.000/0000-00
    return cleaned.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  } else {
    // Formata como CPF: 000.000.000-00
    return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
}

export function formatProdutos(produtosNF: Produto[]): ProdutoFormatado[] {
  return produtosNF.map((produto) => ({
    codigo: produto.codprod.toString(),
    descricao: produto.descricao,
    quantidade: produto.qt.toString(),
    punit: produto.punit.toString(),
  }));
}
