import { useState, useEffect } from 'react';
import { getRandomTips, getTimeOfDay } from '../utils/homeUtils';

interface Stats {
  totalSolicitacoes: number;
  pendentes: number;
  aprovadas: number;
  recusadas: number;
  loading: boolean;
}

export const useHomePage = (isAuthenticated: boolean) => {
  const [stats, setStats] = useState<Stats>({
    totalSolicitacoes: 0,
    pendentes: 0,
    aprovadas: 0,
    recusadas: 0,
    loading: true,
  });
  const [randomTips] = useState(getRandomTips());
  const [timeOfDay] = useState(getTimeOfDay());

  // Define a type for solicitacao items
  interface Solicitacao {
    status: string;
    // add other properties if needed
  }

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/getSolicitacoes');
        if (response.ok) {
          const data: Solicitacao[] = await response.json();
          const pendentes = data.filter((s: Solicitacao) => s.status.toUpperCase() === 'PENDENTE').length;
          const aprovadas = data.filter((s: Solicitacao) => s.status.toUpperCase() === 'APROVADA').length;
          const recusadas = data.filter((s: Solicitacao) => s.status.toUpperCase() === 'RECUSADA').length;
          
          setStats({
            totalSolicitacoes: data.length,
            pendentes,
            aprovadas,
            recusadas,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  return {
    stats,
    randomTips,
    timeOfDay,
  };
};
