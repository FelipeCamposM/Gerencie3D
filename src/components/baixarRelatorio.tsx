import { Button } from "./ui/button";
import {
  gerarRelatorioPDF,
  gerarRelatorioXLSX,
  getLogoBase64,
} from "../lib/relatorioUtils";
import { Solicitacao } from "@/types/solicitacao";

interface Props {
  sortedSolicitacoes: Solicitacao[];
  status: string;
}
export default function BaixarRelatorio({ sortedSolicitacoes, status }: Props) {
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-slate-800 text-white rounded-lg p-8 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">
            Confirmar Download do Relatório
          </h2>
          <p className="mb-4">
            Você está prestes a baixar um relatório em PDF ou Excel contendo{" "}
            <b>{sortedSolicitacoes.length}</b> solicitações filtradas pelo
            status: <b>{status}</b>.<br />
            Escolha o formato desejado:
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              onClick={async () => {
                const logoBase64 = await getLogoBase64("/r3logo.png");
                await gerarRelatorioPDF({
                  solicitacoes: sortedSolicitacoes,
                  status,
                  logoBase64,
                  startDate: undefined,
                  endDate: undefined,
                });
              }}
            >
              Baixar em PDF
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 cursor-pointer"
              onClick={() => {
                gerarRelatorioXLSX({ solicitacoes: sortedSolicitacoes });
              }}
            >
              Baixar em Excel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
