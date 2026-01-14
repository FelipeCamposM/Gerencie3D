"use client";
import { useAuth } from "@/contexts/AuthContext";
import { canCreateSolicitacao } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingPage } from "./LoadingPage";

interface CreateSolicitacaoRouteProps {
  children: React.ReactNode;
}

export default function CreateSolicitacaoRoute({ children }: CreateSolicitacaoRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !canCreateSolicitacao(user)) {
      // Redirect users who can't create solicitations to home page
      router.replace("/");
    }
  }, [user, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingPage message="Verificando permissões..." />;
  }

  // Show access denied for users who can't create solicitations
  if (user && !canCreateSolicitacao(user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-white mb-2">Acesso Negado</h1>
          <p className="text-slate-400 mb-6">
            Você não tem permissão para criar solicitações.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  // Show content for users who can create solicitations
  return <>{children}</>;
}
