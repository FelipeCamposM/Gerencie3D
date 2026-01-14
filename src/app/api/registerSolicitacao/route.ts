export const fetchCache = "force-no-store";
// import { PrismaClient } from '@prisma/client';

import { NextResponse } from "next/server";
import db from "../../../lib/db";

// Configuração para permitir uploads maiores (10MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

interface Produto {
  codigo: string;
  descricao: string;
  quantidade: string;
  punit: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.formData();

    // Processar arquivo da nota fiscal se existir
    const arquivoNF = body.get("arquivo_nf") as File | null;
    let arquivoNFBuffer: Buffer | null = null;

    if (arquivoNF) {
      // Validar tipo de arquivo
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png'
      ];
      
      if (!allowedTypes.includes(arquivoNF.type)) {
        return NextResponse.json(
          { error: "Tipo de arquivo não suportado. Use apenas PDF, JPG, JPEG ou PNG." },
          { status: 400 }
        );
      }
      
      // Validar tamanho do arquivo (máximo 10MB)
      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
      if (arquivoNF.size > maxSizeInBytes) {
        return NextResponse.json(
          { error: "Arquivo muito grande. O tamanho máximo é 10MB." },
          { status: 400 }
        );
      }
      
      try {
        const arrayBuffer = await arquivoNF.arrayBuffer();
        arquivoNFBuffer = Buffer.from(arrayBuffer);
        console.log(`Arquivo processado: ${arquivoNF.name} (${arquivoNF.type}, ${arquivoNF.size} bytes)`);
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        return NextResponse.json(
          { error: "Erro ao processar o arquivo enviado." },
          { status: 400 }
        );
      }
    }

    // Dados da solicitação
    const numeroNF = body.get("numero_nf") as string;
    
    // Validação específica do número da NF
    if (!numeroNF || !/^(\d{4}|\d{6})$/.test(numeroNF)) {
      console.error(`Número de NF inválido recebido: "${numeroNF}"`);
      return NextResponse.json(
        { error: "Número da NF deve ter 4 ou 6 dígitos numéricos" },
        { status: 400 }
      );
    }

    console.log(`Criando solicitação para NF: ${numeroNF} (${numeroNF.length} dígitos)`);

    const solicitacaoToCreate = {
      nome: body.get("nome") as string,
      filial: body.get("filial") as string,
      numero_nf: numeroNF,
      carga: body.get("carga") as string,
      nome_cobranca: body.get("nome_cobranca") as string,
      cod_cobranca: body.get("cod_cobranca") as string,
      rca: parseInt(body.get("rca") as string),
      cgent: body.get("cgent") as string,
      motivo_devolucao: body.get("motivo_devolucao") as string,
      tipo_devolucao: body.get("tipo_devolucao") as string,
      cod_cliente: parseInt(body.get("cod_cliente") as string),
      status: "PENDENTE",
      arquivo_nf: arquivoNFBuffer,
      pendente_by: body.get("pendente_by") as string
    };

    // Log dos dados da solicitação (sem dados sensíveis)
    console.log("Dados da solicitação:", {
      ...solicitacaoToCreate,
      arquivo_nf: arquivoNFBuffer ? `Buffer(${arquivoNFBuffer.length} bytes)` : null
    });

    // Dados dos produtos (JSON string)
    const produtosJson = body.get("produtos") as string;
    const quantidadesDevolucaoJson = body.get("quantidadesDevolucao") as string;

    console.log("Produtos JSON recebido:", produtosJson);
    console.log(
      "Quantidades Devolução JSON recebido:",
      quantidadesDevolucaoJson
    );

    if (!produtosJson) {
      return NextResponse.json(
        { error: "Dados dos produtos não fornecidos" },
        { status: 400 }
      );
    }

    if (!quantidadesDevolucaoJson) {
      return NextResponse.json(
        { error: "Quantidades de devolução não fornecidas" },
        { status: 400 }
      );
    }

    let produtos: Produto[];
    let quantidadesDevolucao: Record<string, number>;

    try {
      produtos = JSON.parse(produtosJson);
      quantidadesDevolucao = JSON.parse(quantidadesDevolucaoJson);
    } catch (parseError) {
      console.error("Erro ao fazer parse dos dados JSON:", parseError);
      return NextResponse.json(
        { error: "Dados dos produtos em formato inválido" },
        { status: 400 }
      );
    }

    // Validar se os arrays não estão vazios
    if (!Array.isArray(produtos) || produtos.length === 0) {
      return NextResponse.json(
        { error: "Lista de produtos não pode estar vazia" },
        { status: 400 }
      );
    }

    // Extrair produtos selecionados das quantidades de devolução
    const produtosSelecionados = Object.keys(quantidadesDevolucao).filter(
      (codigo) => quantidadesDevolucao[codigo] > 0
    );

    console.log(`Total de produtos na nota: ${produtos.length}`);
    console.log(
      `Produtos selecionados para devolução: ${produtosSelecionados.length}`
    );

    // Abordagem sequencial mais robusta para serverless
    let solicitacao;
    
    try {
      // 1. Criar a solicitação
      solicitacao = await db.solicitacoes.create({
        data: solicitacaoToCreate,
      });
      console.log("Solicitação criada com ID:", solicitacao.id);
    } catch (error) {
      console.error("Erro ao criar solicitação:", error);
      throw new Error("Falha ao criar a solicitação principal");
    }

    try {
      // 2. Salvar produtos da nota fiscal (apenas se ainda não existem)
      const produtosParaSalvar = [];
      
      for (const produto of produtos) {
        const produtoExistente = await db.products.findFirst({
          where: {
            numeronf: solicitacao.numero_nf,
            cod_prod: parseInt(produto.codigo)
          }
        });

        if (!produtoExistente) {
          produtosParaSalvar.push({
            numeronf: solicitacao.numero_nf,
            cod_prod: parseInt(produto.codigo),
            descricao: produto.descricao,
            quantidade: parseInt(produto.quantidade),
            punit: parseFloat(produto.punit)
          });
        }
      }

      if (produtosParaSalvar.length > 0) {
        await db.products.createMany({
          data: produtosParaSalvar,
          skipDuplicates: true
        });
      }

      console.log(
        `Produtos da nota fiscal verificados/salvos na tabela products: ${produtosParaSalvar.length}`
      );
    } catch (error) {
      console.error("Erro ao salvar produtos da NF:", error);
      // Não falhamos aqui, pois a solicitação já foi criada
    }

    try {
      // 3. Salvar APENAS os produtos selecionados para devolução na tabela returned_products
      console.log(
        "Produtos selecionados para devolução:",
        produtosSelecionados
      );
      console.log("Quantidades de devolução:", quantidadesDevolucao);

      const produtosRetornados = produtos
        .filter((produto: Produto) => {
          const quantidadeDevolucao = quantidadesDevolucao[produto.codigo] || 0;
          const isSelected = quantidadeDevolucao > 0;
          console.log(
            `Produto ${produto.codigo}: ${
              isSelected
                ? `selecionado (qtd: ${quantidadeDevolucao})`
                : "não selecionado"
            }`
          );
          return isSelected;
        })
        .map((produto: Produto) => {
          const quantidadeDevolucao = quantidadesDevolucao[produto.codigo];
          return {
            numeronf: solicitacao.numero_nf,
            cod_prod: parseInt(produto.codigo),
            descricao: produto.descricao,
            quantidade: quantidadeDevolucao, // Quantidade específica para devolução
            punit: parseFloat(produto.punit),
          };
        });

      console.log(`Produtos para devolução: ${produtosRetornados.length}`);

      if (produtosRetornados.length > 0) {
        await db.returned_products.createMany({
          data: produtosRetornados,
          skipDuplicates: true
        });
      }

    } catch (error) {
      console.error("Erro ao salvar produtos devolvidos:", error);
      // Continuamos mesmo que os produtos devolvidos falhem
    }

    const result = {
      solicitacao,
      totalProdutosNota: produtos.length,
      produtosParaDevolucao: produtosSelecionados.length,
    };

    console.log("Solicitação criada com sucesso! ID:", result.solicitacao.id);
    console.log(
      `Produtos da nota salvos: ${result.totalProdutosNota}, Produtos selecionados para devolução: ${result.produtosParaDevolucao}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    
    // Log mais detalhado para debug no Vercel
    if (error instanceof Error) {
      console.error("Erro detalhado:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    
    // Verificar se é um erro específico do Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: unknown };
      console.error("Código do erro Prisma:", prismaError.code);
      console.error("Meta do erro Prisma:", prismaError.meta);
    }
    
    return NextResponse.json(
      { 
        error: "Erro ao criar solicitação",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        // Incluir código de erro específico se for do Prisma
        code: error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : undefined
      },
      { status: 500 }
    );
  }
}
