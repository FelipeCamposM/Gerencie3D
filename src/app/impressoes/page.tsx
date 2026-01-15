"use client";
import { useState, useEffect } from "react";
import Header from "@/components/header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { isUserAdmin } from "@/lib/auth";
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
  Search,
  Edit,
  Trash2,
  List,
  XCircle,
  AlertCircle,
} from "lucide-react";

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

export default function ImpressoesPage() {
  return (
    <ProtectedRoute>
      <ImpressoesContent />
    </ProtectedRoute>
  );
}

function ImpressoesContent() {
  const { user } = useAuth();
  const isAdmin = isUserAdmin(user);
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [impressaoToDelete, setImpressaoToDelete] = useState<string | null>(
    null
  );
  const [deletingInProgress, setDeletingInProgress] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    nomeProjeto: string;
    precoVenda: string;
    observacoes: string;
  }>({ nomeProjeto: "", precoVenda: "", observacoes: "" });
  const [confirmFalhouOpen, setConfirmFalhouOpen] = useState(false);
  const [impressaoToFail, setImpressaoToFail] = useState<string | null>(null);
  const [filamentoDesperdiciado, setFilamentoDesperdiciado] =
    useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetchImpressoes();

    // Verificar status das impressões a cada 1 minuto
    const interval = setInterval(() => {
      checkAndUpdateStatus();
    }, 60000); // 60000ms = 1 minuto

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  // Atualizar timers a cada segundo
  useEffect(() => {
    const updateTimers = () => {
      const newTimers: Record<string, number> = {};

      impressoes.forEach((impressao) => {
        if (impressao.status === "em_andamento") {
          const dataInicio = new Date(impressao.dataInicio).getTime();
          const agora = new Date().getTime();
          const tempoDecorridoSegundos = Math.floor(
            (agora - dataInicio) / 1000
          ); // em segundos
          const tempoTotalSegundos = impressao.tempoImpressao * 60; // converter minutos para segundos
          const tempoRestanteSegundos =
            tempoTotalSegundos - tempoDecorridoSegundos;

          if (tempoRestanteSegundos <= 0) {
            // Tempo acabou, finalizar automaticamente
            finalizarAutomaticamente(impressao.id);
            newTimers[impressao.id] = 0;
          } else {
            newTimers[impressao.id] = tempoRestanteSegundos;
          }
        }
      });

      setTimers(newTimers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [impressoes]);

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

  const finalizarAutomaticamente = async (impressaoId: string) => {
    try {
      const response = await fetch(`/api/impressoes/${impressaoId}/finalizar`, {
        method: "PATCH",
      });

      if (response.ok) {
        toast.success("Impressão finalizada automaticamente!", {
          description:
            "O tempo de impressão acabou. A impressora está disponível novamente.",
        });
        fetchImpressoes();
      }
    } catch (error) {
      console.error("Erro ao finalizar impressão automaticamente:", error);
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

  const handleFalhouClick = (impressaoId: string) => {
    setImpressaoToFail(impressaoId);
    setFilamentoDesperdiciado("");
    setConfirmFalhouOpen(true);
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

  const handleConfirmFalhou = async () => {
    if (!impressaoToFail) return;

    const filamentoDesperdice = parseFloat(filamentoDesperdiciado) || 0;

    try {
      const response = await fetch(
        `/api/impressoes/${impressaoToFail}/falhou`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filamentoDesperdiciado: filamentoDesperdice }),
        }
      );

      if (response.ok) {
        toast.success("Impressão marcada como falhou!", {
          description:
            "A impressora foi liberada e o filamento foi registrado.",
        });
        setDetailsModalOpen(false);
        setConfirmFalhouOpen(false);
        setImpressaoToFail(null);
        setFilamentoDesperdiciado("");
        fetchImpressoes();
      } else {
        const error = await response.json();
        toast.error("Erro ao marcar impressão como falhou", {
          description: error.error || "Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao marcar impressão como falhou:", error);
      toast.error("Erro ao marcar impressão como falhou", {
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    }
  };

  const handleDeleteClick = (impressaoId: string) => {
    setImpressaoToDelete(impressaoId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!impressaoToDelete) return;

    setDeletingInProgress(true);
    try {
      const response = await fetch(`/api/impressoes/${impressaoToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Impressão deletada com sucesso!", {
          description: "Os filamentos foram devolvidos ao estoque.",
        });
        setDeleteModalOpen(false);
        setDetailsModalOpen(false);
        setImpressaoToDelete(null);
        fetchImpressoes();
      } else {
        const error = await response.json();
        toast.error("Erro ao deletar impressão", {
          description: error.error || "Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao deletar impressão:", error);
      toast.error("Erro ao deletar impressão", {
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setDeletingInProgress(false);
    }
  };

  const handleEditClick = (impressao: Impressao) => {
    setEditFormData({
      nomeProjeto: impressao.nomeProjeto,
      precoVenda: impressao.precoVenda?.toString() || "",
      observacoes: impressao.observacoes || "",
    });
    setEditModalOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!selectedImpressao) return;

    try {
      const response = await fetch(`/api/impressoes/${selectedImpressao.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeProjeto: editFormData.nomeProjeto,
          precoVenda: editFormData.precoVenda
            ? parseFloat(editFormData.precoVenda)
            : null,
          observacoes: editFormData.observacoes || null,
        }),
      });

      if (response.ok) {
        toast.success("Impressão atualizada com sucesso!");
        setEditModalOpen(false);
        setDetailsModalOpen(false);
        fetchImpressoes();
      } else {
        const error = await response.json();
        toast.error("Erro ao atualizar impressão", {
          description: error.error || "Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar impressão:", error);
      toast.error("Erro ao atualizar impressão", {
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

  // Filtrar impressões por pesquisa
  const impressoesFiltradas = impressoes.filter((impressao) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      impressao.nomeProjeto.toLowerCase().includes(searchLower) ||
      impressao.impressora.nome.toLowerCase().includes(searchLower) ||
      impressao.impressora.modelo.toLowerCase().includes(searchLower) ||
      `${impressao.usuario.primeiroNome} ${impressao.usuario.ultimoNome}`
        .toLowerCase()
        .includes(searchLower)
    );
  });

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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Impressões 3D</h1>
            <p className="text-slate-600 mt-2">
              Histórico e gerenciamento de todas as impressões
            </p>
          </div>
          <button
            onClick={() => router.push("/criar-impressao")}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="h-5 w-5" />
            Nova Impressão
          </button>
        </div>

        {/* Stats Cards - Mobile: Single Card | Desktop: Grid */}
        {!loading && impressoes.length > 0 && (
          <>
            {/* Mobile View - Single Card */}
            <div className="md:hidden mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Estatísticas
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Printer className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        Total de Impressões
                      </p>
                    </div>
                    <p className="text-xl font-bold text-slate-900">
                      {totalImpressoes}
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        Concluídas
                      </p>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      {concluidasCount}
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <PlayCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        Em Andamento
                      </p>
                    </div>
                    <p className="text-xl font-bold text-blue-600">
                      {emAndamentoCount}
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-orange-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        Custo Total
                      </p>
                    </div>
                    <p className="text-xl font-bold text-orange-600">
                      R$ {custoTotal.toFixed(0)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        Lucro Total
                      </p>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      R$ {lucroTotal.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop View - Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
          </>
        )}

        {/* Barra de Pesquisa */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por projeto, impressora ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filtros - Mobile: Vertical sem gap | Desktop: Horizontal */}
        <div className="mb-6">
          {/* Mobile View - Botões verticais sem gap */}
          <div className="md:hidden flex flex-col rounded-lg overflow-hidden border border-slate-300 bg-white shadow-sm">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-3 transition-colors cursor-pointer flex items-center gap-2 border-b border-slate-200 last:border-b-0 ${
                filterStatus === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
              }`}
            >
              <List className="h-4 w-4" />
              <span className="font-medium">Todas</span>
            </button>
            <button
              onClick={() => setFilterStatus("em_andamento")}
              className={`px-4 py-3 transition-colors cursor-pointer flex items-center gap-2 border-b border-slate-200 last:border-b-0 ${
                filterStatus === "em_andamento"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
              }`}
            >
              <PlayCircle className="h-4 w-4" />
              <span className="font-medium">Em Andamento</span>
            </button>
            <button
              onClick={() => setFilterStatus("concluida")}
              className={`px-4 py-3 transition-colors cursor-pointer flex items-center gap-2 border-b border-slate-200 last:border-b-0 ${
                filterStatus === "concluida"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Concluídas</span>
            </button>
            <button
              onClick={() => setFilterStatus("cancelada")}
              className={`px-4 py-3 transition-colors cursor-pointer flex items-center gap-2 border-b border-slate-200 last:border-b-0 ${
                filterStatus === "cancelada"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
              }`}
            >
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Canceladas</span>
            </button>
            <button
              onClick={() => setFilterStatus("falhou")}
              className={`px-4 py-3 transition-colors cursor-pointer flex items-center gap-2 ${
                filterStatus === "falhou"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Falhadas</span>
            </button>
          </div>

          {/* Desktop View - Botões horizontais */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                filterStatus === "all"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300"
              }`}
            >
              <List className="h-4 w-4" />
              Todas
            </button>
            <button
              onClick={() => setFilterStatus("em_andamento")}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                filterStatus === "em_andamento"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300"
              }`}
            >
              <PlayCircle className="h-4 w-4" />
              Em Andamento
            </button>
            <button
              onClick={() => setFilterStatus("concluida")}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                filterStatus === "concluida"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300"
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              Concluídas
            </button>
            <button
              onClick={() => setFilterStatus("cancelada")}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                filterStatus === "cancelada"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300"
              }`}
            >
              <XCircle className="h-4 w-4" />
              Canceladas
            </button>
            <button
              onClick={() => setFilterStatus("falhou")}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                filterStatus === "falhou"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300"
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              Falhadas
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-xl text-slate-700">
              Carregando impressões...
            </div>
          </div>
        ) : impressoesFiltradas.length === 0 ? (
          <div className="text-slate-700 text-center py-12">
            {searchTerm ? (
              <>
                <p className="text-lg font-medium mb-2">
                  Nenhuma impressão encontrada
                </p>
                <p className="text-slate-500">Tente outro termo de pesquisa</p>
              </>
            ) : (
              "Nenhuma impressão encontrada"
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {impressoesFiltradas.map((impressao) => (
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

                  {/* Timer Destacado - Apenas para impressões em andamento */}
                  {impressao.status === "em_andamento" &&
                    timers[impressao.id] !== undefined && (
                      <div className="mb-4 bg-gradient-to-br from-blue-600 to-cyan-600 px-4 py-2 rounded-xl shadow-lg border-2 border-blue-400">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Clock className="h-5 w-5 text-white animate-pulse" />
                            <span className="text-white font-semibold text-sm uppercase tracking-wider">
                              Tempo Restante
                            </span>
                          </div>
                          <div
                            className={`font-mono font-bold text-3xl transition-all duration-300 ${
                              timers[impressao.id] <= 300
                                ? "text-red-300 animate-pulse"
                                : "text-white"
                            }`}
                          >
                            {formatTimeRemaining(timers[impressao.id])}
                          </div>
                          {timers[impressao.id] <= 300 && (
                            <div className="mt-2 flex items-center justify-center gap-1">
                              <Activity className="h-3 w-3 text-red-300 animate-pulse" />
                              <span className="text-red-200 text-xs font-medium">
                                Finalizando em breve
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

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
                      <span className="font-semibold">Duração Total:</span>
                      <span className="text-slate-800">
                        {formatDuration(impressao.tempoImpressao)}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">
                          Filamento Estimado:
                        </span>
                        <span className="text-slate-800">
                          {impressao.filamentoTotalUsado.toFixed(0)}g
                        </span>
                      </div>
                      {impressao.status === "falhou" &&
                        impressao.filamentoDesperdiciado !== null && (
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-orange-600" />
                            <span className="font-semibold">
                              Filamento Real Usado:
                            </span>
                            <span className="text-orange-600 font-bold">
                              {impressao.filamentoDesperdiciado.toFixed(0)}g
                            </span>
                          </div>
                        )}
                      <div className="space-y-1 pl-6">
                        {impressao.filamentos.map((fil, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full border border-slate-300 flex-shrink-0"
                              style={{ backgroundColor: fil.filamento.cor }}
                            />
                            <span className="text-slate-700 text-xs">
                              {fil.filamento.tipo} - {fil.filamento.nomeCor} (
                              {fil.quantidadeUsada.toFixed(0)}g)
                            </span>
                          </div>
                        ))}
                      </div>
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

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDetailsClick(impressao)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                        Detalhes
                      </button>
                      {impressao.status === "em_andamento" && (
                        <>
                          <button
                            onClick={() => handleFalhouClick(impressao.id)}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Activity className="h-4 w-4" />
                            Falhou
                          </button>
                          <button
                            onClick={() => handleFinalizarClick(impressao.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Finalizar
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(impressao)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-blue-200 cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteClick(impressao.id)}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-red-200 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                          Deletar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-xl md:text-2xl flex items-center gap-2">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              Detalhes da Impressão
            </DialogTitle>
          </DialogHeader>

          {selectedImpressao && (
            <div className="space-y-6">
              {/* Informações do Projeto */}
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-4 md:p-6 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  <h3 className="text-base md:text-lg font-semibold text-slate-800">
                    Informações do Projeto
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-white p-3 md:p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                      <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
                      <p className="text-slate-600 text-sm font-medium">
                        Nome do Projeto
                      </p>
                    </div>
                    <p className="text-slate-900 font-semibold text-base md:text-lg">
                      {selectedImpressao.nomeProjeto}
                    </p>
                  </div>
                  <div className="bg-white p-3 md:p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                      <Activity className="h-3.5 w-3.5 md:h-4 md:w-4 text-cyan-600" />
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
                  {selectedImpressao.status === "em_andamento" &&
                    timers[selectedImpressao.id] !== undefined && (
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-300 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
                          <p className="text-blue-700 text-sm font-semibold">
                            Tempo Restante
                          </p>
                        </div>
                        <p
                          className={`font-bold text-2xl ${
                            timers[selectedImpressao.id] <= 5
                              ? "text-red-600 animate-pulse"
                              : "text-blue-600"
                          }`}
                        >
                          {formatTimeRemaining(timers[selectedImpressao.id])}
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/* Equipamento e Usuário */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-6 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <Printer className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  <h3 className="text-base md:text-lg font-semibold text-slate-800">
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
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-6 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <Package className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  <h3 className="text-base md:text-lg font-semibold text-slate-800">
                    Materiais Utilizados
                  </h3>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-600" />
                      <span className="text-slate-700 font-semibold">
                        Filamento Estimado
                      </span>
                    </div>
                    <span className="text-slate-900 font-bold text-lg">
                      {selectedImpressao.filamentoTotalUsado.toFixed(0)}g
                    </span>
                  </div>
                  {selectedImpressao.status === "falhou" &&
                    selectedImpressao.filamentoDesperdiciado !== null && (
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200 bg-orange-50 -mx-4 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-orange-600" />
                          <span className="text-orange-700 font-semibold">
                            Filamento Real Usado (Falha)
                          </span>
                        </div>
                        <span className="text-orange-600 font-bold text-lg">
                          {selectedImpressao.filamentoDesperdiciado.toFixed(0)}g
                        </span>
                      </div>
                    )}
                  <div className="space-y-2">
                    {selectedImpressao.filamentos.map((fil, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center pl-4"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0"
                            style={{ backgroundColor: fil.filamento.cor }}
                          />
                          <span className="text-slate-600 text-sm">
                            {fil.filamento.tipo} - {fil.filamento.nomeCor}
                          </span>
                        </div>
                        <span className="text-slate-800 font-medium text-sm">
                          {fil.quantidadeUsada.toFixed(0)}g
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custos e Lucro */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 md:p-6 rounded-xl border border-yellow-100">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                  <h3 className="text-base md:text-lg font-semibold text-slate-800">
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
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2 md:mb-3">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                    <h3 className="text-base md:text-lg font-semibold text-slate-800">
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
            <div className="flex flex-col md:flex-row justify-between w-full gap-2">
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={() =>
                    selectedImpressao && handleEditClick(selectedImpressao)
                  }
                  className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      selectedImpressao &&
                      handleDeleteClick(selectedImpressao.id)
                    }
                    className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar
                  </Button>
                )}
                {selectedImpressao &&
                  selectedImpressao.status === "concluida" && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        selectedImpressao &&
                        handleFalhouClick(selectedImpressao.id)
                      }
                      className="bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Marcar como Falhou
                    </Button>
                  )}
              </div>
              <Button
                onClick={() => setDetailsModalOpen(false)}
                className="bg-slate-600 hover:bg-slate-700"
              >
                Fechar
              </Button>
            </div>
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

      {/* Dialog de Confirmação de Falha */}
      <Dialog open={confirmFalhouOpen} onOpenChange={setConfirmFalhouOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-xl flex items-center gap-2">
              <Activity className="h-6 w-6 text-orange-600" />
              Marcar Impressão como Falhou
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-slate-700">
              Esta impressão falhou durante o processo?
            </p>

            {/* Informação sobre o total previsto */}
            {selectedImpressao && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-5 w-5 text-blue-800" />
                  <p className="font-semibold text-sm text-blue-800">
                    Filamento Previsto:
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-lg font-bold text-blue-900 mb-2">
                      Total: {selectedImpressao.filamentoTotalUsado.toFixed(2)}g
                    </p>

                    <div className="space-y-2 mt-3 pt-3 border-t border-blue-100">
                      {selectedImpressao.filamentos.map((fil, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm bg-slate-50 rounded p-2"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <div
                              className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0"
                              style={{ backgroundColor: fil.filamento.cor }}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-slate-800">
                                {fil.filamento.tipo} - {fil.filamento.nomeCor}
                              </p>
                              {fil.filamento.usuario && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Comprador:{" "}
                                  {fil.filamento.usuario.primeiroNome}{" "}
                                  {fil.filamento.usuario.ultimoNome}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="font-semibold text-slate-700 ml-2">
                            {fil.quantidadeUsada.toFixed(2)}g
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filamento Realmente Usado (gramas)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={filamentoDesperdiciado}
                onChange={(e) => setFilamentoDesperdiciado(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0.0"
              />
              <p className="text-slate-500 text-xs mt-1">
                Informe a quantidade real de filamento que foi utilizado antes
                da falha. O resto será devolvido ao estoque.
              </p>
            </div>
            <p className="text-slate-600 text-sm">
              A impressora será liberada, o filamento não utilizado será
              devolvido ao estoque e a quantidade real usada será registrada.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmFalhouOpen(false);
                setImpressaoToFail(null);
                setFilamentoDesperdiciado("");
              }}
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmFalhou}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Activity className="h-4 w-4 mr-2" />
              Confirmar Falha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-xl flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-red-600" />
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {deletingInProgress ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p className="text-slate-700 font-medium">
                  Deletando impressão...
                </p>
              </div>
            ) : (
              <>
                <p className="text-slate-700 font-semibold mb-2">
                  Tem certeza que deseja deletar esta impressão?
                </p>
                <p className="text-slate-600 text-sm">
                  Esta ação não pode ser desfeita. Os filamentos usados serão
                  devolvidos ao estoque.
                </p>
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setImpressaoToDelete(null);
              }}
              disabled={deletingInProgress}
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deletingInProgress}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar Impressão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-xl flex items-center gap-2">
              <Edit className="h-6 w-6 text-blue-600" />
              Editar Impressão
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nome do Projeto
              </label>
              <input
                type="text"
                value={editFormData.nomeProjeto}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    nomeProjeto: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do projeto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Preço de Venda (Opcional)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={editFormData.precoVenda}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    precoVenda: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Observações
              </label>
              <textarea
                value={editFormData.observacoes}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    observacoes: e.target.value,
                  })
                }
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observações sobre a impressão..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
