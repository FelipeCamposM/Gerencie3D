import React from "react";
import { BarChart3 } from "lucide-react";

interface WelcomeHeaderProps {
  user: {
    primeiroNome: string;
    ultimoNome: string;
  } | null;
  timeOfDay: "morning" | "afternoon" | "evening";
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  user,
  timeOfDay,
}) => {
  const getGreeting = () => {
    switch (timeOfDay) {
      case "morning":
        return "Bom dia, ";
      case "afternoon":
        return "Boa tarde, ";
      case "evening":
        return "Boa noite, ";
      default:
        return "Olá, ";
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <BarChart3 className="h-8 w-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">
            Bem-vindo ao Sistema de Devoluções R3
          </h1>
          {user && (
            <p className="text-slate-400">
              {getGreeting()}
              <span className="text-green-400 font-medium">
                {user.primeiroNome} {user.ultimoNome}
              </span>
              ! Aqui está um resumo das atividades.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
