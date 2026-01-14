import { useState, useEffect } from "react";
import { Impressao, SortColumn } from "@/types/impressao";
import { filterTableHeader } from "@/utils/filters/filterTableHeader";
import { filterBySearch } from "@/utils/filters/filterBySearch";
import { filterByStatus } from "@/utils/filters/filterByStatus";
import { filterByDateRange } from "@/utils/filters/filterByDateRange";

export const useImpressoes = () => {
  const [impressoes, setImpressoes] = useState<Impressao[]>([]);
  const [status, setStatus] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);

  const itemsPerPage = 15;

  // Fetch impressões
  const fetchImpressoes = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/impressoes", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar as Impressões.");
      }

      const data = await response.json();
      setImpressoes(data);
    } catch (error) {
      console.error("Erro ao buscar as Impressões:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchImpressoes();
  }, []);

  // Sorting functions
  const handleSort = (column: string, direction: "asc" | "desc") => {
    setSortColumns((prev) => {
      const filtered = prev.filter((s) => s.column !== column);
      return [{ column, direction }, ...filtered];
    });
  };

  const handleClearSort = (column: string) => {
    setSortColumns((prev) => prev.filter((s) => s.column !== column));
  };

  // Apply sorting and filtering
  const sortedImpressoes = filterTableHeader(impressoes, sortColumns);
  if (sortColumns.length > 0) {
    sortedImpressoes.sort((a, b) => {
      for (const sort of sortColumns) {
        const aValue = a[sort.column as keyof Impressao] ?? "";
        const bValue = b[sort.column as keyof Impressao] ?? "";

        if (
          sort.column === "dataInicio" ||
          sort.column === "dataConclusao" ||
          sort.column === "createdAt"
        ) {
          const aDate = new Date(aValue as string);
          const bDate = new Date(bValue as string);
          if (aDate.getTime() !== bDate.getTime()) {
            return sort.direction === "asc"
              ? aDate.getTime() - bDate.getTime()
              : bDate.getTime() - aDate.getTime();
          }
        } else if (typeof aValue === "string" && typeof bValue === "string") {
          if (
            aValue.localeCompare(bValue, "pt-BR", { sensitivity: "base" }) !== 0
          ) {
            return sort.direction === "asc"
              ? aValue.localeCompare(bValue, "pt-BR", { sensitivity: "base" })
              : bValue.localeCompare(aValue, "pt-BR", { sensitivity: "base" });
          }
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          if (aValue !== bValue) {
            return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
          }
        }
      }
      return 0;
    });
  }

  const filteredImpressoes = filterBySearch(sortedImpressoes, busca, [
    "nomeProjeto",
    "status",
    "observacoes",
  ]);

  const dateFilteredImpressoes = filterByDateRange(
    filteredImpressoes,
    startDate,
    endDate,
    "dataInicio"
  );
  const finalImpressoes = filterByStatus(dateFilteredImpressoes, status);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = finalImpressoes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(finalImpressoes.length / itemsPerPage);
  const startPage = Math.max(1, currentPage - 7);
  const endPage = Math.min(totalPages, startPage + 14);

  return {
    // Data
    impressoes,
    currentItems,
    finalImpressoes,

    // Filter states
    status,
    setStatus,
    busca,
    setBusca,
    startDate,
    setStartDate,
    endDate,
    setEndDate,

    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    startPage,
    endPage,
    itemsPerPage,

    // Sorting
    sortColumns,
    handleSort,
    handleClearSort,

    // Loading
    refreshing,
    fetchImpressoes,
  };
};
