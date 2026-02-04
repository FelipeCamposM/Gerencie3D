import {
  List,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface FilterButtonsProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterButtons({
  currentFilter,
  onFilterChange,
}: FilterButtonsProps) {
  const filters = [
    {
      value: "all",
      label: "Todas",
      icon: List,
      gradient: "from-slate-500 to-slate-700",
      shadow: "shadow-slate-500/30",
    },
    {
      value: "em_andamento",
      label: "Em Andamento",
      icon: PlayCircle,
      gradient: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/30",
    },
    {
      value: "concluida",
      label: "Concluídas",
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-600",
      shadow: "shadow-green-500/30",
    },
    {
      value: "cancelada",
      label: "Canceladas",
      icon: XCircle,
      gradient: "from-orange-500 to-amber-600",
      shadow: "shadow-orange-500/30",
    },
    {
      value: "falhou",
      label: "Falhadas",
      icon: AlertCircle,
      gradient: "from-red-500 to-rose-600",
      shadow: "shadow-red-500/30",
    },
  ];

  return (
    <div className="mb-6">
      {/* Mobile View - Botões verticais sem gap */}
      <div className="md:hidden flex flex-col rounded-xl overflow-hidden border-2 border-slate-300 bg-white shadow-lg">
        {filters.map((filter, index) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`px-5 py-3.5 transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                index !== filters.length - 1
                  ? "border-b-2 border-slate-200"
                  : ""
              } ${
                currentFilter === filter.value
                  ? `bg-gradient-to-r ${filter.gradient} text-white shadow-md ${filter.shadow} font-bold`
                  : "bg-white text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 active:bg-slate-100 font-semibold"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-transform duration-200 ${
                  currentFilter === filter.value
                    ? "bg-white/20 scale-110"
                    : "bg-slate-100"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop View - Botões horizontais */}
      <div className="hidden md:flex gap-3">
        {filters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2.5 font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 ${
                currentFilter === filter.value
                  ? `bg-gradient-to-r ${filter.gradient} text-white ${filter.shadow} shadow-lg scale-105`
                  : "bg-gradient-to-r from-white to-slate-50 text-slate-700 hover:from-slate-100 hover:to-slate-200 border-2 border-slate-300"
              }`}
            >
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center transition-transform duration-200 ${
                  currentFilter === filter.value
                    ? "bg-white/20"
                    : "bg-slate-100"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
