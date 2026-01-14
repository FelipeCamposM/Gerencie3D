export const getWelcomeMessage = (timeOfDay: 'morning' | 'afternoon' | 'evening') => {
  const messages = {
    morning: 'Bom dia! Que tal começar o dia verificando as solicitações pendentes?',
    afternoon: 'Boa tarde! Vamos dar uma olhada no progresso de hoje?',
    evening: 'Boa noite! Aqui está um resumo das atividades do dia.',
  };
  
  return messages[timeOfDay];
};

export const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

export const getRandomTips = () => {
  const tips = [
    {
      title: 'Dica de Produtividade',
      message: 'Use os filtros na página de solicitações para encontrar rapidamente o que você procura.',
      type: 'productivity'
    },
    {
      title: 'Lembrete Importante',
      message: 'As atividades recentes são atualizadas automaticamente e mostradas ao lado na página inicial.',
      type: 'reminder'
    },
    {
      title: 'Funcionalidade',
      message: 'Você pode ordenar as colunas da tabela clicando nos cabeçalhos.',
      type: 'feature'
    },
    {
      title: 'Eficiência',
      message: 'Ao criar uma nova solicitação, algumas informações podem ser preenchidas automaticamente com base no número da NF.',
      type: 'efficiency'
    },
    {
      title: 'Navegação',
      message: 'No topo da página, você pode alternar entre as telas do sistema.',
      type: 'navigation'
    },
    {
      title: 'Segurança',
      message: 'Não compartilhe suas credenciais com ninguém.',
      type: 'security'
    },
    {
      title: 'Performance',
      message: 'O sistema salva automaticamente os filtros aplicados para sua próxima sessão.',
      type: 'performance'
    }
  ];
  
  // Shuffle array and return first two different tips
  const shuffled = [...tips].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
};

export const formatLastUpdate = () => {
  const now = new Date();
  return now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
