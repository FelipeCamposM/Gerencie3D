import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Color {
  nome: string;
  hex: string;
}

const CORES_PREDEFINIDAS: Color[] = [
  { nome: "Preto", hex: "#000000" },
  { nome: "Branco", hex: "#FFFFFF" },
  { nome: "Vermelho", hex: "#FF0000" },
  { nome: "Azul", hex: "#0000FF" },
  { nome: "Verde", hex: "#00FF00" },
  { nome: "Amarelo", hex: "#FFFF00" },
  { nome: "Laranja", hex: "#FFA500" },
  { nome: "Rosa", hex: "#FFC0CB" },
  { nome: "Roxo", hex: "#800080" },
  { nome: "Cinza", hex: "#808080" },
  { nome: "Marrom", hex: "#A52A2A" },
  { nome: "Bege", hex: "#F5F5DC" },
  { nome: "Dourado", hex: "#FFD700" },
  { nome: "Prateado", hex: "#C0C0C0" },
  { nome: "Transparente", hex: "#F0F0F0" },
];

interface ColorPickerProps {
  selectedColor: string;
  colorName: string;
  onColorSelect: (nome: string, hex: string) => void;
  onColorChange: (hex: string) => void;
  onColorNameChange: (nome: string) => void;
  idPrefix?: string;
}

export default function ColorPicker({
  selectedColor,
  colorName,
  onColorSelect,
  onColorChange,
  onColorNameChange,
  idPrefix = "",
}: ColorPickerProps) {
  return (
    <>
      <div>
        <Label>Selecione uma cor pré-definida</Label>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {CORES_PREDEFINIDAS.map((cor) => (
            <button
              key={cor.nome}
              type="button"
              onClick={() => onColorSelect(cor.nome, cor.hex)}
              className={`flex flex-col items-center p-2 rounded border-2 hover:border-slate-500 transition-colors ${
                selectedColor === cor.hex
                  ? "border-slate-600 bg-slate-50 ring-2 ring-slate-300"
                  : "border-slate-200"
              }`}
            >
              <div
                className="w-10 h-10 rounded-full border-2 border-gray-400"
                style={{ backgroundColor: cor.hex }}
              />
              <span className="text-xs mt-1 text-center">{cor.nome}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${idPrefix}nomeCor`}>Nome da Cor</Label>
          <Input
            id={`${idPrefix}nomeCor`}
            value={colorName}
            onChange={(e) => onColorNameChange(e.target.value)}
            placeholder="Ex: Vermelho Vivo"
            required
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}cor`}>Cor (Hexadecimal)</Label>
          <div className="flex gap-2">
            <Input
              id={`${idPrefix}cor`}
              type="color"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
        <Label>Prévia da Cor Selecionada</Label>
        <div className="flex items-center gap-4 mt-2">
          <div
            className="w-24 h-24 rounded-lg border-4 border-slate-400 shadow-lg"
            style={{ backgroundColor: selectedColor }}
          />
          <div>
            <p className="font-semibold text-slate-800">
              {colorName || "Sem nome"}
            </p>
            <p className="text-sm text-slate-600">{selectedColor}</p>
          </div>
        </div>
      </div>
    </>
  );
}
