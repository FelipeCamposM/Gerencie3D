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
import { Eye, EyeOff, Lock } from "lucide-react";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordModal({ open, onOpenChange }: ChangePasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const form = useForm<ChangePasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsLoading(true);
    setMessage(null);

    // Validar se as senhas coincidem
    if (data.newPassword !== data.confirmPassword) {
      setMessage("A nova senha e a confirmação não coincidem");
      setMessageType('error');
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
        setMessage("Senha alterada com sucesso!");
        setMessageType('success');
        
        // Limpar formulário
        form.reset();
        
        // Fechar modal após 2 segundos
        setTimeout(() => {
          onOpenChange(false);
          setMessage(null);
        }, 2000);
      } else {
        setMessage(result.error || "Erro ao alterar senha");
        setMessageType('error');
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setMessage("Erro de conexão. Tente novamente.");
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setMessage(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lock className="h-5 w-5" />
            Alterar Senha
          </DialogTitle>
        </DialogHeader>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              messageType === 'success'
                ? 'bg-green-900/20 border border-green-700/30 text-green-400'
                : 'bg-red-900/20 border border-red-700/30 text-red-400'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Senha Atual */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-white">
              Senha Atual
            </Label>
            <div className="relative">
              <Controller
                name="currentPassword"
                control={form.control}
                rules={{ required: "Senha atual é obrigatória" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Digite sua senha atual"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                    required
                  />
                )}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-white">
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
                    message: "A senha deve ter pelo menos 6 caracteres"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                    required
                  />
                )}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirmar Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">
              Confirmar Nova Senha
            </Label>
            <div className="relative">
              <Controller
                name="confirmPassword"
                control={form.control}
                rules={{ required: "Confirmação de senha é obrigatória" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                    required
                  />
                )}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span className="ml-1 text-sm text-slate-300">A senha deve ter pelo menos 6 caracteres</span>
          </div>

          <DialogFooter className="flex flex-row gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="secondary"
              className="bg-slate-600 hover:bg-slate-700 text-white"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Alterando...
                </div>
              ) : (
                "Alterar Senha"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
