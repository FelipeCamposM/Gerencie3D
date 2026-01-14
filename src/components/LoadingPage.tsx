import React from "react";

interface LoadingPageProps {
  message?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({ 
  message = "Carregando..." 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <div className="text-white text-xl">{message}</div>
      </div>
    </div>
  );
};

// Componente específico para loading do dashboard (mantém compatibilidade)
export const DashboardLoading: React.FC = () => {
  return <LoadingPage message="Carregando..." />;
};

// Componente para loading de páginas (sem header)
export const PageLoadingWithHeader: React.FC<{ message?: string }> = ({ message }) => {
  return <LoadingPage message={message} />;
};

// Componente para loading de autenticação (sem header)
export const AuthLoading: React.FC = () => {
  return <LoadingPage message="Verificando autenticação..." />;
};
