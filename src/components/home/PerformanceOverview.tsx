import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp } from "lucide-react";

interface PerformanceOverviewProps {
  stats: {
    totalSolicitacoes: number;
    pendentes: number;
    aprovadas: number;
  };
}

export const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ stats }) => {
  const approvalRate = stats.totalSolicitacoes > 0 
    ? Math.round((stats.aprovadas / stats.totalSolicitacoes) * 100) 
    : 0;

  const pendingRate = stats.totalSolicitacoes > 0 
    ? Math.round((stats.pendentes / stats.totalSolicitacoes) * 100) 
    : 0;

  return (
    <Card className="bg-slate-800/50 border-slate-700 mt-6">
      <CardHeader className="px-4 ml-1">
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-400" />
          Resumo de Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mx-4">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Taxa de Aprovação</span>
              <span className="text-green-400 font-medium">{approvalRate}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${approvalRate}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Solicitações Pendentes</span>
              <span className="text-yellow-400 font-medium">{pendingRate}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${pendingRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
