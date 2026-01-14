import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { isUserAdmin, canCreateSolicitacao } from "@/lib/auth";
import {
  FileText,
  Plus,
  Users,
  Zap,
} from "lucide-react";

export const QuickActions: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = isUserAdmin(user);
  const canCreate = canCreateSolicitacao(user);

  const quickActions = [
    {
      title: 'Nova Solicitação',
      description: 'Criar uma nova solicitação de devolução',
      icon: Plus,
      href: '/criar-solicitacao',
      color: 'bg-blue-500 hover:bg-blue-600',
      requiresCreatePermission: true,
    },
    {
      title: 'Ver Solicitações',
      description: 'Visualizar todas as solicitações',
      icon: FileText,
      href: '/solicitacoes',
      color: 'bg-emerald-500 hover:bg-emerald-600',
    },
    {
      title: 'Gerenciar Usuários',
      description: 'Administrar usuários do sistema',
      icon: Users,
      href: '/usuarios',
      color: 'bg-purple-500 hover:bg-purple-600',
      adminOnly: true,
    },
  ];

  // Filter actions based on user level and permissions
  const filteredActions = quickActions.filter(action => {
    if (action.adminOnly && !isAdmin) return false;
    if (action.requiresCreatePermission && !canCreate) return false;
    return true;
  });

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="grid gap-4 px-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
          }}
        >
          {filteredActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className={`h-auto p-6 flex flex-col items-center gap-3 ${action.color} text-white hover:text-white transition-all duration-200 hover:scale-105 w-full min-w-0 max-w-full overflow-hidden`}
                onClick={() => router.push(action.href)}
              >
                <IconComponent className="h-8 w-8" />
                <div className="flex flex-col max-w-full w-full">
                  <div className="w-full">
                    <p className="font-semibold truncate w-full">{action.title}</p>
                  </div>
                  <div className="text-center w-full">
                    <p className="text-sm opacity-90 break-words w-full truncate">{action.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
