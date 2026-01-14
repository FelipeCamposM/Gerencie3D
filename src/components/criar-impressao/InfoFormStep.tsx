import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { FileUploadNF } from "@/components/fileUploadNF";
import { NFWarning } from "./NFWarning";
import {
  Search,
  User,
  Package,
  CreditCard,
  ArrowRight,
  Loader2,
  Send,
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";

type FormData = {
  nome: string;
  filial: string;
  numero_nf: string;
  carga: string;
  nome_cobranca: string;
  cod_cobranca: string;
  rca: string;
  cgent: string;
  motivo_devolucao: string;
  tipo_devolucao: string;
  cod_cliente: string;
  pendente_by: string;
};

interface InfoFormStepProps {
  form: UseFormReturn<FormData>;
  numeroNF: string;
  setNumeroNF: (value: string) => void;
  nomeClient: string;
  numeroCodigoCliente: string;
  numeroCarga: string;
  codigoRca: string;
  codigoFilial: string;
  numeroCodigoCobranca: string;
  nomeCodigoCobranca: string;
  identificador: string;
  setArquivoNF: (file: File | null) => void;
  onAdvance: () => void;
  checkIdentificador: (id: string) => string;
  isButtonEnabled: () => boolean;
  onSearchNF?: () => void;
  isSearchingNF?: boolean;
  nfExists?: boolean;
  solicitacoesExistentes?: {
    id: number;
    numero_nf: string;
    status: string;
    created_at: string;
    nome: string;
    cod_cliente: string;
  }[];
  dismissWarning?: () => void;
  motivoDevolucaoText: string;
  setMotivoDevolucaoText: (value: string) => void;
  onNFInfosFetched?: (infos: {
    codcli: string;
    numcar: string;
    codusur: string;
    codcob: string;
    cobranca: string;
    cliente: string;
    codfilial: string;
    cgcent: string;
  }) => void;
}

export function InfoFormStep({
  form,
  numeroNF,
  setNumeroNF,
  nomeClient,
  numeroCodigoCliente,
  numeroCarga,
  codigoRca,
  codigoFilial,
  numeroCodigoCobranca,
  nomeCodigoCobranca,
  identificador,
  setArquivoNF,
  onAdvance,
  checkIdentificador,
  isButtonEnabled,
  onSearchNF,
  isSearchingNF = false,
  nfExists = false,
  solicitacoesExistentes = [],
  dismissWarning,
  motivoDevolucaoText,
  setMotivoDevolucaoText,
}: InfoFormStepProps) {
  // Função para buscar informações da NF manualmente
  const handleSearchNF = async () => {
    if (onSearchNF) {
      onSearchNF();
    }
  };

  // Função para lidar com Enter no input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSearchingNF && numeroNF.length >= 4) {
      e.preventDefault();
      handleSearchNF();
    }
  };
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <CardHeader className="flex flex-col w-full p-0 justify-start">
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Nota Fiscal
          </CardTitle>
          <CardDescription className="text-slate-400">
            Digite o número da nota fiscal para buscar as informações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Aviso usando componente NFWarning */}
          {nfExists && solicitacoesExistentes && solicitacoesExistentes.length > 0 && (
            <NFWarning
              solicitacoes={solicitacoesExistentes}
              onDismiss={dismissWarning || (() => {})}
            />
          )}

          <Form {...form}>
            <form className="space-y-6">
              <div className="gap-6">
                {/* Número da NF */}
                <FormField
                  control={form.control}
                  name="numero_nf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Número da Nota Fiscal
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Digite o número da NF e pressione Enter ou clique no botão"
                            {...field}
                            value={numeroNF}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 6) {
                                setNumeroNF(value);
                                field.onChange(value);
                              }
                            }}
                            onKeyPress={handleKeyPress}
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-12"
                            disabled={isSearchingNF}
                            maxLength={6}
                          />
                          <Button
                            type="button"
                            onClick={handleSearchNF}
                            disabled={isSearchingNF || numeroNF.length < 4}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600"
                          >
                            {isSearchingNF ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Informações do Cliente */}
              <Card className="md:col-span-2 bg-slate-700/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      Nome do Cliente
                    </label>
                    <div className="mt-1 p-3 bg-slate-600 rounded-lg border border-slate-500">
                      <span className="text-white">
                        {nomeClient || "CLIENTE NÃO ENCONTRADO"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      Código do Cliente
                    </label>
                    <div className="mt-1 p-3 bg-slate-600 rounded-lg border border-slate-500">
                      <span className="text-white">
                        {numeroCodigoCliente || "CÓDIGO NÃO ENCONTRADO"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informações da Carga e Cobrança */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Informações da Carga
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 mx-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300">
                        Número da Carga
                      </label>
                      <div className="mt-1 p-3 bg-slate-600 rounded-lg border border-slate-500">
                        <span className="text-white">
                          {numeroCarga || "CARGA NÃO ENCONTRADA"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">
                        Código RCA
                      </label>
                      <div className="mt-1 p-3 bg-slate-600 rounded-lg border border-slate-500">
                        <span className="text-white">
                          {codigoRca || "RCA NÃO ENCONTRADO"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">
                        Código Filial
                      </label>
                      <div className="mt-1 p-3 bg-slate-600 rounded-lg border border-slate-500">
                        <span className="text-white">
                          {codigoFilial || "FILIAL NÃO ENCONTRADA"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700/50 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Informações de Cobrança
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300">
                        Código da Cobrança
                      </label>
                      <div className="mt-1 p-3 bg-slate-600 rounded-lg border border-slate-500">
                        <span className="text-white">
                          {numeroCodigoCobranca || "CÓDIGO NÃO ENCONTRADO"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">
                        Nome da Cobrança
                      </label>
                      <div className="mt-1 p-3 bg-slate-600 rounded-lg border border-slate-500">
                        <span className="text-white">
                          {nomeCodigoCobranca || "NOME NÃO ENCONTRADO"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">
                        Código Identificador
                      </label>
                      <div className="mt-1 p-3 bg-slate-600 rounded-lg border border-slate-500">
                        <span className="text-white">
                          {identificador
                            ? checkIdentificador(identificador)
                            : "CÓDIGO NÃO ENCONTRADO"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Motivo da Devolução */}
              <FormField
                control={form.control}
                name="motivo_devolucao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Motivo da Devolução
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o motivo da devolução"
                        value={motivoDevolucaoText}
                        onChange={(e) => {
                          const value = e.target.value;
                          setMotivoDevolucaoText(value);
                          field.onChange(value);
                        }}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 resize-none overflow-auto h-[90px] max-h-[90px] scrollbar-dark"
                        rows={3}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="mt-6">
                <FileUploadNF
                  onFileChange={(file) => setArquivoNF(file)}
                  onValidationChange={() => {}}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={onAdvance}
                  disabled={!isButtonEnabled()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  Avançar para Produtos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
