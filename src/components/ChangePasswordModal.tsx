"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordModal({
  open,
  onOpenChange,
}: ChangePasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    console.log("Form submitted with data:", data);
    setIsLoading(true);

    // Validar se as senhas coincidem
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Senhas não coincidem", {
        description: "A nova senha e a confirmação devem ser iguais",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/usuarios/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Senha alterada com sucesso!", {
          description: "Sua senha foi atualizada",
        });

        // Limpar formulário
        form.reset();

        // Fechar modal após 1 segundo
        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      } else {
        toast.error("Erro ao alterar senha", {
          description: result.error || "Verifique os dados e tente novamente",
        });
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      toast.error("Erro de conexão", {
        description: "Não foi possível conectar ao servidor",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
            <Lock className="h-5 w-5 text-blue-600" />
            Alterar Senha
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            console.log("Form onSubmit disparado!");
            e.preventDefault();
            form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-4 mt-4"
        >
          {/* Senha Atual */}
          <div className="space-y-2">
            <Label
              htmlFor="currentPassword"
              className="text-slate-700 flex items-center gap-2"
            >
              <Lock className="h-4 w-4 text-blue-600" />
              Senha Atual
            </Label>
            <div className="relative">
              <Controller
                name="currentPassword"
                control={form.control}
                rules={{ required: "Senha atual é obrigatória" }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Input
                      {...field}
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Digite sua senha atual"
                      className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 pr-10"
                    />
                    {error && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {error.message}
                      </p>
                    )}
                  </>
                )}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Nova Senha */}
          <div className="space-y-2">
            <Label
              htmlFor="newPassword"
              className="text-slate-700 flex items-center gap-2"
            >
              <Lock className="h-4 w-4 text-green-600" />
              Nova Senha
            </Label>
            <div className="relative">
              <Controller
                name="newPassword"
                control={form.control}
                rules={{
                  required: "Nova senha é obrigatória",
                  minLength: {
                    value: 6,
                    message: "A senha deve ter pelo menos 6 caracteres",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Input
                      {...field}
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Digite sua nova senha"
                      className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 pr-10"
                    />
                    {error && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {error.message}
                      </p>
                    )}
                  </>
                )}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Mínimo de 6 caracteres
            </p>
          </div>

          {/* Confirmar Nova Senha */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-slate-700 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
              Confirmar Nova Senha
            </Label>
            <div className="relative">
              <Controller
                name="confirmPassword"
                control={form.control}
                rules={{ required: "Confirmação de senha é obrigatória" }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Input
                      {...field}
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua nova senha"
                      className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 pr-10"
                    />
                    {error && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {error.message}
                      </p>
                    )}
                  </>
                )}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-2 justify-center pt-4">
            <Button
              type="button"
              variant="outline"
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Alterando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Alterar Senha
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
