import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="mb-6">
      <div className="relative max-w-md group">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-focus-within:scale-110 transition-transform duration-200">
          <Search className="h-5 w-5 text-white" />
        </div>
        <input
          type="text"
          placeholder="Pesquisar por projeto, impressora ou usuário..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-16 pr-12 py-4 bg-gradient-to-r from-white to-slate-50 border-2 border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-lg flex items-center justify-center text-white shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
