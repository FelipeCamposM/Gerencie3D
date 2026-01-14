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
      "finalizar"
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
    if (statusOnData !== "ABATIDA") {
      return NextResponse.json(
        {
          error: `Solicitação está ${statusOnData} e não pode ser FINALIZADA.`,
        },
        { status: 400 }
      );
    }

    console.log("Solicitação encontrada!\n Id da Solicitação:", solicitacao.id);

    await db.solicitacoes.update({
      where: {
        id: id,
      },
      data: {
        status: "FINALIZADA",
        finalizada_at: new Date(),
        finalizada_by: permissionCheck.user?.name || null,
      },
    });

    console.log("Solicitação Finalizada!");
    return NextResponse.json({
      success: true,
      message: "Solicitação finalizada com sucesso",
      id: solicitacao.id,
    });
  } catch (error) {
    console.error("Erro ao finalizar solicitação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
