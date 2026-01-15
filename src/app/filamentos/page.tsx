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
import { Plus } from "lucide-react";
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

  return (
    <ProtectedRoute>
      <Header />
      <div className="container mx-auto p-6 bg-white min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Gerenciar Filamentos
          </h1>
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" /> Novo Filamento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-slate-800">
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

        {/* Lista de Filamentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nenhum filamento cadastrado ainda.
            </p>
            <Button onClick={() => setCreateModalOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Filamento
            </Button>
          </div>
        )}

        {/* Modal de Edição */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-slate-800">
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
    </ProtectedRoute>
  );
}
