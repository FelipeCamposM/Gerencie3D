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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Impressões 3D</h1>
            <p className="text-gray-400 mt-2">
              Histórico de todas as impressões realizadas
            </p>
          </div>
          <button
            onClick={() => router.push("/criar-impressao")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
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
                : "bg-slate-700 text-gray-300 hover:bg-slate-600"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterStatus("em_andamento")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "em_andamento"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-gray-300 hover:bg-slate-600"
            }`}
          >
            Em Andamento
          </button>
          <button
            onClick={() => setFilterStatus("concluida")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "concluida"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-gray-300 hover:bg-slate-600"
            }`}
          >
            Concluídas
          </button>
          <button
            onClick={() => setFilterStatus("cancelada")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "cancelada"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-gray-300 hover:bg-slate-600"
            }`}
          >
            Canceladas
          </button>
        </div>

        {loading ? (
          <div className="text-white text-center py-12">Carregando...</div>
        ) : impressoes.length === 0 ? (
          <div className="text-white text-center py-12">
            Nenhuma impressão encontrada
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {impressoes.map((impressao) => (
              <div
                key={impressao.id}
                className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">
                    {impressao.nomeProjeto}
                  </h3>
                  <span
                    className={`${getStatusColor(
                      impressao.status
                    )} text-white text-xs px-3 py-1 rounded-full`}
                  >
                    {getStatusText(impressao.status)}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Impressora:</span>
                    <span className="text-white font-medium">
                      {impressao.impressora.nome}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Usuário:</span>
                    <span className="text-white font-medium">
                      {impressao.usuario.primeiroNome}{" "}
                      {impressao.usuario.ultimoNome}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duração:</span>
                    <span className="text-white font-medium">
                      {formatDuration(impressao.tempoImpressao)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Filamento:</span>
                    <span className="text-white font-medium">
                      {impressao.filamentoTotalUsado.toFixed(0)}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Custo Total:</span>
                    <span className="text-white font-medium">
                      R$ {impressao.custoTotal.toFixed(2)}
                    </span>
                  </div>
                  {impressao.precoVenda && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lucro:</span>
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
                    <span className="text-gray-400">Data:</span>
                    <span className="text-white font-medium">
                      {new Date(impressao.dataInicio).toLocaleDateString(
                        "pt-BR"
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDetailsClick(impressao)}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded transition-colors text-sm"
                >
                  Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">
              Detalhes da Impressão
            </DialogTitle>
          </DialogHeader>

          {selectedImpressao && (
            <div className="space-y-6">
              {/* Informações do Projeto */}
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Informações do Projeto
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Nome do Projeto</p>
                    <p className="text-white font-medium">
                      {selectedImpressao.nomeProjeto}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(
                        selectedImpressao.status
                      )} text-white`}
                    >
                      {getStatusText(selectedImpressao.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Data de Início</p>
                    <p className="text-white font-medium">
                      {new Date(selectedImpressao.dataInicio).toLocaleString(
                        "pt-BR"
                      )}
                    </p>
                  </div>
                  {selectedImpressao.dataConclusao && (
                    <div>
                      <p className="text-slate-400 text-sm">
                        Data de Conclusão
                      </p>
                      <p className="text-white font-medium">
                        {new Date(
                          selectedImpressao.dataConclusao
                        ).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-400 text-sm">Tempo de Impressão</p>
                    <p className="text-white font-medium">
                      {formatDuration(selectedImpressao.tempoImpressao)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Equipamento e Usuário */}
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Equipamento e Usuário
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Impressora</p>
                    <p className="text-white font-medium">
                      {selectedImpressao.impressora.nome}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {selectedImpressao.impressora.modelo}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Usuário</p>
                    <p className="text-white font-medium">
                      {selectedImpressao.usuario.primeiroNome}{" "}
                      {selectedImpressao.usuario.ultimoNome}
                    </p>
                  </div>
                </div>
              </div>

              {/* Materiais */}
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Materiais Utilizados
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Filamento Total</span>
                    <span className="text-white font-medium">
                      {selectedImpressao.filamentoTotalUsado.toFixed(0)}g
                    </span>
                  </div>
                  {selectedImpressao.filamentos.map((fil, index) => (
                    <div key={index} className="flex justify-between pl-4">
                      <span className="text-slate-400 text-sm">
                        {fil.filamento.tipo} - {fil.filamento.cor}
                      </span>
                      <span className="text-white text-sm">
                        {fil.quantidadeUsada.toFixed(0)}g
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custos e Lucro */}
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Custos e Lucro
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Custo de Energia</span>
                    <span className="text-white">
                      R$ {selectedImpressao.custoEnergia.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Custo de Filamento</span>
                    <span className="text-white">
                      R$ {selectedImpressao.custoFilamento.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-600 pt-2">
                    <span className="text-slate-400 font-medium">
                      Custo Total
                    </span>
                    <span className="text-white font-medium">
                      R$ {selectedImpressao.custoTotal.toFixed(2)}
                    </span>
                  </div>
                  {selectedImpressao.precoVenda && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Preço de Venda</span>
                        <span className="text-white">
                          R$ {selectedImpressao.precoVenda.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-600 pt-2">
                        <span className="text-slate-400 font-medium">
                          Lucro
                        </span>
                        <span
                          className={`font-medium ${
                            selectedImpressao.lucro &&
                            selectedImpressao.lucro > 0
                              ? "text-green-400"
                              : "text-red-400"
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
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Observações
                  </h3>
                  <p className="text-slate-300">
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
