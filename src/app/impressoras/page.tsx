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
  imagemImpressora?: string | null;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Impressoras 3D</h1>
          <button
            onClick={handleCreateClick}
            className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg shadow-md transition-all"
          >
            + Nova Impressora
          </button>
        </div>

        {loading ? (
          <div className="text-slate-700 text-center py-12">Carregando...</div>
        ) : impressoras.length === 0 ? (
          <div className="text-slate-700 text-center py-12">
            Nenhuma impressora cadastrada
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {impressoras.map((impressora) => (
              <div
                key={impressora.id}
                className="bg-white p-6 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all shadow-sm"
              >
                {impressora.imagemImpressora && (
                  <div className="mb-4 relative w-full aspect-square bg-slate-100">
                    <Image
                      src={impressora.imagemImpressora}
                      alt={impressora.nome}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 100px) 100vw, (max-width: 100px) 50vw, 33vw"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-800">
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
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors text-sm"
                  >
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => handleEditClick(impressora)}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors text-sm"
                  >
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
        <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              Nova Impressora
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="imagemUrl-create" className="text-slate-700">
                Imagem da Impressora
              </Label>
              <Input
                id="imagemUrl-create"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="bg-white border-slate-300 text-slate-800"
              />
              <p className="text-xs text-slate-500 mt-1">
                Formatos aceitos: JPEG, PNG, WEBP. Tamanho máximo: 5MB
              </p>
              {imagePreview && (
                <div className="mt-2 relative w-full aspect-square bg-slate-100">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg border border-slate-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome-create" className="text-slate-700">
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
                <Label htmlFor="modelo-create" className="text-slate-700">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="marca-create" className="text-slate-700">
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
                <Label htmlFor="localizacao-create" className="text-slate-700">
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

            <div>
              <Label htmlFor="status-create" className="text-slate-700">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-white border-slate-300 text-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="em_uso">Em Uso</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="gastoEnergiaKwh-create"
                  className="text-slate-700"
                >
                  Gasto Energia (kWh)
                </Label>
                <Input
                  id="gastoEnergiaKwh-create"
                  type="number"
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
                  className="text-slate-700"
                >
                  Preço Energia (R$/kWh)
                </Label>
                <Input
                  id="precoEnergiaKwh-create"
                  type="number"
                  step="0.01"
                  value={formData.precoEnergiaKwh}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      precoEnergiaKwh: e.target.value,
                    })
                  }
                  className="bg-white border-slate-300 text-slate-800"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              className="bg-white border-slate-300 text-slate-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Criar Impressora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              Editar Impressora
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="imagemUrl" className="text-slate-700">
                Imagem da Impressora
              </Label>
              <Input
                id="imagemUrl"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="bg-white border-slate-300 text-slate-800"
              />
              <p className="text-xs text-slate-500 mt-1">
                Formatos aceitos: JPEG, PNG, WEBP. Tamanho máximo: 5MB
              </p>
              {imagePreview && (
                <div className="mt-2 relative w-full aspect-square bg-slate-100">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg border border-slate-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome" className="text-slate-700">
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
                <Label htmlFor="modelo" className="text-slate-700">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="marca" className="text-slate-700">
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
                <Label htmlFor="localizacao" className="text-slate-700">
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

            <div>
              <Label htmlFor="status" className="text-slate-700">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-white border-slate-300 text-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="em_uso">Em Uso</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gastoEnergiaKwh" className="text-slate-700">
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
                  className="bg-white border-slate-300 text-slate-800"
                />
              </div>
              <div>
                <Label htmlFor="precoEnergiaKwh" className="text-slate-700">
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
                  className="bg-white border-slate-300 text-slate-800"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              className="bg-white border-slate-300 text-slate-700"
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
        <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-2xl">
              Detalhes da Impressora
            </DialogTitle>
          </DialogHeader>

          {detailedImpressora && (
            <div className="space-y-6">
              {/* Imagem da Impressora */}
              {detailedImpressora.imagemImpressora && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="relative w-full aspect-square bg-slate-100">
                    <Image
                      src={detailedImpressora.imagemImpressora}
                      alt={detailedImpressora.nome}
                      fill
                      className="object-contain rounded-lg"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized
                    />
                  </div>
                </div>
              )}
              {/* Informações Gerais */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Informações Gerais
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-600 text-sm">Nome</p>
                    <p className="text-slate-800 font-medium">
                      {detailedImpressora.nome}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Modelo</p>
                    <p className="text-slate-800 font-medium">
                      {detailedImpressora.modelo}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Marca</p>
                    <p className="text-slate-800 font-medium">
                      {detailedImpressora.marca || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Localização</p>
                    <p className="text-slate-800 font-medium">
                      {detailedImpressora.localizacao}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(
                        detailedImpressora.status
                      )}`}
                    >
                      {getStatusText(detailedImpressora.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Energia e Custos */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Energia e Custos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-600 text-sm">
                      Gasto de Energia (kWh)
                    </p>
                    <p className="text-slate-800 font-medium">
                      {detailedImpressora.gastoEnergiaKwh.toFixed(3)} kWh
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">
                      Preço da Energia (R$/kWh)
                    </p>
                    <p className="text-slate-800 font-medium">
                      R$ {detailedImpressora.precoEnergiaKwh.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">
                      Filamento Total Usado
                    </p>
                    <p className="text-slate-800 font-medium">
                      {detailedImpressora.filamentoTotalUsado.toFixed(0)}g
                    </p>
                  </div>
                </div>
              </div>

              {/* Último Uso */}
              {detailedImpressora.ultimoUsuario && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Último Uso
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-600 text-sm">Usuário</p>
                      <p className="text-slate-800 font-medium">
                        {detailedImpressora.ultimoUsuario.primeiroNome}{" "}
                        {detailedImpressora.ultimoUsuario.ultimoNome}
                      </p>
                    </div>
                    {detailedImpressora.ultimoUso && (
                      <div>
                        <p className="text-slate-600 text-sm">Data</p>
                        <p className="text-slate-800 font-medium">
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
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">
                      Últimas Impressões ({detailedImpressora.impressoes.length}
                      )
                    </h3>
                    <div className="space-y-2">
                      {detailedImpressora.impressoes.map(
                        (impressao: Impressao) => (
                          <div
                            key={impressao.id}
                            className="bg-white p-3 rounded border border-slate-300"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-slate-800 font-medium">
                                  {impressao.nomeProjeto}
                                </p>
                                <p className="text-slate-600 text-sm">
                                  Por: {impressao.usuario.primeiroNome}{" "}
                                  {impressao.usuario.ultimoNome}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-600 text-sm">
                                  {new Date(
                                    impressao.dataInicio
                                  ).toLocaleDateString("pt-BR")}
                                </p>
                                <p className="text-slate-800 text-sm">
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
              className="bg-slate-600 hover:bg-slate-700"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
