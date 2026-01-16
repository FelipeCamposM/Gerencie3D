import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  ShieldCheck,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import { CreateUserForm } from "./types";

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (form: CreateUserForm) => Promise<boolean>;
}

export function CreateUserModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateUserModalProps) {
  const [form, setForm] = useState<CreateUserForm>({
    primeiroNome: "",
    ultimoNome: "",
    role: "",
    email: "",
    password: "",
    permissions: [],
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(form);
    if (success) {
      setForm({
        primeiroNome: "",
        ultimoNome: "",
        role: "",
        email: "",
        password: "",
        permissions: [],
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800 text-xl">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Cadastrar Novo Usuário
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção de Informações Pessoais */}
          <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-slate-700">
                Informações Pessoais
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="first_name"
                  className="text-slate-700 flex items-center gap-2 mb-2"
                >
                  <User className="h-4 w-4 text-blue-600" />
                  Nome
                </Label>
                <Input
                  id="first_name"
                  value={form.primeiroNome}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, primeiroNome: e.target.value }))
                  }
                  className="bg-white border-slate-300 text-slate-800"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="last_name"
                  className="text-slate-700 flex items-center gap-2 mb-2"
                >
                  <User className="h-4 w-4 text-blue-600" />
                  Sobrenome
                </Label>
                <Input
                  id="last_name"
                  value={form.ultimoNome}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ultimoNome: e.target.value }))
                  }
                  className="bg-white border-slate-300 text-slate-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* Seção de Credenciais */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-purple-600" />
              <h4 className="font-semibold text-slate-700">Credenciais</h4>
            </div>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="email"
                  className="text-slate-700 flex items-center gap-2 mb-2"
                >
                  <Mail className="h-4 w-4 text-purple-600" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="bg-white border-slate-300 text-slate-800"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="text-slate-700 flex items-center gap-2 mb-2"
                >
                  <Lock className="h-4 w-4 text-purple-600" />
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    className="bg-white border-slate-300 text-slate-800 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Permissões */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-slate-700">Cargo</h4>
            </div>
            <div className="space-y-4">
              <div>
                <Select
                  value={form.role}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, role: value }))
                  }
                >
                  <SelectTrigger className="bg-white border-slate-300 text-slate-800 w-full">
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="admin" className="text-slate-800">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-red-600" />
                        Administrador
                      </div>
                    </SelectItem>
                    <SelectItem value="user" className="text-slate-800">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        Usuário
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
