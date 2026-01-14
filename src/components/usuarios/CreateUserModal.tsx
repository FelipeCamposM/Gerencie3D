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
  Select as CustomSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { UserPlus } from "lucide-react";
import { CreateUserForm } from "./types";
import { PermissionsSelect } from "./PermissionsSelect";

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
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <UserPlus className="h-5 w-5" />
            Cadastrar Novo Usuário
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="text-slate-300 mb-2">
                Nome
              </Label>
              <Input
                id="first_name"
                value={form.primeiroNome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, primeiroNome: e.target.value }))
                }
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name" className="text-slate-300 mb-2">
                Sobrenome
              </Label>
              <Input
                id="last_name"
                value={form.ultimoNome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ultimoNome: e.target.value }))
                }
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-slate-300 mb-2">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-slate-300 mb-2">
              Cargo
            </Label>
            <Input
              id="role"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          <div className="space-y-6">
            <PermissionsSelect
              selectedPermissions={form.permissions || []}
              onPermissionsChange={(permissions) =>
                setForm((f) => ({ ...f, permissions }))
              }
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-slate-300 mb-2">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-slate-700 border-slate-600 text-slate-300"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
