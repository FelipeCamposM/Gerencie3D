import { ChevronUp, ChevronDown } from "lucide-react";

interface OrderBtnProps {
  label: string;
  columnKey: string;
  activeSort: { column: string; direction: "asc" | "desc" }[];
  onSort: (column: string, direction: "asc" | "desc") => void;
  onClearSort: (column: string) => void;
}

export default function OrderBtn({ label, columnKey, activeSort, onSort, onClearSort }: OrderBtnProps) {
    const sortObj = activeSort.find(s => s.column === columnKey);
    const isActive = !!sortObj;

    // Função para alternar ordenação ou limpar se já estiver ativa
    const handleToggle = (dir: "asc" | "desc") => {
        if (isActive && sortObj?.direction === dir) {
        onClearSort(columnKey);
        } else {
        onSort(columnKey, dir);
        }
    };

return (
    <div className="flex items-center gap-2 cursor-pointer">
        <span>{label}</span>
        <div className="flex flex-col">
            <ChevronUp
            className={`transition-all ${isActive && sortObj?.direction === "asc" ? "text-blue-400" : "hover:text-blue-500"}`}
            onClick={() => handleToggle("asc")}
            style={{ width: "15px", height: "15px", strokeWidth: "4px" }}
            />
            <ChevronDown
            className={`transition-all ${isActive && sortObj?.direction === "desc" ? "text-blue-400" : "hover:text-blue-500"}`}
            onClick={() => handleToggle("desc")}
            style={{ width: "15px", height: "15px", strokeWidth: "4px" }}
            />
        </div>
    </div>
);
}