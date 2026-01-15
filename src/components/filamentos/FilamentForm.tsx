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

  const idPrefix = isEdit ? "edit-" : "";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label
          htmlFor={`${idPrefix}tipo`}
          className="text-slate-700 font-semibold"
        >
          Tipo de Filamento
        </Label>
        <Select
          value={formData.tipo}
          onValueChange={(value) => onChange({ ...formData, tipo: value })}
        >
          <SelectTrigger className="bg-white border-slate-300 text-slate-800 mt-1">
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

      <ColorPicker
        selectedColor={formData.cor}
        colorName={formData.nomeCor}
        onColorSelect={handleCorPredefinidaSelect}
        onColorChange={(hex) => onChange({ ...formData, cor: hex })}
        onColorNameChange={(nome) => onChange({ ...formData, nomeCor: nome })}
        idPrefix={idPrefix}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor={`${idPrefix}pesoInicial`}
            className="text-slate-700 font-semibold"
          >
            Peso Inicial (g)
          </Label>
          <Input
            id={`${idPrefix}pesoInicial`}
            type="number"
            step="0.01"
            value={formData.pesoInicial}
            onChange={(e) =>
              onChange({ ...formData, pesoInicial: e.target.value })
            }
            className="bg-white border-slate-300 text-slate-800 mt-1"
            required
          />
        </div>
        <div>
          <Label
            htmlFor={`${idPrefix}precoCompra`}
            className="text-slate-700 font-semibold"
          >
            Preço de Compra (R$)
          </Label>
          <Input
            id={`${idPrefix}precoCompra`}
            type="number"
            step="0.01"
            value={formData.precoCompra}
            onChange={(e) =>
              onChange({ ...formData, precoCompra: e.target.value })
            }
            className="bg-white border-slate-300 text-slate-800 mt-1"
            required
          />
        </div>
      </div>

      {!isEdit && (
        <div>
          <Label htmlFor="compradorId" className="text-slate-700 font-semibold">
            Comprador
          </Label>
          <Select
            value={formData.compradorId}
            onValueChange={(value) =>
              onChange({ ...formData, compradorId: value })
            }
          >
            <SelectTrigger className="bg-white border-slate-300 text-slate-800 mt-1">
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

      <div className="flex justify-end gap-2 pt-4">
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
