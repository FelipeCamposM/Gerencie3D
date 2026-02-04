import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select as CustomSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Filter, Search } from "lucide-react";

interface UsuariosControlsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedLevel: string;
  setSelectedLevel: (value: string) => void;
}

export function UsuariosControls({
  searchTerm,
  setSearchTerm,
  selectedLevel,
  setSelectedLevel,
}: UsuariosControlsProps) {
  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 mb-6 shadow-xl hover:shadow-2xl transition-shadow">
      <CardHeader className="px-6">
        <CardTitle className="text-slate-800 flex items-center gap-3 font-black text-lg">
          <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <Filter className="h-5 w-5 text-white" />
          </div>
          Filtros e Ações
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <div className="relative mb-2">
              <Label
                htmlFor="search"
                className="text-slate-800 font-black text-sm uppercase tracking-wide"
              >
                Buscar usuários
              </Label>
            </div>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-focus-within:scale-110 transition-transform duration-200">
                <Search className="h-4.5 w-4.5 text-white" />
              </div>
              <Input
                id="search"
                placeholder="Nome, email, cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 bg-gradient-to-r from-white to-slate-50 border-2 border-slate-300 text-slate-800 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <div className="mb-2">
              <Label className="text-slate-800 font-black text-sm uppercase tracking-wide">
                Filtrar por nível
              </Label>
            </div>
            <CustomSelect
              value={selectedLevel}
              onValueChange={setSelectedLevel}
            >
              <SelectTrigger className="relative bg-white border-2 border-slate-300 text-slate-800 px-2 w-full flex justify-between font-semibold shadow-sm hover:border-blue-400 transition-colors">
                <SelectValue className="px-4" placeholder="Todos os níveis" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-slate-200 shadow-xl">
                <SelectItem
                  value="all"
                  className="text-slate-800 font-semibold"
                >
                  Todos os níveis
                </SelectItem>
                <SelectItem
                  value="admin"
                  className="text-slate-800 font-semibold"
                >
                  Administrador
                </SelectItem>
                <SelectItem
                  value="user"
                  className="text-slate-800 font-semibold"
                >
                  Usuário
                </SelectItem>
              </SelectContent>
            </CustomSelect>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
