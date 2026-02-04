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
      <div className="mb-4">
        <Label className="text-slate-800 font-black text-sm uppercase tracking-wide mb-3 block">
          Selecione uma cor pré-definida
        </Label>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-2">
          {CORES_PREDEFINIDAS.map((cor) => (
            <button
              key={cor.nome}
              type="button"
              onClick={() => onColorSelect(cor.nome, cor.hex)}
              className={`group flex flex-col items-center p-3 rounded-xl border-2 hover:border-blue-400 transition-all hover:shadow-lg hover:-translate-y-1 ${
                selectedColor === cor.hex
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-300 shadow-lg shadow-blue-500/30"
                  : "border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:from-blue-50 hover:to-slate-50"
              }`}
            >
              <div
                className="w-12 h-12 rounded-xl border-3 border-slate-300 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200"
                style={{ backgroundColor: cor.hex }}
              />
              <span className="text-xs mt-2 text-center text-slate-700 font-bold">
                {cor.nome}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border-2 border-slate-200 shadow-md">
          <Label
            htmlFor={`${idPrefix}nomeCor`}
            className="text-slate-800 font-black text-sm uppercase tracking-wide"
          >
            Nome da Cor
          </Label>
          <Input
            id={`${idPrefix}nomeCor`}
            value={colorName}
            onChange={(e) => onColorNameChange(e.target.value)}
            placeholder="Ex: Vermelho Vivo"
            className="bg-white border-2 border-slate-300 text-slate-800 mt-2 font-semibold hover:border-blue-400 transition-colors shadow-sm"
            required
          />
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border-2 border-slate-200 shadow-md">
          <Label
            htmlFor={`${idPrefix}cor`}
            className="text-slate-800 font-black text-sm uppercase tracking-wide"
          >
            Cor (Hexadecimal)
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id={`${idPrefix}cor`}
              type="color"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-20 h-11 cursor-pointer rounded-lg border-2 border-slate-300 shadow-md hover:scale-105 transition-transform"
            />
            <Input
              type="text"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              placeholder="#000000"
              className="flex-1 bg-white border-2 border-slate-300 text-slate-800 font-mono font-bold hover:border-blue-400 transition-colors shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-indigo-200 shadow-xl">
        <Label className="text-slate-800 font-black text-base uppercase tracking-wide flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse"></div>
          Prévia da Cor Selecionada
        </Label>
        <div className="flex items-center gap-5 mt-4 bg-white/60 p-4 rounded-xl">
          <div
            className="w-28 h-28 rounded-2xl border-4 border-white shadow-2xl ring-4 ring-slate-200 hover:scale-105 transition-transform duration-200"
            style={{ backgroundColor: selectedColor }}
          />
          <div>
            <p className="font-black text-slate-800 text-xl mb-2">
              {colorName || "Sem nome"}
            </p>
            <p className="text-base text-slate-700 font-mono font-bold bg-slate-100 px-3 py-1.5 rounded-lg inline-block shadow-sm">
              {selectedColor}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
