export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { validateUserPermission } from "@/utils/permissions/serverPermissions";

export async function POST(request: Request) {
  try {
    // Validate user permissions
    const permissionCheck = validateUserPermission(
      request as unknown as import("next/server").NextRequest,
      "aprovar"
    );

    if (!permissionCheck.success) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const id: number = parseInt(url.pathname.split("/").pop() || "0", 10);

    const solicitacao = await db.solicitacoes.findUnique({
      where: {
        id: id,
      },
      select: {
        status: true,
        id: true,
      },
    });

    if (!solicitacao) {
      console.log("Solicitação não encontrada");
      return NextResponse.json(
        { error: "Solicitação não encontrada" },
        { status: 404 }
      );
    }

    const statusOnData = solicitacao.status.toUpperCase();
    if (statusOnData !== "PENDENTE") {
      return NextResponse.json(
        { error: `Solicitação está ${statusOnData} e não pode ser APROVADA.` },
        { status: 400 }
      );
    }

    // Processar arquivos enviados
    const formData = await request.formData();
    const arquivoNfDevolucao = formData.get(
      "arquivo_nf_devolucao"
    ) as File | null;
    const arquivoRecibo = formData.get("arquivo_recibo") as File | null;
    const vale = formData.get("vale") as string | null;

    // Converter arquivos para Buffer se existirem
    let arquivoNfBuffer: Buffer | null = null;
    let arquivoReciboBuffer: Buffer | null = null;

    if (arquivoNfDevolucao) {
      const arrayBuffer = await arquivoNfDevolucao.arrayBuffer();
      arquivoNfBuffer = Buffer.from(arrayBuffer);
    }

    if (arquivoRecibo) {
      const arrayBuffer = await arquivoRecibo.arrayBuffer();
      arquivoReciboBuffer = Buffer.from(arrayBuffer);
    }

    console.log(
      "Solicitações encontradas!\n Id da Solicitação:",
      solicitacao.id
    );

    await db.solicitacoes.update({
      where: {
        id: id,
      },
      data: {
        status: "APROVADA",
        aprovada_at: new Date(),
        aprovada_by: permissionCheck.user?.name || null,
        arquivo_nf_devolucao: arquivoNfBuffer,
        arquivo_recibo: arquivoReciboBuffer,
        vale: vale,
      },
    });

    console.log("Solicitação Aprovada!");
    return NextResponse.json({
      success: true,
      message: "Solicitação aprovada com sucesso",
      id: solicitacao.id,
    });
  } catch (error) {
    console.error("Erro ao aprovar solicitação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
