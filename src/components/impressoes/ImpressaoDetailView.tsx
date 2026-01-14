import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  User,
  Package,
  Download,
  Loader2,
  MessageSquare,
  AlertTriangle,
  Calendar,
  FilePlus,
  CheckCircle2,
  Target,
  Zap
} from "lucide-react";
import { Solicitacao } from "@/types/solicitacao";
import {
  getStatusIcon,
  getStatusClass,
  getStatusBadgeVariant,
} from "@/utils/solicitacoes/statusUtils";
import { ProdutosCard } from "@/components/solicitacoes/produtos";
import { ActionButtons } from "./ActionButtons";

interface SolicitacaoDetailViewProps {
  solicitacao: Solicitacao;
  userPermissions: {
    canAprovar: boolean;
    canRecusar: boolean;
    canDesdobrar: boolean;
    canAbater: boolean;
    canFinalizar: boolean;
    canAccessAdmin: boolean;
  };
  onActionComplete?: (message: string, type: "success" | "error") => void;
  onCloseDetailDialog?: () => void;
}

export const SolicitacaoDetailView: React.FC<SolicitacaoDetailViewProps> = ({
  solicitacao,
  userPermissions,
  onActionComplete,
  onCloseDetailDialog,
}) => {
  const [downloadingFiles, setDownloadingFiles] = useState<{
    nf: boolean;
    nf_devolucao: boolean;
    recibo: boolean;
  }>({
    nf: false,
    nf_devolucao: false,
    recibo: false,
  });

  const downloadFile = async (
    solicitacaoId: number,
    tipoArquivo: "nf" | "nf_devolucao" | "recibo"
  ) => {
    try {
      setDownloadingFiles((prev) => ({ ...prev, [tipoArquivo]: true }));

      const response = await fetch(
        `/api/solicitacoes/${solicitacaoId}/download/${tipoArquivo}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao baixar arquivo");
      }

      // Obter o nome do arquivo do header da resposta
      const contentDisposition = response.headers.get("content-disposition");
      let filename = `arquivo_${tipoArquivo}_${solicitacaoId}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Converter a resposta para blob
      const blob = await response.blob();

      // Criar URL temporária para download
      const url = window.URL.createObjectURL(blob);

      // Criar elemento <a> temporário para trigger do download
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Limpar recursos
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      alert("Erro ao baixar arquivo. Tente novamente.");
    } finally {
      setDownloadingFiles((prev) => ({ ...prev, [tipoArquivo]: false }));
    }
  };

  const {
    id,
    nome,
    cod_cliente,
    filial,
    carga,
    numero_nf,
    rca,
    tipo_devolucao,
    vale,
    cod_cobranca,
    nome_cobranca,
    motivo_devolucao,
    motivo_recusa,
    status,
    created_at,
    pendente_by,
    aprovada_by,
    aprovada_at,
    recusada_by,
    recusada_at,
    desdobrada_at,
    desdobrada_by,
    abatida_at,
    abatida_by,
    finalizada_at,
    finalizada_by,
    // BLOBs podem não vir na listagem; usamos flags quando existirem
    arquivo_nf,
    arquivo_nf_devolucao,
    arquivo_recibo,
    has_arquivo_nf,
    has_arquivo_nf_devolucao,
    has_arquivo_recibo,
  } = solicitacao;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center mb-6 gap-2 text-white w-full justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes da Solicitação #{id}
            </div>
            <div className="ml-7 flex text-slate-400 justify-start text-sm items-center gap-1">
              <span>Criada por:</span>
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-white">{pendente_by ? pendente_by : "Usuário Desconhecido"}</span>
              <span>às:</span>
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-white">
                {new Date(created_at).toLocaleDateString()} -{" "}
                {new Date(created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              <span className="text-md text-white flex items-center gap-2 font-bold">
                {getStatusIcon(status)}
              </span>
              <span>Status</span>
            </div>
            <div className="flex flex-col justify-between h-full">
              <div className="flex gap-2 mx-4 h-full">
                <div className="flex justify-center h-full">
                  <Badge
                    variant={getStatusBadgeVariant(status)}
                    className={`flex items-center gap-1 w-fit ${getStatusClass(
                      status
                    )}`}
                  >
                    {getStatusIcon(status)}
                    {status.toUpperCase()}
                  </Badge>
                </div>

              </div>
            </div>
          </div>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Informações Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <Card className="bg-slate-700/50 border-slate-600 col-span-2">
            <CardHeader>
              <CardTitle className="text-md text-white flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 mx-4">
                <div className="flex gap-2 items-center">
                  <p className="text-slate-400 text-sm">Código do cliente:</p>
                  <p className="text-white font-medium">{cod_cliente}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <p className="text-slate-400 text-sm">Nome do cliente:</p>
                  <p className="text-white font-medium">{nome}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <p className="text-slate-400 text-sm">
                    Identificador do Cliente:
                  </p>
                  <p className="text-white font-medium">
                    {"10.641.901/0001-16"}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <p className="text-slate-400 text-sm">Filial:</p>
                  <p className="text-white font-medium">
                    {filial === "1" ? "1 - CD APARECIDA" : "5 - LOJA RIO VERDE"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-md text-white flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Nota Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 mx-4">
                <div className="flex gap-2 items-center">
                  <p className="text-slate-400 text-sm">Carga:</p>
                  <p className="text-white font-medium">{carga}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <p className="text-slate-400 text-sm">NF:</p>
                  <p className="text-white font-medium">{numero_nf}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <p className="text-slate-400 text-sm">Cód:</p>
                  <p className="text-white font-medium">{cod_cliente}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <p className="text-slate-400 text-sm">RCA:</p>
                  <p className="text-white font-medium">{rca}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-md text-white flex items-center gap-2">
                <Package className="h-4 w-4" />
                Devolução
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 mx-4">
                <div className="flex gap-2 items-center">
                  <p className="text-slate-400 text-sm">Tipo de Devolução:</p>
                  <Badge
                    variant="secondary"
                    className={`text-white text-md w-fit capitalize ${tipo_devolucao.toUpperCase() === "PARCIAL"
                      ? "bg-amber-500 hover:bg-amber-500"
                      : "bg-emerald-500 hover:bg-emerald-500"
                      }`}
                  >
                    {tipo_devolucao}
                  </Badge>
                </div>
                {vale && (
                  <div className="flex gap-2 items-center">
                    <p className="text-slate-400 text-sm">Vale:</p>
                    <Badge
                      variant="secondary"
                      className={`text-white text-md w-fit capitalize ${(vale as string).toUpperCase() === "SIM"
                        ? "bg-green-500 hover:bg-green-500"
                        : "bg-red-800 hover:bg-red-800"
                        }`}
                    >
                      {vale}
                    </Badge>
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <p className="text-slate-400 text-sm">Código Cobrança:</p>
                  <p className="text-white font-medium">{cod_cobranca}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <p className="text-slate-400 text-sm">Nome Cobrança:</p>
                  <p className="text-white font-medium">{nome_cobranca}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {userPermissions.canAccessAdmin && (
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-400" />
                Histórico de Ações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Criada por */}
                <div className="flex items-start gap-3 p-3 bg-sky-500/10 rounded-lg border-l-4 border-sky-500 mx-4">
                  <div className="flex items-center gap-2 mt-0.5">
                    <FilePlus className="h-5 w-5 text-sky-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-300 font-medium">Criada por:</span>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-blue-400" />
                        <span className="text-white font-semibold">
                          {pendente_by ? pendente_by : "Usuário Desconhecido"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">
                        {new Date(created_at).toLocaleDateString()} às{" "}
                        {new Date(created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Aprovada */}
                {aprovada_at && (
                  <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border-l-4 border-green-500 mx-4">
                    <div className="flex items-center gap-2 mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-300 font-medium">Aprovada por:</span>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-blue-400" />
                          <span className="text-white font-semibold">
                            {aprovada_by ? aprovada_by : "Usuário Desconhecido"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">
                          {new Date(aprovada_at).toLocaleDateString()} às{" "}
                          {new Date(aprovada_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recusada */}
                {recusada_at && (
                  <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border-l-4 border-red-500 mx-4">
                    <div className="flex items-center gap-2 mt-0.5">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-300 font-medium">Recusada por:</span>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-blue-400" />
                          <span className="text-white font-semibold">
                            {recusada_by ? recusada_by : "Usuário Desconhecido"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">
                          {new Date(recusada_at).toLocaleDateString()} às{" "}
                          {new Date(recusada_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Desdobrada */}
                {desdobrada_at && (
                  <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border-l-4 border-blue-500 mx-4">
                    <div className="flex items-center gap-2 mt-0.5">
                      <Target className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-300 font-medium">Desdobrada por:</span>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-blue-400" />
                          <span className="text-white font-semibold">
                            {desdobrada_by ? desdobrada_by : "Usuário Desconhecido"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">
                          {new Date(desdobrada_at).toLocaleDateString()} às{" "}
                          {new Date(desdobrada_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Abatida */}
                {abatida_at && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border-l-4 border-yellow-500 mx-4">
                    <div className="flex items-center gap-2 mt-0.5">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-300 font-medium">Abatida por:</span>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-blue-400" />
                          <span className="text-white font-semibold">
                            {abatida_by ? abatida_by : "Usuário Desconhecido"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">
                          {new Date(abatida_at).toLocaleDateString()} às{" "}
                          {new Date(abatida_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Finalizada */}
                {finalizada_at && (
                  <div className="flex items-start gap-3 p-3 bg-lime-500/10 rounded-lg border-l-4 border-lime-500 mx-4">
                    <div className="flex items-center gap-2 mt-0.5">
                      <Zap className="h-5 w-5 text-lime-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-300 font-medium">Finalizada por:</span>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-blue-400" />
                          <span className="text-white font-semibold">
                            {finalizada_by ? finalizada_by : "Usuário Desconhecido"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">
                          {new Date(finalizada_at).toLocaleDateString()} às{" "}
                          {new Date(finalizada_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Motivo da Devolução */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              Motivo da Devolução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-slate-600/30 rounded-lg border border-slate-600/50 mx-4">
              <div className="flex items-start gap-3">
                <div className="w-1 h-full bg-blue-400 rounded-full min-h-[20px]"></div>
                <div className="flex-1 max-w-full">
                  <p className="text-slate-200 leading-relaxed text-base font-medium wrap-anywhere max-h-[200px] overflow-auto">
                    {motivo_devolucao}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download dos Arquivos */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download dos Arquivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              {(has_arquivo_nf || arquivo_nf) && (
                <div className="flex flex-col items-center">
                  <Button
                    size="lg"
                    className="w-full h-20 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => downloadFile(id, "nf")}
                    disabled={downloadingFiles.nf}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {downloadingFiles.nf ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <FileText className="h-6 w-6" />
                      )}
                      <span className="text-sm font-semibold">
                        {downloadingFiles.nf ? "Baixando..." : "Nota Fiscal"}
                      </span>
                    </div>
                  </Button>
                  <p className="text-slate-400 text-xs mt-2 text-center">
                    Arquivo da nota fiscal original
                  </p>
                </div>
              )}

              {(has_arquivo_nf_devolucao || arquivo_nf_devolucao) && (
                <div className="flex flex-col items-center">
                  <Button
                    size="lg"
                    className="w-full h-20 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => downloadFile(id, "nf_devolucao")}
                    disabled={downloadingFiles.nf_devolucao}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {downloadingFiles.nf_devolucao ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Package className="h-6 w-6" />
                      )}
                      <span className="text-sm font-semibold">
                        {downloadingFiles.nf_devolucao
                          ? "Baixando..."
                          : "NF Devolução"}
                      </span>
                    </div>
                  </Button>
                  <p className="text-slate-400 text-xs mt-2 text-center">
                    Nota fiscal de devolução
                  </p>
                </div>
              )}

              {(has_arquivo_recibo || arquivo_recibo) && (
                <div className="flex flex-col items-center">
                  <Button
                    size="lg"
                    className="w-full h-20 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => downloadFile(id, "recibo")}
                    disabled={downloadingFiles.recibo}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {downloadingFiles.recibo ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Download className="h-6 w-6" />
                      )}
                      <span className="text-sm font-semibold">
                        {downloadingFiles.recibo ? "Baixando..." : "Recibo"}
                      </span>
                    </div>
                  </Button>
                  <p className="text-slate-400 text-xs mt-2 text-center">
                    Comprovante de recebimento
                  </p>
                </div>
              )}

              {/* Mensagem quando não há arquivos */}
              {!(
                has_arquivo_nf ||
                arquivo_nf ||
                has_arquivo_nf_devolucao ||
                arquivo_nf_devolucao ||
                has_arquivo_recibo ||
                arquivo_recibo
              ) && (
                  <div className="col-span-full flex flex-col items-center justify-center py-8 text-slate-400">
                    <FileText className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-lg font-medium">
                      Nenhum arquivo disponível
                    </p>
                    <p className="text-sm">
                      Esta solicitação não possui arquivos anexados
                    </p>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Motivo da Recusa */}
        {Boolean(motivo_recusa && motivo_recusa.trim()) && (
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Motivo da Recusa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-600/10 rounded-lg border border-red-500/30">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-full bg-red-400 rounded-full min-h-[20px]"></div>
                  <div className="flex-1">
                    <p className="text-red-200 leading-relaxed text-base font-medium">
                      {motivo_recusa}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Produtos */}
        <ProdutosCard numeroNF={numero_nf} />

        {/* Botões de Ação - Centralizados */}
        <div className="flex justify-center gap-4 mt-6">
          <ActionButtons
            solicitacao={solicitacao}
            userPermissions={userPermissions}
            onActionComplete={onActionComplete}
            onCloseDetailDialog={onCloseDetailDialog}
          />
        </div>
      </div>

      <DialogFooter></DialogFooter>
    </>
  );
};
