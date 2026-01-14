"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/header";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Plus } from "lucide-react";

interface Impressora {
  id: number;
  nome: string;
  modelo: string;
  status: string;
}

interface Filamento {
  id: string;
  tipo: string;
  cor: string;
  pesoAtual: number;
  precoCompra: number;
  pesoInicial: number;
}

interface FilamentoSelecionado {
  filamentoId: string;
  quantidadeUsada: string;
}

export default function CriarImpressao() {
  return (
    <ProtectedRoute>
      <CriarImpressaoContent />
    </ProtectedRoute>
  );
}

function CriarImpressaoContent() {
  const router = useRouter();
  const { user } = useAuth();

  // Estados
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [filamentos, setFilamentos] = useState<Filamento[]>([]);
  const [loading, setLoading] = useState(false);

  // Dados do formulário
  const [formData, setFormData] = useState({
    nomeProjeto: "",
    impressoraId: "",
    tempoImpressao: "", // em minutos
    observacoes: "",
    precoVenda: "",
  });

  const [filamentosSelecionados, setFilamentosSelecionados] = useState<
    FilamentoSelecionado[]
  >([{ filamentoId: "", quantidadeUsada: "" }]);

  useEffect(() => {
    fetchImpressoras();
    fetchFilamentos();
  }, []);

  const fetchImpressoras = async () => {
    try {
      const response = await fetch("/api/impressoras");
      const data = await response.json();
      // Filtrar apenas impressoras disponíveis
      const disponivies = data.filter(
        (imp: Impressora) => imp.status === "disponivel"
      );
      setImpressoras(disponivies);
    } catch (error) {
      console.error("Erro ao buscar impressoras:", error);
    }
  };

  const fetchFilamentos = async () => {
    try {
      const response = await fetch("/api/filamentos");
      const data = await response.json();
      // Filtrar apenas filamentos com peso disponível
      const disponiveis = data.filter((fil: Filamento) => fil.pesoAtual > 0);
      setFilamentos(disponiveis);
    } catch (error) {
      console.error("Erro ao buscar filamentos:", error);
    }
  };

  const adicionarFilamento = () => {
    setFilamentosSelecionados([
      ...filamentosSelecionados,
      { filamentoId: "", quantidadeUsada: "" },
    ]);
  };

  const removerFilamento = (index: number) => {
    const novosFilamentos = filamentosSelecionados.filter(
      (_, i) => i !== index
    );
    setFilamentosSelecionados(novosFilamentos);
  };

  const atualizarFilamento = (index: number, campo: string, valor: string) => {
    const novosFilamentos = [...filamentosSelecionados];
    novosFilamentos[index] = {
      ...novosFilamentos[index],
      [campo]: valor,
    };
    setFilamentosSelecionados(novosFilamentos);
  };

  const calcularFilamentoTotal = () => {
    return filamentosSelecionados.reduce((total, fil) => {
      return total + (parseFloat(fil.quantidadeUsada) || 0);
    }, 0);
  };

  const validarFormulario = () => {
    if (!formData.nomeProjeto.trim()) return false;
    if (!formData.impressoraId) return false;
    if (!formData.tempoImpressao || parseFloat(formData.tempoImpressao) <= 0)
      return false;

    // Validar filamentos
    const filamentosValidos = filamentosSelecionados.filter(
      (fil) => fil.filamentoId && parseFloat(fil.quantidadeUsada) > 0
    );

    if (filamentosValidos.length === 0) return false;

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      alert("Por favor, preencha todos os campos obrigatórios corretamente.");
      return;
    }

    if (!user) {
      alert("Usuário não autenticado.");
      return;
    }

    setLoading(true);

    try {
      const filamentosValidos = filamentosSelecionados.filter(
        (fil) => fil.filamentoId && parseFloat(fil.quantidadeUsada) > 0
      );

      const payload = {
        nomeProjeto: formData.nomeProjeto,
        tempoImpressao: formData.tempoImpressao,
        filamentoTotalUsado: calcularFilamentoTotal(),
        observacoes: formData.observacoes || null,
        precoVenda: formData.precoVenda
          ? parseFloat(formData.precoVenda)
          : null,
        status: "em_andamento",
        usuarioId: user.id,
        impressoraId: formData.impressoraId,
        filamentos: filamentosValidos.map((fil) => ({
          filamentoId: fil.filamentoId,
          quantidadeUsada: fil.quantidadeUsada,
        })),
      };

      const response = await fetch("/api/impressoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Impressão criada com sucesso!");
        router.push("/impressoes");
      } else {
        const error = await response.json();
        alert(`Erro ao criar impressão: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao criar impressão:", error);
      alert("Erro ao criar impressão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Nova Impressão 3D
          </h1>
          <p className="text-gray-400">
            Registre uma nova impressão no sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Informações Básicas
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="nomeProjeto" className="text-slate-300">
                  Nome do Projeto *
                </Label>
                <Input
                  id="nomeProjeto"
                  value={formData.nomeProjeto}
                  onChange={(e) =>
                    setFormData({ ...formData, nomeProjeto: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Ex: Suporte para monitor"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="impressoraId" className="text-slate-300">
                    Impressora *
                  </Label>
                  <Select
                    value={formData.impressoraId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, impressoraId: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione a impressora" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {impressoras.length === 0 ? (
                        <SelectItem
                          value="none"
                          disabled
                          className="text-slate-400"
                        >
                          Nenhuma impressora disponível
                        </SelectItem>
                      ) : (
                        impressoras.map((impressora) => (
                          <SelectItem
                            key={impressora.id}
                            value={impressora.id.toString()}
                            className="text-white"
                          >
                            {impressora.nome} - {impressora.modelo}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tempoImpressao" className="text-slate-300">
                    Tempo de Impressão (minutos) *
                  </Label>
                  <Input
                    id="tempoImpressao"
                    type="number"
                    min="1"
                    value={formData.tempoImpressao}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tempoImpressao: e.target.value,
                      })
                    }
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Ex: 180"
                    required
                  />
                  {formData.tempoImpressao && (
                    <p className="text-slate-400 text-xs mt-1">
                      ≈ {Math.floor(parseFloat(formData.tempoImpressao) / 60)}h{" "}
                      {parseFloat(formData.tempoImpressao) % 60}min
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="precoVenda" className="text-slate-300">
                  Preço de Venda (opcional)
                </Label>
                <Input
                  id="precoVenda"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precoVenda}
                  onChange={(e) =>
                    setFormData({ ...formData, precoVenda: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="R$ 0,00"
                />
              </div>

              <div>
                <Label htmlFor="observacoes" className="text-slate-300">
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                  placeholder="Adicione observações sobre a impressão..."
                />
              </div>
            </div>
          </div>

          {/* Filamentos */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                Filamentos Utilizados *
              </h2>
              <Button
                type="button"
                onClick={adicionarFilamento}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Filamento
              </Button>
            </div>

            <div className="space-y-4">
              {filamentosSelecionados.map((filamentoSel, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-end bg-slate-700/50 p-4 rounded-lg"
                >
                  <div className="flex-1">
                    <Label className="text-slate-300">Filamento</Label>
                    <Select
                      value={filamentoSel.filamentoId}
                      onValueChange={(value) =>
                        atualizarFilamento(index, "filamentoId", value)
                      }
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Selecione o filamento" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {filamentos.map((filamento) => (
                          <SelectItem
                            key={filamento.id}
                            value={filamento.id}
                            className="text-white"
                          >
                            {filamento.tipo} - {filamento.cor} (
                            {filamento.pesoAtual.toFixed(0)}g disponível)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <Label className="text-slate-300">Quantidade (g)</Label>
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={filamentoSel.quantidadeUsada}
                      onChange={(e) =>
                        atualizarFilamento(
                          index,
                          "quantidadeUsada",
                          e.target.value
                        )
                      }
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="0.0"
                    />
                  </div>

                  {filamentosSelecionados.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removerFilamento(index)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                <div className="flex justify-between text-white">
                  <span className="font-medium">Total de Filamento:</span>
                  <span className="font-bold">
                    {calcularFilamentoTotal().toFixed(1)}g
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/impressoes")}
              className="bg-slate-700 border-slate-600 text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !validarFormulario()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Criando..." : "Criar Impressão"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
