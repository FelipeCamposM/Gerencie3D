import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { DevolutionTypeCard } from "./DevolutionTypeCard";
import { ProductTable } from "./ProductTable";
import { ProductFiltersControls } from "./ProductFiltersControls";

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

interface ProductSelectionStepProps {
  numeroNF: string;
  nomeClient: string;
  tipoDevolucao: string;
  produtos: Produto[];
  quantidadesDevolucao: Record<string, number>;
  todosSelecionados: boolean;
  aumentarQuantidade: (codigoProduto: string) => void;
  diminuirQuantidade: (codigoProduto: string) => void;
  alterarQuantidadeInput: (codigoProduto: string, valor: string) => void;
  devolverTudo: (codigoProduto: string) => void;
  setQuantidadesDevolucao: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  alternarSelecaoTodos: () => void;
  onBack: () => void;
  onFinalize: () => Promise<void>;
  // New props for filtering and sorting
  productSearchTerm: string;
  setProductSearchTerm: (value: string) => void;
  productSortBy: string;
  setProductSortBy: (value: string) => void;
  productSortColumns: SortColumn[];
  filteredAndSortedProducts: Produto[];
  handleProductSort: (column: string, direction: "asc" | "desc") => void;
  handleProductClearSort: (column: string) => void;
  getQuantidadeDisponivel: (codigoProduto: string) => number;
  isSubmitting: boolean;
}

export function ProductSelectionStep({
  numeroNF,
  nomeClient,
  tipoDevolucao,
  produtos,
  quantidadesDevolucao,
  todosSelecionados,
  aumentarQuantidade,
  diminuirQuantidade,
  alterarQuantidadeInput,
  devolverTudo,
  setQuantidadesDevolucao,
  alternarSelecaoTodos,
  onBack,
  onFinalize,
  productSearchTerm,
  setProductSearchTerm,
  productSortBy,
  setProductSortBy,
  productSortColumns,
  filteredAndSortedProducts,
  handleProductSort,
  handleProductClearSort,
  getQuantidadeDisponivel,
  isSubmitting
}: ProductSelectionStepProps) {
  const isFinalizationEnabled = () => {
    const totalQuantidadeDevolucao = Object.values(quantidadesDevolucao).reduce(
      (acc, qtd) => acc + qtd,
      0
    );
    return totalQuantidadeDevolucao > 0 && tipoDevolucao;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 cursor-pointer hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Badge
          variant="outline"
          className="text-slate-300 border-slate-600"
        >
          NF: {numeroNF}
        </Badge>
        <Badge
          variant="outline"
          className="text-slate-300 border-slate-600"
        >
          Cliente: {nomeClient}
        </Badge>
      </div>

      <DevolutionTypeCard tipoDevolucao={tipoDevolucao} />

      <ProductFiltersControls
        searchTerm={productSearchTerm}
        setSearchTerm={setProductSearchTerm}
        sortBy={productSortBy}
        setSortBy={setProductSortBy}
        produtos={produtos}
        filteredProdutos={filteredAndSortedProducts}
        quantidadesDevolucao={quantidadesDevolucao}
      />

      <ProductTable
        produtos={filteredAndSortedProducts}
        quantidadesDevolucao={quantidadesDevolucao}
        todosSelecionados={todosSelecionados}
        aumentarQuantidade={aumentarQuantidade}
        diminuirQuantidade={diminuirQuantidade}
        alterarQuantidadeInput={alterarQuantidadeInput}
        devolverTudo={devolverTudo}
        setQuantidadesDevolucao={setQuantidadesDevolucao}
        alternarSelecaoTodos={alternarSelecaoTodos}
        sortColumns={productSortColumns}
        onSort={handleProductSort}
        onClearSort={handleProductClearSort}
        getQuantidadeDisponivel={getQuantidadeDisponivel}
      />

      <div className="flex justify-end mt-6">
        <Button
          type="button"
          disabled={!isFinalizationEnabled() || isSubmitting}
          onClick={onFinalize}
          className="bg-green-600 hover:bg-green-700 text-white px-8"
        >
          {isSubmitting ? "Finalizando..." : "Finalizar Solicitação"}
          <CheckCircle2 className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
