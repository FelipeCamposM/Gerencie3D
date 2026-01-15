"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { UserPlus, ArrowLeft, Eye, EyeOff } from "lucide-react";

interface CadastroForm {
  primeiroNome: string;
  ultimoNome: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Cadastro() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const form = useForm<CadastroForm>({
    defaultValues: {
      primeiroNome: "",
      ultimoNome: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [cadastroError, setCadastroError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const onSubmit: SubmitHandler<CadastroForm> = async (data) => {
    setIsLoading(true);
    setCadastroError(null);

    // Validar se as senhas coincidem
    if (data.password !== data.confirmPassword) {
      setCadastroError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    // Validar tamanho mínimo da senha
    if (data.password.length < 6) {
      setCadastroError("A senha deve ter no mínimo 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          primeiroNome: data.primeiroNome,
          ultimoNome: data.ultimoNome,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Cadastro bem-sucedido - redirecionar para login
        router.push("/login?cadastro=sucesso");
      } else {
        // Erro no cadastro
        setCadastroError(result.error || "Erro ao criar conta");
      }
    } catch (error) {
      console.error("Erro na requisição de cadastro:", error);
      setCadastroError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg bg-white border-slate-200">
          <CardHeader className="space-y-1 pb-6 px-8 pt-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/Gerencie3d-Logo.svg"
                alt="Gerencie3D Logo"
                width={150}
                height={150}
                className="w-[150px] h-[150px] object-contain"
                priority
              />
            </div>
            <CardTitle className="text-center text-slate-800 text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
              <UserPlus className="h-6 w-6 text-blue-600" />
              Criar Conta
            </CardTitle>
            <p className="text-center text-slate-600 text-sm">
              Preencha os dados para se cadastrar no sistema
            </p>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            {cadastroError && (
              <div className="p-3 text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {cadastroError}
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="primeiroNome"
                    className="text-slate-700 text-sm font-semibold"
                  >
                    Primeiro Nome
                  </Label>
                  <Controller
                    name="primeiroNome"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="primeiroNome"
                        type="text"
                        placeholder="João"
                        {...field}
                        required
                        className="h-11 bg-white text-slate-800 border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                        autoComplete="given-name"
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="ultimoNome"
                    className="text-slate-700 text-sm font-semibold"
                  >
                    Último Nome
                  </Label>
                  <Controller
                    name="ultimoNome"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="ultimoNome"
                        type="text"
                        placeholder="Silva"
                        {...field}
                        required
                        className="h-11 bg-white text-slate-800 border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                        autoComplete="family-name"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-slate-700 text-sm font-semibold"
                >
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
                      className="h-11 bg-white text-slate-800 border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                      autoComplete="email"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-slate-700 text-sm font-semibold"
                >
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
                        placeholder="Mínimo 6 caracteres"
                        {...field}
                        required
                        className="h-11 bg-white text-slate-800 border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-slate-700 text-sm font-semibold"
                >
                  Confirmar Senha
                </Label>
                <Controller
                  name="confirmPassword"
                  control={form.control}
                  render={({ field }) => (
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Digite a senha novamente"
                        {...field}
                        required
                        className="h-11 bg-white text-slate-800 border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all duration-200"
              >
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>

            <div className="space-y-4 pt-4 border-t border-slate-200">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full h-11 bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
