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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Filamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div
              className="w-24 h-24 rounded-lg border-4 border-slate-400 shadow-lg"
              style={{ backgroundColor: filamento.cor }}
            />
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                {filamento.tipo}
              </h3>
              <p className="text-lg text-slate-700">{filamento.nomeCor}</p>
              <p className="text-sm text-slate-500">{filamento.cor}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-slate-700">
                Informações Básicas
              </h4>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-sm">
                  <span className="font-semibold">Peso Inicial:</span>{" "}
                  {filamento.pesoInicial}g
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Peso Atual:</span>{" "}
                  {filamento.pesoAtual}g
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Usado:</span>{" "}
                  {(filamento.pesoInicial - filamento.pesoAtual).toFixed(2)}g
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Restante:</span>{" "}
                  <span className={getStatusColor(porcentagemRestante)}>
                    {porcentagemRestante.toFixed(1)}%
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-slate-700">
                Informações Financeiras
              </h4>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-sm">
                  <span className="font-semibold">Preço de Compra:</span>{" "}
                  {formatCurrency(filamento.precoCompra)}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Custo por Grama:</span>{" "}
                  {formatCurrency(
                    filamento.precoCompra / filamento.pesoInicial
                  )}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Data da Compra:</span>{" "}
                  {formatDate(filamento.dataCompra)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-slate-700">
              Informações de Uso
            </h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-sm">
                <span className="font-semibold">Comprador:</span>{" "}
                {filamento.comprador.primeiroNome}{" "}
                {filamento.comprador.ultimoNome}
              </p>
              {filamento.ultimoUsuario && (
                <p className="text-sm">
                  <span className="font-semibold">Último Usuário:</span>{" "}
                  {filamento.ultimoUsuario.primeiroNome}{" "}
                  {filamento.ultimoUsuario.ultimoNome}
                </p>
              )}
              {filamento.ultimaUtilizacao && (
                <p className="text-sm">
                  <span className="font-semibold">Última Utilização:</span>{" "}
                  {formatDate(filamento.ultimaUtilizacao)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-slate-700">
              Últimas 10 Impressões
            </h4>
            {filamento.impressoes && filamento.impressoes.length > 0 ? (
              <div className="space-y-2">
                {filamento.impressoes.map((imp, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">
                        {imp.impressao.nomeProjeto}
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatDate(imp.impressao.dataInicio)} -{" "}
                        {imp.quantidadeUsada}g usados
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
