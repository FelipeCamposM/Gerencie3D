"use client";
import { useState, useEffect } from "react";
import Header from "@/components/header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { isUserAdmin } from "@/lib/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { ImpressaoCard } from "@/components/impressoes/ImpressaoCard";
import { StatsCards } from "@/components/impressoes/StatsCards";
import { UserStatsCard } from "@/components/impressoes/UserStatsCard";
import { SearchBar } from "@/components/impressoes/SearchBar";
import { FilterButtons } from "@/components/impressoes/FilterButtons";
import { ImpressaoDetailsModal } from "@/components/impressoes/ImpressaoDetailsModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ConfirmFinalizarDialog,
  ConfirmFalhouDialog,
  DeleteConfirmDialog,
  EditImpressaoDialog,
} from "@/components/impressoes/ImpressaoDialogs";

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
  const [confirmingFalhou, setConfirmingFalhou] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3 colunas x 3 linhas
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

  // Resetar página ao mudar filtro ou pesquisa
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  const handleFinalizarClick = (impressaoId: string) => {
    setImpressaoToFinalize(impressaoId);
    setConfirmFinalizarOpen(true);
  };

  const handleFalhouClick = (impressaoId: string) => {
    const impressao = impressoes.find((i) => i.id === impressaoId);
    if (impressao) {
      setSelectedImpressao(impressao);
    }
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

    setConfirmingFalhou(true);
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
    } finally {
      setConfirmingFalhou(false);
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
    setSelectedImpressao(impressao);
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
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Printer className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Impressões 3D
              </h1>
              <p className="text-slate-600 mt-1 font-medium">
                Histórico e gerenciamento de todas as impressões
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/criar-impressao")}
            className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer font-bold border-0"
          >
            <Printer className="h-5 w-5" />
            Nova Impressão
          </button>
        </div>

        {/* Stats Cards */}
        {!loading && impressoes.length > 0 && (
          <StatsCards
            totalImpressoes={totalImpressoes}
            concluidasCount={concluidasCount}
            emAndamentoCount={emAndamentoCount}
            custoTotal={custoTotal}
            lucroTotal={lucroTotal}
          />
        )}

        {/* Card de Estatísticas por Usuário */}
        {!loading && impressoes.length > 0 && (
          <UserStatsCard impressoes={impressoes} />
        )}

        {/* Barra de Pesquisa */}
        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        {/* Filtros */}
        <FilterButtons
          currentFilter={filterStatus}
          onFilterChange={setFilterStatus}
        />

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
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {impressoesFiltradas
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((impressao) => (
                  <ImpressaoCard
                    key={impressao.id}
                    impressao={impressao}
                    timer={timers[impressao.id]}
                    isAdmin={isAdmin}
                    onDetailsClick={() => handleDetailsClick(impressao)}
                    onFinalizarClick={() => handleFinalizarClick(impressao.id)}
                    onFalhouClick={() => handleFalhouClick(impressao.id)}
                    onEditClick={() => handleEditClick(impressao)}
                    onDeleteClick={() => handleDeleteClick(impressao.id)}
                  />
                ))}
            </div>

            {/* Paginação */}
            {impressoesFiltradas.length > itemsPerPage && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent className="flex flex-wrap gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        namePrevious="Anterior"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        className={`cursor-pointer ${
                          currentPage === 1
                            ? "opacity-50 cursor-not-allowed pointer-events-none"
                            : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
                        }`}
                      />
                    </PaginationItem>

                    {Array.from(
                      {
                        length: Math.ceil(
                          impressoesFiltradas.length / itemsPerPage
                        ),
                      },
                      (_, i) => i + 1
                    ).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className={`cursor-pointer ${
                            currentPage === page
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg font-bold"
                              : "bg-white text-slate-700 border-2 border-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all"
                          }`}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        nameNext="Próximo"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(
                              Math.ceil(
                                impressoesFiltradas.length / itemsPerPage
                              ),
                              prev + 1
                            )
                          )
                        }
                        className={`cursor-pointer ${
                          currentPage ===
                          Math.ceil(impressoesFiltradas.length / itemsPerPage)
                            ? "opacity-50 cursor-not-allowed pointer-events-none"
                            : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
                        }`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Detalhes */}
      <ImpressaoDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        impressao={selectedImpressao}
        timer={selectedImpressao ? timers[selectedImpressao.id] : undefined}
        isAdmin={isAdmin}
        onEdit={() => selectedImpressao && handleEditClick(selectedImpressao)}
        onDelete={() =>
          selectedImpressao && handleDeleteClick(selectedImpressao.id)
        }
        onMarkAsFailed={() =>
          selectedImpressao && handleFalhouClick(selectedImpressao.id)
        }
      />

      {/* Dialog de Confirmação de Finalização */}
      <ConfirmFinalizarDialog
        open={confirmFinalizarOpen}
        onOpenChange={setConfirmFinalizarOpen}
        onConfirm={handleConfirmFinalizar}
      />

      {/* Dialog de Confirmação de Falha */}
      <ConfirmFalhouDialog
        open={confirmFalhouOpen}
        onOpenChange={setConfirmFalhouOpen}
        onConfirm={handleConfirmFalhou}
        filamentoDesperdiciado={filamentoDesperdiciado}
        onFilamentoDesperdiciciadoChange={setFilamentoDesperdiciado}
        selectedImpressao={selectedImpressao}
        confirming={confirmingFalhou}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <DeleteConfirmDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        deleting={deletingInProgress}
      />

      {/* Dialog de Edição */}
      <EditImpressaoDialog
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onConfirm={handleConfirmEdit}
        formData={editFormData}
        onFormDataChange={setEditFormData}
      />
    </div>
  );
}
