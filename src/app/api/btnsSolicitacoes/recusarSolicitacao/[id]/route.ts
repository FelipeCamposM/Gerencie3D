export const fetchCache = "force-no-store";
// import { PrismaClient } from '@prisma/client';

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { validateUserPermission } from "@/utils/permissions/serverPermissions";

export async function POST(request: Request) {
  try {
    // Validate user permissions
    const permissionCheck = validateUserPermission(
      request as unknown as import("next/server").NextRequest,
      "recusar"
    );

    if (!permissionCheck.success) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const id: number = parseInt(url.pathname.split("/").pop() || "0", 10);

    const { motivo_recusa } = await request.json();

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
        { error: `Solicitação está ${statusOnData} e não pode ser RECUSADA.` },
        { status: 400 }
      );
    }

    console.log("Solicitação encontrada!\n Id da Solicitação:", solicitacao.id);

    await db.solicitacoes.update({
      where: {
        id: id,
      },
      data: {
        status: "RECUSADA",
        recusada_at: new Date(),
        recusada_by: permissionCheck.user?.name || null,
        motivo_recusa: motivo_recusa,
      },
    });

    console.log("Solicitação Recusada!");
    return NextResponse.json({
      success: true,
      message: "Solicitação recusada com sucesso",
      id: solicitacao.id,
    });
  } catch (error) {
    console.error("Erro ao recusar solicitação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
