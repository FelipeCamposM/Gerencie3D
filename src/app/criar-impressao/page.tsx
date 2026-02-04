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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Trash2,
  Plus,
  DollarSign,
  TrendingUp,
  Package,
  Printer,
  FileText,
  Clock,
  User,
  Layers3,
} from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <form onSubmit={handleSubmit}>
          {/* Header do Card */}
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-xl mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Printer className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Nova Impressão 3D
                </h2>
                <p className="text-slate-500 font-medium text-sm">
                  Preencha os dados para iniciar uma nova impressão
                </p>
              </div>
            </div>
          </div>

          {/* Card Principal */}
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna 1: Informações Básicas */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="font-black text-slate-800 text-lg">
                    Informações Básicas
                  </h3>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 rounded-xl border-2 border-blue-100/60 shadow-md">
                  <Label
                    htmlFor="nomeProjeto"
                    className="text-slate-800 font-bold text-sm mb-2 flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                    Nome do Projeto *
                  </Label>
                  <Input
                    id="nomeProjeto"
                    value={formData.nomeProjeto}
                    onChange={(e) =>
                      setFormData({ ...formData, nomeProjeto: e.target.value })
                    }
                    className="bg-white border-2 border-blue-200 text-slate-800 h-11 focus:border-blue-400 transition-colors font-semibold"
                    placeholder="Ex: Suporte para monitor"
                    required
                  />
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 p-5 rounded-xl border-2 border-purple-100/60 shadow-md">
                  <Label
                    htmlFor="impressoraId"
                    className="text-slate-800 font-bold text-sm mb-2 flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4 text-purple-600" />
                    Impressora *
                  </Label>
                  <Select
                    value={formData.impressoraId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, impressoraId: value })
                    }
                  >
                    <SelectTrigger className="bg-white border-2 border-purple-200 text-slate-800 h-11 focus:border-purple-400 transition-colors font-semibold w-full">
                      <SelectValue placeholder="Selecione a impressora" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-slate-200 shadow-xl">
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
                            className="text-slate-800 font-semibold"
                          >
                            {impressora.nome} - {impressora.modelo}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-sky-50/50 p-5 rounded-xl border-2 border-cyan-100/60 shadow-md">
                  <Label className="text-slate-800 font-bold text-sm mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-cyan-600" />
                    Tempo de Impressão *
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
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
                        className="bg-white border-2 border-cyan-200 text-slate-800 h-11 focus:border-cyan-400 transition-colors font-semibold"
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
                        className="bg-white border-2 border-cyan-200 text-slate-800 h-11 focus:border-cyan-400 transition-colors font-semibold"
                        placeholder="Minutos"
                      />
                    </div>
                  </div>
                  {formData.tempoImpressao &&
                    parseInt(formData.tempoImpressao) > 0 && (
                      <div className="mt-3 bg-white p-3 rounded-lg border-2 border-cyan-200">
                        <p className="text-cyan-700 text-sm font-bold flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Total:{" "}
                          {Math.floor(
                            parseInt(formData.tempoImpressao) / 60
                          )}h {parseInt(formData.tempoImpressao) % 60}min
                        </p>
                      </div>
                    )}
                </div>

                <div className="flex gap-2">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 rounded-xl border-2 border-amber-100/60 shadow-md">
                    <Label
                      htmlFor="custosAdicionais"
                      className="text-slate-800 font-bold text-sm mb-2 flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4 text-amber-600" />
                      Custos Adicionais
                    </Label>
                    <Input
                      id="custosAdicionais"
                      type="text"
                      inputMode="numeric"
                      value={custosAdicionaisInput.valorFormatado}
                      onChange={custosAdicionaisInput.handleChange}
                      onKeyDown={custosAdicionaisInput.handleKeyDown}
                      className="bg-white border-2 border-amber-200 text-slate-800 h-11 focus:border-amber-400 transition-colors font-semibold"
                      placeholder="R$ 0,00"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 p-5 rounded-xl border-2 border-green-100/60 shadow-md">
                    <Label
                      htmlFor="markup"
                      className="text-slate-800 font-bold text-sm mb-2 flex items-center gap-2"
                    >
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Markup (Multiplicador)
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
                      className="bg-white border-2 border-green-200 text-slate-800 h-11 focus:border-green-400 transition-colors font-semibold"
                      placeholder="4"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-gray-50/50 p-5 rounded-xl border-2 border-slate-200 shadow-md">
                  <Label
                    htmlFor="observacoes"
                    className="text-slate-800 font-bold text-sm mb-2 flex items-center gap-2"
                  >
                    Observações
                  </Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                    className="bg-white border-2 border-slate-300 text-slate-800 min-h-[100px] text-sm focus:border-slate-400 transition-colors resize-none font-medium"
                    placeholder="Observações adicionais sobre a impressão..."
                  />
                </div>
              </div>

              {/* Coluna 2: Filamentos */}
              <div className="space-y-5">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Layers3 className="h-5 w-5 text-purple-600" />
                    <h3 className="font-black text-slate-800 text-lg">
                      Filamentos Utilizados
                    </h3>
                  </div>
                  <Button
                    type="button"
                    onClick={adicionarFilamento}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-9 px-4 text-sm shadow-lg shadow-green-500/30 font-bold"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-4 max-h-[620px] overflow-y-auto pr-2 scrollbar-dark">
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
                        className="bg-gradient-to-br from-white to-purple-50/30 p-4 rounded-xl border-2 border-purple-200 shadow-md hover:shadow-lg transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                            Filamento #{index + 1}
                          </span>
                          {filamentosSelecionados.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removerFilamento(index)}
                              variant="destructive"
                              size="sm"
                              className="h-7 w-7 p-0 shadow-sm"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>

                        <Select
                          value={filamentoSel.filamentoId}
                          onValueChange={(value) =>
                            atualizarFilamento(index, "filamentoId", value)
                          }
                        >
                          <SelectTrigger className="bg-white border-2 border-purple-300 text-slate-800 h-12 font-semibold hover:border-purple-400 transition-colors w-full">
                            <SelectValue placeholder="Selecione o filamento" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-2 border-slate-200 shadow-xl max-h-[300px]">
                            {filamentos.map((filamento) => (
                              <SelectItem
                                key={filamento.id}
                                value={filamento.id}
                                className="text-slate-800 font-semibold py-3"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8 ring-2 ring-purple-200">
                                    {filamento.comprador.imagemUsuario &&
                                    filamento.comprador.imagemUsuario.length >
                                      0 ? (
                                      <AvatarImage
                                        src={`data:image/jpeg;base64,${filamento.comprador.imagemUsuario}`}
                                        className="object-cover"
                                      />
                                    ) : null}
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center">
                                      <User className="h-4 w-4" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col gap-0.5 flex-1">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                        style={{
                                          backgroundColor: filamento.cor,
                                        }}
                                      />
                                      <span className="font-bold text-slate-800">
                                        {filamento.tipo}
                                      </span>
                                      <span className="text-slate-600">-</span>
                                      <span className="text-slate-700">
                                        {filamento.nomeCor}
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-500 ml-6">
                                      Comprador:{" "}
                                      {filamento.comprador.primeiroNome} •{" "}
                                      {filamento.pesoAtual.toFixed(0)}g
                                      disponível
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex gap-3 items-center">
                          <div className="flex-1">
                            <Label className="text-xs font-bold text-slate-700 mb-1.5 block">
                              Quantidade (gramas)
                            </Label>
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
                              className="bg-white border-2 border-slate-300 text-slate-800 h-10 font-semibold focus:border-purple-400 transition-colors"
                              placeholder="0.0"
                            />
                          </div>
                        </div>

                        {/* Informação de sobra no carretel */}
                        {filamentoAtual && quantidadeUsada > 0 && (
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border-2 border-blue-200 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-700">
                                Sobrará no carretel:
                              </span>
                              <span
                                className={`text-sm font-black ${
                                  sobra < 100
                                    ? "text-amber-600"
                                    : "text-green-600"
                                }`}
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

                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl shadow-lg shadow-purple-500/30">
                  <div className="flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      <span className="font-bold text-sm">
                        Total de Filamento:
                      </span>
                    </div>
                    <span className="font-black text-2xl">
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
