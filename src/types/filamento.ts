export interface Usuario {
  id: number;
  primeiroNome: string;
  ultimoNome: string;
  email?: string;
}

export interface Filamento {
  id: string;
  tipo: string;
  nomeCor: string;
  cor: string;
  pesoInicial: number;
  pesoAtual: number;
  precoCompra: number;
  dataCompra: string;
  ultimaUtilizacao: string | null;
  comprador: Usuario;
  ultimoUsuario: Usuario | null;
  porcentagemRestante: number;
}

export interface ImpressaoFilamento {
  impressao: {
    id: string;
    nomeProjeto: string;
    dataInicio: string;
    status: string;
  };
  quantidadeUsada: number;
}

export interface FilamentoDetalhes extends Filamento {
  impressoes: ImpressaoFilamento[];
}

export interface FilamentoSelecionado {
  filamentoId: string;
  quantidadeUsada: string;
}

// Tipo simplificado para criar impressão (sem relações completas)
export interface FilamentoSimples {
  id: string;
  tipo: string;
  cor: string;
  pesoAtual: number;
  precoCompra: number;
  pesoInicial: number;
}
