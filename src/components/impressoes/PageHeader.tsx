import React from "react";
import { Printer } from "lucide-react";

export const PageHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Printer className="h-8 w-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">
            Histórico de Impressões 3D
          </h1>
          <p className="text-slate-400">
            Visualize e gerencie todas as impressões realizadas
          </p>
        </div>
      </div>
    </div>
  );
};
