"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "@/components/header";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Printer,
  Activity,
  AlertTriangle,
  TrendingUp,
  Zap,
  Package,
  Edit,
  Eye,
  MapPin,
  Tag,
  DollarSign,
  Clock,
  User,
  Image as ImageIcon,
  BarChart3,
} from "lucide-react";
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
import { useCurrencyInput } from "@/utils/currencyInput";

interface Impressora {
  id: number;
  nome: string;
  modelo: string;
  marca?: string;
  localizacao: string;
  imagemImpressora?: string | null;
  status: string;
  gastoEnergiaKwh: number;
  precoEnergiaKwh: number;
  filamentoTotalUsado: number;
  impressoesRealizadas?: number;
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

interface DetailedImpressora extends Impressora {
  impressoes: Impressao[];
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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedImpressora, setSelectedImpressora] =
    useState<Impressora | null>(null);
  const [detailedImpressora, setDetailedImpressora] =
    useState<DetailedImpressora | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    modelo: "",
    marca: "",
    localizacao: "",
    imagemImpressora: "",
    status: "disponivel",
    gastoEnergiaKwh: "",
    precoEnergiaKwh: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Hook para entrada monetária do preço de energia
  const precoEnergiaInput = useCurrencyInput({
    onChange: (valorEmReais) => {
      setFormData((prev) => ({ ...prev, precoEnergiaKwh: valorEmReais }));
    },
    initialValue: 0,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchImpressoras();

    // Verificar e atualizar status das impressoras a cada 1 minuto
    const interval = setInterval(() => {
      checkAndUpdateStatus();
    }, 60000); // 60000ms = 1 minuto

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Atualizar valor do preço de energia no hook
    precoEnergiaInput.setValue(impressora.precoEnergiaKwh);
    setFormData({
      nome: impressora.nome,
      modelo: impressora.modelo,
      marca: impressora.marca || "",
      localizacao: impressora.localizacao,
      imagemImpressora: impressora.imagemImpressora || "",
      status: impressora.status,
      gastoEnergiaKwh: impressora.gastoEnergiaKwh.toString(),
      precoEnergiaKwh: impressora.precoEnergiaKwh.toString(),
    });
    setImagePreview(impressora.imagemImpressora || null);
    setSelectedFile(null);
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

  const handleCreateClick = () => {
    precoEnergiaInput.setValue(0);
    setFormData({
      nome: "",
      modelo: "",
      marca: "",
      localizacao: "",
      imagemImpressora: "",
      status: "disponivel",
      gastoEnergiaKwh: "",
      precoEnergiaKwh: "",
    });
    setImagePreview(null);
    setSelectedFile(null);
    setCreateModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        alert("Tipo de arquivo inv\u00e1lido. Use apenas JPEG, PNG ou WEBP");
        return;
      }

      // Validar tamanho (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("Arquivo muito grande. Tamanho m\u00e1ximo: 5MB");
        return;
      }

      setSelectedFile(file);
      // Criar preview e converter para base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, imagemImpressora: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSave = async () => {
    try {
      const response = await fetch("/api/impressoras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.nome,
          modelo: formData.modelo,
          marca: formData.marca,
          localizacao: formData.localizacao,
          imagemImpressora: formData.imagemImpressora || null,
          status: formData.status,
          gastoEnergiaKwh: parseFloat(formData.gastoEnergiaKwh),
          precoEnergiaKwh: parseFloat(formData.precoEnergiaKwh),
        }),
      });

      if (response.ok) {
        await fetchImpressoras();
        setCreateModalOpen(false);
        setSelectedFile(null);
      } else {
        console.error("Erro ao criar impressora");
      }
    } catch (error) {
      console.error("Erro ao criar impressora:", error);
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
            imagemImpressora: formData.imagemImpressora || null,
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
        setSelectedFile(null);
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

  const disponiveisCount = impressoras.filter(
    (i) => i.status === "disponivel"
  ).length;
  const emUsoCount = impressoras.filter((i) => i.status === "em_uso").length;
  const manutencaoCount = impressoras.filter(
    (i) => i.status === "manutencao"
  ).length;
  const totalFilamento = impressoras.reduce(
    (acc, i) => acc + i.filamentoTotalUsado,
    0
  );

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
                Impressoras 3D
              </h1>
              <p className="text-slate-600 mt-1 font-medium">
                Gerencie suas impressoras e monitore o status
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateClick}
            className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer font-bold border-0"
          >
            <Printer className="h-5 w-5" />
            Nova Impressora
          </button>
        </div>

        {/* Stats Cards - Mobile: Single Card | Desktop: Grid */}
        {!loading && impressoras.length > 0 && (
          <>
            {/* Mobile View - Single Card */}
            <div className="md:hidden mb-8">
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-xl p-6 border-2 border-slate-200">
                <h3 className="text-lg font-black text-slate-900 mb-4 uppercase tracking-wide">
                  Estatísticas
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                        <Printer className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                        Total de Impressoras
                      </p>
                    </div>
                    <p className="text-xl font-black text-slate-900">
                      {impressoras.length}
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                        Disponíveis
                      </p>
                    </div>
                    <p className="text-xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {disponiveisCount}
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                        Em Uso
                      </p>
                    </div>
                    <p className="text-xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {emUsoCount}
                    </p>
                  </div>

                  <div
                    className={`flex items-center justify-between py-3 ${
                      manutencaoCount > 0 ? "border-b border-slate-200" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                        Filamento Total Usado
                      </p>
                    </div>
                    <p className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {(totalFilamento / 1000).toFixed(1)}kg
                    </p>
                  </div>

                  {manutencaoCount > 0 && (
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                          Em Manutenção
                        </p>
                      </div>
                      <p className="text-xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        {manutencaoCount}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop View - Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-6 border-2 border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                      Total de Impressoras
                    </p>
                    <p className="text-3xl font-black text-slate-900 mt-2">
                      {impressoras.length}
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Printer className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg p-6 border-2 border-green-200 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                      Disponíveis
                    </p>
                    <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">
                      {disponiveisCount}
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-6 border-2 border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                      Em Uso
                    </p>
                    <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                      {emUsoCount}
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Activity className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg p-6 border-2 border-purple-200 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                      Filamento Total Usado
                    </p>
                    <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                      {(totalFilamento / 1000).toFixed(1)}kg
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Package className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              {manutencaoCount > 0 && (
                <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg p-6 border-2 border-orange-200 hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                        Em Manutenção
                      </p>
                      <p className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mt-2">
                        {manutencaoCount}
                      </p>
                    </div>
                    <div className="h-14 w-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      <AlertTriangle className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-xl text-slate-700">
              Carregando impressoras...
            </div>
          </div>
        ) : impressoras.length === 0 ? (
          <div className="text-slate-700 text-center py-12">
            Nenhuma impressora cadastrada
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {impressoras.map((impressora) => (
              <div
                key={impressora.id}
                className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all shadow-lg overflow-hidden flex flex-col group"
              >
                <div className="flex p-4 gap-4">
                  {/* Imagem à esquerda */}
                  {impressora.imagemImpressora ? (
                    <div className="relative w-32 h-32 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                      <Image
                        src={impressora.imagemImpressora}
                        alt={impressora.nome}
                        fill
                        className="object-contain"
                        sizes="128px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Printer className="h-12 w-12 text-slate-400" />
                    </div>
                  )}

                  {/* Informações à direita */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Printer className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <h3 className="text-lg font-bold text-slate-800 truncate">
                          {impressora.nome}
                        </h3>
                      </div>
                      <span
                        className={`${getStatusColor(
                          impressora.status
                        )} text-white text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2 flex-shrink-0`}
                      >
                        {getStatusText(impressora.status)}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <div className="h-1 w-1 bg-slate-400 rounded-full flex-shrink-0"></div>
                        <span className="font-semibold">Modelo:</span>
                        <span className="text-slate-800 truncate">
                          {impressora.modelo}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <div className="h-1 w-1 bg-slate-400 rounded-full flex-shrink-0"></div>
                        <span className="font-semibold">Marca:</span>
                        <span className="text-slate-800 truncate">
                          {impressora.marca}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <div className="h-1 w-1 bg-slate-400 rounded-full flex-shrink-0"></div>
                        <span className="font-semibold">Localização:</span>
                        <span className="text-slate-800 truncate">
                          {impressora.localizacao}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Package className="h-3 w-3 text-purple-600 flex-shrink-0" />
                        <span className="font-semibold">
                          Filamento Utilizado:
                        </span>
                        <span className="text-slate-800">
                          {impressora.filamentoTotalUsado.toFixed(0)}g
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <TrendingUp className="h-3 w-3 text-green-600 flex-shrink-0" />
                        <span className="font-semibold">Impressões:</span>
                        <span className="text-slate-800">
                          {impressora.impressoesRealizadas || 0}
                        </span>
                      </div>
                      {impressora.ultimoUsuario && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Activity className="h-3 w-3 text-blue-600 flex-shrink-0" />
                          <span className="font-semibold">Último Usuário:</span>
                          <span className="text-slate-800 truncate">
                            {impressora.ultimoUsuario.primeiroNome}{" "}
                            {impressora.ultimoUsuario.ultimoNome}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Zap className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                        <span className="font-semibold">
                          Energia Consumida:
                        </span>
                        <span className="text-slate-800">
                          {impressora.gastoEnergiaKwh.toFixed(2)} kWh
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões embaixo */}
                <div className="flex gap-2 px-4 pb-4">
                  <button
                    onClick={() => handleDetailsClick(impressora)}
                    className="flex-1 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 px-4 py-2 rounded-lg transition-all text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 border-2 border-slate-300"
                  >
                    <Eye className="h-4 w-4" />
                    Detalhes
                  </button>
                  <button
                    onClick={() => handleEditClick(impressora)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 border-0"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300 text-slate-800 max-w-3xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-blue-400 [&::-webkit-scrollbar-thumb]:to-indigo-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-slate-100">
          <button
            onClick={() => setCreateModalOpen(false)}
            className="absolute right-4 top-4 rounded-lg p-2 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-red-100 hover:to-red-200 transition-all text-slate-600 hover:text-red-600 border-2 border-slate-300 hover:border-red-300 shadow-md hover:shadow-lg z-50"
          >
            <svg
              className="h-4 w-4"
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
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-2xl flex items-center gap-3 font-black">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Printer className="h-6 w-6 text-white" />
              </div>
              Nova Impressora
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Seção de Imagem */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-slate-700">
                  Imagem da Impressora
                </h4>
              </div>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="imagemUrl-create"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Escolher Imagem
                </label>
                <input
                  id="imagemUrl-create"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-sm text-slate-600">
                  {selectedFile
                    ? selectedFile.name
                    : "Nenhuma imagem selecionada"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Formatos aceitos: JPEG, PNG, WEBP. Tamanho máximo: 5MB
              </p>
              {imagePreview && (
                <div className="mt-4 relative w-48 h-48 mx-auto bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                    sizes="192px"
                    unoptimized
                  />
                </div>
              )}
            </div>

            {/* Seção de Informações Básicas */}
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <Printer className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-slate-700">
                  Informações Básicas
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="nome-create"
                    className="text-slate-700 flex items-center gap-2 mb-2"
                  >
                    <Printer className="h-4 w-4 text-blue-600" />
                    Nome
                  </Label>
                  <Input
                    id="nome-create"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className="bg-white border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="modelo-create"
                    className="text-slate-700 flex items-center gap-2 mb-2"
                  >
                    <Tag className="h-4 w-4 text-purple-600" />
                    Modelo
                  </Label>
                  <Input
                    id="modelo-create"
                    value={formData.modelo}
                    onChange={(e) =>
                      setFormData({ ...formData, modelo: e.target.value })
                    }
                    className="bg-white border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="marca-create"
                    className="text-slate-700 flex items-center gap-2 mb-2"
                  >
                    <Tag className="h-4 w-4 text-green-600" />
                    Marca
                  </Label>
                  <Input
                    id="marca-create"
                    value={formData.marca}
                    onChange={(e) =>
                      setFormData({ ...formData, marca: e.target.value })
                    }
                    className="bg-white border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="localizacao-create"
                    className="text-slate-700 flex items-center gap-2 mb-2"
                  >
                    <MapPin className="h-4 w-4 text-orange-600" />
                    Localização
                  </Label>
                  <Input
                    id="localizacao-create"
                    value={formData.localizacao}
                    onChange={(e) =>
                      setFormData({ ...formData, localizacao: e.target.value })
                    }
                    className="bg-white border-slate-300 text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Seção de Status e Energia */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-slate-700">
                  Status e Configurações de Energia
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label
                    htmlFor="status-create"
                    className="text-slate-700 flex items-center gap-2 mb-2"
                  >
                    <Activity className="h-4 w-4 text-cyan-600" />
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="bg-white border-slate-300 text-slate-800 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="em_uso">Em Uso</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="gastoEnergiaKwh-create"
                    className="text-slate-700 flex items-center gap-2 mb-2"
                  >
                    <Zap className="h-4 w-4 text-yellow-600" />
                    Gasto Energia (kWh)
                  </Label>
                  <Input
                    id="gastoEnergiaKwh-create"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={formData.gastoEnergiaKwh}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gastoEnergiaKwh: e.target.value,
                      })
                    }
                    className="bg-white border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="precoEnergiaKwh-create"
                    className="text-slate-700 flex items-center gap-2 mb-2"
                  >
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Preço Energia (R$/kWh)
                  </Label>
                  <Input
                    id="precoEnergiaKwh-create"
                    type="text"
                    inputMode="numeric"
                    value={precoEnergiaInput.valorFormatado}
                    onChange={precoEnergiaInput.handleChange}
                    onKeyDown={precoEnergiaInput.handleKeyDown}
                    className="bg-white border-slate-300 text-slate-800 font-medium"
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              className="bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border-2 border-slate-300 text-slate-700 font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateSave}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all border-0"
            >
              Criar Impressora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-3xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-blue-400 [&::-webkit-scrollbar-thumb]:to-indigo-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-slate-100">
          <button
            onClick={() => setEditModalOpen(false)}
            className="absolute right-4 top-4 rounded-lg p-2 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-red-100 hover:to-red-200 transition-all text-slate-600 hover:text-red-600 border-2 border-slate-300 hover:border-red-300 shadow-md hover:shadow-lg z-50"
          >
            <svg
              className="h-4 w-4"
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
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-2xl flex items-center gap-3 font-black">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Edit className="h-6 w-6 text-white" />
              </div>
              Editar Impressora
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Seção de Imagem */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-slate-700">
                  Imagem da Impressora
                </h4>
              </div>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="imagemUrl"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Escolher Imagem
                </label>
                <input
                  id="imagemUrl"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-sm text-slate-600">
                  {selectedFile
                    ? selectedFile.name
                    : "Nenhuma imagem selecionada"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Formatos aceitos: JPEG, PNG, WEBP. Tamanho máximo: 5MB
              </p>
              {imagePreview && (
                <div className="mt-4 relative w-48 h-48 mx-auto bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                    sizes="192px"
                    unoptimized
                  />
                </div>
              )}
            </div>

            {/* Seção de Informações Básicas */}
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <Printer className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-slate-700">
                  Informações Básicas
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="nome"
                    className="text-slate-700 flex items-center gap-2 mb-2"
                  >
                    <Printer className="h-4 w-4 text-blue-600" />
                    Nome
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className="bg-white border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="modelo"
                    className="text-slate-700 flex items-center gap-2 mb-2"
                  >
                    <Tag className="h-4 w-4 text-purple-600" />
                    Modelo
                  </Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) =>
                      setFormData({ ...formData, modelo: e.target.value })
                    }
                    className="bg-white border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="marca"
                    className="text-slate-700 flex items-center gap-2 mb-2"
                  >
                    <Tag className="h-4 w-4 text-green-600" />
                    Marca
                  </Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={(e) =>
                      setFormData({ ...formData, marca: e.target.value })
                    }
                    className="bg-white border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="localizacao"
                    className="text-slate-700 flex items-center gap-2 mb-2"
                  >
                    <MapPin className="h-4 w-4 text-orange-600" />
                    Localização
                  </Label>
                  <Input
                    id="localizacao"
                    value={formData.localizacao}
                    onChange={(e) =>
                      setFormData({ ...formData, localizacao: e.target.value })
                    }
                    className="bg-white border-slate-300 text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Seção de Status e Energia */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-slate-700">
                  Status e Configurações de Energia
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label
                    htmlFor="status"
                    className="text-slate-700 flex items-center gap-2 mb-2"
                  >
                    <Activity className="h-4 w-4 text-cyan-600" />
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="bg-white border-slate-300 text-slate-800 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="em_uso">Em Uso</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="gastoEnergiaKwh"
                    className="text-slate-700 flex items-center gap-2 mb-2"
                  >
                    <Zap className="h-4 w-4 text-yellow-600" />
                    Gasto Energia (kWh)
                  </Label>
                  <Input
                    id="gastoEnergiaKwh"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={formData.gastoEnergiaKwh}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gastoEnergiaKwh: e.target.value,
                      })
                    }
                    className="bg-white border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="precoEnergiaKwh"
                    className="text-slate-700 flex items-center gap-2 mb-2"
                  >
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Preço Energia (R$/kWh)
                  </Label>
                  <Input
                    id="precoEnergiaKwh"
                    type="text"
                    inputMode="numeric"
                    value={precoEnergiaInput.valorFormatado}
                    onChange={precoEnergiaInput.handleChange}
                    onKeyDown={precoEnergiaInput.handleKeyDown}
                    className="bg-white border-slate-300 text-slate-800 font-medium"
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              className="bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border-2 border-slate-300 text-slate-700 font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all border-0"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-4xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-blue-400 [&::-webkit-scrollbar-thumb]:to-indigo-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-slate-100">
          <button
            onClick={() => setDetailsModalOpen(false)}
            className="absolute right-4 top-4 rounded-lg p-2 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-red-100 hover:to-red-200 transition-all text-slate-600 hover:text-red-600 border-2 border-slate-300 hover:border-red-300 shadow-md hover:shadow-lg z-50"
          >
            <svg
              className="h-4 w-4"
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
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-2xl flex items-center gap-3 font-black">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Printer className="h-6 w-6 text-white" />
              </div>
              Detalhes da Impressora
            </DialogTitle>
          </DialogHeader>

          {detailedImpressora && (
            <div className="space-y-6 overflow-x-hidden">
              {/* Informações Gerais com Imagem */}
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Printer className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">
                      Informações Gerais
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-600" />
                    <span className="text-sm font-medium text-slate-600">
                      Status:
                    </span>
                    <span
                      className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(
                        detailedImpressora.status
                      )}`}
                    >
                      {getStatusText(detailedImpressora.status)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Imagem */}
                  {detailedImpressora.imagemImpressora ? (
                    <div className="relative w-full md:w-48 h-48 md:flex-shrink-0 bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200">
                      <Image
                        src={detailedImpressora.imagemImpressora}
                        alt={detailedImpressora.nome}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 192px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-full md:w-48 h-48 md:flex-shrink-0 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                      <Printer className="h-24 w-24 text-slate-300" />
                    </div>
                  )}

                  {/* Informações */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Printer className="h-4 w-4 text-blue-600" />
                        <p className="text-slate-600 text-sm font-medium">
                          Nome
                        </p>
                      </div>
                      <p className="text-slate-900 font-semibold text-lg">
                        {detailedImpressora.nome}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4 text-purple-600" />
                        <p className="text-slate-600 text-sm font-medium">
                          Modelo
                        </p>
                      </div>
                      <p className="text-slate-900 font-semibold">
                        {detailedImpressora.modelo}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <p className="text-slate-600 text-sm font-medium">
                          Marca
                        </p>
                      </div>
                      <p className="text-slate-900 font-semibold">
                        {detailedImpressora.marca || "N/A"}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-orange-600" />
                        <p className="text-slate-600 text-sm font-medium">
                          Localização
                        </p>
                      </div>
                      <p className="text-slate-900 font-semibold">
                        {detailedImpressora.localizacao}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Energia e Custos */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Energia e Custos
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <p className="text-slate-600 text-sm font-medium">
                        Gasto de Energia
                      </p>
                    </div>
                    <p className="text-slate-900 font-bold text-xl">
                      {detailedImpressora.gastoEnergiaKwh.toFixed(3)}
                      <span className="text-sm text-slate-600 ml-1">kWh</span>
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <p className="text-slate-600 text-sm font-medium">
                        Preço da Energia
                      </p>
                    </div>
                    <p className="text-slate-900 font-bold text-xl">
                      R$ {detailedImpressora.precoEnergiaKwh.toFixed(2)}
                      <span className="text-sm text-slate-600 ml-1">/kWh</span>
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-purple-600" />
                      <p className="text-slate-600 text-sm font-medium">
                        Filamento Total Usado
                      </p>
                    </div>
                    <p className="text-slate-900 font-bold text-xl">
                      {detailedImpressora.filamentoTotalUsado.toFixed(0)}
                      <span className="text-sm text-slate-600 ml-1">g</span>
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <p className="text-slate-600 text-sm font-medium">
                        Impressões Realizadas
                      </p>
                    </div>
                    <p className="text-slate-900 font-bold text-xl">
                      {detailedImpressora.impressoesRealizadas || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Último Uso */}
              {detailedImpressora.ultimoUsuario && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-slate-800">
                      Último Uso
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <p className="text-slate-600 text-sm font-medium">
                          Usuário
                        </p>
                      </div>
                      <p className="text-slate-900 font-semibold">
                        {detailedImpressora.ultimoUsuario.primeiroNome}{" "}
                        {detailedImpressora.ultimoUsuario.ultimoNome}
                      </p>
                    </div>
                    {detailedImpressora.ultimoUso && (
                      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <p className="text-slate-600 text-sm font-medium">
                            Data
                          </p>
                        </div>
                        <p className="text-slate-900 font-semibold">
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
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-100">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="h-5 w-5 text-cyan-600" />
                      <h3 className="text-lg font-semibold text-slate-800">
                        Últimas Impressões (
                        {detailedImpressora.impressoes.length})
                      </h3>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {detailedImpressora.impressoes.map(
                        (impressao: Impressao) => (
                          <div
                            key={impressao.id}
                            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Printer className="h-4 w-4 text-blue-600" />
                                  <p className="text-slate-900 font-semibold">
                                    {impressao.nomeProjeto}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <User className="h-3 w-3" />
                                  <span>
                                    {impressao.usuario.primeiroNome}{" "}
                                    {impressao.usuario.ultimoNome}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 justify-end mb-1">
                                  <Clock className="h-3 w-3 text-slate-500" />
                                  <p className="text-slate-600 text-xs">
                                    {new Date(
                                      impressao.dataInicio
                                    ).toLocaleDateString("pt-BR")}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 justify-end">
                                  <Package className="h-3 w-3 text-purple-600" />
                                  <p className="text-slate-900 font-semibold text-sm">
                                    {impressao.filamentoTotalUsado.toFixed(0)}g
                                  </p>
                                </div>
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
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all border-0"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
