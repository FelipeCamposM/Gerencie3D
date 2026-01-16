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
    <Card className="bg-white border-slate-200 mb-6 shadow-sm">
      <CardHeader className="px-[20px]">
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          Filtros e Ações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <div className="relative mb-2">
              <Label htmlFor="search" className="text-slate-700 font-semibold">
                Buscar usuários
              </Label>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-[10px] h-4 w-4 text-slate-400" />
              <Input
                id="search"
                placeholder="Nome, email, cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <div className="mb-2">
              <Label className="text-slate-700 font-semibold">
                Filtrar por nível
              </Label>
            </div>
            <CustomSelect
              value={selectedLevel}
              onValueChange={setSelectedLevel}
            >
              <SelectTrigger className="relative bg-white border-slate-300 text-slate-800 px-2 w-full flex justify-between">
                <SelectValue className="px-4" placeholder="Todos os níveis" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all" className="text-slate-800">
                  Todos os níveis
                </SelectItem>
                <SelectItem value="admin" className="text-slate-800">
                  Administrador
                </SelectItem>
                <SelectItem value="user" className="text-slate-800">
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
