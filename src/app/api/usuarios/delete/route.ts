import { NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

export async function DELETE(request: Request) {
  try {
    // Verificar se o usuário é admin
    const token = request.headers
      .get("cookie")
      ?.split("; ")
      .find((c) => c.startsWith("auth-token="))
      ?.split("=")[1];
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as {
      role: string;
    };

    if (decoded.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Acesso negado. Apenas administradores podem deletar usuários.",
        },
        { status: 403 }
      );
    }

    const { id } = await request.json();

    console.log("ID recebido para exclusão:", id);

    if (!id) {
      console.error("ID não fornecido na requisição");
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deletedUser = await db.user_profiles.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json(
      { error: "Usuário não encontrado ou erro ao excluir" },
      { status: 500 }
    );
  }
}
