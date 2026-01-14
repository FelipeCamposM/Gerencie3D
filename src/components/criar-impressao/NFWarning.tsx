import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Clock, CheckCircle, XCircle } from "lucide-react";

interface SolicitacaoExistente {
  id: number;
  numero_nf: string;
  status: string;
  created_at: string;
  nome: string;
  cod_cliente: string;
}

interface NFWarningProps {
  solicitacoes: SolicitacaoExistente[];
  onDismiss: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'aprovada':
    case 'finalizada':
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    case 'rejeitada':
    case 'cancelada':
      return <XCircle className="h-4 w-4 text-red-400" />;
    case 'pendente':
    case 'em_analise':
      return <Clock className="h-4 w-4 text-yellow-400" />;
    default:
      return <Clock className="h-4 w-4 text-blue-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'aprovada':
    case 'finalizada':
      return 'text-green-400';
    case 'rejeitada':
    case 'cancelada':
      return 'text-red-400';
    case 'pendente':
    case 'em_analise':
      return 'text-yellow-400';
    default:
      return 'text-blue-400';
  }
};

export function NFWarning({ solicitacoes, onDismiss }: NFWarningProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-400/40 rounded-xl shadow-lg backdrop-blur-sm relative">
      <div className="flex items-start gap-4">        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-orange-300 font-semibold text-base flex gap-2 items-center">
              <div className="p-2 bg-orange-500/20 rounded-full flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              </div>
              <span className="text-lg">Informação: Existem solicitações anteriores para esta Nota Fiscal</span>
            </h3>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-orange-300 hover:text-white hover:bg-orange-500/30 p-2 h-auto min-w-0 rounded-full transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {solicitacoes.map((solicitacao) => (
              <div 
                key={solicitacao.id} 
                className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-slate-700/50 rounded-full">
                      {getStatusIcon(solicitacao.status)}
                    </div>
                    <span className={`font-semibold text-sm px-2 py-1 rounded-full bg-slate-700/50 ${getStatusColor(solicitacao.status)}`}>
                      {solicitacao.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-300 font-semibold">ID</span>
                    <span className="text-orange-300 text-sm font-bold bg-orange-500/10 px-2 py-1 rounded-lg">
                      #{solicitacao.id}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-orange-300/80 font-medium text-xs uppercase tracking-wide mb-1">Cliente</span>
                    <span className="text-slate-200 font-medium truncate">{solicitacao.nome}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-orange-300/80 font-medium text-xs uppercase tracking-wide mb-1">Código</span>
                    <span className="text-slate-200 font-mono">{solicitacao.cod_cliente}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-orange-300/80 font-medium text-xs uppercase tracking-wide mb-1">Criada em</span>
                    <span className="text-slate-200">{formatDate(solicitacao.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-orange-500/10 border border-orange-400/30 rounded-lg">
            <p className="text-orange-200 text-sm leading-relaxed">
              O sistema impedirá apenas a devolução de produtos que já foram devolvidos anteriormente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
