import {
  User,
  Printer,
  Package,
  TrendingUp,
  Award,
  DollarSign,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Impressao {
  id: string;
  usuario: {
    id: number;
    primeiroNome: string;
    ultimoNome: string;
    imagemUsuario?: string | null;
  };
  filamentoTotalUsado: number;
  custoTotal: number;
}

interface UserStatsCardProps {
  impressoes: Impressao[];
}

export function UserStatsCard({ impressoes }: UserStatsCardProps) {
  // Agrupar dados por usuário
  const usuariosMap = new Map();
  impressoes.forEach((impressao) => {
    const userId = impressao.usuario.id;
    if (!usuariosMap.has(userId)) {
      usuariosMap.set(userId, {
        id: userId,
        nome: `${impressao.usuario.primeiroNome} ${impressao.usuario.ultimoNome}`,
        imagemUsuario: impressao.usuario.imagemUsuario,
        impressoes: 0,
        filamentoUsado: 0,
        gastoTotal: 0,
      });
    }
    const userData = usuariosMap.get(userId);
    userData.impressoes += 1;
    userData.filamentoUsado += impressao.filamentoTotalUsado;
    userData.gastoTotal += impressao.custoTotal;
  });

  const usuarios = Array.from(usuariosMap.values());

  // Ordenar usuários por número de impressões (decrescente)
  usuarios.sort((a, b) => b.impressoes - a.impressoes);

  if (usuarios.length === 0) return null;

  // Cores gradientes variadas para cada usuário
  const gradientes = [
    "from-violet-500 via-purple-500 to-pink-500",
    "from-cyan-500 via-blue-500 to-indigo-500",
    "from-emerald-500 via-green-500 to-teal-500",
    "from-orange-500 via-amber-500 to-yellow-500",
    "from-rose-500 via-red-500 to-pink-500",
    "from-sky-500 via-cyan-500 to-blue-500",
  ];

  return (
    <div className="relative bg-gradient-to-br from-white via-slate-50 to-blue-50/30 rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200/50 hover:shadow-xl transition-all duration-300 mb-8 overflow-hidden">
      {/* Decoração de fundo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/10 to-pink-500/10 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 transform hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Estatísticas por Usuário
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Top {usuarios.length} colaboradores ativos
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-2 rounded-full border border-cyan-200/50">
          <Award className="h-4 w-4 text-cyan-600" />
          <span className="text-xs font-semibold text-cyan-700">
            {impressoes.length} impressões totais
          </span>
        </div>
      </div>

      {/* Grid de usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {usuarios.map((usuario, index) => {
          const gradiente = gradientes[index % gradientes.length];
          const isTopUser = index === 0;

          return (
            <div
              key={usuario.id}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              {/* Badge de ranking para o top usuário */}
              {isTopUser && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 animate-bounce">
                    <Award className="h-3 w-3" />
                    Top
                  </div>
                </div>
              )}

              {/* Header colorido do card */}
              <div className={`h-2 bg-gradient-to-r ${gradiente}`} />

              {/* Conteúdo */}
              <div className="p-5">
                {/* Avatar e nome */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="relative">
                    <Avatar
                      className={`h-14 w-14 ring-4 ring-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
                    >
                      {usuario.imagemUsuario &&
                      usuario.imagemUsuario.length > 0 ? (
                        <AvatarImage
                          src={`data:image/jpeg;base64,${usuario.imagemUsuario}`}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback
                        className={`bg-gradient-to-br ${gradiente} text-white flex items-center justify-center`}
                      >
                        <User className="h-7 w-7 drop-shadow-md" />
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 h-6 w-6 bg-gradient-to-br ${gradiente} rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow`}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-base truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-600 group-hover:bg-clip-text transition-all">
                      {usuario.nome}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Colaborador ativo
                    </p>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="space-y-3">
                  {/* Impressões */}
                  <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100/50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                          <Printer className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          Impressões
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {usuario.impressoes}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Filamento */}
                  <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100/50 group-hover:from-emerald-100 group-hover:to-teal-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          Filamento
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          {usuario.filamentoUsado.toFixed(0)}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          g
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gasto Total */}
                  <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100/50 group-hover:from-amber-100 group-hover:to-orange-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          Gasto Total
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(usuario.gastoTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
