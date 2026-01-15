import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Edit2,
  Trash2,
  Mail,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Circle,
  BadgeCent,
  UserPlus,
  Store,
} from "lucide-react";
import { Usuario } from "./types";
import {
  getInitials,
  getLevelBadgeClass,
  getLevelBadgeStyle,
  getLevelBadgeConfig,
} from "./utils";
import { UserPermissionsBadge } from "./UserPermissionsBadge";
import { useAuth } from "@/contexts/AuthContext";
import { isUserAdmin } from "@/lib/auth";

interface UsuariosTableProps {
  usuarios: Usuario[];
  onEditUser: (usuario: Usuario) => void;
  onDeleteUser: (id: string) => void;
  onCreateUser: () => void;
}

const getLevelIcon = (level?: string | null) => {
  const iconProps = { size: 14, className: "mr-1" };

  switch ((level || "").toLowerCase()) {
    case "adm":
      return <ShieldCheck {...iconProps} />;
    case "vendas":
      return <ShoppingCart {...iconProps} />;
    case "financeiro":
      return <BadgeCent {...iconProps} />;
    case "logistica":
      return <Truck {...iconProps} />;
    case "marketplace":
      return <Store {...iconProps} />;
    default:
      return <Circle {...iconProps} />;
  }
};

export function UsuariosTable({
  usuarios,
  onEditUser,
  onDeleteUser,
  onCreateUser,
}: UsuariosTableProps) {
  const { user } = useAuth();
  const isAdmin = isUserAdmin(user);

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-slate-800">
            Lista de Usuários ({usuarios.length})
          </CardTitle>
          <CardDescription className="text-slate-600">
            Gerencie todos os usuários do sistema
          </CardDescription>
        </div>
        <Button
          onClick={onCreateUser}
          className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-slate-50">
              <TableHead className="text-slate-700 font-semibold pl-15">
                Usuário
              </TableHead>
              <TableHead className="text-slate-700 font-semibold">
                Contato
              </TableHead>
              <TableHead className="text-slate-700 font-semibold">
                Cargo
              </TableHead>
              <TableHead className="text-slate-700 font-semibold">
                Permissões
              </TableHead>
              <TableHead className="text-slate-700 font-semibold text-right pr-12">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-slate-500"
                >
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((usuario) => (
                <TableRow
                  key={usuario.id}
                  className="border-slate-200 hover:bg-slate-50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-500/10 text-blue-600 font-semibold border border-blue-200">
                          {getInitials(
                            usuario.primeiroNome,
                            usuario.ultimoNome
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-800">
                          {usuario.primeiroNome} {usuario.ultimoNome}
                        </p>
                        <p className="text-sm text-slate-500">
                          ID: {String(usuario.id).slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">{usuario.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-slate-700 font-medium">{usuario.role}</p>
                  </TableCell>
                  <TableCell>
                    <UserPermissionsBadge
                      permissions={usuario.permissions || []}
                    />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditUser(usuario)}
                        className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteUser(String(usuario.id))}
                          className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
