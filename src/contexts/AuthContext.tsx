"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, userToken: string) => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const login = (userData: User, userToken: string) => {
    if (process.env.NODE_ENV !== "production")
      console.log("AuthProvider: Fazendo login", userData);
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
  };

  const logout = async () => {
    if (process.env.NODE_ENV !== "production")
      console.log("AuthProvider: Fazendo logout");
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Limpar cookie do servidor
    try {
      await fetch("/api/usuarios/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      if (process.env.NODE_ENV !== "production")
        console.error("Erro ao fazer logout no servidor:", error);
    }

    // Redirecionar para login
    router.push("/login");
  };

  const refreshAuth = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/usuarios/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
      } else if (response.status === 401) {
        // Token expirado ou inválido
        if (process.env.NODE_ENV !== "production")
          console.log("Token expirado, fazendo logout");
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/login");
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production")
        console.error("Erro ao verificar autenticação:", error);
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const initAuth = async () => {
      if (process.env.NODE_ENV !== "production")
        console.log("AuthProvider: Inicializando autenticação");

      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      // Tentar obter dados do localStorage
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          if (process.env.NODE_ENV !== "production")
            console.log("AuthProvider: Dados encontrados no localStorage");
          setUser(JSON.parse(storedUser));
          setToken(storedToken);

          // Verificar se o token ainda é válido
          const response = await fetch("/api/usuarios/me", {
            credentials: "include",
          });

          if (!response.ok) {
            // Token inválido, limpar dados
            setUser(null);
            setToken(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        } else {
          if (process.env.NODE_ENV !== "production")
            console.log("AuthProvider: Nenhum dado encontrado no localStorage");
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production")
          console.error("AuthProvider: Erro ao inicializar:", error);
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const isAuthenticated = Boolean(user && token);

  // Verificar token periodicamente (a cada 5 minutos)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      if (process.env.NODE_ENV !== "production")
        console.log("Verificando validade do token...");
      await refreshAuth();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshAuth]);

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const response = await fetch(`/api/usuarios/${user.id}`);
      if (response.ok) {
        const userData = await response.json();
        const updatedUser = {
          ...user,
          primeiroNome: userData.primeiroNome,
          ultimoNome: userData.ultimoNome,
          email: userData.email,
          imagemUsuario: userData.imagemUsuario,
          impressoesRealizadas: userData.impressoesRealizadas,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
