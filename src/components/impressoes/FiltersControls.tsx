import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search, RefreshCw, X, CalendarIcon } from "lucide-react";
import { Impressao } from "@/types/impressao";
import { DownloadDialog } from "./DownloadDialog";

interface FiltersControlsProps {
  busca: string;
  setBusca: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  startDate: string | null;
  setStartDate: (value: string | null) => void;
  endDate: string | null;
  setEndDate: (value: string | null) => void;
  refreshing: boolean;
  onRefresh: () => void;
  // Add filtered impressoes for download
  filteredImpressoes: Impressao[];
  // Add pagination reset function
  setCurrentPage: (page: number) => void;
}

export const FiltersControls: React.FC<FiltersControlsProps> = ({
  busca,
  setBusca,
  status,
  setStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  refreshing,
  onRefresh,
  filteredImpressoes,
  setCurrentPage,
}) => {
  // Função para criar data sem problemas de timezone
  const createLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // month é 0-indexed
  };

  // Função para formatar data local para string
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Funções para resetar paginação quando filtros mudam
  const handleSearchChange = (value: string) => {
    setBusca(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value || "Todos");
    setCurrentPage(1);
  };

  const handleStartDateChange = (value: string | null) => {
    setStartDate(value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (value: string | null) => {
    setEndDate(value);
    setCurrentPage(1);
  };
  return (
    <Card className="bg-slate-800/50 border-slate-700 mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros e Ações
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        {/* Linha única com todos os filtros e ações */}
        <div className="flex flex-wrap lg:flex-nowrap items-end gap-4">
          {/* Campo de Busca */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-slate-300 text-sm font-medium block mb-2">
              Buscar impressões
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Nome do projeto, status..."
                value={busca}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-10"
              />
            </div>
          </div>

          {/* Período - Data Início e Fim */}
          <div className="flex-none min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-300 text-sm font-medium">
                Período
              </label>
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleStartDateChange(null);
                    handleEndDateChange(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white h-auto p-1 hover:bg-slate-800"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {/* Data Início */}
              <div className="flex-1 relative">
                <Popover>
                  <div className="flex">
                    <Input
                      type="date"
                      value={startDate || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          handleStartDateChange(value);
                          // Se a data final for anterior à nova data inicial, limpe a data final
                          if (
                            endDate &&
                            createLocalDate(value) > createLocalDate(endDate)
                          ) {
                            handleEndDateChange(null);
                          }
                        } else {
                          handleStartDateChange(null);
                        }
                      }}
                      className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 text-sm h-10 pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                      placeholder="Data inicial"
                    />
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-slate-600"
                      >
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                      </Button>
                    </PopoverTrigger>
                  </div>
                  <PopoverContent
                    className="w-auto p-0 bg-slate-800 border-slate-600"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={
                        startDate ? createLocalDate(startDate) : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          const formattedDate = formatLocalDate(date);
                          handleStartDateChange(formattedDate);

                          // Se a data final for anterior à nova data inicial, limpe a data final
                          if (endDate && date > createLocalDate(endDate)) {
                            handleEndDateChange(null);
                          }
                        } else {
                          handleStartDateChange(null);
                        }
                      }}
                      autoFocus
                      className="text-white [&_.rdp-day]:text-white [&_.rdp-day_selected]:bg-blue-600 [&_.rdp-day_selected]:text-white [&_.rdp-day:hover]:bg-slate-700"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Data Fim */}
              <div className="flex-1 relative">
                <Popover>
                  <div className="flex">
                    <Input
                      type="date"
                      value={endDate || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          // Verifica se a data final é posterior à data inicial
                          if (
                            startDate &&
                            createLocalDate(value) < createLocalDate(startDate)
                          ) {
                            return; // Não permite data final anterior à inicial
                          }
                          handleEndDateChange(value);
                        } else {
                          handleEndDateChange(null);
                        }
                      }}
                      min={startDate || undefined}
                      className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 text-sm h-10 pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                      placeholder="Data final"
                    />
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-slate-600"
                      >
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                      </Button>
                    </PopoverTrigger>
                  </div>
                  <PopoverContent
                    className="w-auto p-0 bg-slate-800 border-slate-600"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={endDate ? createLocalDate(endDate) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const formattedDate = formatLocalDate(date);
                          handleEndDateChange(formattedDate);
                        } else {
                          handleEndDateChange(null);
                        }
                      }}
                      disabled={(date) => {
                        // Desabilita datas anteriores à data inicial se uma foi selecionada
                        if (startDate) {
                          return date < createLocalDate(startDate);
                        }
                        return false;
                      }}
                      autoFocus
                      className="text-white [&_.rdp-day]:text-white [&_.rdp-day_selected]:bg-blue-600 [&_.rdp-day_selected]:text-white [&_.rdp-day:hover]:bg-slate-700"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex-none min-w-[160px]">
            <label className="text-slate-300 text-sm font-medium block mb-2">
              Status
            </label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white w-full h-10 py-[19px]">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="Todos" className="text-white">
                  Todos
                </SelectItem>
                <SelectItem value="concluida" className="text-white">
                  Concluída
                </SelectItem>
                <SelectItem value="em_andamento" className="text-white">
                  Em Andamento
                </SelectItem>
                <SelectItem value="cancelada" className="text-white">
                  Cancelada
                </SelectItem>
                <SelectItem value="falhou" className="text-white">
                  Falhou
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 flex-none">
            <Button
              onClick={onRefresh}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 cursor-pointer w-[140px]"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Atualizando..." : "Atualizar"}
            </Button>

            <div className="h-10">
              <DownloadDialog
                impressoes={filteredImpressoes}
                currentFilter={status}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
