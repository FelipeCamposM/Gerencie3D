"use client";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/header";
import ProtectedRoute from "../components/ProtectedRoute";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Printer,
  Package,
  ClipboardList,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

interface Impressora {
  status: string;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Filamento {
  [key: string]: unknown;
}

interface Impressao {
  dataInicio: string;
  status: string;
  filamentoTotalUsado: number;
  nomeProjeto: string;
  [key: string]: unknown;
}

interface FilamentoData {
  tipo: string;
  pesoAtual: number;
  pesoInicial: number;
  [key: string]: unknown;
}

function HomeContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalImpressoras: 0,
    impressorasDisponiveis: 0,
    impressorasEmUso: 0,
    totalFilamentos: 0,
    impressoesHoje: 0,
    impressoesMes: 0,
    loading: true,
  });
  const [chartData, setChartData] = useState<{
    statusImpressoras: Array<{ name: string; value: number; color: string }>;
    impressoesPorDia: Array<{ dia: string; quantidade: number }>;
    filamentosPorTipo: Array<{
      tipo: string;
      quantidade: number;
      peso: number;
    }>;
    impressoesRecentes: Impressao[];
  }>({
    statusImpressoras: [],
    impressoesPorDia: [],
    filamentosPorTipo: [],
    impressoesRecentes: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [impressorasRes, filamentosRes, impressoesRes] =
          await Promise.all([
            fetch("/api/impressoras"),
            fetch("/api/filamentos"),
            fetch("/api/impressoes"),
          ]);

        const impressoras: Impressora[] = await impressorasRes.json();
        const filamentos: FilamentoData[] = await filamentosRes.json();
        const impressoes: Impressao[] = await impressoesRes.json();

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

        // Stats básicas
        const disponíveis = impressoras.filter(
          (i) => i.status === "disponivel"
        ).length;
        const emUso = impressoras.filter((i) => i.status === "em_uso").length;
        const manutencao = impressoras.filter(
          (i) => i.status === "manutencao"
        ).length;

        // Dados para gráfico de pizza - Status das Impressoras
        const statusData = [
          { name: "Disponíveis", value: disponíveis, color: "#10b981" },
          { name: "Em Uso", value: emUso, color: "#3b82f6" },
          { name: "Manutenção", value: manutencao, color: "#ef4444" },
        ].filter((item) => item.value > 0);

        // Dados para gráfico de barras - Impressões por dia (últimos 7 dias)
        const impressoesPorDia = [];
        for (let i = 6; i >= 0; i--) {
          const dia = new Date();
          dia.setDate(dia.getDate() - i);
          dia.setHours(0, 0, 0, 0);
          const proximoDia = new Date(dia);
          proximoDia.setDate(proximoDia.getDate() + 1);

          const count = impressoes.filter((imp) => {
            const dataImp = new Date(imp.dataInicio);
            return dataImp >= dia && dataImp < proximoDia;
          }).length;

          impressoesPorDia.push({
            dia: dia.toLocaleDateString("pt-BR", {
              weekday: "short",
              day: "2-digit",
            }),
            quantidade: count,
          });
        }

        // Dados para gráfico - Filamentos por tipo
        const filamentosPorTipoMap = new Map<
          string,
          { quantidade: number; peso: number }
        >();
        filamentos.forEach((fil) => {
          const existing = filamentosPorTipoMap.get(fil.tipo) || {
            quantidade: 0,
            peso: 0,
          };
          filamentosPorTipoMap.set(fil.tipo, {
            quantidade: existing.quantidade + 1,
            peso: existing.peso + fil.pesoAtual,
          });
        });

        const filamentosPorTipo = Array.from(
          filamentosPorTipoMap.entries()
        ).map(([tipo, data]) => ({
          tipo,
          quantidade: data.quantidade,
          peso: Math.round(data.peso),
        }));

        // Impressões recentes
        const impressoesRecentes = impressoes
          .sort(
            (a, b) =>
              new Date(b.dataInicio).getTime() -
              new Date(a.dataInicio).getTime()
          )
          .slice(0, 5);

        setStats({
          totalImpressoras: impressoras.length || 0,
          impressorasDisponiveis: disponíveis,
          impressorasEmUso: emUso,
          totalFilamentos: filamentos.length || 0,
          impressoesHoje:
            impressoes.filter((i) => new Date(i.dataInicio) >= hoje).length ||
            0,
          impressoesMes:
            impressoes.filter((i) => new Date(i.dataInicio) >= inicioMes)
              .length || 0,
          loading: false,
        });

        setChartData({
          statusImpressoras: statusData,
          impressoesPorDia,
          filamentosPorTipo,
          impressoesRecentes,
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-700 text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Printer className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              Bem-vindo ao Gerencie 3D!
            </h1>
            <p className="text-slate-600 font-medium text-lg">
              Olá, {user?.primeiroNome || "Usuário"}! Gerencie suas impressoras
              3D e impressões.
            </p>
          </div>
        </div>

        {/* Stats Cards - Mobile: Single Card | Desktop: Grid */}
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
                  {stats.totalImpressoras}
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
                  {stats.impressorasDisponiveis}
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
                  {stats.impressorasEmUso}
                </p>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Total de Filamentos
                  </p>
                </div>
                <p className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {stats.totalFilamentos}
                </p>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Impressões Hoje
                  </p>
                </div>
                <p className="text-xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {stats.impressoesHoje}
                </p>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-lg flex items-center justify-center shadow-md">
                    <ClipboardList className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Impressões Este Mês
                  </p>
                </div>
                <p className="text-xl font-black bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">
                  {stats.impressoesMes}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop View - Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-6 border-2 border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                  Total de Impressoras
                </p>
                <p className="text-3xl font-black text-slate-900 mt-2">
                  {stats.totalImpressoras}
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
                  {stats.impressorasDisponiveis}
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
                  {stats.impressorasEmUso}
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
                  Total de Filamentos
                </p>
                <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                  {stats.totalFilamentos}
                </p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <Package className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg p-6 border-2 border-orange-200 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                  Impressões Hoje
                </p>
                <p className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mt-2">
                  {stats.impressoesHoje}
                </p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <Clock className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-cyan-50 rounded-xl shadow-lg p-6 border-2 border-cyan-200 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                  Impressões Este Mês
                </p>
                <p className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent mt-2">
                  {stats.impressoesMes}
                </p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <ClipboardList className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Status das Impressoras */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-xl p-6 border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                Status das Impressoras
              </h3>
            </div>
            {chartData.statusImpressoras.length > 0 ? (
              <div className="h-64 flex items-center justify-center">
                <PieChart width={450} height={250}>
                  <Pie
                    data={chartData.statusImpressoras}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.statusImpressoras.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                Nenhum dado disponível
              </div>
            )}
          </div>

          {/* Gráfico de Impressões por Dia */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-xl p-6 border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-lg flex items-center justify-center shadow-md">
                <BarChart className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                Impressões nos Últimos 7 Dias
              </h3>
            </div>
            {chartData.impressoesPorDia.length > 0 ? (
              <div className="h-64 flex items-center justify-center">
                <BarChart
                  width={450}
                  height={250}
                  data={chartData.impressoesPorDia}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#3b82f6" />
                </BarChart>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                Nenhum dado disponível
              </div>
            )}
          </div>
        </div>

        {/* Filamentos e Impressões Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Filamentos por Tipo */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-xl p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                Filamentos por Tipo
              </h3>
            </div>
            {chartData.filamentosPorTipo.length > 0 ? (
              <div className="h-64 flex items-center justify-center">
                <BarChart
                  width={450}
                  height={250}
                  data={chartData.filamentosPorTipo}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tipo" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#8b5cf6" name="Quantidade" />
                </BarChart>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                Nenhum dado disponível
              </div>
            )}
          </div>

          {/* Impressões Recentes */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-xl p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                Impressões Recentes
              </h3>
            </div>
            {chartData.impressoesRecentes.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-blue-400 [&::-webkit-scrollbar-thumb]:to-indigo-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                {chartData.impressoesRecentes.map((impressao, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border-2 border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex-1">
                      <p className="font-black text-slate-900 text-sm">
                        {impressao.nomeProjeto || `Impressão #${impressao.id}`}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 font-medium">
                        {new Date(impressao.dataInicio).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${
                          impressao.status === "concluida"
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                            : impressao.status === "em_andamento"
                            ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
                            : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
                        }`}
                      >
                        {impressao.status === "concluida"
                          ? "Concluída"
                          : impressao.status === "em_andamento"
                          ? "Em Andamento"
                          : "Cancelada"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                Nenhuma impressão recente
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/impressoras"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-6 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-1 flex items-center gap-4 group border-0"
          >
            <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Printer className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black mb-1">Impressoras</h3>
              <p className="text-sm text-blue-100 font-medium">
                Gerenciar impressoras 3D
              </p>
            </div>
          </a>

          <a
            href="/filamentos"
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-6 rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:-translate-y-1 flex items-center gap-4 group border-0"
          >
            <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Package className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black mb-1">Filamentos</h3>
              <p className="text-sm text-purple-100 font-medium">
                Controlar estoque de filamentos
              </p>
            </div>
          </a>

          <a
            href="/impressoes"
            className="bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-white p-6 rounded-xl transition-all shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:-translate-y-1 flex items-center gap-4 group border-0"
          >
            <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <ClipboardList className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black mb-1">Impressões</h3>
              <p className="text-sm text-cyan-100 font-medium">
                Registrar e visualizar impressões
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
