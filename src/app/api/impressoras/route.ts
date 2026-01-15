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

    // Converter Bytes para base64
    const impressorasComImagem = impressoras.map((impressora) => ({
      ...impressora,
      imagemImpressora: impressora.imagemImpressora
        ? `data:image/jpeg;base64,${Buffer.from(
            impressora.imagemImpressora
          ).toString("base64")}`
        : null,
    }));

    return NextResponse.json(impressorasComImagem);
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

    // Converter base64 para Buffer se houver imagem
    let imagemBuffer = null;
    if (data.imagemImpressora) {
      // Remover o prefixo data:image/...;base64,
      const base64Data = data.imagemImpressora.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      imagemBuffer = Buffer.from(base64Data, "base64");
    }

    const impressora = await db.impressora.create({
      data: {
        nome: data.nome,
        modelo: data.modelo,
        marca: data.marca,
        localizacao: data.localizacao,
        imagemImpressora: imagemBuffer,
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
