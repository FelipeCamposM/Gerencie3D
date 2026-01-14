import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import {
  Activity,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  Bell,
  AlertTriangle,
  ClockIcon,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { formatBrazilianDateTime } from "../../utils/timeUtils";

interface ActivityItem {
  id: number;
  action: string;
  description: string;
  time: Date | string;
  type: "success" | "warning" | "info";
  nome?: string;
  status?: string;
}

export const RecentActivity: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNewActivities, setHasNewActivities] = useState(false);

  // Verificar níveis de usuário
  const isLogisticsUser = user?.user_level === "logistica";
  const isSalesUser = user?.user_level === "vendas";
  const isFinancialUser = user?.user_level === "financeiro";

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setLoading(true);

        // Escolher endpoint baseado no nível do usuário
        let endpoint = "/api/recentActivity"; // Default

        if (isLogisticsUser) {
          endpoint = "/api/recentActivityRecusadas";
        } else if (isSalesUser) {
          endpoint = "/api/recentActivityPendentes";
        } else if (isFinancialUser) {
          endpoint = "/api/recentActivityFinanceiro";
        }

        const response = await fetch(endpoint, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }

        const data = await response.json();
        setActivities(data);
        setError(null);

        // Para usuários especiais, verificar se há atividades novas (novas notificações)
        if (
          (isLogisticsUser || isSalesUser || isFinancialUser) &&
          data.length > 0
        ) {
          let storageKey = "lastSeenDefault";
          if (isLogisticsUser) {
            storageKey = "lastSeenRecusadas";
          } else if (isSalesUser) {
            storageKey = "lastSeenPendentes";
          } else if (isFinancialUser) {
            storageKey = "lastSeenFinanceiro";
          }

          const lastSeen = localStorage.getItem(storageKey);
          if (!lastSeen) {
            setHasNewActivities(true);
          } else {
            const lastSeenDate = new Date(lastSeen);
            const hasNewActivity = data.some((activity: ActivityItem) => {
              const activityDate = new Date(activity.time);
              return activityDate > lastSeenDate;
            });
            setHasNewActivities(hasNewActivity);
          }
        }
      } catch (err) {
        console.error("Error fetching recent activities:", err);
        setError("Erro ao carregar atividades recentes");
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    // Só buscar atividades se o usuário estiver carregado
    if (user) {
      fetchRecentActivity();
    }
  }, [user, isLogisticsUser, isSalesUser, isFinancialUser]);

  const recentActivity: ActivityItem[] = [
    {
      id: 1,
      action: "Solicitação aprovada",
      description: "Solicitação #1234 foi aprovada",
      time: "2 horas atrás",
      type: "success",
    },
    {
      id: 2,
      action: "Nova solicitação",
      description: "Solicitação #1235 foi criada",
      time: "4 horas atrás",
      type: "info",
    },
    {
      id: 3,
      action: "Solicitação recusada",
      description: "Solicitação #1233 foi recusada",
      time: "6 horas atrás",
      type: "warning",
    },
  ];

  const getActivityIcon = (type: string, status?: string) => {
    // Para usuários de logística vendo recusadas, usar ícone de alerta especial
    if (isLogisticsUser && type === "warning") {
      return (
        <div className="relative">
          <XCircle className="h-4 w-4 text-red-500" />
          <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-400 rounded-full animate-pulse"></div>
        </div>
      );
    }

    // Para usuários de vendas vendo pendentes, usar ícone de relógio especial
    if (isSalesUser && type === "info") {
      return (
        <div className="relative">
          <ClockIcon className="h-4 w-4 text-yellow-500" />
          <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
      );
    }

    // Para usuários financeiros, usar cores específicas baseadas no status
    if (isFinancialUser && status) {
      const getFinancialIcon = () => {
        switch (status) {
          case "APROVADA":
            return (
              <div className="relative">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            );
          case "DESDOBRADA":
            return (
              <div className="relative">
                <DollarSign className="h-4 w-4 text-blue-500" />
                <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            );
          case "ABATIDA":
            return (
              <div className="relative">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
                <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            );
          case "FINALIZADA":
            return (
              <div className="relative">
                <CheckCircle2 className="h-4 w-4 text-lime-500" />
                <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-lime-400 rounded-full animate-pulse"></div>
              </div>
            );
          default:
            return (
              <div className="relative">
                <DollarSign className="h-4 w-4 text-green-500" />
                <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            );
        }
      };
      return getFinancialIcon();
    }

    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "warning":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "info":
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  // Função para marcar atividades como vistas
  const markActivitiesAsSeen = () => {
    if (
      (isLogisticsUser || isSalesUser || isFinancialUser) &&
      hasNewActivities
    ) {
      setHasNewActivities(false);
      // Salvar no localStorage baseado no tipo de usuário
      let storageKey = "lastSeenDefault";
      if (isLogisticsUser) {
        storageKey = "lastSeenRecusadas";
      } else if (isSalesUser) {
        storageKey = "lastSeenPendentes";
      } else if (isFinancialUser) {
        storageKey = "lastSeenFinanceiro";
      }
      localStorage.setItem(storageKey, new Date().toISOString());
    }
  };

  // Use real data if available, otherwise use fallback
  const displayActivities = activities.length > 0 ? activities : recentActivity;

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mx-4 max-h-80 overflow-y-auto scrollbar-dark">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30 animate-pulse"
              >
                <div className="h-4 w-4 bg-slate-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-600 rounded w-3/4"></div>
                  <div className="h-2 bg-slate-600 rounded w-1/2"></div>
                  <div className="h-2 bg-slate-600 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="bg-slate-800/50 border-slate-700"
      onClick={markActivitiesAsSeen}
    >
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          {isLogisticsUser && hasNewActivities ? (
            <>
              <div className="relative">
                <Bell className="h-5 w-5 text-orange-400" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-orange-400">Solicitações Recusadas</span>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </>
          ) : isSalesUser && hasNewActivities ? (
            <>
              <div className="relative">
                <ClockIcon className="h-5 w-5 text-yellow-400" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-yellow-400">Solicitações Pendentes</span>
              <Clock className="h-4 w-4 text-yellow-500" />
            </>
          ) : isFinancialUser && hasNewActivities ? (
            <>
              <div className="relative">
                <DollarSign className="h-5 w-5 text-green-400" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-green-400">Atividades Financeiras</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          ) : isLogisticsUser ? (
            <>
              <Bell className="h-5 w-5 text-blue-400" />
              Solicitações Recusadas
            </>
          ) : isSalesUser ? (
            <>
              <ClockIcon className="h-5 w-5 text-blue-400" />
              Solicitações Pendentes
            </>
          ) : isFinancialUser ? (
            <>
              <DollarSign className="h-5 w-5 text-blue-400" />
              Atividades Financeiras
            </>
          ) : (
            <>
              <Activity className="h-5 w-5 text-blue-400" />
              Atividade Recente
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mx-4 max-h-172.5 overflow-y-auto scrollbar-dark">
          {displayActivities.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-slate-400">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma atividade recente</p>
              </div>
            </div>
          ) : (
            displayActivities.map((activity) => {
              // Função para obter cores específicas para atividades financeiras
              const getFinancialCardColors = (status?: string) => {
                if (!isFinancialUser || !status) return "";

                switch (status) {
                  case "APROVADA":
                    return "bg-green-600/10 border border-green-600/20 hover:bg-green-600/15";
                  case "DESDOBRADA":
                    return "bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15";
                  case "ABATIDA":
                    return "bg-yellow-600/10 border border-yellow-600/20 hover:bg-yellow-600/15";
                  case "FINALIZADA":
                    return "bg-lime-500/10 border border-lime-500/20 hover:bg-lime-500/15";
                  default:
                    return "bg-green-500/10 border border-green-500/20 hover:bg-green-500/15";
                }
              };

              // Função para obter cores de texto específicas para atividades financeiras
              const getFinancialTextColor = (status?: string) => {
                if (!isFinancialUser || !status) return "";

                switch (status) {
                  case "APROVADA":
                    return "text-green-300";
                  case "DESDOBRADA":
                    return "text-blue-300";
                  case "ABATIDA":
                    return "text-yellow-300";
                  case "FINALIZADA":
                    return "text-lime-300";
                  default:
                    return "text-green-300";
                }
              };

              return (
                <div
                  key={activity.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    isLogisticsUser && activity.type === "warning"
                      ? "bg-red-500/10 border border-red-500/20 hover:bg-red-500/15"
                      : isSalesUser && activity.type === "info"
                      ? "bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/15"
                      : isFinancialUser
                      ? getFinancialCardColors(activity.status)
                      : "bg-slate-700/30 hover:bg-slate-700/50"
                  }`}
                >
                  {getActivityIcon(activity.type, activity.status)}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-sm ${
                        isLogisticsUser && activity.type === "warning"
                          ? "text-red-300"
                          : isSalesUser && activity.type === "info"
                          ? "text-yellow-300"
                          : isFinancialUser
                          ? getFinancialTextColor(activity.status)
                          : "text-white"
                      }`}
                    >
                      {activity.action}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {activity.description}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      {typeof activity.time === "string"
                        ? activity.time
                        : formatBrazilianDateTime(activity.time)}
                    </p>
                    {isLogisticsUser && activity.type === "warning" && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-orange-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Requer atenção</span>
                      </div>
                    )}
                    {isSalesUser && activity.type === "info" && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400">
                        <Clock className="h-3 w-3" />
                        <span>Aguardando análise</span>
                      </div>
                    )}
                    {isFinancialUser && activity.status && (
                      <div
                        className={`mt-2 flex items-center gap-1 text-xs ${getFinancialTextColor(
                          activity.status
                        )}`}
                      >
                        <TrendingUp className="h-3 w-3" />
                        <span>
                          {activity.status === "APROVADA" &&
                            "Aprovado para processamento"}
                          {activity.status === "DESDOBRADA" &&
                            "Desdobrado para análise"}
                          {activity.status === "ABATIDA" && "Valor abatido"}
                          {activity.status === "FINALIZADA" &&
                            "Processo finalizado"}
                          {![
                            "APROVADA",
                            "DESDOBRADA",
                            "ABATIDA",
                            "FINALIZADA",
                          ].includes(activity.status) &&
                            "Processado financeiramente"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <div className="mx-4 mt-4">
          <Button
            variant="ghost"
            className={`w-full px-4 ${
              isLogisticsUser && hasNewActivities
                ? "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 bg-orange-500/20"
                : isSalesUser && hasNewActivities
                ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 bg-yellow-500/20"
                : isFinancialUser && hasNewActivities
                ? "text-green-400 hover:text-green-300 hover:bg-green-500/10 bg-green-500/20"
                : "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 bg-blue-500/20"
            }`}
            onClick={() => router.push("/solicitacoes")}
          >
            {isLogisticsUser
              ? "Ver todas as recusadas"
              : isSalesUser
              ? "Ver todas as pendentes"
              : isFinancialUser
              ? "Ver atividades financeiras"
              : "Ver todas as atividades"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
