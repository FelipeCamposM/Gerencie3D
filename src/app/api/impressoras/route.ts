import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET - Listar todas as impressoras
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    const impressoras = await db.impressora.findMany({
      where: status ? { status } : undefined,
      include: {
        ultimoUsuario: {
          select: {
            id: true,
            primeiroNome: true,
            ultimoNome: true,
            email: true,
          },
        },
        ultimaImpressao: {
          select: {
            id: true,
            nomeProjeto: true,
            dataConclusao: true,
            status: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(impressoras);
  } catch (error) {
    console.error("Erro ao buscar impressoras:", error);
    return NextResponse.json(
      { error: "Erro ao buscar impressoras" },
      { status: 500 }
    );
  }
}

// POST - Criar nova impressora
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const impressora = await db.impressora.create({
      data: {
        nome: data.nome,
        modelo: data.modelo,
        marca: data.marca,
        localizacao: data.localizacao,
        gastoEnergiaKwh: parseFloat(data.gastoEnergiaKwh),
        precoEnergiaKwh: parseFloat(data.precoEnergiaKwh),
        status: data.status || "disponivel",
      },
    });

    return NextResponse.json(impressora, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar impressora:", error);
    return NextResponse.json(
      { error: "Erro ao criar impressora" },
      { status: 500 }
    );
  }
}
