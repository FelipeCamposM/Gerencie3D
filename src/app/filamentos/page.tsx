"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Header from "@/components/header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { isUserAdmin } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Plus,
  Package,
  TrendingUp,
  DollarSign,
  Layers,
  Archive,
  User,
  Search,
} from "lucide-react";
import FilamentCard from "@/components/filamentos/FilamentCard";
import FilamentForm from "@/components/filamentos/FilamentForm";
import FilamentDetailsModal from "@/components/filamentos/FilamentDetailsModal";
import { Filamento, Usuario, FilamentoDetalhes } from "@/types/filamento";

export default function FilamentosPage() {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isAdmin = isUserAdmin(user);
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
  const [deletingFilamento, setDeletingFilamento] = useState(false);
  const [selectedFilamento, setSelectedFilamento] = useState<Filamento | null>(
    null
  );
  const [filamentoDetalhes, setFilamentoDetalhes] =
    useState<FilamentoDetalhes | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showZerados, setShowZerados] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3 colunas x 3 linhas

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

  // Resetar página ao mudar filtro ou pesquisa
  useEffect(() => {
    setCurrentPage(1);
  }, [showZerados, searchTerm]);

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
        toast.success("Filamento criado com sucesso!", {
          description: `${formData.tipo} - ${formData.nomeCor}`,
        });
      } else {
        toast.error("Erro ao criar filamento", {
          description: "Tente novamente mais tarde.",
        });
      }
    } catch (error) {
      console.error("Erro ao criar filamento:", error);
      toast.error("Erro ao criar filamento", {
        description: "Ocorreu um erro inesperado.",
      });
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

    setDeletingFilamento(true);
    try {
      const response = await fetch(`/api/filamentos/${filamentoToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchFilamentos();
        setDeleteModalOpen(false);
        setFilamentoToDelete(null);
        toast.success("Filamento excluído com sucesso!", {
          description: "O filamento foi removido do sistema.",
        });
      } else {
        const error = await response.json();
        toast.error("Erro ao excluir filamento", {
          description:
            error.details || error.error || "Tente novamente mais tarde.",
          duration: 6000,
        });
      }
    } catch (error) {
      console.error("Erro ao deletar filamento:", error);
      toast.error("Erro ao excluir filamento", {
        description: "Ocorreu um erro inesperado.",
      });
    } finally {
      setDeletingFilamento(false);
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
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

  // Filtrar filamentos por pesquisa e status (zerado/disponível)
  const filamentosFiltrados = filamentos.filter((filamento) => {
    // Filtro de zerados/disponíveis
    const filtroZerado = showZerados
      ? filamento.pesoAtual === 0
      : filamento.pesoAtual > 0;

    if (!filtroZerado) return false;

    // Filtro de pesquisa
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      filamento.tipo.toLowerCase().includes(searchLower) ||
      filamento.nomeCor.toLowerCase().includes(searchLower) ||
      filamento.cor.toLowerCase().includes(searchLower) ||
      `${filamento.comprador.primeiroNome} ${filamento.comprador.ultimoNome}`
        .toLowerCase()
        .includes(searchLower)
    );
  });

  return (
    <ProtectedRoute>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Package className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Gerenciar Filamentos
                </h1>
                <p className="text-slate-600 mt-1 font-medium">
                  Controle seu estoque de filamentos para impressão 3D
                </p>
              </div>
            </div>
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={resetForm}
                  className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer font-bold border-0"
                >
                  <Plus className="h-5 w-5" /> Novo Filamento
                </button>
              </DialogTrigger>
              <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-2xl max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="cursor-pointer absolute right-4 top-4 h-8 w-8 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-lg flex items-center justify-center text-white shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 z-50"
                  aria-label="Fechar"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
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

          {/* Stats Cards - Mobile: Single Card | Desktop: Grid */}
          {!loading && filamentos.length > 0 && (
            <>
              {/* Mobile View - Single Card */}
              <div className="md:hidden mb-8">
                <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl p-6 border-2 border-slate-200">
                  <h3 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse"></div>
                    Estatísticas Gerais
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl px-4 border border-blue-100/60">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                          <Package className="h-5.5 w-5.5 text-white" />
                        </div>
                        <p className="text-sm font-bold text-blue-700">
                          Total de Filamentos
                        </p>
                      </div>
                      <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {totalFilamentos}
                      </p>
                    </div>

                    <div className="flex items-center justify-between py-4 bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-xl px-4 border border-green-100/60">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                          <TrendingUp className="h-5.5 w-5.5 text-white" />
                        </div>
                        <p className="text-sm font-bold text-green-700">
                          Peso Total Disponível
                        </p>
                      </div>
                      <p className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {(totalPeso / 1000).toFixed(1)}kg
                      </p>
                    </div>

                    <div className="flex items-center justify-between py-4 bg-gradient-to-br from-purple-50 to-pink-50/50 rounded-xl px-4 border border-purple-100/60">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                          <DollarSign className="h-5.5 w-5.5 text-white" />
                        </div>
                        <p className="text-sm font-bold text-purple-700">
                          Investimento Total
                        </p>
                      </div>
                      <p className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        R$ {totalInvestimento.toFixed(0)}
                      </p>
                    </div>

                    <div className="py-4 bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-xl px-4 border border-orange-100/60">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Layers className="h-5.5 w-5.5 text-white" />
                          </div>
                          <p className="text-sm font-bold text-orange-700">
                            Tipos de Material
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {filamentosPLA > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg font-bold shadow-sm">
                            PLA: {filamentosPLA}
                          </span>
                        )}
                        {filamentosABS > 0 && (
                          <span className="text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded-lg font-bold shadow-sm">
                            ABS: {filamentosABS}
                          </span>
                        )}
                        {filamentosPETG > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1.5 rounded-lg font-bold shadow-sm">
                            PETG: {filamentosPETG}
                          </span>
                        )}
                        {filamentosOutros > 0 && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-3 py-1.5 rounded-lg font-bold shadow-sm">
                            Outros: {filamentosOutros}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop View - Grid */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg shadow-blue-500/20 p-6 border-2 border-blue-100 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">
                        Total Filamentos
                      </p>
                      <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                        {totalFilamentos}
                      </p>
                    </div>
                    <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200">
                      <Package className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg shadow-green-500/20 p-6 border-2 border-green-100 hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-1 transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-green-700 uppercase tracking-wide">
                        Peso Disponível
                      </p>
                      <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">
                        {(totalPeso / 1000).toFixed(1)}kg
                      </p>
                    </div>
                    <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg shadow-purple-500/20 p-6 border-2 border-purple-100 hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-1 transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-purple-700 uppercase tracking-wide">
                        Investimento
                      </p>
                      <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                        R$ {totalInvestimento.toFixed(0)}
                      </p>
                    </div>
                    <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200">
                      <DollarSign className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-lg shadow-orange-500/20 p-6 border-2 border-orange-100 hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1 transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-orange-700 uppercase tracking-wide">
                        Tipos Material
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {filamentosPLA > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-lg font-bold shadow-sm">
                            PLA: {filamentosPLA}
                          </span>
                        )}
                        {filamentosABS > 0 && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-lg font-bold shadow-sm">
                            ABS: {filamentosABS}
                          </span>
                        )}
                        {filamentosPETG > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-lg font-bold shadow-sm">
                            PETG: {filamentosPETG}
                          </span>
                        )}
                        {filamentosOutros > 0 && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-lg font-bold shadow-sm">
                            Outros: {filamentosOutros}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-14 w-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200">
                      <Layers className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Card de Gastos por Usuário */}
          {!loading && filamentos.length > 0 && (
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl p-6 border-2 border-slate-200 hover:shadow-2xl transition-shadow mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-black text-slate-800">
                  Gastos por Usuário
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {usuarios.map((usuario, index) => {
                  const filamentosUsuario = filamentos.filter(
                    (f) => f.comprador.id === usuario.id
                  );
                  const totalGasto = filamentosUsuario.reduce(
                    (acc, f) => acc + f.precoCompra,
                    0
                  );
                  const totalKg =
                    filamentosUsuario.reduce(
                      (acc, f) => acc + f.pesoInicial,
                      0
                    ) / 1000;

                  if (filamentosUsuario.length === 0) return null;

                  const gradients = [
                    {
                      from: "from-cyan-50",
                      to: "to-sky-50/50",
                      border: "border-cyan-200",
                      iconBg: "from-cyan-500 to-sky-600",
                      shadow: "shadow-cyan-500/30",
                    },
                    {
                      from: "from-purple-50",
                      to: "to-pink-50/50",
                      border: "border-purple-200",
                      iconBg: "from-purple-500 to-pink-600",
                      shadow: "shadow-purple-500/30",
                    },
                    {
                      from: "from-green-50",
                      to: "to-emerald-50/50",
                      border: "border-green-200",
                      iconBg: "from-green-500 to-emerald-600",
                      shadow: "shadow-green-500/30",
                    },
                    {
                      from: "from-orange-50",
                      to: "to-amber-50/50",
                      border: "border-orange-200",
                      iconBg: "from-orange-500 to-amber-600",
                      shadow: "shadow-orange-500/30",
                    },
                  ];
                  const gradient = gradients[index % gradients.length];

                  return (
                    <div
                      key={usuario.id}
                      className={`bg-gradient-to-br ${gradient.from} ${gradient.to} p-4 rounded-xl border-2 ${gradient.border} shadow-md hover:shadow-lg transition-all`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`h-11 w-11 bg-gradient-to-br ${gradient.iconBg} rounded-xl flex items-center justify-center shadow-lg ${gradient.shadow}`}
                        >
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800">
                            {usuario.primeiroNome} {usuario.ultimoNome}
                          </p>
                          <p className="text-xs text-slate-600 font-semibold">
                            {filamentosUsuario.length} filamento(s)
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                          <span className="text-sm text-slate-700 flex items-center gap-1 font-semibold">
                            <DollarSign className="h-4 w-4 text-purple-600" />
                            Total Gasto:
                          </span>
                          <span className="font-black text-purple-600">
                            R$ {totalGasto.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                          <span className="text-sm text-slate-700 flex items-center gap-1 font-semibold">
                            <Package className="h-4 w-4 text-green-600" />
                            Total Comprado:
                          </span>
                          <span className="font-black text-green-600">
                            {totalKg.toFixed(2)} kg
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Barra de Pesquisa e Filtros */}
          <div className="mb-8">
            <div className="flex flex-col gap-4">
              {/* Desktop: Barra de pesquisa + Botão lado a lado */}
              <div className="hidden md:flex gap-4 items-center">
                <div className="relative flex-1 group">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-focus-within:scale-110 transition-transform duration-200">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar por tipo, cor ou comprador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-12 py-4 bg-gradient-to-r from-white to-slate-50 border-2 border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-lg flex items-center justify-center text-white shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Botão Toggle Desktop - Tamanho fixo */}
                <Button
                  onClick={() => setShowZerados(!showZerados)}
                  className={`w-56 h-12 ${
                    showZerados
                      ? "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  } text-white transition-all cursor-pointer shadow-lg hover:shadow-xl font-bold hover:-translate-y-0.5 border-0`}
                >
                  {showZerados ? (
                    <>
                      <Package className="h-5 w-5 mr-2" />
                      Mostrar Disponíveis
                    </>
                  ) : (
                    <>
                      <Archive className="h-5 w-5 mr-2" />
                      Mostrar Zerados
                    </>
                  )}
                </Button>
              </div>

              {/* Mobile: Barra de pesquisa e botão em coluna */}
              <div className="md:hidden flex flex-col gap-4">
                <div className="relative flex-1 group">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-focus-within:scale-110 transition-transform duration-200">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar por tipo, cor ou comprador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-12 py-4 bg-gradient-to-r from-white to-slate-50 border-2 border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-lg flex items-center justify-center text-white shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Botão Toggle Mobile - Largura total */}
                <Button
                  onClick={() => setShowZerados(!showZerados)}
                  className={`w-full h-12 ${
                    showZerados
                      ? "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  } text-white transition-all cursor-pointer shadow-lg hover:shadow-xl font-bold border-0`}
                >
                  {showZerados ? (
                    <>
                      <Package className="h-5 w-5 mr-2" />
                      Mostrar Disponíveis
                    </>
                  ) : (
                    <>
                      <Archive className="h-5 w-5 mr-2" />
                      Mostrar Zerados
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Título da Lista */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {showZerados ? (
                <>
                  <Archive className="h-6 w-6 text-orange-600" />
                  Filamentos Zerados
                </>
              ) : (
                <>
                  <Package className="h-6 w-6 text-green-600" />
                  Filamentos Disponíveis
                </>
              )}
            </h2>
            <p className="text-slate-600 mt-1">
              {filamentosFiltrados.length} filamento(s) encontrado(s)
            </p>
          </div>

          {/* Lista de Filamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filamentosFiltrados
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              )
              .map((filamento) => (
                <FilamentCard
                  key={filamento.id}
                  filamento={filamento}
                  onViewDetails={fetchFilamentoDetalhes}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))}
          </div>

          {/* Paginação */}
          {filamentosFiltrados.length > itemsPerPage && (
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
                        filamentosFiltrados.length / itemsPerPage
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
                              filamentosFiltrados.length / itemsPerPage
                            ),
                            prev + 1
                          )
                        )
                      }
                      className={`cursor-pointer ${
                        currentPage ===
                        Math.ceil(filamentosFiltrados.length / itemsPerPage)
                          ? "opacity-50 cursor-not-allowed pointer-events-none"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {filamentosFiltrados.length === 0 && filamentos.length > 0 && (
            <div className="text-center py-16 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-lg mb-2">
                  {searchTerm
                    ? "Nenhum filamento encontrado com esses critérios."
                    : showZerados
                    ? "Nenhum filamento zerado encontrado."
                    : "Nenhum filamento disponível."}
                </p>
                {searchTerm && (
                  <Button
                    onClick={() => setSearchTerm("")}
                    variant="outline"
                    className="mt-2"
                  >
                    Limpar pesquisa
                  </Button>
                )}
              </div>
            </div>
          )}

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
            <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setEditModalOpen(false)}
                className="absolute right-4 top-4 h-8 w-8 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-lg flex items-center justify-center text-white shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 z-50"
                aria-label="Fechar"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
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
            <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-slate-800 text-xl font-bold">
                  Confirmar Exclusão
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                {deletingFilamento ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <div className="w-12 h-12 border-4 border-slate-300 border-t-red-600 rounded-full animate-spin"></div>
                    <p className="text-slate-700 font-medium">
                      Excluindo filamento...
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-700">
                    Tem certeza que deseja excluir este filamento? Esta ação não
                    pode ser desfeita.
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deletingFilamento}
                  className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={deletingFilamento}
                  className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingFilamento ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Excluindo...
                    </>
                  ) : (
                    "Excluir"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  );
}
