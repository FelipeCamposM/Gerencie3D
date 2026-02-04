import { Card, CardContent } from "../ui/card";
import { Users, ShieldCheck } from "lucide-react";
import { Usuario } from "./types";

interface UsuariosStatsProps {
  usuarios: Usuario[];
}

export function UsuariosStats({ usuarios }: UsuariosStatsProps) {
  const statsConfig = [
    {
      label: "Total de Usuários",
      value: usuarios.length,
      icon: Users,
      color: "indigo",
    },
    {
      label: "Administradores",
      value: usuarios.filter((u) => u.role === "admin").length,
      icon: ShieldCheck,
      color: "red",
    },
    {
      label: "Usuários",
      value: usuarios.filter((u) => u.role === "user").length,
      icon: Users,
      color: "blue",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        gradient: "from-blue-50 to-indigo-50/50",
        border: "border-blue-100/60",
        iconBg: "from-blue-500 to-indigo-600",
        shadow: "shadow-blue-500/30",
        text: "from-blue-600 to-indigo-600",
      },
      red: {
        gradient: "from-red-50 to-rose-50/50",
        border: "border-red-100/60",
        iconBg: "from-red-500 to-rose-600",
        shadow: "shadow-red-500/30",
        text: "from-red-600 to-rose-600",
      },
      indigo: {
        gradient: "from-indigo-50 to-purple-50/50",
        border: "border-indigo-100/60",
        iconBg: "from-indigo-500 to-purple-600",
        shadow: "shadow-indigo-500/30",
        text: "from-indigo-600 to-purple-600",
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

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
            {statsConfig.map((stat, index) => {
              const colors = getColorClasses(stat.color);
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between py-4 bg-gradient-to-br ${colors.gradient} rounded-xl px-4 border-2 ${colors.border} shadow-md`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-11 w-11 bg-gradient-to-br ${colors.iconBg} rounded-xl flex items-center justify-center shadow-lg ${colors.shadow}`}
                    >
                      <stat.icon className="h-5.5 w-5.5 text-white" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {stat.label}
                    </p>
                  </div>
                  <p
                    className={`text-2xl font-black bg-gradient-to-r ${colors.text} bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop View - Grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsConfig.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <Card
              key={index}
              className={`bg-gradient-to-br ${colors.gradient} border-2 ${colors.border} shadow-lg ${colors.shadow} hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 group`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p
                      className={`text-3xl font-black bg-gradient-to-r ${colors.text} bg-clip-text text-transparent mt-2`}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`h-14 w-14 bg-gradient-to-br ${colors.iconBg} rounded-xl flex items-center justify-center shadow-lg ${colors.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200`}
                  >
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
