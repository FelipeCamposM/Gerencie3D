"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { AuthLoading } from "../../components/LoadingPage";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import {
  UserPlus,
  LogIn,
  Mail,
  Lock,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const form = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const response = await fetch("/api/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include", // Importante para cookies
      });

      const result = await response.json();

      if (response.ok) {
        // Login bem-sucedido - usar o AuthContext
        console.log("Login bem-sucedido:", result);
        login(result.user, result.token);

        // Aguardar um momento para o estado ser atualizado
        setTimeout(() => {
          router.push("/");
        }, 100);
      } else {
        // Erro no login
        setLoginError(result.error || "Erro ao fazer login");
      }
    } catch (error) {
      console.error("Erro na requisição de login:", error);
      setLoginError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus(
      "Funcionalidade de redefinição de senha será implementada em breve."
    );
    // Aqui você pode implementar a funcionalidade de redefinição de senha no futuro
  };

  // Mostrar loading se ainda estiver verificando autenticação
  if (authLoading) {
    return <AuthLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg bg-white border border-slate-200">
          <CardHeader className="space-y-1 px-8 pt-8">
            <div className="flex justify-center">
              <div className="relative">
                <Image
                  src="/gerencie3d_logo_com_escrita.png"
                  alt="Gerencie 3D Logo"
                  width={200}
                  height={80}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            {!showForgot ? (
              <div>
                {loginError && (
                  <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>{loginError}</span>
                  </div>
                )}

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-slate-700 text-sm font-medium flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4 text-slate-500" />
                      Email
                    </Label>
                    <Controller
                      name="email"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          {...field}
                          required
                          className="h-11 bg-white text-slate-800 border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                          autoComplete="username"
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-slate-700 text-sm font-medium flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4 text-slate-500" />
                      Senha
                    </Label>
                    <Controller
                      name="password"
                      control={form.control}
                      render={({ field }) => (
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            required
                            className="h-11 bg-white text-slate-800 border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 pr-10"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-900 to-cyan-500 hover:brightness-110 text-white font-semibold transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Entrando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="h-5 w-5" />
                        Entrar
                      </div>
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div>
                <div className="mb-6 text-center">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Redefinir Senha
                  </h3>
                  <p className="text-sm text-slate-600">
                    Digite seu email para receber as instruções
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="forgot_email"
                      className="text-slate-700 text-sm font-medium flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4 text-slate-500" />
                      E-mail
                    </Label>
                    <Input
                      id="forgot_email"
                      type="email"
                      placeholder="seu@email.com"
                      value={forgotEmail ?? ""}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                      }}
                      required
                      className="h-11 bg-white text-slate-800 border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      autoComplete="username"
                    />
                  </div>

                  {forgotStatus && (
                    <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                      {forgotStatus}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-11 bg-white hover:bg-slate-50 text-slate-700 border-slate-300 transition-all duration-200"
                      onClick={() => {
                        setShowForgot(false);
                        setForgotEmail("");
                        setForgotStatus(null);
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200 shadow-lg"
                    >
                      Enviar
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Link para Cadastro */}
            {!showForgot && (
              <div className="pt-6 border-t border-slate-200">
                <p className="text-center text-slate-600 text-sm mb-3">
                  Não tem uma conta?
                </p>
                <Link href="/cadastro">
                  <Button
                    variant="outline"
                    className="w-full h-11 bg-white hover:bg-slate-50 text-slate-700 border-slate-300 font-medium transition-all duration-200"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Criar Conta
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
