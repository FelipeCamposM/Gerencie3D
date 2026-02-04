import { CheckCircle, Activity, Trash2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmFinalizarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmFinalizarDialog({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmFinalizarDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-800 text-xl flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Confirmar Finalização
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-slate-700">
            Deseja finalizar esta impressão e liberar a impressora?
          </p>
          <p className="text-slate-600 text-sm mt-2">
            A impressora ficará disponível novamente para novas impressões.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Finalizar Impressão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmFalhouDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  filamentoDesperdiciado: string;
  onFilamentoDesperdiciciadoChange: (value: string) => void;
  selectedImpressao: {
    filamentoTotalUsado: number;
    filamentos: {
      quantidadeUsada: number;
      filamento: {
        tipo: string;
        nomeCor: string;
        cor: string;
        usuario?: {
          primeiroNome: string;
          ultimoNome: string;
        };
      };
    }[];
  } | null;
  confirming: boolean;
}

export function ConfirmFalhouDialog({
  open,
  onOpenChange,
  onConfirm,
  filamentoDesperdiciado,
  onFilamentoDesperdiciciadoChange,
  selectedImpressao,
  confirming,
}: ConfirmFalhouDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-800 text-xl flex items-center gap-2">
            <Activity className="h-6 w-6 text-orange-600" />
            Marcar Impressão como Falhou
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-slate-700">
            Esta impressão falhou durante o processo?
          </p>

          {/* Informação sobre o total previsto */}
          {selectedImpressao && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="h-5 w-5 text-blue-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <p className="font-semibold text-sm text-blue-800">
                  Filamento Previsto:
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-lg font-bold text-blue-900 mb-2">
                    Total: {selectedImpressao.filamentoTotalUsado.toFixed(2)}g
                  </p>

                  <div className="space-y-2 mt-3 pt-3 border-t border-blue-100">
                    {selectedImpressao.filamentos.map((fil, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm bg-slate-50 rounded p-2"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0"
                            style={{ backgroundColor: fil.filamento.cor }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">
                              {fil.filamento.tipo} - {fil.filamento.nomeCor}
                            </p>
                            {fil.filamento.usuario && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                Comprador: {fil.filamento.usuario.primeiroNome}{" "}
                                {fil.filamento.usuario.ultimoNome}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="font-semibold text-slate-700 ml-2">
                          {fil.quantidadeUsada.toFixed(2)}g
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filamento Realmente Usado (gramas)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={filamentoDesperdiciado}
              onChange={(e) => onFilamentoDesperdiciciadoChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="0.0"
            />
            <p className="text-slate-500 text-xs mt-1">
              Informe a quantidade real de filamento que foi utilizado antes da
              falha. O resto será devolvido ao estoque.
            </p>
          </div>
          <p className="text-slate-600 text-sm">
            A impressora será liberada, o filamento não utilizado será devolvido
            ao estoque e a quantidade real usada será registrada.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={confirming}
            className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={confirming}
            className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirming ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processando...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Confirmar Falha
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  deleting: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  deleting,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-800 text-xl flex items-center gap-2">
            <Trash2 className="h-6 w-6 text-red-600" />
            Confirmar Exclusão
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {deleting ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <p className="text-slate-700 font-medium">
                Deletando impressão...
              </p>
            </div>
          ) : (
            <>
              <p className="text-slate-700 font-semibold mb-2">
                Tem certeza que deseja deletar esta impressão?
              </p>
              <p className="text-slate-600 text-sm">
                Esta ação não pode ser desfeita. Os filamentos usados serão
                devolvidos ao estoque.
              </p>
            </>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
            className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar Impressão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditImpressaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  formData: {
    nomeProjeto: string;
    precoVenda: string;
    observacoes: string;
  };
  onFormDataChange: (data: {
    nomeProjeto: string;
    precoVenda: string;
    observacoes: string;
  }) => void;
}

export function EditImpressaoDialog({
  open,
  onOpenChange,
  onConfirm,
  formData,
  onFormDataChange,
}: EditImpressaoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-800 text-xl flex items-center gap-2">
            <Edit className="h-6 w-6 text-blue-600" />
            Editar Impressão
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nome do Projeto
            </label>
            <input
              type="text"
              value={formData.nomeProjeto}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  nomeProjeto: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome do projeto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Preço de Venda (Opcional)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={formData.precoVenda}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  precoVenda: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="R$ 0,00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  observacoes: e.target.value,
                })
              }
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observações sobre a impressão..."
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
