import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; tipo: string }> }
    ) {
    try {
        const { id, tipo } = await params;

        // Validar parâmetros
        if (!id || !tipo) {
            return NextResponse.json(
                { error: "ID da solicitação e tipo de arquivo são obrigatórios" },
                { status: 400 }
            );
        }

        // Validar tipo de arquivo
        const tiposValidos = ["nf", "nf_devolucao", "recibo"];
            if (!tiposValidos.includes(tipo)) {
            return NextResponse.json(
                { error: "Tipo de arquivo inválido" },
                { status: 400 }
            );
        }

        // Buscar a solicitação no banco de dados
        const solicitacao = await db.solicitacoes.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                arquivo_nf: true,
                arquivo_nf_devolucao: true,
                arquivo_recibo: true,
            },
        });

        if (!solicitacao) {
        return NextResponse.json(
            { error: "Solicitação não encontrada" },
            { status: 404 }
        );
        }

        // Determinar qual campo usar baseado no tipo
        let arquivoBuffer: Uint8Array | null = null;
        let nomeArquivo = "";

        switch (tipo) {
        case "nf":
            arquivoBuffer = solicitacao.arquivo_nf;
            nomeArquivo = `nota_fiscal_${id}.pdf`;
            break;
        case "nf_devolucao":
            arquivoBuffer = solicitacao.arquivo_nf_devolucao;
            nomeArquivo = `nota_fiscal_devolucao_${id}.pdf`;
            break;
        case "recibo":
            arquivoBuffer = solicitacao.arquivo_recibo;
            nomeArquivo = `recibo_${id}.pdf`;
            break;
        }

        // Verificar se o arquivo existe
        if (!arquivoBuffer) {
        return NextResponse.json(
            { error: "Arquivo não encontrado" },
            { status: 404 }
        );
        }

        // Converter Uint8Array para Buffer
        const buffer = Buffer.from(arquivoBuffer);

        // Retornar o arquivo
        return new NextResponse(buffer, {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
            "Content-Length": buffer.length.toString(),
        },
        });
    } catch (error) {
        console.error("Erro ao buscar arquivo:", error);
        return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
        );
    }
}
