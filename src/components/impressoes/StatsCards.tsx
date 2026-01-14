import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Printer,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Impressao } from "@/types/impressao";

interface StatsCardsProps {
  impressoes: Impressao[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ impressoes }) => {
  const totalCusto = impressoes.reduce((acc, imp) => acc + imp.custoTotal, 0);
  const totalLucro = impressoes.reduce((acc, imp) => acc + (imp.lucro || 0), 0);
  const totalFilamento = impressoes.reduce(
    (acc, imp) => acc + imp.filamentoTotalUsado,
    0
  );

  const stats = [
    {
      title: "Total",
      value: impressoes.length,
      icon: Printer,
      bgColor: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      title: "Em Andamento",
      value: impressoes.filter((i) => i.status === "em_andamento").length,
      icon: PlayCircle,
      bgColor: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
    },
    {
      title: "Concluídas",
      value: impressoes.filter((i) => i.status === "concluida").length,
      icon: CheckCircle2,
      bgColor: "bg-green-500/20",
      iconColor: "text-green-400",
    },
    {
      title: "Canceladas",
      value: impressoes.filter((i) => i.status === "cancelada").length,
      icon: XCircle,
      bgColor: "bg-red-500/20",
      iconColor: "text-red-400",
    },
    {
      title: "Falhadas",
      value: impressoes.filter((i) => i.status === "falhou").length,
      icon: Clock,
      bgColor: "bg-orange-500/20",
      iconColor: "text-orange-400",
    },
    {
      title: "Custo Total",
      value: `R$ ${totalCusto.toFixed(2)}`,
      icon: DollarSign,
      bgColor: "bg-purple-500/20",
      iconColor: "text-purple-400",
    },
    {
      title: "Lucro Total",
      value: `R$ ${totalLucro.toFixed(2)}`,
      icon: TrendingUp,
      bgColor: "bg-lime-500/20",
      iconColor: "text-lime-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 p-0">
                <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                  <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="mb-1.5">
                  <p className="text-sm text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">
                    {typeof stat.value === "number" ? stat.value : stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
