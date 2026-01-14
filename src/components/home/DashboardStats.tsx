import React from "react";
import { Card, CardContent } from "../ui/card";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalSolicitacoes: number;
    pendentes: number;
    aprovadas: number;
    recusadas: number;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const statsCards = [
    {
      title: "Total de Solicitações",
      value: stats.totalSolicitacoes,
      description: "Todas as solicitações",
      icon: FileText,
      bgColor: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      title: "Pendentes",
      value: stats.pendentes,
      description: "Aguardando análise",
      icon: Clock,
      bgColor: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
    },
    {
      title: "Aprovadas",
      value: stats.aprovadas,
      description: "Aprovadas hoje",
      icon: CheckCircle2,
      bgColor: "bg-green-500/20",
      iconColor: "text-green-400",
    },
    {
      title: "Recusadas",
      value: stats.recusadas,
      description: "Requerem atenção",
      icon: XCircle,
      bgColor: "bg-red-500/20",
      iconColor: "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card
            key={index}
            className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-slate-500 text-sm mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 ${stat.bgColor} rounded-full`}>
                  <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
