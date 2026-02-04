import {
  FileText,
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  Printer,
  User,
  Package,
  DollarSign,
  TrendingUp,
  Zap,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Impressao {
  id: string;
  nomeProjeto: string;
  tempoImpressao: number;
  filamentoTotalUsado: number;
  filamentoDesperdiciado: number | null;
  custoTotal: number;
  custoEnergia: number;
  custoFilamento: number;
  precoVenda: number | null;
  lucro: number | null;
  status: string;
  observacoes: string | null;
  dataInicio: string;
  dataConclusao: string | null;
  usuario: {
    id: number;
    primeiroNome: string;
    ultimoNome: string;
  };
  impressora: {
    id: number;
    nome: string;
    modelo: string;
  };
  filamentos: {
    quantidadeUsada: number;
    filamento: {
      id: string;
      tipo: string;
      nomeCor: string;
      cor: string;
      usuario?: {
        primeiroNome: string;
        ultimoNome: string;
      };
    };
  }[];
}

interface ImpressaoDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  impressao: Impressao | null;
  timer?: number;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMarkAsFailed: () => void;
}

export function ImpressaoDetailsModal({
  open,
  onOpenChange,
  impressao,
  timer,
  isAdmin,
  onEdit,
  onDelete,
  onMarkAsFailed,
}: ImpressaoDetailsModalProps) {
  if (!impressao) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluida":
        return "bg-green-500";
      case "em_andamento":
        return "bg-blue-500";
      case "cancelada":
        return "bg-red-500";
      case "falhou":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "concluida":
        return "Concluída";
      case "em_andamento":
        return "Em Andamento";
      case "cancelada":
        return "Cancelada";
      case "falhou":
        return "Falhou";
      default:
        return status;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return "Finalizando...";

    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}min ${secs}s restantes`;
    } else if (mins > 0) {
      return `${mins}min ${secs}s restantes`;
    } else {
      return `${secs}s restantes`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-blue-400 [&::-webkit-scrollbar-thumb]:to-indigo-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-slate-100 hover:[&::-webkit-scrollbar-thumb]:from-blue-500 hover:[&::-webkit-scrollbar-thumb]:to-indigo-700">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 h-8 w-8 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-lg flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 z-50 cursor-pointer"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
        <DialogHeader>
          <DialogTitle className="text-slate-800 text-xl md:text-2xl flex items-center gap-3 pr-10">
            <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <span className="font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Detalhes da Impressão
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Projeto */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 md:p-6 rounded-2xl border-2 border-blue-200 shadow-lg">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <FileText className="h-4.5 w-4.5 md:h-5 md:w-5 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-black text-blue-800">
                Informações do Projeto
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="bg-white p-3 md:p-4 rounded-xl border-2 border-blue-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <div className="h-7 w-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                  </div>
                  <p className="text-blue-700 text-sm font-bold uppercase tracking-wide">
                    Nome do Projeto
                  </p>
                </div>
                <p className="text-slate-900 font-bold text-base md:text-lg">
                  {impressao.nomeProjeto}
                </p>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-xl border-2 border-cyan-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <div className="h-7 w-7 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Activity className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                  </div>
                  <p className="text-cyan-700 text-sm font-bold uppercase tracking-wide">
                    Status
                  </p>
                </div>
                <span
                  className={`inline-block px-4 py-2 rounded-xl text-sm font-bold shadow-md ${getStatusColor(
                    impressao.status
                  )} text-white`}
                >
                  {getStatusText(impressao.status)}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border-2 border-green-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-green-700 text-sm font-bold uppercase tracking-wide">
                    Data de Início
                  </p>
                </div>
                <p className="text-slate-900 font-bold">
                  {new Date(impressao.dataInicio).toLocaleString("pt-BR")}
                </p>
              </div>
              {impressao.dataConclusao && (
                <div className="bg-white p-4 rounded-xl border-2 border-emerald-100 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-emerald-700 text-sm font-bold uppercase tracking-wide">
                      Data de Conclusão
                    </p>
                  </div>
                  <p className="text-slate-900 font-bold">
                    {new Date(impressao.dataConclusao).toLocaleString("pt-BR")}
                  </p>
                </div>
              )}
              <div className="bg-white p-4 rounded-xl border-2 border-orange-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-orange-700 text-sm font-bold uppercase tracking-wide">
                    Tempo de Impressão
                  </p>
                </div>
                <p className="text-slate-900 font-black text-xl">
                  {formatDuration(impressao.tempoImpressao)}
                </p>
              </div>
              {impressao.status === "em_andamento" && timer !== undefined && (
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-xl border-2 border-blue-300 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center animate-pulse">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-blue-800 text-sm font-black uppercase tracking-wide">
                      Tempo Restante
                    </p>
                  </div>
                  <p
                    className={`font-black text-2xl ${
                      timer <= 5
                        ? "text-red-600 animate-pulse"
                        : "bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                    }`}
                  >
                    {formatTimeRemaining(timer)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Equipamento e Usuário */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 p-4 md:p-6 rounded-2xl border-2 border-purple-200 shadow-lg">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="h-9 w-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <Printer className="h-4.5 w-4.5 md:h-5 md:w-5 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-black text-purple-800">
                Equipamento e Usuário
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Printer className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-blue-700 text-sm font-bold uppercase tracking-wide">
                    Impressora
                  </p>
                </div>
                <p className="text-slate-900 font-bold">
                  {impressao.impressora.nome}
                </p>
                <p className="text-slate-600 text-xs mt-1 font-semibold">
                  {impressao.impressora.modelo}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border-2 border-purple-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-purple-700 text-sm font-bold uppercase tracking-wide">
                    Usuário
                  </p>
                </div>
                <p className="text-slate-900 font-bold">
                  {impressao.usuario.primeiroNome}{" "}
                  {impressao.usuario.ultimoNome}
                </p>
              </div>
            </div>
          </div>

          {/* Materiais */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 p-4 md:p-6 rounded-2xl border-2 border-green-200 shadow-lg">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="h-9 w-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                <Package className="h-4.5 w-4.5 md:h-5 md:w-5 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-black text-green-800">
                Materiais Utilizados
              </h3>
            </div>
            <div className="bg-white p-4 rounded-xl border-2 border-green-100 shadow-md">
              <div className="flex items-center justify-between mb-3 pb-3 border-b-2 border-green-100">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-green-700 font-black uppercase tracking-wide">
                    Filamento Estimado
                  </span>
                </div>
                <span className="text-slate-900 font-black text-lg">
                  {impressao.filamentoTotalUsado.toFixed(0)}g
                </span>
              </div>
              {impressao.status === "falhou" &&
                impressao.filamentoDesperdiciado !== null && (
                  <div className="flex items-center justify-between mb-3 pb-3 border-b-2 border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 -mx-4 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 bg-gradient-to-br from-orange-400 to-amber-600 rounded-lg flex items-center justify-center">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-orange-800 font-black uppercase tracking-wide">
                        Filamento Real Usado (Falha)
                      </span>
                    </div>
                    <span className="text-orange-600 font-black text-lg">
                      {impressao.filamentoDesperdiciado.toFixed(0)}g
                    </span>
                  </div>
                )}
              <div className="space-y-2">
                {impressao.filamentos.map((fil, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center pl-4 bg-slate-50 rounded-lg py-2 px-3 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border-2 border-white shadow-md ring-2 ring-slate-200 flex-shrink-0"
                        style={{ backgroundColor: fil.filamento.cor }}
                      />
                      <span className="text-slate-700 text-sm font-semibold">
                        {fil.filamento.tipo} - {fil.filamento.nomeCor}
                      </span>
                    </div>
                    <span className="text-slate-900 font-black text-sm">
                      {fil.quantidadeUsada.toFixed(0)}g
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custos e Lucro */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50/50 p-4 md:p-6 rounded-2xl border-2 border-yellow-200 shadow-lg">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="h-9 w-9 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <DollarSign className="h-4.5 w-4.5 md:h-5 md:w-5 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-black text-yellow-800">
                Custos e Lucro
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border-2 border-yellow-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-yellow-700 text-sm font-bold uppercase tracking-wide">
                    Custo de Energia
                  </p>
                </div>
                <p className="text-slate-900 font-black text-xl">
                  R$ {impressao.custoEnergia.toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border-2 border-purple-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-purple-700 text-sm font-bold uppercase tracking-wide">
                    Custo de Filamento
                  </p>
                </div>
                <p className="text-slate-900 font-black text-xl">
                  R$ {impressao.custoFilamento.toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-200 shadow-lg md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-orange-800 text-sm font-black uppercase tracking-wide">
                    Custo Total
                  </p>
                </div>
                <p className="text-orange-600 font-black text-2xl">
                  R$ {impressao.custoTotal.toFixed(2)}
                </p>
              </div>
              {impressao.precoVenda && (
                <>
                  <div className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-7 w-7 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-blue-700 text-sm font-bold uppercase tracking-wide">
                        Preço de Venda
                      </p>
                    </div>
                    <p className="text-slate-900 font-black text-xl">
                      R$ {impressao.precoVenda.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-200 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-emerald-800 text-sm font-black uppercase tracking-wide">
                        Lucro
                      </p>
                    </div>
                    <p
                      className={`font-black text-2xl ${
                        impressao.lucro && impressao.lucro > 0
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
                          : "text-red-600"
                      }`}
                    >
                      R$ {impressao.lucro?.toFixed(2)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Observações */}
          {impressao.observacoes && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 md:p-6 rounded-2xl border-2 border-slate-200 shadow-lg">
              <div className="flex items-center gap-3 mb-2 md:mb-3">
                <div className="h-9 w-9 bg-gradient-to-br from-slate-500 to-slate-700 rounded-lg flex items-center justify-center shadow-md">
                  <FileText className="h-4.5 w-4.5 md:h-5 md:w-5 text-white" />
                </div>
                <h3 className="text-base md:text-lg font-black text-slate-800">
                  Observações
                </h3>
              </div>
              <div className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-md">
                <p className="text-slate-700 font-medium leading-relaxed">
                  {impressao.observacoes}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex flex-col md:flex-row justify-between w-full gap-2">
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={onEdit}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 text-blue-700 hover:from-blue-100 hover:to-indigo-100 font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={onDelete}
                  className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 text-red-700 hover:from-red-100 hover:to-rose-100 font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </Button>
              )}
              {impressao.status === "concluida" && (
                <Button
                  variant="outline"
                  onClick={onMarkAsFailed}
                  className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 text-orange-700 hover:from-orange-100 hover:to-amber-100 font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Marcar como Falhou
                </Button>
              )}
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Fechar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
