import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ColorPicker from "./ColorPicker";
import { Usuario } from "@/types/filamento";
import { useCurrencyInput } from "@/utils/currencyInput";
import { Palette, Scale, DollarSign, User, Layers } from "lucide-react";

const TIPOS_FILAMENTOS = [
  "PLA",
  "ABS",
  "PETG",
  "TPU",
  "Nylon",
  "ASA",
  "PC",
  "PVA",
  "HIPS",
  "Outro",
];

interface FilamentFormData {
  tipo: string;
  nomeCor: string;
  cor: string;
  pesoInicial: string;
  precoCompra: string;
  compradorId: string;
}

interface FilamentFormProps {
  formData: FilamentFormData;
  usuarios: Usuario[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (data: FilamentFormData) => void;
  isEdit?: boolean;
}

export default function FilamentForm({
  formData,
  usuarios,
  onSubmit,
  onCancel,
  onChange,
  isEdit = false,
}: FilamentFormProps) {
  const handleCorPredefinidaSelect = (nome: string, hex: string) => {
    onChange({ ...formData, nomeCor: nome, cor: hex });
  };

  // Hook para entrada monetária do preço de compra
  const precoCompraInput = useCurrencyInput({
    onChange: (valorEmReais) => {
      onChange({ ...formData, precoCompra: valorEmReais });
    },
    initialValue: parseFloat(formData.precoCompra) || 0,
  });

  const idPrefix = isEdit ? "edit-" : "";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Seção Tipo e Informações de Compra */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tipo de Filamento */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 rounded-xl border-2 border-blue-100/60 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <Layers className="h-4.5 w-4.5 text-white" />
            </div>
            <Label
              htmlFor={`${idPrefix}tipo`}
              className="text-slate-800 font-black text-sm uppercase tracking-wide"
            >
              Tipo de Filamento
            </Label>
          </div>
          <Select
            value={formData.tipo}
            onValueChange={(value) => onChange({ ...formData, tipo: value })}
          >
            <SelectTrigger className="bg-white border-2 border-blue-200 text-slate-800 shadow-sm hover:border-blue-400 transition-colors font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-slate-200 shadow-xl">
              {TIPOS_FILAMENTOS.map((tipo) => (
                <SelectItem key={tipo} value={tipo} className="font-semibold">
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Peso Inicial */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 p-5 rounded-xl border-2 border-green-100/60 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
              <Scale className="h-4.5 w-4.5 text-white" />
            </div>
            <Label
              htmlFor={`${idPrefix}pesoInicial`}
              className="text-slate-800 font-black text-sm uppercase tracking-wide"
            >
              Peso Inicial (g)
            </Label>
          </div>
          <Input
            id={`${idPrefix}pesoInicial`}
            type="number"
            inputMode="decimal"
            step="0.01"
            value={formData.pesoInicial}
            onChange={(e) =>
              onChange({ ...formData, pesoInicial: e.target.value })
            }
            className="bg-white border-2 border-green-200 text-slate-800 shadow-sm hover:border-green-400 transition-colors font-semibold"
            required
          />
        </div>

        {/* Preço de Compra */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 p-5 rounded-xl border-2 border-purple-100/60 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
              <DollarSign className="h-4.5 w-4.5 text-white" />
            </div>
            <Label
              htmlFor={`${idPrefix}precoCompra`}
              className="text-slate-800 font-black text-sm uppercase tracking-wide"
            >
              Preço de Compra
            </Label>
          </div>
          <Input
            id={`${idPrefix}precoCompra`}
            type="text"
            inputMode="numeric"
            value={precoCompraInput.valorFormatado}
            onChange={precoCompraInput.handleChange}
            onKeyDown={precoCompraInput.handleKeyDown}
            className="bg-white border-2 border-purple-200 text-slate-800 font-bold shadow-sm hover:border-purple-400 transition-colors"
            placeholder="R$ 0,00"
            required
          />
        </div>
      </div>

      {/* Seção Cor */}
      <div className="bg-gradient-to-br from-cyan-50 to-sky-50/50 p-5 rounded-xl border-2 border-cyan-100/60 shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-lg flex items-center justify-center shadow-md">
            <Palette className="h-4.5 w-4.5 text-white" />
          </div>
          <h3 className="text-slate-800 font-black text-base uppercase tracking-wide">
            Cor do Filamento
          </h3>
        </div>
        <ColorPicker
          selectedColor={formData.cor}
          colorName={formData.nomeCor}
          onColorSelect={handleCorPredefinidaSelect}
          onColorChange={(hex) => onChange({ ...formData, cor: hex })}
          onColorNameChange={(nome) => onChange({ ...formData, nomeCor: nome })}
          idPrefix={idPrefix}
        />
      </div>

      {/* Seção Comprador */}
      {!isEdit && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50/50 p-5 rounded-xl border-2 border-yellow-100/60 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
              <User className="h-4.5 w-4.5 text-white" />
            </div>
            <Label
              htmlFor="compradorId"
              className="text-slate-800 font-black text-base uppercase tracking-wide"
            >
              Comprador
            </Label>
          </div>
          <Select
            value={formData.compradorId}
            onValueChange={(value) =>
              onChange({ ...formData, compradorId: value })
            }
          >
            <SelectTrigger className="bg-white border-2 border-yellow-200 text-slate-800 shadow-sm hover:border-yellow-400 transition-colors font-semibold">
              <SelectValue placeholder="Selecione o comprador" />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-slate-200 shadow-xl">
              {usuarios.map((usuario) => (
                <SelectItem
                  key={usuario.id}
                  value={usuario.id.toString()}
                  className="font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 ring-2 ring-cyan-200">
                      {usuario.imagemUsuario &&
                      usuario.imagemUsuario.length > 0 ? (
                        <AvatarImage
                          src={`data:image/jpeg;base64,${usuario.imagemUsuario}`}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-sky-600 text-white flex items-center justify-center">
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {usuario.primeiroNome} {usuario.ultimoNome}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-300 text-slate-700 hover:from-slate-100 hover:to-slate-200 shadow-md hover:shadow-lg transition-all font-bold hover:-translate-y-0.5"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all font-bold hover:-translate-y-0.5 border-0"
        >
          {isEdit ? "Salvar Alterações" : "Criar Filamento"}
        </Button>
      </div>
    </form>
  );
}
