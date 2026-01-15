import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET - Buscar impressão por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const impressao = await db.impressao3D.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            primeiroNome: true,
            ultimoNome: true,
            email: true,
          },
        },
        impressora: {
          select: {
            id: true,
            nome: true,
            modelo: true,
            localizacao: true,
          },
        },
        filamentos: {
          include: {
            filamento: true,
          },
        },
      },
    });

    if (!impressao) {
      return NextResponse.json(
        { error: "Impressão não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(impressao);
  } catch (error) {
    console.error("Erro ao buscar impressão:", error);
    return NextResponse.json(
      { error: "Erro ao buscar impressão" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar impressão
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updateData: {
      nomeProjeto?: string;
      status?: string;
      observacoes?: string | null;
      dataConclusao?: Date;
      precoVenda?: number | null;
      lucro?: number | null;
    } = {};
    if (data.nomeProjeto) updateData.nomeProjeto = data.nomeProjeto;
    if (data.status) updateData.status = data.status;
    if (data.observacoes !== undefined)
      updateData.observacoes = data.observacoes;
    if (data.dataConclusao)
      updateData.dataConclusao = new Date(data.dataConclusao);
    if (data.precoVenda !== undefined) {
      updateData.precoVenda = data.precoVenda
        ? parseFloat(data.precoVenda)
        : null;

      // Recalcular lucro se precoVenda foi atualizado
      const impressaoAtual = await db.impressao3D.findUnique({
        where: { id },
        select: { custoTotal: true },
      });

      if (impressaoAtual) {
        updateData.lucro = data.precoVenda
          ? parseFloat(data.precoVenda) - impressaoAtual.custoTotal
          : null;
      }
    }

    // Se mudou para concluída, atualizar data de conclusão e status da impressora
    if (data.status === "concluida" && !updateData.dataConclusao) {
      updateData.dataConclusao = new Date();

      const impressao = await db.impressao3D.findUnique({
        where: { id },
        select: { impressoraId: true },
      });

      if (impressao) {
        await db.impressora.update({
          where: { id: impressao.impressoraId },
          data: { status: "disponivel" },
        });
      }
    }

    const impressao = await db.impressao3D.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(impressao);
  } catch (error) {
    console.error("Erro ao atualizar impressão:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar impressão" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar impressão (apenas admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar se o usuário é admin
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      role: string;
    };

    if (decoded.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Acesso negado. Apenas administradores podem deletar impressões.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Buscar impressão antes de deletar para reverter atualizações
    const impressao = await db.impressao3D.findUnique({
      where: { id },
      include: {
        filamentos: true,
      },
    });

    if (!impressao) {
      return NextResponse.json(
        { error: "Impressão não encontrada" },
        { status: 404 }
      );
    }

    // Reverter peso dos filamentos
    for (const filamentoImpressao of impressao.filamentos) {
      await db.filamento.update({
        where: { id: filamentoImpressao.filamentoId },
        data: {
          pesoAtual: {
            increment: filamentoImpressao.quantidadeUsada,
          },
        },
      });
    }

    // Reverter filamento total usado da impressora
    await db.impressora.update({
      where: { id: impressao.impressoraId },
      data: {
        filamentoTotalUsado: {
          decrement: impressao.filamentoTotalUsado,
        },
      },
    });

    // Se a impressão não estava finalizada, liberar a impressora
    if (impressao.status !== "Finalizada") {
      await db.impressora.update({
        where: { id: impressao.impressoraId },
        data: {
          status: "disponivel",
        },
      });
    }

    // Deletar impressão (filamentos serão deletados em cascata)
    await db.impressao3D.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Impressão deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar impressão:", error);
    return NextResponse.json(
      { error: "Erro ao deletar impressão" },
      { status: 500 }
    );
  }
}
