import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select as CustomSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../ui/select';
import { Filter, Search } from 'lucide-react';

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
  setSelectedLevel
}: UsuariosControlsProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 mb-6">
      <CardHeader className='px-[20px]'>
        <CardTitle className="text-white flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros e Ações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <div className="relative ml-4 mb-2">
              <Label htmlFor="search" className="text-slate-300 ml-1">Buscar usuários</Label>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-[10px] h-4 w-4 text-slate-400 ml-4" />
              <Input
                id="search"
                placeholder="Nome, email, cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ml-4"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48 ml-4">
            <div className="mb-2 ml-1">
              <Label className="text-slate-300">Filtrar por nível</Label>
            </div>
            <CustomSelect value={selectedLevel} onValueChange={setSelectedLevel}>
              <div className="px-0 mr-4">
                <SelectTrigger className="relative bg-slate-700 border-slate-600 text-white px-2 w-full flex justify-between">
                  <SelectValue className="px-4" placeholder="Todos os níveis" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">Todos os níveis</SelectItem>
                  <SelectItem value="adm" className="text-white">Administrador</SelectItem>
                  <SelectItem value="vendas" className="text-white">Vendas</SelectItem>
                  <SelectItem value="financeiro" className="text-white">Financeiro</SelectItem>
                  <SelectItem value="logistica" className="text-white">Logística</SelectItem>
                  <SelectItem value="marketplace" className="text-white">Marketplace</SelectItem>
                </SelectContent>
              </div>
            </CustomSelect>
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
}
