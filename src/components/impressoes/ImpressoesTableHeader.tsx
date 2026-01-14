import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import OrderBtn from "@/components/orderBtn";
import { SortColumn } from "@/types/solicitacao";

interface SolicitacoesTableHeaderProps {
  sortColumns: SortColumn[];
  onSort: (column: string, direction: "asc" | "desc") => void;
  onClearSort: (column: string) => void;
  // Selection
  allSelected?: boolean;
  onToggleSelectAll?: (checked: boolean) => void;
  showSelection?: boolean;
}

export const SolicitacoesTableHeader: React.FC<SolicitacoesTableHeaderProps> = ({
  sortColumns,
  onSort,
  onClearSort,
  allSelected,
  onToggleSelectAll,
  showSelection = false,
}) => {
  return (
    <TableHeader>
      <TableRow className="border-slate-700 hover:bg-slate-700/30">
        {showSelection && (
          <TableHead className="w-8 text-slate-300">
            <Checkbox
              className="data-[state=checked]:bg-red-600"
              checked={allSelected}
              onCheckedChange={(v) => onToggleSelectAll?.(!!v)}
              aria-label="Selecionar tudo"
            />
          </TableHead>
        )}
        <TableHead className="text-slate-300 justify-center flex">
          <OrderBtn
            label="ID"
            columnKey="id"
            activeSort={sortColumns}
            onSort={onSort}
            onClearSort={onClearSort}
          />
        </TableHead>
        <TableHead className="text-slate-300">
          <OrderBtn
            label="Nome Cliente"
            columnKey="nome"
            activeSort={sortColumns}
            onSort={onSort}
            onClearSort={onClearSort}
          />
        </TableHead>
        <TableHead className="text-slate-300">
          <OrderBtn
            label="Código Cliente"
            columnKey="cod_cliente"
            activeSort={sortColumns}
            onSort={onSort}
            onClearSort={onClearSort}
          />
        </TableHead>
        <TableHead className="text-slate-300">
          <OrderBtn
            label="NF"
            columnKey="numero_nf"
            activeSort={sortColumns}
            onSort={onSort}
            onClearSort={onClearSort}
          />
        </TableHead>
        <TableHead className="text-slate-300">
          <OrderBtn
            label="Código RCA"
            columnKey="rca"
            activeSort={sortColumns}
            onSort={onSort}
            onClearSort={onClearSort}
          />
        </TableHead>
        <TableHead className="text-slate-300 px-6">
          <OrderBtn
            label="Tipo"
            columnKey="tipo_devolucao"
            activeSort={sortColumns}
            onSort={onSort}
            onClearSort={onClearSort}
          />
        </TableHead>
        <TableHead className="text-slate-300">
          <OrderBtn
            label="Data"
            columnKey="created_at"
            activeSort={sortColumns}
            onSort={onSort}
            onClearSort={onClearSort}
          />
        </TableHead>
        <TableHead className="text-slate-300">Status</TableHead>
      </TableRow>
    </TableHeader>
  );
};
