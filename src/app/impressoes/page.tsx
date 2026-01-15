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
import { useRouter } from "next/navigation";

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

  const handleFinalizarImpressao = async (impressaoId: string) => {
    if (!confirm("Deseja finalizar esta impressão e liberar a impressora?")) {
      return;
    }

    try {
      const response = await fetch(`/api/impressoes/${impressaoId}/finalizar`, {
        method: "PATCH",
      });

      if (response.ok) {
        alert("Impressão finalizada com sucesso!");
        setDetailsModalOpen(false);
        fetchImpressoes();
      } else {
        const error = await response.json();
        alert(`Erro ao finalizar impressão: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao finalizar impressão:", error);
      alert("Erro ao finalizar impressão. Tente novamente.");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Impressões 3D</h1>
            <p className="text-slate-600 mt-2">
              Histórico de todas as impressões realizadas
            </p>
          </div>
          <button
            onClick={() => router.push("/criar-impressao")}
            className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg shadow-md transition-all"
          >
            + Nova Impressão
          </button>
        </div>

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
                className="bg-white p-6 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-800">
                    {impressao.nomeProjeto}
                  </h3>
                  <span
                    className={`${getStatusColor(
                      impressao.status
                    )} text-xs px-3 py-1 rounded-full`}
                  >
                    {getStatusText(impressao.status)}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Impressora:</span>
                    <span className="text-slate-800 font-medium">
                      {impressao.impressora.nome}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Usuário:</span>
                    <span className="text-slate-800 font-medium">
                      {impressao.usuario.primeiroNome}{" "}
                      {impressao.usuario.ultimoNome}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Duração:</span>
                    <span className="text-slate-800 font-medium">
                      {formatDuration(impressao.tempoImpressao)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Filamento:</span>
                    <span className="text-slate-800 font-medium">
                      {impressao.filamentoTotalUsado.toFixed(0)}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Custo Total:</span>
                    <span className="text-slate-800 font-medium">
                      R$ {impressao.custoTotal.toFixed(2)}
                    </span>
                  </div>
                  {impressao.precoVenda && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Lucro:</span>
                      <span
                        className={`font-medium ${
                          impressao.lucro && impressao.lucro > 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        R$ {impressao.lucro?.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Data:</span>
                    <span className="text-slate-800 font-medium">
                      {new Date(impressao.dataInicio).toLocaleDateString(
                        "pt-BR"
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDetailsClick(impressao)}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors text-sm"
                  >
                    Ver Detalhes
                  </button>
                  {impressao.status === "em_andamento" && (
                    <button
                      onClick={() => handleFinalizarImpressao(impressao.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors text-sm font-medium"
                    >
                      Finalizar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-2xl">
              Detalhes da Impressão
            </DialogTitle>
          </DialogHeader>

          {selectedImpressao && (
            <div className="space-y-6">
              {/* Informações do Projeto */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Informações do Projeto
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-600 text-sm">Nome do Projeto</p>
                    <p className="text-slate-800 font-medium">
                      {selectedImpressao.nomeProjeto}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(
                        selectedImpressao.status
                      )}`}
                    >
                      {getStatusText(selectedImpressao.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Data de Início</p>
                    <p className="text-slate-800 font-medium">
                      {new Date(selectedImpressao.dataInicio).toLocaleString(
                        "pt-BR"
                      )}
                    </p>
                  </div>
                  {selectedImpressao.dataConclusao && (
                    <div>
                      <p className="text-slate-600 text-sm">
                        Data de Conclusão
                      </p>
                      <p className="text-slate-800 font-medium">
                        {new Date(
                          selectedImpressao.dataConclusao
                        ).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-600 text-sm">Tempo de Impressão</p>
                    <p className="text-slate-800 font-medium">
                      {formatDuration(selectedImpressao.tempoImpressao)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Equipamento e Usuário */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Equipamento e Usuário
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-600 text-sm">Impressora</p>
                    <p className="text-slate-800 font-medium">
                      {selectedImpressao.impressora.nome}
                    </p>
                    <p className="text-slate-600 text-xs">
                      {selectedImpressao.impressora.modelo}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Usuário</p>
                    <p className="text-slate-800 font-medium">
                      {selectedImpressao.usuario.primeiroNome}{" "}
                      {selectedImpressao.usuario.ultimoNome}
                    </p>
                  </div>
                </div>
              </div>

              {/* Materiais */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Materiais Utilizados
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Filamento Total</span>
                    <span className="text-slate-800 font-medium">
                      {selectedImpressao.filamentoTotalUsado.toFixed(0)}g
                    </span>
                  </div>
                  {selectedImpressao.filamentos.map((fil, index) => (
                    <div key={index} className="flex justify-between pl-4">
                      <span className="text-slate-600 text-sm">
                        {fil.filamento.tipo} - {fil.filamento.cor}
                      </span>
                      <span className="text-slate-800 text-sm">
                        {fil.quantidadeUsada.toFixed(0)}g
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custos e Lucro */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Custos e Lucro
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Custo de Energia</span>
                    <span className="text-slate-800">
                      R$ {selectedImpressao.custoEnergia.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Custo de Filamento</span>
                    <span className="text-slate-800">
                      R$ {selectedImpressao.custoFilamento.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-300 pt-2">
                    <span className="text-slate-600 font-medium">
                      Custo Total
                    </span>
                    <span className="text-slate-800 font-medium">
                      R$ {selectedImpressao.custoTotal.toFixed(2)}
                    </span>
                  </div>
                  {selectedImpressao.precoVenda && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Preço de Venda</span>
                        <span className="text-slate-800">
                          R$ {selectedImpressao.precoVenda.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-300 pt-2">
                        <span className="text-slate-600 font-medium">
                          Lucro
                        </span>
                        <span
                          className={`font-medium ${
                            selectedImpressao.lucro &&
                            selectedImpressao.lucro > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          R$ {selectedImpressao.lucro?.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Observações */}
              {selectedImpressao.observacoes && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Observações
                  </h3>
                  <p className="text-slate-700">
                    {selectedImpressao.observacoes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setDetailsModalOpen(false)}
              className="bg-slate-700 hover:bg-slate-600"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
