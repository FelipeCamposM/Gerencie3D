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
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-5 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-5 w-5 text-blue-600" />
            <Label
              htmlFor={`${idPrefix}tipo`}
              className="text-slate-800 font-bold text-sm"
            >
              Tipo de Filamento
            </Label>
          </div>
          <Select
            value={formData.tipo}
            onValueChange={(value) => onChange({ ...formData, tipo: value })}
          >
            <SelectTrigger className="bg-white border-slate-300 text-slate-800 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              {TIPOS_FILAMENTOS.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Peso Inicial */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="h-5 w-5 text-green-600" />
            <Label
              htmlFor={`${idPrefix}pesoInicial`}
              className="text-slate-800 font-bold text-sm"
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
            className="bg-white border-slate-300 text-slate-800 shadow-sm"
            required
          />
        </div>

        {/* Preço de Compra */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <Label
              htmlFor={`${idPrefix}precoCompra`}
              className="text-slate-800 font-bold text-sm"
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
            className="bg-white border-slate-300 text-slate-800 font-medium shadow-sm"
            placeholder="R$ 0,00"
            required
          />
        </div>
      </div>

      {/* Seção Cor */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-5 rounded-xl border border-cyan-100">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-5 w-5 text-cyan-600" />
          <h3 className="text-slate-800 font-bold text-base">
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
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl border border-yellow-100">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-5 w-5 text-yellow-600" />
            <Label
              htmlFor="compradorId"
              className="text-slate-800 font-bold text-base"
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
            <SelectTrigger className="bg-white border-slate-300 text-slate-800 shadow-sm">
              <SelectValue placeholder="Selecione o comprador" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              {usuarios.map((usuario) => (
                <SelectItem key={usuario.id} value={usuario.id.toString()}>
                  {usuario.primeiroNome} {usuario.ultimoNome}
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
          className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isEdit ? "Salvar Alterações" : "Criar Filamento"}
        </Button>
      </div>
    </form>
  );
}
