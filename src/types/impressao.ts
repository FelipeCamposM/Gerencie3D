// Tipo para Impressão 3D
export type Impressao = {
  id: string;
  nomeProjeto: string;
  tempoImpressao: number; // em minutos
  filamentoTotalUsado: number; // em gramas
  custoTotal: number;
  custoEnergia: number;
  custoFilamento: number;
  precoVenda?: number;
  lucro?: number;
  status: string; // concluida, em_andamento, cancelada, falhou
  observacoes?: string;
  dataInicio: string;
  dataConclusao?: string;
  createdAt: string;
  updatedAt: string;
  // Relações
  usuarioId: number;
  impressoraId: number;
  usuario?: {
    id: number;
    primeiroNome: string;
    ultimoNome: string;
    email: string;
  };
  impressora?: {
    id: number;
    nome: string;
    modelo: string;
    marca: string;
  };
  filamentos?: {
    id: string;
    quantidadeUsada: number;
    filamento: {
      id: string;
      tipo: string;
      cor: string;
    };
  }[];
};

export interface UserProfile {
  id: number;
  primeiroNome: string;
  ultimoNome: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface SortColumn {
  column: string;
  direction: "asc" | "desc";
}
