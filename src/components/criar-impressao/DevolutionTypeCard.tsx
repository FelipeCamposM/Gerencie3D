import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface DevolutionTypeCardProps {
  tipoDevolucao: string;
}

export function DevolutionTypeCard({ tipoDevolucao }: DevolutionTypeCardProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 mb-6">
      <CardHeader className="px-3">
        <CardTitle className="text-white flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Tipo de Devolução
        </CardTitle>
      </CardHeader>
      <CardContent className="mx-6 min-h-[120px]">
        <div
          className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${tipoDevolucao === "total"
              ? "bg-green-500/20 border-green-500/30"
              : tipoDevolucao === "parcial"
                ? "bg-orange-500/20 border-orange-500/30"
                : "bg-slate-700/50 border-slate-600"
            }`}
        >
          {tipoDevolucao === "total" ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <div>
                <h3 className="font-semibold text-green-400">Devolução Total</h3>
                <p className="text-sm text-green-300">
                  Todos os produtos da nota fiscal serão devolvidos
                </p>
              </div>
            </>
          ) : tipoDevolucao === "parcial" ? (
            <>
              <XCircle className="h-5 w-5 text-orange-400" />
              <div>
                <h3 className="font-semibold text-orange-400">Devolução Parcial</h3>
                <p className="text-sm text-orange-300">
                  Alguns produtos da nota fiscal serão devolvidos
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-slate-400" />
              <div>
                <h3 className="font-semibold text-slate-400">Selecione os produtos</h3>
                <p className="text-sm text-slate-400">
                  Selecione as quantidades de produtos para devolução
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
