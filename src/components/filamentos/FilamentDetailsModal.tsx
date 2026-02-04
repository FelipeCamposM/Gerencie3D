import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilamentoDetalhes } from "@/types/filamento";
import {
  Package,
  DollarSign,
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Printer,
  FileText,
  Archive,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-800 text-2xl flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            Detalhes do Filamento
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Seção de Cor e Tipo */}
          <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-center gap-4">
              <div
                className="w-24 h-24 rounded-xl border-4 border-white shadow-lg"
                style={{ backgroundColor: filamento.cor }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <h3 className="text-2xl font-bold text-slate-800">
                    {filamento.tipo}
                  </h3>
                </div>
                <p className="text-lg text-slate-700 font-medium">
                  {filamento.nomeCor}
                </p>
                <p className="text-sm text-slate-500 font-mono mt-1">
                  {filamento.cor}
                </p>
              </div>
            </div>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações de Peso */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="font-bold text-lg text-slate-800">
                  Informações de Peso
                </h4>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-slate-600">
                        Peso Inicial
                      </span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {(filamento.pesoInicial / 1000).toFixed(3)}g
                    </span>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-slate-600">
                        Peso Atual
                      </span>
                    </div>
                    <span className="font-bold text-green-600">
                      {filamento.pesoAtual.toFixed(2)}g
                    </span>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-slate-600">
                        Usado
                      </span>
                    </div>
                    <span className="font-bold text-orange-600">
                      {(filamento.pesoInicial - filamento.pesoAtual).toFixed(2)}
                      g
                    </span>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-cyan-600" />
                      <span className="text-sm font-medium text-slate-600">
                        Restante
                      </span>
                    </div>
                    <span
                      className={`font-bold ${getStatusColor(
                        porcentagemRestante
                      )}`}
                    >
                      {porcentagemRestante.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all ${
                        porcentagemRestante > 50
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : porcentagemRestante > 20
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                          : "bg-gradient-to-r from-red-500 to-red-600"
                      }`}
                      style={{ width: `${porcentagemRestante}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Financeiras */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <h4 className="font-bold text-lg text-slate-800">
                  Informações Financeiras
                </h4>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-slate-600">
                      Preço de Compra
                    </span>
                  </div>
                  <p className="text-xl font-bold text-purple-600">
                    {formatCurrency(filamento.precoCompra)}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-600">
                      Custo por Grama
                    </span>
                  </div>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(
                      filamento.precoCompra / filamento.pesoInicial
                    )}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-cyan-600" />
                    <span className="text-sm font-medium text-slate-600">
                      Data da Compra
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {formatDate(filamento.dataCompra)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações de Usuário */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-yellow-600" />
              <h4 className="font-bold text-lg text-slate-800">
                Informações de Uso
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Comprador
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 ring-2 ring-blue-200">
                    {filamento.comprador.imagemUsuario &&
                    filamento.comprador.imagemUsuario.length > 0 ? (
                      <AvatarImage
                        src={`data:image/jpeg;base64,${filamento.comprador.imagemUsuario}`}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-lg font-semibold text-slate-900">
                    {filamento.comprador.primeiroNome}{" "}
                    {filamento.comprador.ultimoNome}
                  </p>
                </div>
              </div>
              {filamento.ultimoUsuario && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-slate-600">
                      Último Usuário
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 ring-2 ring-purple-200">
                      {filamento.ultimoUsuario.imagemUsuario &&
                      filamento.ultimoUsuario.imagemUsuario.length > 0 ? (
                        <AvatarImage
                          src={`data:image/jpeg;base64,${filamento.ultimoUsuario.imagemUsuario}`}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-lg font-semibold text-slate-900">
                      {filamento.ultimoUsuario.primeiroNome}{" "}
                      {filamento.ultimoUsuario.ultimoNome}
                    </p>
                  </div>
                </div>
              )}
              {filamento.ultimaUtilizacao && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-slate-600">
                      Última Utilização
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {formatDate(filamento.ultimaUtilizacao)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Histórico de Impressões */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Printer className="h-5 w-5 text-slate-600" />
              <h4 className="font-bold text-lg text-slate-800">
                Últimas 10 Impressões
              </h4>
            </div>
            {filamento.impressoes && filamento.impressoes.length > 0 ? (
              <div className="space-y-3">
                {filamento.impressoes.map((imp, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <p className="font-bold text-slate-800">
                            {imp.impressao.nomeProjeto}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-cyan-600" />
                            {formatDate(imp.impressao.dataInicio)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-green-600" />
                            <span className="font-semibold text-green-600">
                              {imp.quantidadeUsada}g
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          imp.impressao.status === "concluida"
                            ? "bg-green-500 text-white"
                            : imp.impressao.status === "em_andamento"
                            ? "bg-blue-500 text-white"
                            : imp.impressao.status === "falhou"
                            ? "bg-orange-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {imp.impressao.status === "concluida"
                          ? "Concluída"
                          : imp.impressao.status === "em_andamento"
                          ? "Em Andamento"
                          : imp.impressao.status === "falhou"
                          ? "Falhou"
                          : "Cancelada"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg border border-slate-200 text-center">
                <Archive className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  Nenhuma impressão registrada com este filamento ainda.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
