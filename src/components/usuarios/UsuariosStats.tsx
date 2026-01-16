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
      blue: "bg-blue-500/10 text-blue-600 border-blue-200",
      red: "bg-red-500/10 text-red-600 border-red-200",
      green: "bg-green-500/10 text-green-600 border-green-200",
      orange: "bg-orange-500/10 text-orange-600 border-orange-200",
      indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
      yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <>
      {/* Mobile View - Single Card */}
      <div className="md:hidden mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Estatísticas
          </h3>
          <div className="space-y-4">
            {statsConfig.map((stat, index) => (
              <div
                key={index}
                className={`flex items-center justify-between py-3 ${
                  index !== statsConfig.length - 1
                    ? "border-b border-slate-100"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 ${getColorClasses(
                      stat.color
                    )} rounded-lg flex items-center justify-center border`}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    {stat.label}
                  </p>
                </div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop View - Grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statsConfig.map((stat, index) => (
          <Card
            key={index}
            className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`h-12 w-12 ${getColorClasses(
                    stat.color
                  )} rounded-lg flex items-center justify-center border`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
