import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Filter,
    Search,
    X,
} from "lucide-react";

interface Produto {
    codigo: string;
    descricao: string;
    quantidade: string;
    punit: string;
}

interface ProductFiltersControlsProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    produtos: Produto[];
    filteredProdutos: Produto[];
    quantidadesDevolucao: Record<string, number>;
}

export const ProductFiltersControls: React.FC<ProductFiltersControlsProps> = ({
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    produtos,
    filteredProdutos,
    quantidadesDevolucao,
}) => {
    const clearSearch = () => {
        setSearchTerm("");
    };

    const produtosSelecionados = produtos.filter(p =>
        (quantidadesDevolucao[p.codigo] || 0) > 0
    ).length;

    return (
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader className="px-4">
                <CardTitle className="text-white flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtros de Produtos
                </CardTitle>
                <div className="text-slate-400 text-sm">
                    Mostrando {filteredProdutos.length} de {produtos.length} produtos
                    {produtosSelecionados > 0 && (
                        <span className="ml-2 text-green-400">
                            • {produtosSelecionados} selecionado{produtosSelecionados !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="">
                <div className="flex flex-col lg:flex-row gap-2 items-end">
                    <div className="flex-1 ml-4">
                        <label className="text-slate-300 text-sm font-medium">
                            Buscar produtos
                        </label>
                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Código, descrição do produto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                            />
                            {searchTerm && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={clearSearch}
                                    className="absolute right-0.5 top-0.5 h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="mr-4">
                        <div className="items-end">
                            <label className="text-slate-300 text-sm font-medium">
                                Ordenar por
                            </label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="mt-1 bg-slate-700 border-slate-600 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                    <SelectItem value="codigo-asc" className="text-white">
                                        Código (A-Z)
                                    </SelectItem>
                                    <SelectItem value="codigo-desc" className="text-white">
                                        Código (Z-A)
                                    </SelectItem>
                                    <SelectItem value="descricao-asc" className="text-white">
                                        Produto (A-Z)
                                    </SelectItem>
                                    <SelectItem value="descricao-desc" className="text-white">
                                        Produto (Z-A)
                                    </SelectItem>
                                    <SelectItem value="quantidade-asc" className="text-white">
                                        Quantidade (Menor)
                                    </SelectItem>
                                    <SelectItem value="quantidade-desc" className="text-white">
                                        Quantidade (Maior)
                                    </SelectItem>
                                    <SelectItem value="preco-asc" className="text-white">
                                        Preço (Menor)
                                    </SelectItem>
                                    <SelectItem value="preco-desc" className="text-white">
                                        Preço (Maior)
                                    </SelectItem>
                                    <SelectItem value="selecionados" className="text-white">
                                        Selecionados Primeiro
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
