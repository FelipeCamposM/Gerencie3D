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
import {
  FilamentoSimples as Filamento,
  FilamentoSelecionado,
} from "@/types/filamento";
import { useCurrencyInput } from "@/utils/currencyInput";
import { toast } from "sonner";

interface Impressora {
  id: number;
  nome: string;
  modelo: string;
  status: string;
  gastoEnergiaKwh: number;
  precoEnergiaKwh: number;
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
    custosAdicionais: "",
    markup: "4",
    custoPeca: "",
  });

  // Hook para entrada monetária dos custos adicionais
  const custosAdicionaisInput = useCurrencyInput({
    onChange: (valorEmReais) => {
      setFormData((prev) => ({ ...prev, custosAdicionais: valorEmReais }));
    },
    initialValue: 0,
  });

  const [filamentosSelecionados, setFilamentosSelecionados] = useState<
    FilamentoSelecionado[]
  >([{ filamentoId: "", quantidadeUsada: "" }]);

  useEffect(() => {
    fetchImpressoras();
    fetchFilamentos();
  }, []);

  // Calcular automaticamente o preço de venda
  useEffect(() => {
    calcularPrecoVenda();
  }, [
    formData.tempoImpressao,
    formData.impressoraId,
    formData.custosAdicionais,
    formData.markup,
    filamentosSelecionados,
  ]);

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

  const calcularPrecoVenda = () => {
    // Verificar se temos dados suficientes
    if (!formData.tempoImpressao || !formData.impressoraId) {
      return;
    }

    const impressoraSelecionada = impressoras.find(
      (imp) => imp.id.toString() === formData.impressoraId
    );

    if (!impressoraSelecionada) {
      return;
    }

    // Verificar se há filamentos válidos selecionados
    const filamentosValidos = filamentosSelecionados.filter(
      (fil) => fil.filamentoId && parseFloat(fil.quantidadeUsada) > 0
    );

    if (filamentosValidos.length === 0) {
      return;
    }

    // Calcular custo do filamento
    let custoFilamento = 0;
    filamentosValidos.forEach((filSel) => {
      const filamento = filamentos.find((f) => f.id === filSel.filamentoId);
      if (filamento) {
        const custoGrama = filamento.precoCompra / filamento.pesoInicial;
        custoFilamento += custoGrama * parseFloat(filSel.quantidadeUsada);
      }
    });

    // Calcular custo de energia
    const horasImpressao = parseFloat(formData.tempoImpressao) / 60;
    const custoEnergia =
      impressoraSelecionada.gastoEnergiaKwh *
      horasImpressao *
      impressoraSelecionada.precoEnergiaKwh;

    // Adicionar custos adicionais
    const custosAdicionais = parseFloat(formData.custosAdicionais) || 0;

    // Calcular custo da peça
    const custoPeca = custoFilamento + custoEnergia + custosAdicionais;

    // Aplicar markup ao preço de venda
    const markup = parseFloat(formData.markup) || 1;
    const precoVenda = custoPeca * markup;

    // Atualizar o custo da peça e preço de venda
    setFormData((prev) => ({
      ...prev,
      custoPeca: custoPeca.toFixed(2),
      precoVenda: precoVenda.toFixed(2),
    }));
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
      toast.error("Formulário incompleto", {
        description:
          "Por favor, preencha todos os campos obrigatórios corretamente.",
      });
      return;
    }

    if (!user) {
      toast.error("Autenticação necessária", {
        description: "Usuário não autenticado.",
      });
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
        toast.success("Impressão criada com sucesso!", {
          description: "A impressão foi iniciada e a impressora está em uso.",
        });
        router.push("/impressoes");
      } else {
        const error = await response.json();
        toast.error("Erro ao criar impressão", {
          description: error.error || "Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao criar impressão:", error);
      toast.error("Erro ao criar impressão", {
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Nova Impressão 3D
          </h1>
          <p className="text-slate-600">
            Registre uma nova impressão no sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-slate-600 text-white rounded-full flex items-center justify-center text-sm">
                1
              </span>
              Informações Básicas
            </h2>

            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="nomeProjeto"
                  className="text-slate-700 font-medium"
                >
                  Nome do Projeto *
                </Label>
                <Input
                  id="nomeProjeto"
                  value={formData.nomeProjeto}
                  onChange={(e) =>
                    setFormData({ ...formData, nomeProjeto: e.target.value })
                  }
                  className="bg-white border-slate-300 text-slate-800"
                  placeholder="Ex: Suporte para monitor"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="impressoraId"
                    className="text-slate-700 font-medium"
                  >
                    Impressora *
                  </Label>
                  <Select
                    value={formData.impressoraId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, impressoraId: value })
                    }
                  >
                    <SelectTrigger className="bg-white border-slate-300 text-slate-800">
                      <SelectValue placeholder="Selecione a impressora" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {impressoras.length === 0 ? (
                        <SelectItem
                          value="none"
                          disabled
                          className="text-slate-600"
                        >
                          Nenhuma impressora disponível
                        </SelectItem>
                      ) : (
                        impressoras.map((impressora) => (
                          <SelectItem
                            key={impressora.id}
                            value={impressora.id.toString()}
                            className="text-slate-800"
                          >
                            {impressora.nome} - {impressora.modelo}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="tempoImpressao"
                    className="text-slate-700 font-medium"
                  >
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
                    className="bg-white border-slate-300 text-slate-800"
                    placeholder="Ex: 180"
                    required
                  />
                  {formData.tempoImpressao && (
                    <p className="text-slate-600 text-xs mt-1">
                      ≈ {Math.floor(parseFloat(formData.tempoImpressao) / 60)}h{" "}
                      {parseFloat(formData.tempoImpressao) % 60}min
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label
                    htmlFor="custosAdicionais"
                    className="text-slate-700 font-medium"
                  >
                    Custos Adicionais
                  </Label>
                  <Input
                    id="custosAdicionais"
                    type="text"
                    value={custosAdicionaisInput.valorFormatado}
                    onChange={custosAdicionaisInput.handleChange}
                    onKeyDown={custosAdicionaisInput.handleKeyDown}
                    className="bg-white border-slate-300 text-slate-800 font-medium"
                    placeholder="R$ 0,00"
                  />
                  <p className="text-slate-500 text-xs mt-1">
                    Embalagem, adesivos, etc.
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="markup"
                    className="text-slate-700 font-medium"
                  >
                    Markup (Multiplicador)
                  </Label>
                  <Input
                    id="markup"
                    type="number"
                    step="0.1"
                    min="1"
                    value={formData.markup}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        markup: e.target.value,
                      })
                    }
                    className="bg-white border-slate-300 text-slate-800"
                    placeholder="4"
                  />
                  <p className="text-slate-500 text-xs mt-1">
                    Multiplicador do custo
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="custoPeca"
                    className="text-slate-700 font-medium"
                  >
                    Custo da Peça
                  </Label>
                  <Input
                    id="custoPeca"
                    type="text"
                    value={
                      formData.custoPeca
                        ? `R$ ${parseFloat(formData.custoPeca).toFixed(2)}`
                        : "R$ 0,00"
                    }
                    className="bg-slate-50 border-slate-300 text-slate-800 font-semibold"
                    disabled
                  />
                  <p className="text-slate-500 text-xs mt-1">
                    Custo total calculado
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label
                    htmlFor="precoVenda"
                    className="text-slate-700 font-medium"
                  >
                    Preço de Venda (com Markup)
                  </Label>
                  <div className="relative">
                    <Input
                      id="precoVenda"
                      type="text"
                      value={
                        formData.precoVenda
                          ? `R$ ${parseFloat(formData.precoVenda).toFixed(2)}`
                          : "R$ 0,00"
                      }
                      className="bg-green-50 border-green-300 text-green-700 font-bold text-lg"
                      disabled
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-1">
                    Custo × {formData.markup || "4"}x markup
                  </p>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="observacoes"
                  className="text-slate-700 font-medium"
                >
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  className="bg-white border-slate-300 text-slate-800 min-h-[100px]"
                  placeholder="Adicione observações sobre a impressão..."
                />
              </div>
            </div>
          </div>

          {/* Filamentos */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-8 h-8 bg-slate-600 text-white rounded-full flex items-center justify-center text-sm">
                  2
                </span>
                Filamentos Utilizados *
              </h2>
              <Button
                type="button"
                onClick={adicionarFilamento}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Filamento
              </Button>
            </div>

            <div className="space-y-3">
              {filamentosSelecionados.map((filamentoSel, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200"
                >
                  <div className="flex-1">
                    <Label className="text-slate-700 font-medium">
                      Filamento
                    </Label>
                    <Select
                      value={filamentoSel.filamentoId}
                      onValueChange={(value) =>
                        atualizarFilamento(index, "filamentoId", value)
                      }
                    >
                      <SelectTrigger className="bg-white border-slate-300 text-slate-800">
                        <SelectValue placeholder="Selecione o filamento" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {filamentos.map((filamento) => (
                          <SelectItem
                            key={filamento.id}
                            value={filamento.id}
                            className="text-slate-800"
                          >
                            {filamento.tipo} - {filamento.cor} (
                            {filamento.pesoAtual.toFixed(0)}g disponível)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <Label className="text-slate-700 font-medium">
                      Quantidade (g)
                    </Label>
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
                      className="bg-white border-slate-300 text-slate-800"
                      placeholder="0.0"
                    />
                  </div>

                  {filamentosSelecionados.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removerFilamento(index)}
                      variant="destructive"
                      size="sm"
                      className="mb-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
                <div className="flex justify-between text-slate-800">
                  <span className="font-medium">Total de Filamento:</span>
                  <span className="font-bold text-lg">
                    {calcularFilamentoTotal().toFixed(1)}g
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 justify-end pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/impressoes")}
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !validarFormulario()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {loading ? "Criando..." : "Criar Impressão"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
