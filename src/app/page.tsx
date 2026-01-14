"use client";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/header";
import ProtectedRoute from "../components/ProtectedRoute";
import { useState, useEffect } from "react";

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

interface Filamento {
  [key: string]: unknown;
}

interface Impressao {
  dataInicio: string;
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [impressorasRes, filamentosRes, impressoesRes] =
          await Promise.all([
            fetch("/api/impressoras"),
            fetch("/api/filamentos"),
            fetch("/api/impressoes"),
          ]);

        const impressoras = await impressorasRes.json();
        const filamentos = await filamentosRes.json();
        const impressoes = await impressoesRes.json();

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

        setStats({
          totalImpressoras: impressoras.length || 0,
          impressorasDisponiveis:
            impressoras.filter((i: Impressora) => i.status === "disponivel").length ||
            0,
          impressorasEmUso:
            impressoras.filter((i: Impressora) => i.status === "em_uso").length || 0,
          totalFilamentos: filamentos.length || 0,
          impressoesHoje:
            impressoes.filter((i: Impressao) => new Date(i.dataInicio) >= hoje)
              .length || 0,
          impressoesMes:
            impressoes.filter((i: Impressao) => new Date(i.dataInicio) >= inicioMes)
              .length || 0,
          loading: false,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Bem-vindo ao 3D PrintManager
          </h1>
          <p className="text-gray-400">
            Olá, {user?.primeiroNome || "Usuário"}! Gerencie suas impressoras 3D
            e impressões.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-gray-400 text-sm mb-2">Total de Impressoras</h3>
            <p className="text-3xl font-bold text-white">
              {stats.totalImpressoras}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {stats.impressorasDisponiveis} disponíveis
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-gray-400 text-sm mb-2">Impressoras em Uso</h3>
            <p className="text-3xl font-bold text-blue-500">
              {stats.impressorasEmUso}
            </p>
            <p className="text-sm text-gray-500 mt-2">Atualmente operando</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-gray-400 text-sm mb-2">
              Filamentos em Estoque
            </h3>
            <p className="text-3xl font-bold text-green-500">
              {stats.totalFilamentos}
            </p>
            <p className="text-sm text-gray-500 mt-2">Bobinas disponíveis</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-gray-400 text-sm mb-2">Impressões Hoje</h3>
            <p className="text-3xl font-bold text-purple-500">
              {stats.impressoesHoje}
            </p>
            <p className="text-sm text-gray-500 mt-2">Iniciadas hoje</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-gray-400 text-sm mb-2">Impressões Este Mês</h3>
            <p className="text-3xl font-bold text-yellow-500">
              {stats.impressoesMes}
            </p>
            <p className="text-sm text-gray-500 mt-2">Total do mês</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-gray-400 text-sm mb-2">Status do Sistema</h3>
            <p className="text-3xl font-bold text-green-500">●</p>
            <p className="text-sm text-gray-500 mt-2">Operacional</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/impressoras"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition-colors"
          >
            <h3 className="text-xl font-bold mb-2">🖨️ Impressoras</h3>
            <p className="text-sm">Gerenciar impressoras 3D</p>
          </a>

          <a
            href="/filamentos"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg transition-colors"
          >
            <h3 className="text-xl font-bold mb-2">🧵 Filamentos</h3>
            <p className="text-sm">Controlar estoque de filamentos</p>
          </a>

          <a
            href="/impressoes"
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg transition-colors"
          >
            <h3 className="text-xl font-bold mb-2">📊 Impressões</h3>
            <p className="text-sm">Registrar e visualizar impressões</p>
          </a>
        </div>
      </div>
    </div>
  );
}
