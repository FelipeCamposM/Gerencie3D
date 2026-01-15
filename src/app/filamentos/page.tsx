"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Package,
  TrendingUp,
  DollarSign,
  Layers,
  Archive,
} from "lucide-react";
import FilamentCard from "@/components/filamentos/FilamentCard";
import FilamentForm from "@/components/filamentos/FilamentForm";
import FilamentDetailsModal from "@/components/filamentos/FilamentDetailsModal";
import { Filamento, Usuario, FilamentoDetalhes } from "@/types/filamento";

export default function FilamentosPage() {
  const [filamentos, setFilamentos] = useState<Filamento[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [filamentoToDelete, setFilamentoToDelete] = useState<string | null>(
    null
  );
  const [selectedFilamento, setSelectedFilamento] = useState<Filamento | null>(
    null
  );
  const [filamentoDetalhes, setFilamentoDetalhes] =
    useState<FilamentoDetalhes | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    tipo: "PLA",
    nomeCor: "",
    cor: "#000000",
    pesoInicial: "1000",
    precoCompra: "",
    compradorId: "",
  });

  useEffect(() => {
    fetchFilamentos();
    fetchUsuarios();
  }, []);

  const fetchFilamentos = async () => {
    try {
      const response = await fetch("/api/filamentos");
      const data = await response.json();
      setFilamentos(data);
    } catch (error) {
      console.error("Erro ao buscar filamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch("/api/usuarios");
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const fetchFilamentoDetalhes = async (id: string) => {
    try {
      const response = await fetch(`/api/filamentos/${id}`);
      const data = await response.json();
      setFilamentoDetalhes(data);
      setDetailsModalOpen(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes do filamento:", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/filamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setCreateModalOpen(false);
        fetchFilamentos();
        resetForm();
      }
    } catch (error) {
      console.error("Erro ao criar filamento:", error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFilamento) return;

    try {
      const response = await fetch(`/api/filamentos/${selectedFilamento.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditModalOpen(false);
        fetchFilamentos();
        resetForm();
      }
    } catch (error) {
      console.error("Erro ao editar filamento:", error);
    }
  };

  const handleDelete = (id: string) => {
    setFilamentoToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!filamentoToDelete) return;

    try {
      const response = await fetch(`/api/filamentos/${filamentoToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchFilamentos();
        setDeleteModalOpen(false);
        setFilamentoToDelete(null);
      }
    } catch (error) {
      console.error("Erro ao deletar filamento:", error);
    }
  };

  const openEditModal = (filamento: Filamento) => {
    setSelectedFilamento(filamento);
    setFormData({
      tipo: filamento.tipo,
      nomeCor: filamento.nomeCor,
      cor: filamento.cor,
      pesoInicial: filamento.pesoInicial.toString(),
      precoCompra: filamento.precoCompra.toString(),
      compradorId: filamento.comprador.id.toString(),
    });
    setEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      tipo: "PLA",
      nomeCor: "",
      cor: "#000000",
      pesoInicial: "1000",
      precoCompra: "",
      compradorId: "",
    });
    setSelectedFilamento(null);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-xl text-slate-700">Carregando filamentos...</div>
        </div>
      </ProtectedRoute>
    );
  }

  const totalFilamentos = filamentos.length;
  const totalPeso = filamentos.reduce((acc, f) => acc + f.pesoAtual, 0);
  const totalInvestimento = filamentos.reduce(
    (acc, f) => acc + f.precoCompra,
    0
  );
  const filamentosPLA = filamentos.filter((f) => f.tipo === "PLA").length;
  const filamentosABS = filamentos.filter((f) => f.tipo === "ABS").length;
  const filamentosPETG = filamentos.filter((f) => f.tipo === "PETG").length;
  const filamentosOutros =
    filamentos.length - filamentosPLA - filamentosABS - filamentosPETG;

  return (
    <ProtectedRoute>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Gerenciar Filamentos
              </h1>
              <p className="text-slate-600 mt-2">
                Controle seu estoque de filamentos para impressão 3D
              </p>
            </div>
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={resetForm}
                  className="bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" /> Novo Filamento
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-slate-800 text-xl flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Criar Novo Filamento
                  </DialogTitle>
                </DialogHeader>
                <FilamentForm
                  formData={formData}
                  usuarios={usuarios}
                  onSubmit={handleCreate}
                  onCancel={() => setCreateModalOpen(false)}
                  onChange={setFormData}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          {!loading && filamentos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Total de Filamentos
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {totalFilamentos}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Peso Total Disponível
                    </p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {(totalPeso / 1000).toFixed(1)}kg
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Investimento Total
                    </p>
                    <p className="text-2xl font-bold text-purple-600 mt-2">
                      R$ {totalInvestimento.toFixed(0)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Tipos de Material
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {filamentosPLA > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                          PLA: {filamentosPLA}
                        </span>
                      )}
                      {filamentosABS > 0 && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                          ABS: {filamentosABS}
                        </span>
                      )}
                      {filamentosPETG > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
                          PETG: {filamentosPETG}
                        </span>
                      )}
                      {filamentosOutros > 0 && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">
                          Outros: {filamentosOutros}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Layers className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Filamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filamentos.map((filamento) => (
              <FilamentCard
                key={filamento.id}
                filamento={filamento}
                onViewDetails={fetchFilamentoDetalhes}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {filamentos.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Archive className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-lg mb-4">
                  Nenhum filamento cadastrado ainda.
                </p>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Filamento
                </Button>
              </div>
            </div>
          )}

          {/* Modal de Edição */}
          <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
            <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-slate-800 text-xl flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Editar Filamento
                </DialogTitle>
              </DialogHeader>
              <FilamentForm
                formData={formData}
                usuarios={usuarios}
                onSubmit={handleEdit}
                onCancel={() => setEditModalOpen(false)}
                onChange={setFormData}
                isEdit
              />
            </DialogContent>
          </Dialog>

          {/* Modal de Detalhes */}
          <FilamentDetailsModal
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
            filamento={filamentoDetalhes}
          />

          {/* Modal de Confirmação de Exclusão */}
          <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-slate-800 text-xl font-bold">
                  Confirmar Exclusão
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-slate-700">
                  Tem certeza que deseja excluir este filamento? Esta ação não
                  pode ser desfeita.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpen(false)}
                  className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Excluir
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  );
}
