import { FileText } from "lucide-react";

export function PageHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <FileText className="h-8 w-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">
            Nova Solicitação de Devolução
          </h1>
          <p className="text-slate-400">
            Crie uma nova solicitação de devolução de produtos
          </p>
        </div>
      </div>
    </div>
  );
}
