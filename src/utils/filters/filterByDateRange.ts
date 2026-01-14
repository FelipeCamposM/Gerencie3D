import { Solicitacao } from "@/types/solicitacao";

// Função para criar data local sem problemas de timezone
const createLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month é 0-indexed
};

export const filterByDateRange = (
  solicitacoes: Solicitacao[],
  startDate: string | null,
  endDate: string | null
): Solicitacao[] => {
  if (!startDate && !endDate) {
    return solicitacoes;
  }

  return solicitacoes.filter((solicitacao) => {
    const solicitacaoDate = new Date(solicitacao.created_at);
    
    // Reset time to beginning of day for accurate comparison
    solicitacaoDate.setHours(0, 0, 0, 0);
    
    let matchesStartDate = true;
    let matchesEndDate = true;
    
    if (startDate) {
      const start = createLocalDate(startDate);
      start.setHours(0, 0, 0, 0);
      matchesStartDate = solicitacaoDate >= start;
    }
    
    if (endDate) {
      const end = createLocalDate(endDate);
      end.setHours(23, 59, 59, 999); // End of day
      matchesEndDate = solicitacaoDate <= end;
    }
    
    return matchesStartDate && matchesEndDate;
  });
};
