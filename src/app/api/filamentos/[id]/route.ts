import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

// GET - Buscar filamento por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filamento = await db.filamento.findUnique({
      where: { id },
      include: {
        comprador: {
          select: {
            id: true,
            primeiroNome: true,
            ultimoNome: true,
            email: true,
            imagemUsuario: true,
          },
        },
        ultimoUsuario: {
          select: {
            id: true,
            primeiroNome: true,
            ultimoNome: true,
            imagemUsuario: true,
          },
        },
        impressoes: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            impressao: {
              select: {
                id: true,
                nomeProjeto: true,
                dataInicio: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!filamento) {
      return NextResponse.json(
        { error: "Filamento não encontrado" },
        { status: 404 }
      );
    }

    // Converter imagemUsuario de Buffer para base64
    const filamentoComImagem = {
      ...filamento,
      comprador: {
        ...filamento.comprador,
        imagemUsuario: filamento.comprador.imagemUsuario
          ? Buffer.from(filamento.comprador.imagemUsuario).toString("base64")
          : null,
      },
      ultimoUsuario: filamento.ultimoUsuario
        ? {
            ...filamento.ultimoUsuario,
            imagemUsuario: filamento.ultimoUsuario.imagemUsuario
              ? Buffer.from(filamento.ultimoUsuario.imagemUsuario).toString(
                  "base64"
                )
              : null,
          }
        : null,
    };

    return NextResponse.json(filamentoComImagem);
  } catch (error) {
    console.error("Erro ao buscar filamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar filamento" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar filamento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updateData: Partial<{
      tipo: string;
      nomeCor: string;
      cor: string;
      pesoAtual: number;
      precoCompra: number;
      ultimaUtilizacao: Date;
    }> = {};
    if (data.tipo) updateData.tipo = data.tipo;
    if (data.nomeCor) updateData.nomeCor = data.nomeCor;
    if (data.cor) updateData.cor = data.cor;
    if (data.pesoAtual !== undefined)
      updateData.pesoAtual = parseFloat(data.pesoAtual);
    if (data.precoCompra !== undefined)
      updateData.precoCompra = parseFloat(data.precoCompra);
    if (data.ultimaUtilizacao)
      updateData.ultimaUtilizacao = new Date(data.ultimaUtilizacao);

    const filamento = await db.filamento.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(filamento);
  } catch (error) {
    console.error("Erro ao atualizar filamento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar filamento" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar filamento (apenas admin)
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

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "Configuração inválida" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as unknown as {
      role: string;
    };

    if (decoded.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Acesso negado. Apenas administradores podem deletar filamentos.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verificar se o filamento está sendo usado em alguma impressão ATIVA
    // Ignorar impressões que falharam ou foram canceladas, pois o filamento já foi devolvido
    const impressoesComFilamento = await db.impressaoFilamento.findFirst({
      where: {
        filamentoId: id,
        impressao: {
          status: {
            notIn: ["falhou", "cancelada"],
          },
        },
      },
      include: {
        impressao: {
          select: {
            nomeProjeto: true,
            status: true,
          },
        },
      },
    });

    if (impressoesComFilamento) {
      return NextResponse.json(
        {
          error:
            "Este filamento não pode ser excluído porque está sendo usado em uma ou mais impressões ativas.",
          details: `Filamento usado na impressão: ${impressoesComFilamento.impressao.nomeProjeto} (${impressoesComFilamento.impressao.status})`,
        },
        { status: 400 }
      );
    }

    // Deletar os registros de impressao_filamento de impressões que falharam ou foram canceladas
    // pois o filamento já foi devolvido ao estoque
    await db.impressaoFilamento.deleteMany({
      where: {
        filamentoId: id,
        impressao: {
          status: {
            in: ["falhou", "cancelada"],
          },
        },
      },
    });

    // Agora pode deletar o filamento sem conflito de foreign key
    await db.filamento.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Filamento deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar filamento:", error);
    return NextResponse.json(
      { error: "Erro ao deletar filamento" },
      { status: 500 }
    );
  }
}
