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
import { Trash2, Plus, DollarSign, TrendingUp, Package } from "lucide-react";
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
    tempoImpressao: "", // em minutos (calculado automaticamente)
    horas: "",
    minutos: "",
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

  // Atualizar tempo total em minutos quando horas ou minutos mudam
  useEffect(() => {
    const horas = parseInt(formData.horas) || 0;
    const minutos = parseInt(formData.minutos) || 0;
    const totalMinutos = (horas * 60 + minutos).toString();

    if (formData.tempoImpressao !== totalMinutos) {
      setFormData((prev) => ({ ...prev, tempoImpressao: totalMinutos }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.horas, formData.minutos]);

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

  // Calcular automaticamente o preço de venda
  useEffect(() => {
    calcularPrecoVenda();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.tempoImpressao,
    formData.impressoraId,
    formData.custosAdicionais,
    formData.markup,
    filamentosSelecionados,
    impressoras,
    filamentos,
  ]);

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
        <form onSubmit={handleSubmit}>
          {/* Card Único */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-md">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-200">
              Nova Impressão 3D
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna 1: Informações Básicas */}
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="nomeProjeto"
                    className="text-slate-700 font-semibold text-sm mb-1.5 block"
                  >
                    Nome do Projeto *
                  </Label>
                  <Input
                    id="nomeProjeto"
                    value={formData.nomeProjeto}
                    onChange={(e) =>
                      setFormData({ ...formData, nomeProjeto: e.target.value })
                    }
                    className="bg-slate-50 border-slate-300 text-slate-800 h-10 focus:bg-white transition-colors"
                    placeholder="Ex: Suporte para monitor"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="impressoraId"
                    className="text-slate-700 font-semibold text-sm mb-1.5 block"
                  >
                    Impressora *
                  </Label>
                  <Select
                    value={formData.impressoraId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, impressoraId: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-300 text-slate-800 h-10 focus:bg-white transition-colors w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {impressoras.length === 0 ? (
                        <SelectItem
                          value="none"
                          disabled
                          className="text-slate-600"
                        >
                          Nenhuma disponível
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
                  <Label className="text-slate-700 font-semibold text-sm mb-1.5 block">
                    Tempo de Impressão *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        id="horas"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={formData.horas}
                        onChange={(e) =>
                          setFormData({ ...formData, horas: e.target.value })
                        }
                        className="bg-slate-50 border-slate-300 text-slate-800 h-10 focus:bg-white transition-colors"
                        placeholder="Horas"
                      />
                    </div>
                    <div>
                      <Input
                        id="minutos"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="59"
                        value={formData.minutos}
                        onChange={(e) =>
                          setFormData({ ...formData, minutos: e.target.value })
                        }
                        className="bg-slate-50 border-slate-300 text-slate-800 h-10 focus:bg-white transition-colors"
                        placeholder="Minutos"
                      />
                    </div>
                  </div>
                  {formData.tempoImpressao &&
                    parseInt(formData.tempoImpressao) > 0 && (
                      <p className="text-blue-600 text-xs mt-1.5 font-medium">
                        ⏱️ Total: {formData.tempoImpressao} minutos
                      </p>
                    )}
                </div>

                <div>
                  <Label
                    htmlFor="custosAdicionais"
                    className="text-slate-700 font-semibold text-sm mb-1.5 block"
                  >
                    Custos Adicionais
                  </Label>
                  <Input
                    id="custosAdicionais"
                    type="text"
                    inputMode="numeric"
                    value={custosAdicionaisInput.valorFormatado}
                    onChange={custosAdicionaisInput.handleChange}
                    onKeyDown={custosAdicionaisInput.handleKeyDown}
                    className="bg-slate-50 border-slate-300 text-slate-800 h-10 focus:bg-white transition-colors"
                    placeholder="R$ 0,00"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="markup"
                    className="text-slate-700 font-semibold text-sm mb-1.5 block"
                  >
                    Markup
                  </Label>
                  <Input
                    id="markup"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="1"
                    value={formData.markup}
                    onChange={(e) =>
                      setFormData({ ...formData, markup: e.target.value })
                    }
                    className="bg-slate-50 border-slate-300 text-slate-800 h-10 focus:bg-white transition-colors"
                    placeholder="4"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="observacoes"
                    className="text-slate-700 font-semibold text-sm mb-1.5 block"
                  >
                    Observações
                  </Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                    className="bg-slate-50 border-slate-300 text-slate-800 min-h-[100px] text-sm focus:bg-white transition-colors resize-none"
                    placeholder="Observações..."
                  />
                </div>
              </div>

              {/* Coluna 2: Filamentos */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-slate-700 font-semibold text-sm">
                    Filamentos *
                  </Label>
                  <Button
                    type="button"
                    onClick={adicionarFilamento}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-8 px-3 text-xs shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                  {filamentosSelecionados.map((filamentoSel, index) => {
                    const filamentoAtual = filamentos.find(
                      (f) => f.id === filamentoSel.filamentoId
                    );
                    const quantidadeUsada =
                      parseFloat(filamentoSel.quantidadeUsada) || 0;
                    const sobra = filamentoAtual
                      ? filamentoAtual.pesoAtual - quantidadeUsada
                      : 0;

                    return (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-slate-50 to-blue-50 p-3 rounded-lg border border-slate-300 shadow-sm space-y-2.5"
                      >
                        <Select
                          value={filamentoSel.filamentoId}
                          onValueChange={(value) =>
                            atualizarFilamento(index, "filamentoId", value)
                          }
                        >
                          <SelectTrigger className="bg-white border-slate-300 text-slate-800 !h-12 text-sm w-full">
                            <SelectValue placeholder="Selecione o filamento" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200">
                            {filamentos.map((filamento) => (
                              <SelectItem
                                key={filamento.id}
                                value={filamento.id}
                                className="text-slate-800 text-sm py-2"
                              >
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <div
                                      className="w-3 h-3 rounded-full border border-slate-300"
                                      style={{ backgroundColor: filamento.cor }}
                                    />
                                    <span className="font-medium">
                                      {filamento.tipo}
                                    </span>
                                    <span>-</span>
                                    <span>{filamento.nomeCor}</span>
                                    <span className="text-slate-500 text-xs ml-auto">
                                      ({filamento.pesoAtual.toFixed(0)}g)
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 ml-4">
                                    Comprador:{" "}
                                    {filamento.comprador.primeiroNome}{" "}
                                    {filamento.comprador.ultimoNome}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              type="number"
                              inputMode="decimal"
                              min="0.1"
                              step="0.1"
                              max={
                                filamentoSel.filamentoId
                                  ? filamentos.find(
                                      (f) => f.id === filamentoSel.filamentoId
                                    )?.pesoAtual
                                  : undefined
                              }
                              value={filamentoSel.quantidadeUsada}
                              onChange={(e) => {
                                const value = e.target.value;
                                const filamentoSelecionado = filamentos.find(
                                  (f) => f.id === filamentoSel.filamentoId
                                );

                                if (
                                  filamentoSelecionado &&
                                  parseFloat(value) >
                                    filamentoSelecionado.pesoAtual
                                ) {
                                  toast.error("Quantidade inválida", {
                                    description: `Disponível apenas ${filamentoSelecionado.pesoAtual.toFixed(
                                      1
                                    )}g.`,
                                  });
                                  return;
                                }

                                atualizarFilamento(
                                  index,
                                  "quantidadeUsada",
                                  value
                                );
                              }}
                              className="bg-white border-slate-300 text-slate-800 h-9 text-sm"
                              placeholder="Gramas"
                            />
                          </div>

                          {filamentosSelecionados.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removerFilamento(index)}
                              variant="destructive"
                              size="sm"
                              className="h-9 w-9 p-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>

                        {/* Informação de sobra no carretel */}
                        {filamentoAtual && quantidadeUsada > 0 && (
                          <div className="bg-white p-2 rounded border border-slate-200">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-600">
                                Sobrará no carretel:
                              </span>
                              <span
                                className={
                                  sobra < 100
                                    ? "font-bold text-amber-600"
                                    : "font-bold text-green-600"
                                }
                              >
                                {sobra.toFixed(1)}g
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-lg shadow-sm">
                  <div className="flex justify-between text-white">
                    <span className="font-semibold text-sm">
                      Total de Filamento:
                    </span>
                    <span className="font-bold text-lg">
                      {calcularFilamentoTotal().toFixed(1)}g
                    </span>
                  </div>
                </div>
              </div>

              {/* Coluna 3: Resumo Financeiro */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-300 shadow-md">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-lg flex items-center justify-center shadow-sm">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-base">
                      Resumo Financeiro
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Custo Total */}
                    <div className="bg-white p-4 rounded-lg border-2 border-orange-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm lg:text-xs font-bold text-orange-700 uppercase tracking-wide">
                          Custo Total
                        </p>
                        <Package className="h-5 w-5 text-orange-600" />
                      </div>
                      <p className="text-3xl font-black text-orange-600 mb-3">
                        {formData.custoPeca
                          ? `R$ ${parseFloat(formData.custoPeca).toFixed(2)}`
                          : "R$ 0,00"}
                      </p>
                      <div className="space-y-2 pt-2 border-t-2 border-orange-100">
                        <div className="flex justify-between text-sm lg:text-xs">
                          <span className="text-slate-600 font-medium">
                            Filamento ({calcularFilamentoTotal().toFixed(1)}g)
                          </span>
                          <span className="font-bold text-slate-800">
                            {(() => {
                              let custoFilamento = 0;
                              filamentosSelecionados.forEach((filSel) => {
                                const filamento = filamentos.find(
                                  (f) => f.id === filSel.filamentoId
                                );
                                if (
                                  filamento &&
                                  parseFloat(filSel.quantidadeUsada) > 0
                                ) {
                                  const custoGrama =
                                    filamento.precoCompra /
                                    filamento.pesoInicial;
                                  custoFilamento +=
                                    custoGrama *
                                    parseFloat(filSel.quantidadeUsada);
                                }
                              });
                              return `R$ ${custoFilamento.toFixed(2)}`;
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm lg:text-xs">
                          <span className="text-slate-600 font-medium">
                            Energia (
                            {formData.tempoImpressao
                              ? `${Math.floor(
                                  parseInt(formData.tempoImpressao) / 60
                                )}h ${
                                  parseInt(formData.tempoImpressao) % 60
                                }min`
                              : "0h 0min"}
                            )
                          </span>
                          <span className="font-bold text-slate-800">
                            {(() => {
                              if (
                                !formData.tempoImpressao ||
                                !formData.impressoraId
                              )
                                return "R$ 0,00";
                              const impressora = impressoras.find(
                                (imp) =>
                                  imp.id.toString() === formData.impressoraId
                              );
                              if (!impressora) return "R$ 0,00";
                              const horasImpressao =
                                parseFloat(formData.tempoImpressao) / 60;
                              const custoEnergia =
                                impressora.gastoEnergiaKwh *
                                horasImpressao *
                                impressora.precoEnergiaKwh;
                              return `R$ ${custoEnergia.toFixed(2)}`;
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm lg:text-xs">
                          <span className="text-slate-600 font-medium">
                            Custos Adicionais
                          </span>
                          <span className="font-bold text-slate-800">
                            R${" "}
                            {(
                              parseFloat(formData.custosAdicionais) || 0
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm lg:text-xs pt-1.5 border-t border-slate-200">
                          <span className="text-slate-600 font-medium">
                            Markup
                          </span>
                          <span className="font-bold text-blue-600">
                            {formData.markup}x
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Preço de Venda */}
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-lg border-2 border-green-400 shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm lg:text-xs font-bold text-white uppercase tracking-wide">
                          Preço de Venda
                        </p>
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-4xl font-black text-white mb-3">
                        {formData.precoVenda
                          ? `R$ ${parseFloat(formData.precoVenda).toFixed(2)}`
                          : "R$ 0,00"}
                      </p>
                      <div className="space-y-2 pt-2 border-t-2 border-green-400">
                        <div className="flex justify-between items-center">
                          <span className="text-sm lg:text-xs text-green-50 font-semibold">
                            Lucro Líquido
                          </span>
                          <span className="text-xl font-black text-white">
                            {formData.precoVenda && formData.custoPeca
                              ? `R$ ${(
                                  parseFloat(formData.precoVenda) -
                                  parseFloat(formData.custoPeca)
                                ).toFixed(2)}`
                              : "R$ 0,00"}
                          </span>
                        </div>
                        <div className="bg-green-400/30 px-2 py-1 rounded">
                          <p className="text-sm lg:text-xs text-white font-bold text-center">
                            {formData.precoVenda &&
                            formData.custoPeca &&
                            parseFloat(formData.custoPeca) > 0
                              ? `🎯 ${(
                                  ((parseFloat(formData.precoVenda) -
                                    parseFloat(formData.custoPeca)) /
                                    parseFloat(formData.custoPeca)) *
                                  100
                                ).toFixed(0)}% de margem de lucro`
                              : "Configure para ver margem"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={loading || !validarFormulario()}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-12 font-bold text-base shadow-lg disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Criando...
                      </span>
                    ) : (
                      "Criar Impressão"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/impressoes")}
                    className="bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 h-11 font-semibold"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
