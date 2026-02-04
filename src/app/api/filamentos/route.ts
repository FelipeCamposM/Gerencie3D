import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET - Listar todos os filamentos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tipo = searchParams.get("tipo");
    const cor = searchParams.get("cor");

    const where: { tipo?: string; cor?: string } = {};
    if (tipo) where.tipo = tipo;
    if (cor) where.cor = cor;

    const filamentos = await db.filamento.findMany({
      where,
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
      },
      orderBy: {
        dataCompra: "desc",
      },
    });

    // Calcular porcentagem restante para cada filamento e converter imagemUsuario
    const filamentosComPorcentagem = filamentos.map((fil) => ({
      ...fil,
      porcentagemRestante: (fil.pesoAtual / fil.pesoInicial) * 100,
      comprador: {
        ...fil.comprador,
        imagemUsuario: fil.comprador.imagemUsuario
          ? Buffer.from(fil.comprador.imagemUsuario).toString("base64")
          : null,
      },
      ultimoUsuario: fil.ultimoUsuario
        ? {
            ...fil.ultimoUsuario,
            imagemUsuario: fil.ultimoUsuario.imagemUsuario
              ? Buffer.from(fil.ultimoUsuario.imagemUsuario).toString("base64")
              : null,
          }
        : null,
    }));

    return NextResponse.json(filamentosComPorcentagem);
  } catch (error) {
    console.error("Erro ao buscar filamentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar filamentos" },
      { status: 500 }
    );
  }
}

// POST - Criar novo filamento
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const filamento = await db.filamento.create({
      data: {
        tipo: data.tipo,
        nomeCor: data.nomeCor,
        cor: data.cor,
        pesoInicial: parseFloat(data.pesoInicial),
        pesoAtual: parseFloat(data.pesoAtual || data.pesoInicial),
        precoCompra: parseFloat(data.precoCompra),
        dataCompra: data.dataCompra ? new Date(data.dataCompra) : new Date(),
        compradorId: parseInt(data.compradorId),
      },
    });

    return NextResponse.json(filamento, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar filamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar filamento" },
      { status: 500 }
    );
  }
}
