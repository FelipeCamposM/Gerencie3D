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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Impressora {
  id: number;
  nome: string;
  modelo: string;
  marca?: string;
  localizacao: string;
  status: string;
  gastoEnergiaKwh: number;
  precoEnergiaKwh: number;
  filamentoTotalUsado: number;
  ultimoUso: string | null;
  ultimoUsuario?: {
    primeiroNome: string;
    ultimoNome: string;
  };
}

interface Impressao {
  id: number;
  nomeProjeto: string;
  dataInicio: string;
  filamentoTotalUsado: number;
  usuario: {
    primeiroNome: string;
    ultimoNome: string;
  };
}

export default function ImpressorasPage() {
  return (
    <ProtectedRoute>
      <ImpressorasContent />
    </ProtectedRoute>
  );
}

function ImpressorasContent() {
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedImpressora, setSelectedImpressora] =
    useState<Impressora | null>(null);
  const [detailedImpressora, setDetailedImpressora] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "",
    modelo: "",
    marca: "",
    localizacao: "",
    status: "disponivel",
    gastoEnergiaKwh: "",
    precoEnergiaKwh: "",
  });

  useEffect(() => {
    fetchImpressoras();

    // Verificar e atualizar status das impressoras a cada 1 minuto
    const interval = setInterval(() => {
      checkAndUpdateStatus();
    }, 60000); // 60000ms = 1 minuto

    return () => clearInterval(interval);
  }, []);

  const fetchImpressoras = async () => {
    try {
      const response = await fetch("/api/impressoras");
      const data = await response.json();
      setImpressoras(data);
    } catch (error) {
      console.error("Erro ao buscar impressoras:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndUpdateStatus = async () => {
    try {
      await fetch("/api/impressoes/check-status", {
        method: "POST",
      });
      // Recarregar impressoras após atualizar status
      fetchImpressoras();
    } catch (error) {
      console.error("Erro ao verificar status:", error);
    }
  };

  const handleEditClick = (impressora: Impressora) => {
    setSelectedImpressora(impressora);
    setFormData({
      nome: impressora.nome,
      modelo: impressora.modelo,
      marca: impressora.marca || "",
      localizacao: impressora.localizacao,
      status: impressora.status,
      gastoEnergiaKwh: impressora.gastoEnergiaKwh.toString(),
      precoEnergiaKwh: impressora.precoEnergiaKwh.toString(),
    });
    setEditModalOpen(true);
  };

  const handleDetailsClick = async (impressora: Impressora) => {
    try {
      const response = await fetch(`/api/impressoras/${impressora.id}`);
      const data = await response.json();
      setDetailedImpressora(data);
      setDetailsModalOpen(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes da impressora:", error);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedImpressora) return;

    try {
      const response = await fetch(
        `/api/impressoras/${selectedImpressora.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: formData.nome,
            modelo: formData.modelo,
            marca: formData.marca,
            localizacao: formData.localizacao,
            status: formData.status,
            gastoEnergiaKwh: parseFloat(formData.gastoEnergiaKwh),
            precoEnergiaKwh: parseFloat(formData.precoEnergiaKwh),
          }),
        }
      );

      if (response.ok) {
        await fetchImpressoras();
        setEditModalOpen(false);
        setSelectedImpressora(null);
      } else {
        console.error("Erro ao atualizar impressora");
      }
    } catch (error) {
      console.error("Erro ao atualizar impressora:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponivel":
        return "bg-green-500";
      case "em_uso":
        return "bg-blue-500";
      case "manutencao":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "disponivel":
        return "Disponível";
      case "em_uso":
        return "Em Uso";
      case "manutencao":
        return "Manutenção";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Impressoras 3D</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
            + Nova Impressora
          </button>
        </div>

        {loading ? (
          <div className="text-white text-center py-12">Carregando...</div>
        ) : impressoras.length === 0 ? (
          <div className="text-white text-center py-12">
            Nenhuma impressora cadastrada
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {impressoras.map((impressora) => (
              <div
                key={impressora.id}
                className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">
                    {impressora.nome}
                  </h3>
                  <span
                    className={`${getStatusColor(
                      impressora.status
                    )} text-white text-xs px-3 py-1 rounded-full`}
                  >
                    {getStatusText(impressora.status)}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">
                    <span className="font-semibold">Modelo:</span>{" "}
                    {impressora.modelo}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-semibold">Localização:</span>{" "}
                    {impressora.localizacao}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-semibold">Filamento usado:</span>{" "}
                    {impressora.filamentoTotalUsado.toFixed(0)}g
                  </p>
                  {impressora.ultimoUsuario && (
                    <p className="text-gray-400">
                      <span className="font-semibold">Último uso:</span>{" "}
                      {impressora.ultimoUsuario.primeiroNome}{" "}
                      {impressora.ultimoUsuario.ultimoNome}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700 flex gap-2">
                  <button
                    onClick={() => handleDetailsClick(impressora)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded transition-colors text-sm"
                  >
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => handleEditClick(impressora)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors text-sm"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Impressora</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome" className="text-slate-300">
                  Nome
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="modelo" className="text-slate-300">
                  Modelo
                </Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) =>
                    setFormData({ ...formData, modelo: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="marca" className="text-slate-300">
                  Marca
                </Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) =>
                    setFormData({ ...formData, marca: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="localizacao" className="text-slate-300">
                  Localização
                </Label>
                <Input
                  id="localizacao"
                  value={formData.localizacao}
                  onChange={(e) =>
                    setFormData({ ...formData, localizacao: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status" className="text-slate-300">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="disponivel" className="text-white">
                    Disponível
                  </SelectItem>
                  <SelectItem value="em_uso" className="text-white">
                    Em Uso
                  </SelectItem>
                  <SelectItem value="manutencao" className="text-white">
                    Manutenção
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gastoEnergiaKwh" className="text-slate-300">
                  Gasto Energia (kWh)
                </Label>
                <Input
                  id="gastoEnergiaKwh"
                  type="number"
                  step="0.01"
                  value={formData.gastoEnergiaKwh}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gastoEnergiaKwh: e.target.value,
                    })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="precoEnergiaKwh" className="text-slate-300">
                  Preço Energia (R$/kWh)
                </Label>
                <Input
                  id="precoEnergiaKwh"
                  type="number"
                  step="0.01"
                  value={formData.precoEnergiaKwh}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      precoEnergiaKwh: e.target.value,
                    })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              className="bg-slate-700 border-slate-600 text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">
              Detalhes da Impressora
            </DialogTitle>
          </DialogHeader>

          {detailedImpressora && (
            <div className="space-y-6">
              {/* Informações Gerais */}
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Informações Gerais
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Nome</p>
                    <p className="text-white font-medium">
                      {detailedImpressora.nome}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Modelo</p>
                    <p className="text-white font-medium">
                      {detailedImpressora.modelo}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Marca</p>
                    <p className="text-white font-medium">
                      {detailedImpressora.marca || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Localização</p>
                    <p className="text-white font-medium">
                      {detailedImpressora.localizacao}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(
                        detailedImpressora.status
                      )} text-white`}
                    >
                      {getStatusText(detailedImpressora.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Energia e Custos */}
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Energia e Custos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">
                      Gasto de Energia (kWh)
                    </p>
                    <p className="text-white font-medium">
                      {detailedImpressora.gastoEnergiaKwh.toFixed(3)} kWh
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">
                      Preço da Energia (R$/kWh)
                    </p>
                    <p className="text-white font-medium">
                      R$ {detailedImpressora.precoEnergiaKwh.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">
                      Filamento Total Usado
                    </p>
                    <p className="text-white font-medium">
                      {detailedImpressora.filamentoTotalUsado.toFixed(0)}g
                    </p>
                  </div>
                </div>
              </div>

              {/* Último Uso */}
              {detailedImpressora.ultimoUsuario && (
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Último Uso
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Usuário</p>
                      <p className="text-white font-medium">
                        {detailedImpressora.ultimoUsuario.primeiroNome}{" "}
                        {detailedImpressora.ultimoUsuario.ultimoNome}
                      </p>
                    </div>
                    {detailedImpressora.ultimoUso && (
                      <div>
                        <p className="text-slate-400 text-sm">Data</p>
                        <p className="text-white font-medium">
                          {new Date(
                            detailedImpressora.ultimoUso
                          ).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Últimas Impressões */}
              {detailedImpressora.impressoes &&
                detailedImpressora.impressoes.length > 0 && (
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Últimas Impressões ({detailedImpressora.impressoes.length}
                      )
                    </h3>
                    <div className="space-y-2">
                      {detailedImpressora.impressoes.map(
                        (impressao: Impressao) => (
                          <div
                            key={impressao.id}
                            className="bg-slate-800 p-3 rounded border border-slate-600"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-white font-medium">
                                  {impressao.nomeProjeto}
                                </p>
                                <p className="text-slate-400 text-sm">
                                  Por: {impressao.usuario.primeiroNome}{" "}
                                  {impressao.usuario.ultimoNome}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-400 text-sm">
                                  {new Date(
                                    impressao.dataInicio
                                  ).toLocaleDateString("pt-BR")}
                                </p>
                                <p className="text-white text-sm">
                                  {impressao.filamentoTotalUsado.toFixed(0)}g
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
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
