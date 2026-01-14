import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Impressao, SortColumn } from "@/types/impressao";

interface ImpressoesTableProps {
  currentItems: Impressao[];
  totalImpressoes: number;
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  startPage: number;
  endPage: number;
  sortColumns: SortColumn[];
  onSort: (column: string, direction: "asc" | "desc") => void;
  onClearSort: (column: string) => void;
  onPageChange: (page: number) => void;
  onRefreshList?: () => void;
  userPermissions: {
    canAprovar: boolean;
    canRecusar: boolean;
    canDesdobrar: boolean;
    canAbater: boolean;
    canFinalizar: boolean;
    canDelete?: boolean;
    canAccessAdmin: boolean;
  };
}

const getStatusBadge = (status: string) => {
  const badges = {
    concluida: "bg-green-500/20 text-green-400 border-green-500/50",
    em_andamento: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    cancelada: "bg-red-500/20 text-red-400 border-red-500/50",
    falhou: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  };
  return badges[status as keyof typeof badges] || "bg-gray-500/20 text-gray-400 border-gray-500/50";
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ImpressoesTable: React.FC<ImpressoesTableProps> = ({
  currentItems,
  totalImpressoes,
  filteredCount,
  currentPage,
  totalPages,
  startPage,
  endPage,
  sortColumns,
  onSort,
  onClearSort,
  onPageChange,
  onRefreshList,
  userPermissions,
}) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">
          Lista de Impressões 3D ({filteredCount})
        </CardTitle>
        <CardDescription className="text-slate-400">
          {filteredCount} de {totalImpressoes} impressões
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Projeto</TableHead>
                <TableHead className="text-slate-300">Impressora</TableHead>
                <TableHead className="text-slate-300">Usuário</TableHead>
                <TableHead className="text-slate-300">Tempo (min)</TableHead>
                <TableHead className="text-slate-300">Filamento (g)</TableHead>
                <TableHead className="text-slate-300">Custo Total</TableHead>
                <TableHead className="text-slate-300">Lucro</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Data Início</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((impressao) => (
                  <TableRow key={impressao.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">{impressao.nomeProjeto}</TableCell>
                    <TableCell className="text-slate-300">
                      {impressao.impressora ? `${impressao.impressora.nome} (${impressao.impressora.modelo})` : "N/A"}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {impressao.usuario ? `${impressao.usuario.primeiroNome} ${impressao.usuario.ultimoNome}` : "N/A"}
                    </TableCell>
                    <TableCell className="text-slate-300">{impressao.tempoImpressao}</TableCell>
                    <TableCell className="text-slate-300">{impressao.filamentoTotalUsado.toFixed(2)}</TableCell>
                    <TableCell className="text-slate-300">R$ {impressao.custoTotal.toFixed(2)}</TableCell>
                    <TableCell className={impressao.lucro && impressao.lucro > 0 ? "text-green-400" : "text-slate-300"}>
                      {impressao.lucro ? `R$ ${impressao.lucro.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-md text-xs border ${getStatusBadge(impressao.status)}`}>
                        {impressao.status === "em_andamento" ? "Em Andamento" : 
                         impressao.status === "concluida" ? "Concluída" : 
                         impressao.status === "cancelada" ? "Cancelada" : "Falhou"}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-300">{formatDate(impressao.dataInicio)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                    Nenhuma impressão encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer text-white hover:bg-slate-700"
                    }
                  />
                </PaginationItem>

                {Array.from(
                  { length: endPage - startPage + 1 },
                  (_, i) => startPage + i
                ).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      isActive={currentPage === page}
                      className={
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-white hover:bg-slate-700 cursor-pointer"
                      }
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages && onPageChange(currentPage + 1)
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer text-white hover:bg-slate-700"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Confirmar exclusão"
            description={
              <span>
                Tem certeza que deseja excluir {selectedIds.length} solicitação{selectedIds.length !== 1 ? "(ões)" : ""}? Esta ação não pode ser desfeita.
              </span>
            }
            confirmText={`Excluir${selectedIds.length ? ` (${selectedIds.length})` : ""}`}
            cancelText="Cancelar"
            onConfirm={handleBulkDelete}
            loading={deleting}
          />
        )}
        <div className="overflow-x-auto">
          <Table>
            <SolicitacoesTableHeader
              sortColumns={sortColumns}
              onSort={onSort}
              onClearSort={onClearSort}
              allSelected={allOnPageSelected}
              onToggleSelectAll={toggleSelectAll}
              showSelection={!!userPermissions.canDelete}
            />
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((solicitacao) => (
                  <SolicitacaoTableRow
                    key={solicitacao.id}
                    solicitacao={solicitacao}
                    userPermissions={userPermissions}
                    onRefreshList={onRefreshList}
                    selected={selectedIds.includes(solicitacao.id)}
                    onToggleSelected={toggleRow}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={userPermissions.canDelete ? 10 : 9} className="text-center py-8 text-slate-400">
                    Nenhuma solicitação encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    namePrevious="Primeira Página"
                    href="#"
                    onClick={() => onPageChange(1)}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationPrevious
                    namePrevious="Anterior"
                    href="#"
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {[...Array(endPage - startPage + 1)].map((_, i) => (
                  <PaginationItem key={i + startPage}>
                    <PaginationLink
                      className={
                        currentPage === i + startPage ? "bg-slate-400" : ""
                      }
                      href="#"
                      onClick={() => onPageChange(i + startPage)}
                    >
                      {i + startPage}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    nameNext="Próxima"
                    href="#"
                    onClick={() =>
                      onPageChange(Math.min(currentPage + 1, totalPages))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    nameNext="Última Página"
                    href="#"
                    onClick={() => onPageChange(totalPages)}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
