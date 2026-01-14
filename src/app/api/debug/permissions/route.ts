import { NextResponse } from "next/server";
import { getUserPermissions } from "@/utils/permissions/userPermissions";
import jwt from "jsonwebtoken";

interface UserTokenPayload {
  userId: number;
  email: string;
  role: string;
  user_level: string;
  name: string;
  iat: number;
  exp: number;
}

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader
      ?.split("; ")
      .find((row) => row.startsWith("auth-token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Token não encontrado" },
        { status: 401 }
      );
    }

    // Verificar se o token é válido
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as UserTokenPayload;

    // Buscar dados atualizados do usuário no banco
    const db = (await import("@/lib/db")).default;
    const user = await db.user_profiles.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        user_level: true,
        created_at: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Testar a função de permissões
    console.log('Testing permissions for user:', user);
    const userForPermissions = {
      ...user,
      user_level: user.user_level || 'default',
      created_at: user.created_at.toISOString()
    };
    const permissions = await getUserPermissions(userForPermissions);
    console.log('Permissions result:', permissions);

    return NextResponse.json({
      user,
      permissions,
      debug: {
        userId: user.id,
        userLevel: user.user_level,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Erro ao testar permissões:", error);
    return NextResponse.json(
      { 
        error: "Erro interno",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
