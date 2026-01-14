import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Calculator, Plus, Minus, SquareCheck, SquareX } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import OrderBtn from "@/components/orderBtn";

interface Produto {
  codigo: string;
  descricao: string;
  quantidade: string;
  punit: string;
}

interface SortColumn {
  column: string;
  direction: "asc" | "desc";
}

interface ProductTableProps {
  produtos: Produto[];
  quantidadesDevolucao: Record<string, number>;
  todosSelecionados: boolean;
  aumentarQuantidade: (codigoProduto: string) => void;
  diminuirQuantidade: (codigoProduto: string) => void;
  alterarQuantidadeInput: (codigoProduto: string, valor: string) => void;
  devolverTudo: (codigoProduto: string) => void;
  setQuantidadesDevolucao: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  alternarSelecaoTodos: () => void;
  sortColumns: SortColumn[];
  onSort: (column: string, direction: "asc" | "desc") => void;
  onClearSort: (column: string) => void;
  getQuantidadeDisponivel: (codigoProduto: string) => number;
}

export function ProductTable({
  produtos,
  quantidadesDevolucao,
  todosSelecionados,
  aumentarQuantidade,
  diminuirQuantidade,
  alterarQuantidadeInput,
  devolverTudo,
  setQuantidadesDevolucao,
  alternarSelecaoTodos,
  sortColumns,
  onSort,
  onClearSort,
  getQuantidadeDisponivel,
}: ProductTableProps) {
  const calcularTotais = () => {
    let totalQuantidade = 0;
    let totalValor = 0;
    let totalQuantidadeDevolucao = 0;
    let totalValorDevolucao = 0;

    produtos.forEach((produto) => {
      const qtdTotal = Number(produto.quantidade);
      const qtdDevolucao = quantidadesDevolucao[produto.codigo] || 0;
      const precoUnit = Number(produto.punit);

      totalQuantidade += qtdTotal;
      totalValor += qtdTotal * precoUnit;
      totalQuantidadeDevolucao += qtdDevolucao;
      totalValorDevolucao += qtdDevolucao * precoUnit;
    });

    return {
      totalQuantidade,
      totalValor,
      totalQuantidadeDevolucao,
      totalValorDevolucao
    };
  };

  const totais = calcularTotais();

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="px-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Produtos da Nota Fiscal
            </CardTitle>
            <p className="text-slate-400 mt-1">
              Total de {produtos.length} produto{produtos.length !== 1 ? 's' : ''} encontrado{produtos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={alternarSelecaoTodos}
              className={`transition-all duration-200 ${
                todosSelecionados
                  ? "bg-red-600/20 text-red-400 border-red-500/50 hover:bg-red-600/40"
                  : "bg-green-600/20 text-green-400 border-green-500/50 hover:bg-green-600/40"
              }`}
            >
              {todosSelecionados ? (
                <>
                  <SquareX className="h-4 w-4 mr-1" />
                  Desselecionar Todos
                </>
              ) : (
                <>
                  <SquareCheck className="h-4 w-4 mr-1" />
                  Selecionar Todos
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 bg-slate-800 hover:bg-slate-800">
              <TableHead className="text-slate-300 text-center ml-0 pl-3">
                <OrderBtn
                  label="Código"
                  columnKey="codigo"
                  activeSort={sortColumns}
                  onSort={onSort}
                  onClearSort={onClearSort}
                />
              </TableHead>
              <TableHead className="text-slate-300">
                <OrderBtn
                  label="Produto"
                  columnKey="descricao"
                  activeSort={sortColumns}
                  onSort={onSort}
                  onClearSort={onClearSort}
                />
              </TableHead>
              <TableHead className="text-slate-300 text-center">
                <OrderBtn
                  label="Qtd. Total"
                  columnKey="quantidade"
                  activeSort={sortColumns}
                  onSort={onSort}
                  onClearSort={onClearSort}
                />
              </TableHead>
              <TableHead className="text-slate-300 text-center">Já Devolvido</TableHead>
              <TableHead className="text-slate-300 text-center">Qtd. a Devolver</TableHead>
              <TableHead className="text-slate-300 text-center">Ações</TableHead>
              <TableHead className="text-slate-300 text-center">
                <OrderBtn
                  label="Preço Unit."
                  columnKey="punit"
                  activeSort={sortColumns}
                  onSort={onSort}
                  onClearSort={onClearSort}
                />
              </TableHead>
              <TableHead className="text-slate-300 text-center w-36">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(produtos) && produtos.length > 0 ? (
              produtos.map((p) => {
                const qtdSelecionada = quantidadesDevolucao[p.codigo] || 0;
                const qtdTotal = Number(p.quantidade);
                const isCompleto = qtdSelecionada === qtdTotal && qtdSelecionada > 0;
                const isParcial = qtdSelecionada > 0 && qtdSelecionada < qtdTotal;
                const isVazio = qtdSelecionada === 0;

                return (
                  <TableRow
                    key={p.codigo}
                    className={`border-slate-700 transition-all duration-200 ${
                      isCompleto
                        ? "bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
                        : isParcial
                        ? "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30"
                        : "hover:bg-slate-700/50"
                    }`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isCompleto && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        )}
                        {isParcial && (
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                        )}
                        {isVazio && (
                          <div className="w-2 h-2 bg-slate-500 rounded-full" />
                        )}
                        <Badge
                          variant="outline"
                          className={`text-slate-300 border-slate-600 ${
                            isCompleto
                              ? "border-green-500/50 text-green-300"
                              : isParcial
                              ? "border-orange-500/50 text-orange-300"
                              : ""
                          }`}
                        >
                          {p.codigo}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {p.descricao}
                    </TableCell>
                    <TableCell className="text-center text-slate-300">
                      <Badge
                        variant="outline"
                        className="text-blue-400 border-blue-500/50"
                      >
                        {p.quantidade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const quantidadeOriginal = Number(p.quantidade);
                        const quantidadeDisponivel = getQuantidadeDisponivel(p.codigo);
                        const quantidadeJaDevolvida = quantidadeOriginal - quantidadeDisponivel;
                        
                        if (quantidadeJaDevolvida > 0) {
                          return (
                            <Badge
                              variant="outline"
                              className="text-red-400 border-red-500/50"
                            >
                              {quantidadeJaDevolvida}
                            </Badge>
                          );
                        } else {
                          return (
                            <span className="text-slate-500 text-sm">-</span>
                          );
                        }
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => diminuirQuantidade(p.codigo)}
                          disabled={qtdSelecionada <= 0}
                          className={`h-8 w-8 p-0 rounded-l-lg transition-all duration-200 rounded-r-none ${
                            qtdSelecionada <= 0
                              ? "border-slate-600 bg-slate-700/50 text-slate-500 cursor-not-allowed"
                              : "border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/25 hover:border-red-400/70 hover:text-red-300 active:scale-95"
                          }`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          max={p.quantidade}
                          value={qtdSelecionada}
                          onChange={(e) =>
                            alterarQuantidadeInput(p.codigo, e.target.value)
                          }
                          className={`w-16 h-8 text-center rounded-none text-white no-spinner font-medium transition-all duration-200 ${
                            isCompleto
                              ? "bg-green-600/20 border-green-500/50 text-green-200 focus:border-green-400/70 focus:bg-green-600/30"
                              : isParcial
                              ? "bg-orange-600/20 border-orange-500/50 text-orange-200 focus:border-orange-400/70 focus:bg-orange-600/30"
                              : "bg-slate-700 border-slate-600 focus:border-blue-500/50 focus:bg-slate-600"
                          }`}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => aumentarQuantidade(p.codigo)}
                          disabled={qtdSelecionada >= qtdTotal}
                          className={`h-8 w-8 p-0 rounded-r-lg transition-all duration-200 rounded-l-none ${
                            qtdSelecionada >= qtdTotal
                              ? "border-slate-600 bg-slate-700/50 text-slate-500 cursor-not-allowed"
                              : "border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/25 hover:border-green-400/70 hover:text-green-300 active:scale-95"
                          }`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        <div className="group relative">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => devolverTudo(p.codigo)}
                            disabled={isCompleto}
                            className={`text-xs transition-all duration-200 ${
                              isCompleto
                                ? "bg-green-600/30 text-green-300 border-green-500/50 cursor-not-allowed opacity-50"
                                : "bg-green-600/20 text-green-400 border-green-500/50 hover:bg-green-600/40 hover:text-green-300 hover:border-green-400/70"
                            }`}
                          >
                            <SquareCheck className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="group relative">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setQuantidadesDevolucao((prev) => ({
                                ...prev,
                                [p.codigo]: 0,
                              }));
                            }}
                            disabled={isVazio}
                            className={`text-xs transition-all duration-200 ${
                              isVazio
                                ? "bg-red-600/30 text-red-300 border-red-500/50 cursor-not-allowed opacity-50"
                                : "bg-red-600/20 text-red-400 border-red-500/50 hover:bg-red-600/40 hover:text-red-300 hover:border-red-400/70"
                            }`}
                          >
                            <SquareX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-slate-300">
                      {formatPrice(Number(p.punit))}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`text-xl font-bold transition-colors duration-200 ${
                          isCompleto
                            ? "text-green-400"
                            : isParcial
                            ? "text-orange-400"
                            : "text-white"
                        }`}
                      >
                        {formatPrice(Number(p.punit) * qtdSelecionada)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="hover:bg-slate-700/50">
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-slate-400">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum produto encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          
            <TableRow className="bg-slate-800 border-slate-600 hover:bg-slate-800/90 border-t">
              <TableCell colSpan={2} className="text-white font-bold">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-slate-400" />
                  <span className="text-lg">Totais</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="text-blue-400 border-blue-500/50 font-bold">
                  {totais.totalQuantidade}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className={`font-bold ${
                    totais.totalQuantidadeDevolucao > 0
                      ? "text-green-400 border-green-500/50"
                      : "text-slate-400 border-slate-600"
                  }`}
                >
                  {totais.totalQuantidadeDevolucao}
                </Badge>
              </TableCell>
              <TableCell></TableCell>
              <TableCell className="text-center text-slate-300 font-bold">
                {formatPrice(totais.totalValor)}
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={`text-xl font-bold ${
                    totais.totalValorDevolucao > 0 ? "text-green-400" : "text-white"
                  }`}
                >
                  {formatPrice(totais.totalValorDevolucao)}
                </span>
              </TableCell>
            </TableRow>
          
        </Table>
      </CardContent>
    </Card>
  );
}

export default ProductTable;
