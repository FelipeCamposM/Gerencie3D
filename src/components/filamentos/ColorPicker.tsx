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
        <Label className="text-slate-700 font-semibold">
          Selecione uma cor pré-definida
        </Label>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {CORES_PREDEFINIDAS.map((cor) => (
            <button
              key={cor.nome}
              type="button"
              onClick={() => onColorSelect(cor.nome, cor.hex)}
              className={`flex flex-col items-center p-3 rounded-lg border-2 hover:border-blue-400 transition-all hover:shadow-md ${
                selectedColor === cor.hex
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className="w-10 h-10 rounded-full border-2 border-slate-300 shadow-sm"
                style={{ backgroundColor: cor.hex }}
              />
              <span className="text-xs mt-1 text-center text-slate-700 font-medium">
                {cor.nome}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor={`${idPrefix}nomeCor`}
            className="text-slate-700 font-semibold"
          >
            Nome da Cor
          </Label>
          <Input
            id={`${idPrefix}nomeCor`}
            value={colorName}
            onChange={(e) => onColorNameChange(e.target.value)}
            placeholder="Ex: Vermelho Vivo"
            className="bg-white border-slate-300 text-slate-800 mt-1"
            required
          />
        </div>
        <div>
          <Label
            htmlFor={`${idPrefix}cor`}
            className="text-slate-700 font-semibold"
          >
            Cor (Hexadecimal)
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              id={`${idPrefix}cor`}
              type="color"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-20 h-10 cursor-pointer"
            />
            <Input
              type="text"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              placeholder="#000000"
              className="flex-1 bg-white border-slate-300 text-slate-800"
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-lg border-2 border-slate-200 shadow-sm">
        <Label className="text-slate-700 font-semibold">
          Prévia da Cor Selecionada
        </Label>
        <div className="flex items-center gap-4 mt-3">
          <div
            className="w-24 h-24 rounded-xl border-4 border-slate-300 shadow-lg"
            style={{ backgroundColor: selectedColor }}
          />
          <div>
            <p className="font-bold text-slate-800 text-lg">
              {colorName || "Sem nome"}
            </p>
            <p className="text-sm text-slate-600 font-mono">{selectedColor}</p>
          </div>
        </div>
      </div>
    </>
  );
}
