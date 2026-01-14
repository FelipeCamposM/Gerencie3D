type SortDirection = "asc" | "desc";

export interface SortConfig {
  column: string;
  direction: SortDirection;
}

/**
 * Função genérica para ordenar e filtrar uma lista de objetos com múltiplas colunas.
 * @param data - Lista original de objetos
 * @param sortConfig - Array de colunas e direções ordenadas por prioridade (esquerda → direita)
 * @returns Lista ordenada
 */
export function filterTableHeader<T extends Record<string, unknown>>(
  data: T[],
  sortConfig: SortConfig[]
): T[] {
  return [...data].sort((a, b) => {
    for (const sort of sortConfig) {
      const column = sort.column;
      const direction = sort.direction;
      const aValue = a[column];
      const bValue = b[column];

      // Comparar datas
      if (isDate(aValue) && isDate(bValue)) {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        if (aDate !== bDate) {
          return direction === "asc" ? aDate - bDate : bDate - aDate;
        }
        continue;
      }

      // Comparar números
      if (isNumber(aValue) && isNumber(bValue)) {
        if (aValue !== bValue) {
          return direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        continue;
      }

      // Comparar strings
      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue, "pt-BR", {
          sensitivity: "base",
        });
        if (result !== 0) {
          return direction === "asc" ? result : -result;
        }
        continue;
      }
    }

    return 0; // Igual em todas as colunas
  });
}

// Auxiliares

function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

function isDate(value: unknown): boolean {
  return (
    typeof value === "string" &&
    !isNaN(Date.parse(value)) &&
    value.includes("-") // simples heurística para evitar strings genéricas
  );
}
