export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import db from "../../../lib/db";

type SolicitacaoRow = {
  id: number;
  nome: string;
  filial: string;
  numero_nf: string;
  carga: string;
  nome_cobranca: string | null;
  cod_cobranca: string;
  rca: number;
  cgent: string | null;
  motivo_devolucao: string;
  motivo_recusa: string | null;
  tipo_devolucao: string;
  cod_cliente: number;
  status: string;
  vale: string | null;
  created_at: Date;
  updated_at: Date | null;
  has_arquivo_nf: boolean;
  has_arquivo_nf_devolucao: boolean;
  has_arquivo_recibo: boolean;
  // Campos de auditoria podem existir mas não são usados no front
  pendente_at?: Date | null;
  aprovada_at?: Date | null;
  recusada_at?: Date | null;
  desdobrada_at?: Date | null;
  abatida_at?: Date | null;
  finalizada_at?: Date | null;
  pendente_by?: string | null;
  aprovada_by?: string | null;
  recusada_by?: string | null;
  desdobrada_by?: string | null;
  abatida_by?: string | null;
  finalizada_by?: string | null;
};

// Retorna as solicitações SEM carregar os BLOBs (arquivos) para melhorar a performance.
// Inclui flags booleanas indicando a existência de cada arquivo.
export async function GET() {
  try {
    // Usamos query raw para evitar materializar os bytes dos arquivos (bytea) na resposta
    const solicitacoes = await db.$queryRawUnsafe<SolicitacaoRow[]>(`
            SELECT 
                id,
                nome,
                filial,
                numero_nf,
                carga,
                nome_cobranca,
                cod_cobranca,
                rca,
                cgent,
                motivo_devolucao,
                motivo_recusa,
                tipo_devolucao,
                cod_cliente,
                status,
                vale,
                pendente_at,
                aprovada_at,
                recusada_at,
                desdobrada_at,
                abatida_at,
                finalizada_at,
                pendente_by,
                aprovada_by,
                recusada_by,
                desdobrada_by,
                abatida_by,
                finalizada_by,
                created_at,
                updated_at,
                -- Flags de existência dos arquivos (sem trazer os bytes)
                (arquivo_nf IS NOT NULL)           AS has_arquivo_nf,
                (arquivo_nf_devolucao IS NOT NULL) AS has_arquivo_nf_devolucao,
                (arquivo_recibo IS NOT NULL)       AS has_arquivo_recibo
            FROM solicitacoes
            ORDER BY created_at DESC
        `);

    // Sempre retornar 200 com array (vazio ou não) para simplificar o consumo no front
    console.log("Solicitações encontradas! Quantidade:", solicitacoes.length);
    return NextResponse.json(solicitacoes);
  } catch (error) {
    console.error("Erro ao buscar Solicitações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar Solicitações" },
      { status: 500 }
    );
  }
}
