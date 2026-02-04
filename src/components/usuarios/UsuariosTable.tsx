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
import { Button } from "../ui/button";
import { Edit2, Trash2, Mail, UserPlus } from "lucide-react";
import { Usuario } from "./types";
import { getInitials } from "./utils";
import { useAuth } from "@/contexts/AuthContext";
import { isUserAdmin } from "@/lib/auth";

interface UsuariosTableProps {
  usuarios: Usuario[];
  onEditUser: (usuario: Usuario) => void;
  onDeleteUser: (id: string) => void;
  onCreateUser: () => void;
}

export function UsuariosTable({
  usuarios,
  onEditUser,
  onDeleteUser,
  onCreateUser,
}: UsuariosTableProps) {
  const { user } = useAuth();
  const isAdmin = isUserAdmin(user);

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-6">
        <div>
          <CardTitle className="text-slate-800 font-black text-xl">
            Lista de Usuários ({usuarios.length})
          </CardTitle>
          <CardDescription className="text-slate-600 font-medium mt-1">
            Gerencie todos os usuários do sistema
          </CardDescription>
        </div>
        <Button
          onClick={onCreateUser}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white h-10 px-6 shadow-lg shadow-blue-500/30 hover:shadow-xl font-bold hover:-translate-y-0.5 transition-all border-0"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </CardHeader>
      <CardContent className="px-6">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-50">
              <TableHead className="text-slate-800 font-black text-sm uppercase tracking-wide pl-15">
                Usuário
              </TableHead>
              <TableHead className="text-slate-800 font-black text-sm uppercase tracking-wide hidden md:table-cell">
                Contato
              </TableHead>
              <TableHead className="text-slate-800 font-black text-sm uppercase tracking-wide">
                Cargo
              </TableHead>
              <TableHead className="text-slate-800 font-black text-sm uppercase tracking-wide text-right pr-12">
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
                      <Avatar className="h-10 w-10 ring-2 ring-blue-200">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black border-2 border-blue-400 shadow-md">
                          {getInitials(
                            usuario.primeiroNome,
                            usuario.ultimoNome
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-slate-800">
                          {usuario.primeiroNome} {usuario.ultimoNome}
                        </p>
                        <p className="text-sm text-slate-500 font-medium">
                          ID: {String(usuario.id).slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">{usuario.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-slate-700 font-medium">{usuario.role}</p>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditUser(usuario)}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 text-blue-700 hover:from-blue-100 hover:to-indigo-100 font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteUser(String(usuario.id))}
                          className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 text-red-600 hover:from-red-100 hover:to-rose-100 font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
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
