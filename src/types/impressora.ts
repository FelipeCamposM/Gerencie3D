export interface Impressora {
  id: number;
  nome: string;
  modelo: string;
  localizacao: string;
  gastoEnergiaKwh: number;
  precoEnergiaKwh: number;
  filamentoTotalUsado: number;
  ultimoUso: Date | null;
  status: "disponivel" | "em_uso" | "manutencao";
  createdAt: Date;
  updatedAt: Date;
  ultimoUsuarioId?: number | null;
  ultimaImpressaoId?: string | null;
}

export interface Filamento {
  id: string;
  tipo: string; // PLA, ABS, PETG, TPU, etc
  cor: string;
  pesoInicial: number; // em gramas
  pesoAtual: number; // em gramas
  precoCompra: number;
  dataCompra: Date;
  ultimaUtilizacao: Date | null;
  createdAt: Date;
  updatedAt: Date;
  compradorId: number;
  ultimoUsuarioId?: number | null;
}

export interface Impressao3D {
  id: string;
  nomeProjeto: string;
  tempoImpressao: number; // em minutos
  filamentoTotalUsado: number; // em gramas
  custoTotal: number;
  custoEnergia: number;
  custoFilamento: number;
  precoVenda?: number | null;
  lucro?: number | null;
  status: "concluida" | "em_andamento" | "cancelada" | "falhou";
  observacoes?: string | null;
  dataInicio: Date;
  dataConclusao?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  usuarioId: number;
  impressoraId: number;
}

export interface ImpressaoFilamento {
  id: string;
  quantidadeUsada: number; // em gramas
  createdAt: Date;
  impressaoId: string;
  filamentoId: string;
}

export interface Usuario {
  id: number;
  primeiroNome: string;
  ultimoNome: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos com relações
export interface ImpressoraComRelacoes extends Impressora {
  ultimoUsuario?: Usuario | null;
  ultimaImpressao?: Impressao3D | null;
  impressoes?: Impressao3D[];
}

export interface FilamentoComRelacoes extends Filamento {
  comprador: Usuario;
  ultimoUsuario?: Usuario | null;
  impressoes?: ImpressaoFilamento[];
}

export interface Impressao3DComRelacoes extends Impressao3D {
  usuario: Usuario;
  impressora: Impressora;
  filamentos?: (ImpressaoFilamento & {
    filamento: Filamento;
  })[];
}
