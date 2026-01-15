import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Filamento } from "@/types/filamento";

interface FilamentCardProps {
  filamento: Filamento;
  onViewDetails: (id: string) => void;
  onEdit: (filamento: Filamento) => void;
  onDelete: (id: string) => void;
}

export default function FilamentCard({
  filamento,
  onViewDetails,
  onEdit,
  onDelete,
}: FilamentCardProps) {
  const getStatusColor = (porcentagem: number) => {
    if (porcentagem > 50) return "text-green-600";
    if (porcentagem > 20) return "text-yellow-600";
    return "text-red-600";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-16 h-16 rounded-lg border-4 border-slate-300 shadow-md"
            style={{ backgroundColor: filamento.cor }}
          />
          <div>
            <h3 className="font-bold text-lg text-slate-800">
              {filamento.tipo}
            </h3>
            <p className="text-sm text-slate-600">{filamento.nomeCor}</p>
            <p className="text-xs text-slate-500">{filamento.cor}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Peso Inicial:</span>
          <span className="font-semibold">{filamento.pesoInicial}g</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Peso Atual:</span>
          <span className="font-semibold">{filamento.pesoAtual}g</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Restante:</span>
          <span
            className={`font-semibold ${getStatusColor(
              filamento.porcentagemRestante
            )}`}
          >
            {filamento.porcentagemRestante.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div
            className={`h-2 rounded-full ${
              filamento.porcentagemRestante > 50
                ? "bg-green-600"
                : filamento.porcentagemRestante > 20
                ? "bg-yellow-600"
                : "bg-red-600"
            }`}
            style={{ width: `${filamento.porcentagemRestante}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Preço:</span>
          <span className="font-semibold">
            {formatCurrency(filamento.precoCompra)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Comprador:</span>
          <span className="font-semibold">
            {filamento.comprador.primeiroNome}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onViewDetails(filamento.id)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Detalhes
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(filamento)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(filamento.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
