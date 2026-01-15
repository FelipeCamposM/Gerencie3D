import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilamentoDetalhes } from "@/types/filamento";

interface FilamentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filamento: FilamentoDetalhes | null;
}

export default function FilamentDetailsModal({
  open,
  onOpenChange,
  filamento,
}: FilamentDetailsModalProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusColor = (porcentagem: number) => {
    if (porcentagem > 50) return "text-green-600";
    if (porcentagem > 20) return "text-yellow-600";
    return "text-red-600";
  };

  if (!filamento) return null;

  // Calcular porcentagem restante localmente
  const porcentagemRestante =
    (filamento.pesoAtual / filamento.pesoInicial) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-800 text-xl font-bold">
            Detalhes do Filamento
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-white rounded-lg border-2 border-slate-200 shadow-sm">
            <div
              className="w-24 h-24 rounded-xl border-4 border-slate-300 shadow-lg"
              style={{ backgroundColor: filamento.cor }}
            />
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                {filamento.tipo}
              </h3>
              <p className="text-lg text-slate-700 font-medium">
                {filamento.nomeCor}
              </p>
              <p className="text-sm text-slate-500 font-mono">
                {filamento.cor}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-bold text-base text-slate-800">
                Informações Básicas
              </h4>
              <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
                <p className="text-sm text-slate-700">
                  <span className="font-bold">Peso Inicial:</span>{" "}
                  {filamento.pesoInicial}g
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-bold">Peso Atual:</span>{" "}
                  {filamento.pesoAtual}g
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-bold">Usado:</span>{" "}
                  {(filamento.pesoInicial - filamento.pesoAtual).toFixed(2)}g
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-bold">Restante:</span>{" "}
                  <span className={getStatusColor(porcentagemRestante)}>
                    {porcentagemRestante.toFixed(1)}%
                  </span>
                </p>
                <div className="mt-3">
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        porcentagemRestante > 50
                          ? "bg-green-500"
                          : porcentagemRestante > 20
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${porcentagemRestante}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-base text-slate-800">
                Informações Financeiras
              </h4>
              <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
                <p className="text-sm text-slate-700">
                  <span className="font-bold">Preço de Compra:</span>{" "}
                  {formatCurrency(filamento.precoCompra)}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-bold">Custo por Grama:</span>{" "}
                  {formatCurrency(
                    filamento.precoCompra / filamento.pesoInicial
                  )}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-bold">Data da Compra:</span>{" "}
                  {formatDate(filamento.dataCompra)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-base text-slate-800">
              Informações de Uso
            </h4>
            <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
              <p className="text-sm text-slate-700">
                <span className="font-bold">Comprador:</span>{" "}
                {filamento.comprador.primeiroNome}{" "}
                {filamento.comprador.ultimoNome}
              </p>
              {filamento.ultimoUsuario && (
                <p className="text-sm text-slate-700">
                  <span className="font-bold">Último Usuário:</span>{" "}
                  {filamento.ultimoUsuario.primeiroNome}{" "}
                  {filamento.ultimoUsuario.ultimoNome}
                </p>
              )}
              {filamento.ultimaUtilizacao && (
                <p className="text-sm text-slate-700">
                  <span className="font-bold">Última Utilização:</span>{" "}
                  {formatDate(filamento.ultimaUtilizacao)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-base text-slate-800">
              Últimas 10 Impressões
            </h4>
            {filamento.impressoes && filamento.impressoes.length > 0 ? (
              <div className="space-y-2">
                {filamento.impressoes.map((imp, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-slate-800">
                        {imp.impressao.nomeProjeto}
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatDate(imp.impressao.dataInicio)} -{" "}
                        <span className="font-semibold">
                          {imp.quantidadeUsada}g
                        </span>{" "}
                        usados
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        imp.impressao.status === "concluida"
                          ? "bg-green-100 text-green-800"
                          : imp.impressao.status === "em_andamento"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {imp.impressao.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Nenhuma impressão registrada com este filamento ainda.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
