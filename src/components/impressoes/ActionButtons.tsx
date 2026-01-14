import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  Target,
  AlertTriangle,
  Zap,
  CircleCheck,
  CircleX,
} from "lucide-react";
import { Solicitacao, SelectedFiles } from "@/types/solicitacao";
import { FileUploadNFDevRecibo } from "@/components/fileUpload_NFDev_Recibo";
import {
  AprovarSolicitacao,
  RecusarSolicitacao,
  DesdobrarSolicitacao,
  AbaterSolicitacao,
  FinalizarSolicitacao,
} from "@/utils/solicitacoes/botoesSolicitacoes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ConfirmDialog from "../ui/confirm-dialog";

interface ActionButtonsProps {
  solicitacao: Solicitacao;
  userPermissions: {
    canAprovar: boolean;
    canRecusar: boolean;
    canDesdobrar: boolean;
    canAbater: boolean;
    canFinalizar: boolean;
  };
  onActionComplete?: (message: string, type: "success" | "error") => void;
  onCloseDetailDialog?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  solicitacao,
  userPermissions,
  onActionComplete,
  onCloseDetailDialog,
}) => {
  // Dialog de confirmação foi extraído para componente reutilizável

  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>({
    nfDevolucao: null,
    recibo: null,
  });
  const [filesValid, setFilesValid] = useState(false);
  const [vale, setVale] = useState("");

  // Estados para controlar dialogs
  const [aprovarDialogOpen, setAprovarDialogOpen] = useState(false);
  const [recusarDialogOpen, setRecusarDialogOpen] = useState(false);

  // Estados para confirmar ações
  const [confirmAprovarOpen, setConfirmAprovarOpen] = useState(false);
  const [confirmRecusarOpen, setConfirmRecusarOpen] = useState(false);
  const [confirmDesdobrarOpen, setConfirmDesdobrarOpen] = useState(false);
  const [confirmAbaterOpen, setConfirmAbaterOpen] = useState(false);
  const [confirmFinalizarOpen, setConfirmFinalizarOpen] = useState(false);

  // Estado de loading para os botões
  const [isLoading, setIsLoading] = useState(false);

  const { status, id } = solicitacao;

  // Funções para tratar as ações
  const handleAprovar = async () => {
    try {
      setIsLoading(true);
      await AprovarSolicitacao(
        id,
        selectedFiles.nfDevolucao!,
        selectedFiles.recibo!,
        vale
      );

      // Fechar dialogs locais
  setConfirmAprovarOpen(false);
      setAprovarDialogOpen(false);

      // Resetar formulário
      setSelectedFiles({ nfDevolucao: null, recibo: null });
      setVale("");
      setFilesValid(false);

      // Fechar o dialog principal e mostrar toast
      onActionComplete?.("Solicitação aprovada com sucesso!", "success");

      // Pequeno delay antes de fechar o dialog para garantir que o toast apareça
      setTimeout(() => {
        onCloseDetailDialog?.();
      }, 100);
    } catch (error) {
      onActionComplete?.(
        error instanceof Error ? error.message : "Erro ao aprovar solicitação",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecusar = async () => {
    try {
      setIsLoading(true);
      await RecusarSolicitacao(id, motivoRecusa);

      // Fechar dialogs locais
  setConfirmRecusarOpen(false);
      setRecusarDialogOpen(false);
      setMotivoRecusa("");

      // Fechar o dialog principal e mostrar toast
      onActionComplete?.("Solicitação recusada com sucesso!", "success");

      // Pequeno delay antes de fechar o dialog
      setTimeout(() => {
        onCloseDetailDialog?.();
      }, 100);
    } catch (error) {
      onActionComplete?.(
        error instanceof Error ? error.message : "Erro ao recusar solicitação",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDesdobrar = async () => {
    try {
      setIsLoading(true);
      await DesdobrarSolicitacao(id);

      // Fechar o dialog principal e mostrar toast
  setConfirmDesdobrarOpen(false);
      onActionComplete?.("Solicitação desdobrada com sucesso!", "success");

      // Pequeno delay antes de fechar o dialog
      setTimeout(() => {
        onCloseDetailDialog?.();
      }, 100);
    } catch (error) {
      onActionComplete?.(
        error instanceof Error
          ? error.message
          : "Erro ao desdobrar solicitação",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbater = async () => {
    try {
      setIsLoading(true);
      await AbaterSolicitacao(id);

      // Fechar o dialog principal e mostrar toast
  setConfirmAbaterOpen(false);
      onActionComplete?.("Solicitação abatida com sucesso!", "success");

      // Pequeno delay antes de fechar o dialog
      setTimeout(() => {
        onCloseDetailDialog?.();
      }, 100);
    } catch (error) {
      onActionComplete?.(
        error instanceof Error ? error.message : "Erro ao abater solicitação",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizar = async () => {
    try {
      setIsLoading(true);
      await FinalizarSolicitacao(id);

      // Fechar o dialog principal e mostrar toast
  setConfirmFinalizarOpen(false);
      onActionComplete?.("Solicitação finalizada com sucesso!", "success");

      // Pequeno delay antes de fechar o dialog
      setTimeout(() => {
        onCloseDetailDialog?.();
      }, 100);
    } catch (error) {
      onActionComplete?.(
        error instanceof Error
          ? error.message
          : "Erro ao finalizar solicitação",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Componente de renderização dos botões
  const renderButtons = () => {
    if (status.toUpperCase() === "PENDENTE") {
      return (
        <>
          <div className="flex flex-row justify-center gap-4 mt-6">
            {userPermissions.canAprovar && (
              <Dialog
                open={aprovarDialogOpen}
                onOpenChange={setAprovarDialogOpen}
              >
                <DialogTrigger className="flex items-center justify-center text-sm font-semibold gap-1 bg-green-600 hover:bg-green-700 cursor-pointer py-2 px-4 rounded-md">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  <span>Aprovar</span>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle></DialogTitle>
                  </DialogHeader>
                  <Card className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-slate-600 rounded-xl p-6 border-none shadow-2xl">
                    <CardHeader className="pb-4">
                      <span className="text-xl font-bold text-green-400 flex items-center gap-3">
                        <div className="p-2 bg-green-600/20 rounded-full">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        Aprovar Solicitação
                      </span>
                      <p className="text-slate-400 text-sm mt-2">
                        Envie os arquivos necessários e confirme se é vale para
                        aprovar esta solicitação.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (
                            selectedFiles.nfDevolucao &&
                            selectedFiles.recibo &&
                            vale &&
                            vale !== ""
                          ) {
                            setConfirmAprovarOpen(true);
                          }
                        }}
                        className="space-y-6"
                      >
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                            📎 Arquivos Necessários
                          </h3>
                          <FileUploadNFDevRecibo
                            onFilesChange={(files) => setSelectedFiles(files)}
                            onValidationChange={(isValid) =>
                              setFilesValid(isValid)
                            }
                          />
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                            🏷️ Informações Adicionais
                          </h3>
                          <div className="w-full">
                            <Label className="text-slate-300 text-sm font-medium mb-3 flex items-center gap-2">
                              É vale?
                              <span className="text-red-400 font-bold">*</span>
                            </Label>
                            <Select
                              value={vale || undefined}
                              onValueChange={(v) => setVale(v || "")}
                            >
                              <SelectTrigger className="mt-1 bg-gradient-to-r from-slate-700 to-slate-600 border-slate-500 text-white w-full hover:from-slate-600 hover:to-slate-500 transition-all duration-200 shadow-lg h-12">
                                <SelectValue placeholder="Selecione se é vale ou não" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600 shadow-xl">
                                <SelectItem
                                  value="SIM"
                                  className="text-white hover:bg-green-600/20 focus:bg-green-600/20"
                                >
                                  <div className="flex items-center">
                                    <CircleCheck className="h-4 w-4 mr-2 text-green-400" />
                                    <span>SIM</span>
                                  </div>
                                </SelectItem>
                                <SelectItem
                                  value="NÃO"
                                  className="text-white hover:bg-red-600/20 focus:bg-red-600/20"
                                >
                                  <div className="flex items-center">
                                    <CircleX className="h-4 w-4 mr-2 text-red-400" />
                                    <span>NÃO</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {!vale && (
                              <p className="text-amber-400 text-xs mt-2 flex items-center animate-pulse">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Campo obrigatório para aprovar a solicitação
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>

                        <Button
                          type="submit"
                          className={`w-full font-bold py-4 h-14 transition-all duration-300 ${
                            filesValid && vale && !isLoading
                              ? "bg-gradient-to-r from-green-600 via-green-700 to-green-600 hover:from-green-700 hover:via-green-800 hover:to-green-700 text-white shadow-xl transform hover:scale-[1.02] hover:shadow-green-500/25"
                              : "bg-gradient-to-r from-slate-600 to-slate-700 text-slate-400 cursor-not-allowed"
                          }`}
                          disabled={!filesValid || !vale || isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span className="text-lg">Aprovando...</span>
                            </div>
                          ) : filesValid && vale ? (
                            <div className="flex items-center justify-center gap-3">
                              <CheckCircle2 className="h-5 w-5" />
                              <span className="text-lg">Aprovar Solicitação</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <AlertTriangle className="h-5 w-5" />
                              <span className="text-sm">
                                {!filesValid && !vale
                                  ? "Envie os arquivos e selecione se é vale"
                                  : !filesValid
                                  ? "Envie ambos os arquivos"
                                  : "Selecione se é vale ou não"}
                              </span>
                            </div>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </DialogContent>
              </Dialog>
            )}

            {userPermissions.canRecusar && (
              <Dialog
                open={recusarDialogOpen}
                onOpenChange={setRecusarDialogOpen}
              >
                <DialogTrigger className="flex items-center justify-center text-sm font-semibold gap-1 bg-red-600 hover:bg-red-700 cursor-pointer py-2 px-4 rounded-md">
                  <XCircle className="h-4 w-4 mr-2" />
                  <span>Recusar</span>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle></DialogTitle>
                  </DialogHeader>
                  <Card className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-slate-600 rounded-xl p-6 border-none shadow-2xl">
                    <CardHeader>
                      <span className="text-xl font-bold text-red-400 flex items-center gap-3">
                        <div className="p-2 bg-red-600/20 rounded-full">
                          <XCircle className="h-6 w-6" />
                        </div>
                        Motivo da Recusa
                      </span>
                      <p className="text-slate-400 text-sm mt-2">
                        Descreva o motivo pelo qual esta solicitação está sendo
                        recusada.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Label className="text-slate-300 mb-2 block">
                        Digite o Motivo da Recusa: *
                      </Label>
                      <Input
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 mb-4"
                        placeholder="Descreva o motivo..."
                        value={motivoRecusa}
                        onChange={(e) => setMotivoRecusa(e.target.value)}
                        disabled={isLoading}
                      />
                      <Button
                        className={`font-bold w-full mt-2 transition-all duration-300 ${
                          motivoRecusa.trim() !== "" && !isLoading
                            ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-xl transform hover:scale-[1.02]"
                            : "bg-gradient-to-r from-slate-600 to-slate-700 text-slate-400 cursor-not-allowed"
                        }`}
                        onClick={() => setConfirmRecusarOpen(true)}
                        disabled={motivoRecusa.trim() === "" || isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Recusando...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <XCircle className="h-4 w-4" />
                            Recusar
                          </div>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </>
      );
    }

    if (status.toUpperCase() === "APROVADA" && userPermissions.canDesdobrar) {
      return (
        <Button
          className={`transition-all duration-300 ${
            isLoading
              ? "bg-blue-700 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 transform hover:scale-105"
          }`}
          onClick={() => setConfirmDesdobrarOpen(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Desdobrar
            </div>
          )}
        </Button>
      );
    }

    if (status.toUpperCase() === "DESDOBRADA" && userPermissions.canAbater) {
      return (
        <Button
          className={`transition-all duration-300 ${
            isLoading
              ? "bg-yellow-700 cursor-not-allowed"
              : "bg-yellow-600 hover:bg-yellow-700 transform hover:scale-105"
          }`}
          onClick={() => setConfirmAbaterOpen(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Abater
            </div>
          )}
        </Button>
      );
    }

    if (status.toUpperCase() === "ABATIDA" && userPermissions.canFinalizar) {
      return (
        <Button
          className={`transition-all duration-300 ${
            isLoading
              ? "bg-lime-700 cursor-not-allowed"
              : "bg-lime-600 hover:bg-lime-700 transform hover:scale-105"
          }`}
          onClick={() => setConfirmFinalizarOpen(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Finalizar
            </div>
          )}
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="relative">
      {/* Botões renderizados */}
      {renderButtons()}

      {/* Dialogs de confirmação gerais */}
      <ConfirmDialog
        open={confirmAprovarOpen}
        onOpenChange={setConfirmAprovarOpen}
        title="Tem certeza que deseja Aprovar?"
        confirmText="Prosseguir"
        cancelText="Cancelar"
        onConfirm={handleAprovar}
        loading={isLoading}
      />
      <ConfirmDialog
        open={confirmRecusarOpen}
        onOpenChange={setConfirmRecusarOpen}
        title="Tem certeza que deseja Recusar?"
        confirmText="Prosseguir"
        cancelText="Cancelar"
        onConfirm={handleRecusar}
        loading={isLoading}
      />
      <ConfirmDialog
        open={confirmDesdobrarOpen}
        onOpenChange={setConfirmDesdobrarOpen}
        title="Tem certeza que deseja Desdobrar?"
        confirmText="Prosseguir"
        cancelText="Cancelar"
        onConfirm={handleDesdobrar}
        loading={isLoading}
      />
      <ConfirmDialog
        open={confirmAbaterOpen}
        onOpenChange={setConfirmAbaterOpen}
        title="Tem certeza que deseja Abater?"
        confirmText="Prosseguir"
        cancelText="Cancelar"
        onConfirm={handleAbater}
        loading={isLoading}
      />
      <ConfirmDialog
        open={confirmFinalizarOpen}
        onOpenChange={setConfirmFinalizarOpen}
        title="Tem certeza que deseja Finalizar?"
        confirmText="Prosseguir"
        cancelText="Cancelar"
        onConfirm={handleFinalizar}
        loading={isLoading}
      />
    </div>
  );
};
