import {
  Printer,
  CheckCircle,
  PlayCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";

interface StatsCardsProps {
  totalImpressoes: number;
  concluidasCount: number;
  emAndamentoCount: number;
  custoTotal: number;
  lucroTotal: number;
}

export function StatsCards({
  totalImpressoes,
  concluidasCount,
  emAndamentoCount,
  custoTotal,
  lucroTotal,
}: StatsCardsProps) {
  return (
    <>
      {/* Mobile View - Single Card */}
      <div className="md:hidden mb-8">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl p-6 border-2 border-slate-200">
          <h3 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse"></div>
            Estatísticas Gerais
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl px-4 border border-blue-100/60">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Printer className="h-5.5 w-5.5 text-white" />
                </div>
                <p className="text-sm font-bold text-blue-700">
                  Total de Impressões
                </p>
              </div>
              <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {totalImpressoes}
              </p>
            </div>

            <div className="flex items-center justify-between py-4 bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-xl px-4 border border-green-100/60">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <CheckCircle className="h-5.5 w-5.5 text-white" />
                </div>
                <p className="text-sm font-bold text-green-700">Concluídas</p>
              </div>
              <p className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {concluidasCount}
              </p>
            </div>

            <div className="flex items-center justify-between py-4 bg-gradient-to-br from-cyan-50 to-sky-50/50 rounded-xl px-4 border border-cyan-100/60">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <PlayCircle className="h-5.5 w-5.5 text-white" />
                </div>
                <p className="text-sm font-bold text-cyan-700">
                  Em Andamento
                </p>
              </div>
              <p className="text-2xl font-black bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">
                {emAndamentoCount}
              </p>
            </div>

            <div className="flex items-center justify-between py-4 bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-xl px-4 border border-orange-100/60">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <DollarSign className="h-5.5 w-5.5 text-white" />
                </div>
                <p className="text-sm font-bold text-orange-700">
                  Custo Total
                </p>
              </div>
              <p className="text-2xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {formatPrice(custoTotal)}
              </p>
            </div>

            <div className="flex items-center justify-between py-4 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-xl px-4 border border-emerald-100/60">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <TrendingUp className="h-5.5 w-5.5 text-white" />
                </div>
                <p className="text-sm font-bold text-emerald-700">
                  Lucro Total
                </p>
              </div>
              <p className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {formatPrice(lucroTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View - Grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg shadow-blue-500/20 p-6 border-2 border-blue-100 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">
                Total Impressões
              </p>
              <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                {totalImpressoes}
              </p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200">
              <Printer className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg shadow-green-500/20 p-6 border-2 border-green-100 hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-1 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Concluídas</p>
              <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">
                {concluidasCount}
              </p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-2xl shadow-lg shadow-cyan-500/20 p-6 border-2 border-cyan-100 hover:shadow-2xl hover:shadow-cyan-500/30 hover:-translate-y-1 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-cyan-700 uppercase tracking-wide">Em Andamento</p>
              <p className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent mt-2">
                {emAndamentoCount}
              </p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200">
              <PlayCircle className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-lg shadow-orange-500/20 p-6 border-2 border-orange-100 hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-orange-700 uppercase tracking-wide">Custo Total</p>
              <p className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mt-2">
                {formatPrice(custoTotal)}
              </p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-lg shadow-emerald-500/20 p-6 border-2 border-emerald-100 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-wide">Lucro Total</p>
              <p className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mt-2">
                {formatPrice(lucroTotal)}
              </p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
