import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  Calendar, 
  Clock,
  Server,
  Zap
} from "lucide-react";
import { formatLastUpdate } from "../../utils/homeUtils";

export const SystemStatus: React.FC = () => {
  return (
    <Card className="bg-slate-800/50 border-slate-700 min-h-[370px] max-h-[370px]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          Status do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mx-3">
          {/* Status do Servidor */}
          <div className="p-5 rounded-lg bg-green-500/10 border border-green-500/20 min-h-[72px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-medium text-sm">Sistema</span>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Online
              </Badge>
            </div>
            <p className="text-slate-300 text-sm">
              Todos os serviços operando normalmente
            </p>
          </div>

          {/* Horário de Entrada */}
          <div className="p-5 rounded-lg bg-blue-500/10 border border-blue-500/20 min-h-[72px] flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 font-medium text-sm">Última Entrada</span>
            </div>
            <p className="text-slate-300 text-sm">
              {formatLastUpdate()}
            </p>
          </div>

          {/* Versão do Sistema */}
          <div className="p-5 rounded-lg bg-purple-500/10 border border-purple-500/20 min-h-[72px] flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="text-purple-400 font-medium text-sm">Versão</span>
            </div>
            <p className="text-slate-300 text-sm">
              v1.2.5 - Correção notas de Rio Verdde - 10/09/2025
            </p>
          </div>
    </div>
  </CardContent>
    </Card>
  );
};
