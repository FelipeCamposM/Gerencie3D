import { Card, CardContent } from "../ui/card";
import {
  Users,
  BadgeCent,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Store,
} from "lucide-react";
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
      blue: "bg-blue-500/20 text-blue-400",
      red: "bg-red-500/20 text-red-400",
      green: "bg-green-500/20 text-green-400",
      orange: "bg-orange-500/20 text-orange-500",
      indigo: "bg-indigo-500/20 text-indigo-400",
      yellow: "bg-yellow-500/20 text-yellow-400",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
      {statsConfig.map((stat, index) => (
        <Card key={index} className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${getColorClasses(stat.color)} rounded-lg`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="mb-4">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
