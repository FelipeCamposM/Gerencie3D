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
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
      {statsConfig.map((stat, index) => (
        <Card
          key={index}
          className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 ${getColorClasses(
                  stat.color
                )} rounded-lg border`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="mb-4">
                <p className="text-sm text-slate-600 font-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
