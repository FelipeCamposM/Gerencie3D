"use client";
import { useState, useEffect } from "react";
import Header from "@/components/header";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Printer,
  Clock,
  Package,
  DollarSign,
  TrendingUp,
  CheckCircle,
  PlayCircle,
  User,
  Calendar,
  Zap,
  Eye,
  FileText,
  Activity,
} from "lucide-react";

interface Impressao {
  id: string;
  nomeProjeto: string;
  tempoImpressao: number;
  filamentoTotalUsado: number;
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
      cor: string;
    };
  }[];
}

export default function ImpressoesPage() {
  return (
    <ProtectedRoute>
      <ImpressoesContent />
    </ProtectedRoute>
  );
}

function ImpressoesContent() {
  const [impressoes, setImpressoes] = useState<Impressao[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [confirmFinalizarOpen, setConfirmFinalizarOpen] = useState(false);
  const [impressaoToFinalize, setImpressaoToFinalize] = useState<string | null>(
    null
  );
  const [selectedImpressao, setSelectedImpressao] = useState<Impressao | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    fetchImpressoes();

    // Verificar status das impressões a cada 1 minuto
    const interval = setInterval(() => {
      checkAndUpdateStatus();
    }, 60000); // 60000ms = 1 minuto

    return () => clearInterval(interval);
  }, [filterStatus]);

  const fetchImpressoes = async () => {
    try {
      const url =
        filterStatus === "all"
          ? "/api/impressoes"
          : `/api/impressoes?status=${filterStatus}`;
      const response = await fetch(url);
      const data = await response.json();
      setImpressoes(data);
    } catch (error) {
      console.error("Erro ao buscar impressões:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndUpdateStatus = async () => {
    try {
      await fetch("/api/impressoes/check-status", {
        method: "POST",
      });
      // Recarregar impressões após atualizar status
      fetchImpressoes();
    } catch (error) {
      console.error("Erro ao verificar status:", error);
    }
  };

  const handleDetailsClick = (impressao: Impressao) => {
    setSelectedImpressao(impressao);
    setDetailsModalOpen(true);
  };

  const handleFinalizarClick = (impressaoId: string) => {
    setImpressaoToFinalize(impressaoId);
    setConfirmFinalizarOpen(true);
  };

  const handleConfirmFinalizar = async () => {
    if (!impressaoToFinalize) return;

    try {
      const response = await fetch(
        `/api/impressoes/${impressaoToFinalize}/finalizar`,
        {
          method: "PATCH",
        }
      );

      if (response.ok) {
        toast.success("Impressão finalizada com sucesso!", {
          description: "A impressora foi liberada e está disponível novamente.",
        });
        setDetailsModalOpen(false);
        setConfirmFinalizarOpen(false);
        setImpressaoToFinalize(null);
        fetchImpressoes();
      } else {
        const error = await response.json();
        toast.error("Erro ao finalizar impressão", {
          description: error.error || "Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao finalizar impressão:", error);
      toast.error("Erro ao finalizar impressão", {
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    }
  };

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

  const totalImpressoes = impressoes.length;
  const concluidasCount = impressoes.filter(
    (i) => i.status === "concluida"
  ).length;
  const emAndamentoCount = impressoes.filter(
    (i) => i.status === "em_andamento"
  ).length;
  const custoTotal = impressoes.reduce((acc, i) => acc + i.custoTotal, 0);
  const lucroTotal = impressoes.reduce((acc, i) => acc + (i.lucro || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Impressões 3D</h1>
            <p className="text-slate-600 mt-2">
              Histórico e gerenciamento de todas as impressões
            </p>
          </div>
          <button
            onClick={() => router.push("/criar-impressao")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <Printer className="h-5 w-5" />
            Nova Impressão
          </button>
        </div>

        {/* Stats Cards */}
        {!loading && impressoes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total de Impressões
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {totalImpressoes}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Printer className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Concluídas
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {concluidasCount}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Em Andamento
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {emAndamentoCount}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <PlayCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Custo Total
                  </p>
                  <p className="text-2xl font-bold text-orange-600 mt-2">
                    R$ {custoTotal.toFixed(0)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Lucro Total
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    R$ {lucroTotal.toFixed(0)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterStatus("em_andamento")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "em_andamento"
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Em Andamento
          </button>
          <button
            onClick={() => setFilterStatus("concluida")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "concluida"
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Concluídas
          </button>
          <button
            onClick={() => setFilterStatus("cancelada")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "cancelada"
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Canceladas
          </button>
        </div>

        {loading ? (
          <div className="text-slate-700 text-center py-12">Carregando...</div>
        ) : impressoes.length === 0 ? (
          <div className="text-slate-700 text-center py-12">
            Nenhuma impressão encontrada
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {impressoes.map((impressao) => (
              <div
                key={impressao.id}
                className="bg-white rounded-lg border border-slate-200 hover:shadow-lg transition-all shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-xl font-bold text-slate-800">
                        {impressao.nomeProjeto}
                      </h3>
                    </div>
                    <span
                      className={`${getStatusColor(
                        impressao.status
                      )} text-xs px-3 py-1 rounded-full font-medium`}
                    >
                      {getStatusText(impressao.status)}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Printer className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">Impressora:</span>
                      <span className="text-slate-800">
                        {impressao.impressora.nome}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold">Usuário:</span>
                      <span className="text-slate-800">
                        {impressao.usuario.primeiroNome}{" "}
                        {impressao.usuario.ultimoNome}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="font-semibold">Duração:</span>
                      <span className="text-slate-800">
                        {formatDuration(impressao.tempoImpressao)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Package className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">Filamento:</span>
                      <span className="text-slate-800">
                        {impressao.filamentoTotalUsado.toFixed(0)}g
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <DollarSign className="h-4 w-4 text-red-600" />
                      <span className="font-semibold">Custo Total:</span>
                      <span className="text-slate-800">
                        R$ {impressao.custoTotal.toFixed(2)}
                      </span>
                    </div>
                    {impressao.precoVenda && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <span className="font-semibold">Lucro:</span>
                        <span
                          className={`font-medium ${
                            impressao.lucro && impressao.lucro > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          R$ {impressao.lucro?.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="h-4 w-4 text-cyan-600" />
                      <span className="font-semibold">Data:</span>
                      <span className="text-slate-800">
                        {new Date(impressao.dataInicio).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDetailsClick(impressao)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Detalhes
                    </button>
                    {impressao.status === "em_andamento" && (
                      <button
                        onClick={() => handleFinalizarClick(impressao.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Finalizar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Detalhes da Impressão
            </DialogTitle>
          </DialogHeader>

          {selectedImpressao && (
            <div className="space-y-6">
              {/* Informações do Projeto */}
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Informações do Projeto
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <p className="text-slate-600 text-sm font-medium">
                        Nome do Projeto
                      </p>
                    </div>
                    <p className="text-slate-900 font-semibold text-lg">
                      {selectedImpressao.nomeProjeto}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-cyan-600" />
                      <p className="text-slate-600 text-sm font-medium">
                        Status
                      </p>
                    </div>
                    <span
                      className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(
                        selectedImpressao.status
                      )}`}
                    >
                      {getStatusText(selectedImpressao.status)}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <p className="text-slate-600 text-sm font-medium">
                        Data de Início
                      </p>
                    </div>
                    <p className="text-slate-900 font-semibold">
                      {new Date(selectedImpressao.dataInicio).toLocaleString(
                        "pt-BR"
                      )}
                    </p>
                  </div>
                  {selectedImpressao.dataConclusao && (
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-slate-600 text-sm font-medium">
                          Data de Conclusão
                        </p>
                      </div>
                      <p className="text-slate-900 font-semibold">
                        {new Date(
                          selectedImpressao.dataConclusao
                        ).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  )}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <p className="text-slate-600 text-sm font-medium">
                        Tempo de Impressão
                      </p>
                    </div>
                    <p className="text-slate-900 font-bold text-xl">
                      {formatDuration(selectedImpressao.tempoImpressao)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Equipamento e Usuário */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-4">
                  <Printer className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Equipamento e Usuário
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Printer className="h-4 w-4 text-blue-600" />
                      <p className="text-slate-600 text-sm font-medium">
                        Impressora
                      </p>
                    </div>
                    <p className="text-slate-900 font-semibold">
                      {selectedImpressao.impressora.nome}
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      {selectedImpressao.impressora.modelo}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-purple-600" />
                      <p className="text-slate-600 text-sm font-medium">
                        Usuário
                      </p>
                    </div>
                    <p className="text-slate-900 font-semibold">
                      {selectedImpressao.usuario.primeiroNome}{" "}
                      {selectedImpressao.usuario.ultimoNome}
                    </p>
                  </div>
                </div>
              </div>

              {/* Materiais */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Materiais Utilizados
                  </h3>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-600" />
                      <span className="text-slate-700 font-semibold">
                        Filamento Total
                      </span>
                    </div>
                    <span className="text-slate-900 font-bold text-lg">
                      {selectedImpressao.filamentoTotalUsado.toFixed(0)}g
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedImpressao.filamentos.map((fil, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center pl-4"
                      >
                        <span className="text-slate-600 text-sm">
                          {fil.filamento.tipo} - {fil.filamento.cor}
                        </span>
                        <span className="text-slate-800 font-medium text-sm">
                          {fil.quantidadeUsada.toFixed(0)}g
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custos e Lucro */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Custos e Lucro
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <p className="text-slate-600 text-sm font-medium">
                        Custo de Energia
                      </p>
                    </div>
                    <p className="text-slate-900 font-bold text-xl">
                      R$ {selectedImpressao.custoEnergia.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-purple-600" />
                      <p className="text-slate-600 text-sm font-medium">
                        Custo de Filamento
                      </p>
                    </div>
                    <p className="text-slate-900 font-bold text-xl">
                      R$ {selectedImpressao.custoFilamento.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-orange-600" />
                      <p className="text-slate-700 text-sm font-semibold">
                        Custo Total
                      </p>
                    </div>
                    <p className="text-orange-600 font-bold text-2xl">
                      R$ {selectedImpressao.custoTotal.toFixed(2)}
                    </p>
                  </div>
                  {selectedImpressao.precoVenda && (
                    <>
                      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <p className="text-slate-600 text-sm font-medium">
                            Preço de Venda
                          </p>
                        </div>
                        <p className="text-slate-900 font-bold text-xl">
                          R$ {selectedImpressao.precoVenda.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <p className="text-slate-700 text-sm font-semibold">
                            Lucro
                          </p>
                        </div>
                        <p
                          className={`font-bold text-2xl ${
                            selectedImpressao.lucro &&
                            selectedImpressao.lucro > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          R$ {selectedImpressao.lucro?.toFixed(2)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Observações */}
              {selectedImpressao.observacoes && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-800">
                      Observações
                    </h3>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <p className="text-slate-700">
                      {selectedImpressao.observacoes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setDetailsModalOpen(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Finalização */}
      <Dialog
        open={confirmFinalizarOpen}
        onOpenChange={setConfirmFinalizarOpen}
      >
        <DialogContent className="bg-white border-slate-200 text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-xl flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Confirmar Finalização
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-700">
              Deseja finalizar esta impressão e liberar a impressora?
            </p>
            <p className="text-slate-600 text-sm mt-2">
              A impressora ficará disponível novamente para novas impressões.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmFinalizarOpen(false);
                setImpressaoToFinalize(null);
              }}
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmFinalizar}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar Impressão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
