import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { validateUserPermission } from "@/utils/permissions/serverPermissions";

export async function POST(request: NextRequest) {
  try {
    // Only allow users with delete permission (excluir)
    const permissionCheck = validateUserPermission(request, "excluir");
    if (!permissionCheck.success) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as { ids?: unknown };
    const rawIds = Array.isArray(body?.ids) ? (body.ids as unknown[]) : [];
    const ids: number[] = rawIds
      .map((n) => {
        const num = typeof n === "string" ? Number(n) : (n as number);
        return Number(num);
      })
      .filter((n) => Number.isFinite(n));

    if (!ids.length) {
      return NextResponse.json(
        { error: "Lista de IDs inválida ou vazia" },
        { status: 400 }
      );
    }

    // Get NF numbers for the solicitacoes to delete
    const solicitacoesToDelete = await db.solicitacoes.findMany({
      where: { id: { in: ids } },
      select: { id: true, numero_nf: true },
    });

    if (!solicitacoesToDelete.length) {
      return NextResponse.json(
        { error: "Nenhuma solicitação encontrada para os IDs informados" },
        { status: 404 }
      );
    }

    const nfList = solicitacoesToDelete.map((s) => s.numero_nf);

    // Run all deletions in a single transaction
    const result = await db.$transaction(async (tx) => {
      const delReturned = await tx.returned_products.deleteMany({
        where: { numeronf: { in: nfList } },
      });

      const delProducts = await tx.products.deleteMany({
        where: { numeronf: { in: nfList } },
      });

      const delSolicitacoes = await tx.solicitacoes.deleteMany({
        where: { id: { in: ids } },
      });

      return {
        deletedReturned: delReturned.count,
        deletedProducts: delProducts.count,
        deletedSolicitacoes: delSolicitacoes.count,
      };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Erro ao excluir solicitações em lote:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
