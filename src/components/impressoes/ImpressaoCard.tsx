import {
  FileText,
  Printer,
  User,
  Clock,
  Package,
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Activity,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    imagemUsuario?: string | null;
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

interface ImpressaoCardProps {
  impressao: Impressao;
  timer?: number;
  isAdmin: boolean;
  onDetailsClick: () => void;
  onFinalizarClick: () => void;
  onFalhouClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function ImpressaoCard({
  impressao,
  timer,
  isAdmin,
  onDetailsClick,
  onFinalizarClick,
  onFalhouClick,
  onEditClick,
  onDeleteClick,
}: ImpressaoCardProps) {
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

  const getStatusGradient = (status: string) => {
    switch (status) {
      case "concluida":
        return "from-emerald-500 to-green-600";
      case "em_andamento":
        return "from-blue-500 to-indigo-600";
      case "cancelada":
        return "from-red-500 to-rose-600";
      case "falhou":
        return "from-orange-500 to-amber-600";
      default:
        return "from-gray-500 to-slate-600";
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/60 hover:border-slate-300 hover:shadow-2xl transition-all duration-300 shadow-md overflow-hidden transform hover:-translate-y-1">
      {/* Barra colorida superior baseada no status */}
      <div
        className={`h-1.5 bg-gradient-to-r ${getStatusGradient(
          impressao.status
        )}`}
      />

      {/* Decoração de fundo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/5 to-purple-500/5 rounded-full blur-3xl -z-10 group-hover:from-blue-400/10 group-hover:to-purple-500/10 transition-all duration-500" />

      <div className="p-6">
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`h-12 w-12 bg-gradient-to-br ${getStatusGradient(
                impressao.status
              )} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
            >
              <FileText className="h-6 w-6 text-white drop-shadow-md" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-800 truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-600 group-hover:bg-clip-text transition-all">
                {impressao.nomeProjeto}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                ID: {impressao.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <span
            className={`${getStatusColor(
              impressao.status
            )} text-xs px-3 py-1.5 rounded-full font-bold text-white shadow-md whitespace-nowrap`}
          >
            {getStatusText(impressao.status)}
          </span>
        </div>

        {/* Timer Destacado - Apenas para impressões em andamento */}
        {impressao.status === "em_andamento" && timer !== undefined && (
          <div className="relative mb-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-5 py-4 rounded-2xl shadow-2xl shadow-blue-500/40 border-2 border-blue-400/30 overflow-hidden">
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

            <div className="relative text-center">
              <div className="flex items-center justify-center gap-2.5 mb-2">
                <div className="h-8 w-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center animate-pulse">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-bold text-white/90 uppercase tracking-widest">
                  Tempo Restante
                </p>
              </div>
              <p className="text-3xl font-black text-white tracking-tight drop-shadow-lg mb-3">
                {formatTimeRemaining(timer)}
              </p>
              {timer > 0 && (
                <div className="relative">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/30">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full transition-all duration-1000 shadow-lg shadow-green-400/50"
                      style={{
                        width: `${
                          ((impressao.tempoImpressao * 60 - timer) /
                            (impressao.tempoImpressao * 60)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-white/80 font-semibold mt-2">
                    {Math.round(
                      ((impressao.tempoImpressao * 60 - timer) /
                        (impressao.tempoImpressao * 60)) *
                        100
                    )}
                    % concluído
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {/* Impressora */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl p-3.5 border border-blue-100/60 group-hover:from-blue-100/80 group-hover:to-indigo-100/60 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <Printer className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-0.5">
                  Impressora
                </p>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {impressao.impressora.nome} - {impressao.impressora.modelo}
                </p>
              </div>
            </div>
          </div>

          {/* Usuário */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 rounded-xl p-3.5 border border-purple-100/60 group-hover:from-purple-100/80 group-hover:to-pink-100/60 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
                <User className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-0.5">
                  Responsável
                </p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 ring-2 ring-purple-200">
                    {impressao.usuario.imagemUsuario &&
                    impressao.usuario.imagemUsuario.length > 0 ? (
                      <AvatarImage
                        src={`data:image/jpeg;base64,${impressao.usuario.imagemUsuario}`}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center">
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {impressao.usuario.primeiroNome}{" "}
                    {impressao.usuario.ultimoNome}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Duração */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-xl p-3.5 border border-orange-100/60 group-hover:from-orange-100/80 group-hover:to-amber-100/60 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-sm">
                <Clock className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-0.5">
                  Duração Total
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {formatDuration(impressao.tempoImpressao)}
                </p>
              </div>
            </div>
          </div>

          {/* Filamentos */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-xl p-3.5 border border-green-100/60 group-hover:from-green-100/80 group-hover:to-emerald-100/60 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                <Package className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">
                  Filamento Total
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {impressao.filamentoTotalUsado.toFixed(2)}g
                </p>
              </div>
            </div>
            {impressao.status === "falhou" &&
              impressao.filamentoDesperdiciado !== null && (
                <div className="mb-3 bg-orange-100/80 border border-orange-200 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-orange-600" />
                    <span className="text-xs font-semibold text-orange-700">
                      Real Usado (Falha):
                    </span>
                    <span className="text-sm font-bold text-orange-800">
                      {impressao.filamentoDesperdiciado.toFixed(2)}g
                    </span>
                  </div>
                </div>
              )}
            <div className="space-y-2 pl-2">
              {impressao.filamentos.map((f) => (
                <div
                  key={f.filamento.id}
                  className="flex items-center gap-2.5 bg-white/60 rounded-lg px-2.5 py-1.5"
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200"
                    style={{ backgroundColor: f.filamento.cor }}
                  />
                  <span className="text-xs text-slate-700 font-medium flex-1 truncate">
                    {f.filamento.tipo} - {f.filamento.nomeCor}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {f.quantidadeUsada.toFixed(1)}g
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Custos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-red-50 to-rose-50/50 rounded-xl p-3 border border-red-100/60">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-7 w-7 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-semibold text-red-700">Custo</p>
              </div>
              <p className="text-lg font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                R$ {formatPrice(impressao.custoTotal)}
              </p>
            </div>

            {impressao.precoVenda ? (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-xl p-3 border border-emerald-100/60">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-7 w-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-emerald-700">
                    Lucro
                  </p>
                </div>
                <p
                  className={`text-lg font-black ${
                    (impressao.lucro || 0) >= 0
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
                      : "text-red-600"
                  }`}
                >
                  R$ {formatPrice(impressao.lucro || 0)}
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-cyan-50 to-sky-50/50 rounded-xl p-3 border border-cyan-100/60">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-7 w-7 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-cyan-700">Data</p>
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {new Date(impressao.dataInicio).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={onDetailsClick}
              className="flex-1 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 border border-slate-300"
            >
              <Eye className="h-4.5 w-4.5" />
              Detalhes
            </button>
            {impressao.status === "em_andamento" && (
              <>
                <button
                  onClick={onFinalizarClick}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5"
                >
                  <CheckCircle className="h-4.5 w-4.5" />
                  Finalizar
                </button>
                <button
                  onClick={onFalhouClick}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5"
                >
                  <Activity className="h-4.5 w-4.5" />
                  Falhou
                </button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEditClick}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              <Edit className="h-4.5 w-4.5" />
              Editar
            </button>
            {isAdmin && (
              <button
                onClick={onDeleteClick}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5"
              >
                <Trash2 className="h-4.5 w-4.5" />
                Deletar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
