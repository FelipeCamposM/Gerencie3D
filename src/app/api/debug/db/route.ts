import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    console.log("Testando conexão com o banco de dados...");
    
    // Teste simples de conexão
    const result = await db.$queryRaw`SELECT 1 as test`;
    console.log("Conexão bem-sucedida:", result);
    
    // Testar uma consulta real
    const userCount = await db.user_profiles.count();
    console.log("Total de usuários:", userCount);
    
    // Testar tabela de solicitações
    const solicitacoesCount = await db.solicitacoes.count();
    console.log("Total de solicitações:", solicitacoesCount);
    
    return NextResponse.json({
      success: true,
      message: "Conexão com o banco funcionando",
      stats: {
        usuarios: userCount,
        solicitacoes: solicitacoesCount
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        databaseUrl: process.env.DATABASE_URL ? "Configurada" : "Não configurada"
      }
    });

  } catch (error) {
    console.error("Erro na conexão com o banco:", error);
    
    return NextResponse.json({
      success: false,
      error: "Erro na conexão com o banco de dados",
      details: error instanceof Error ? error.message : "Erro desconhecido",
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        databaseUrl: process.env.DATABASE_URL ? "Configurada" : "Não configurada"
      }
    }, { status: 500 });
  }
}
