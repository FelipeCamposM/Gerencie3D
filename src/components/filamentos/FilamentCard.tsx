import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Filamento } from "@/types/filamento";
import { useAuth } from "@/contexts/AuthContext";
import { isUserAdmin } from "@/lib/auth";

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
  const { user } = useAuth();
  const isAdmin = isUserAdmin(user);

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
    <div className="group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border-2 border-slate-200 hover:border-slate-300 hover:shadow-2xl transition-all duration-300 p-6 overflow-hidden transform hover:-translate-y-1">
      {/* Decoração de fundo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/5 to-pink-500/5 rounded-full blur-3xl -z-10 group-hover:from-purple-400/10 group-hover:to-pink-500/10 transition-all duration-500" />

      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-2xl border-4 border-white shadow-2xl ring-2 ring-slate-200 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
            style={{ backgroundColor: filamento.cor }}
          />
          <div>
            <h3 className="font-black text-lg text-slate-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-600 group-hover:bg-clip-text transition-all">
              {filamento.tipo}
            </h3>
            <p className="font-bold text-base text-slate-700">
              {filamento.nomeCor}
            </p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {filamento.cor}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl p-3 border border-blue-100/60">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
              Peso Inicial:
            </span>
            <span className="font-black text-slate-800">
              {(filamento.pesoInicial / 1000).toFixed(3)}kg
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 rounded-xl p-3 border border-purple-100/60">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
              Peso Atual:
            </span>
            <span className="font-black text-slate-800">
              {filamento.pesoAtual.toFixed(2)}g
            </span>
          </div>
        </div>

        <div
          className={`bg-gradient-to-br rounded-xl p-3 border-2 ${
            filamento.porcentagemRestante > 50
              ? "from-green-50 to-emerald-50/50 border-green-200"
              : filamento.porcentagemRestante > 20
              ? "from-yellow-50 to-amber-50/50 border-yellow-200"
              : "from-red-50 to-rose-50/50 border-red-200"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span
              className={`text-xs font-bold uppercase tracking-wide ${
                filamento.porcentagemRestante > 50
                  ? "text-green-700"
                  : filamento.porcentagemRestante > 20
                  ? "text-yellow-700"
                  : "text-red-700"
              }`}
            >
              Restante:
            </span>
            <span
              className={`font-black text-lg ${getStatusColor(
                filamento.porcentagemRestante
              )}`}
            >
              {filamento.porcentagemRestante.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full shadow-lg transition-all duration-500 ${
                filamento.porcentagemRestante > 50
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : filamento.porcentagemRestante > 20
                  ? "bg-gradient-to-r from-yellow-500 to-amber-600"
                  : "bg-gradient-to-r from-red-500 to-rose-600"
              }`}
              style={{ width: `${filamento.porcentagemRestante}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-xl p-3 border border-orange-100/60">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">
              Preço:
            </span>
            <span className="font-black text-slate-800">
              {formatCurrency(filamento.precoCompra)}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-sky-50/50 rounded-xl p-3 border border-cyan-100/60">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-cyan-700 uppercase tracking-wide">
              Comprador:
            </span>
            <span className="font-black text-slate-800">
              {filamento.comprador.primeiroNome}{" "}
              {filamento.comprador.ultimoNome}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 cursor-pointer bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border-2 border-slate-300 text-slate-700 font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          onClick={() => onViewDetails(filamento.id)}
        >
          <Eye className="h-4 w-4 mr-1.5" />
          Detalhes
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-300 text-blue-700 font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          onClick={() => onEdit(filamento)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        {isAdmin && (
          <Button
            variant="destructive"
            size="sm"
            className="cursor-pointer bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 border-0 transition-all hover:-translate-y-0.5"
            onClick={() => onDelete(filamento.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
