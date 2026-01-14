// src/components/solicitacoes/produtos.tsx
"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import {
  fetchProdutosSolicitacao,
  ProdutoSolicitacao,
} from "@/utils/solicitacoes/produtos/produtos";
import { formatPrice } from "@/utils/formatPrice";

interface ProdutosCardProps {
  numeroNF: string;
}

export function ProdutosCard({ numeroNF }: ProdutosCardProps) {
  const [produtos, setProdutos] = useState<ProdutoSolicitacao[]>([]);
  const [produtosRetornados, setProdutosRetornados] = useState<
    ProdutoSolicitacao[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchProdutosSolicitacao(numeroNF);

        setProdutos(response.produtos);
        setProdutosRetornados(response.produtosRetornados);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setError("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };

    if (numeroNF) {
      fetchProdutos();
    }
  }, [numeroNF]);

  if (loading) {
    return (
      <Card className="bg-slate-700/50 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-400 py-4">
            Carregando produtos...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-700/50 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-400 py-4">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-700/50 border-slate-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Package className="h-5 w-5" />
          Produtos ({produtos.length} total, {produtosRetornados.length} para
          devolução)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-600">
                <TableHead className="text-slate-300">Código</TableHead>
                <TableHead className="text-slate-300">Descrição</TableHead>
                <TableHead className="text-slate-300 text-center">
                  Qtd. Total
                </TableHead>
                <TableHead className="text-slate-300 text-center">
                  Qtd. Devolvida
                </TableHead>
                <TableHead className="text-slate-300 text-center">
                  Preço Unit.
                </TableHead>
                <TableHead className="text-slate-300 text-center">
                  Valor Total
                </TableHead>
                <TableHead className="text-slate-300 text-center">
                  Valor Total Devolvido
                </TableHead>
                <TableHead className="text-slate-300 text-center">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.length > 0 ? (
                produtos.map((produto) => {
                  const produtoRetornado = produtosRetornados.find(
                    (p) => p.cod_prod === produto.cod_prod
                  );
                  //   const isRetornado = !!produtoRetornado;
                  const quantidadeDevolvida = produtoRetornado?.quantidade || 0;

                  return (
                    <TableRow key={produto.id} className="border-slate-600">
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-slate-300 border-slate-500"
                        >
                          {produto.cod_prod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        {produto.descricao}
                      </TableCell>
                      <TableCell className="text-center text-slate-300">
                        {produto.quantidade}
                      </TableCell>
                      <TableCell className="text-center text-slate-300">
                        {quantidadeDevolvida}
                      </TableCell>
                      <TableCell className="text-center text-slate-300">
                        {formatPrice(Number(produto.punit))}
                      </TableCell>
                      <TableCell className="text-center text-white font-medium">
                        {formatPrice(Number(produto.punit) * produto.quantidade)}
                      </TableCell>
                      <TableCell className="text-center text-white font-medium">
                        {formatPrice(Number(produto.punit) * quantidadeDevolvida)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Badge
                            className={
                              quantidadeDevolvida === 0
                                ? "bg-green-500/20 text-green-400 border-green-500/50"
                                : quantidadeDevolvida === produto.quantidade
                                ? "bg-red-500/20 text-red-400 border-red-500/50"
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                            }
                          >
                            {quantidadeDevolvida === 0
                              ? "Nenhuma"
                              : quantidadeDevolvida === produto.quantidade
                              ? "Total"
                              : "Parcial"}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-slate-400 py-4"
                  >
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-slate-800/90 hover:bg-slate-800/90 border-slate-600">
                <TableCell
                  colSpan={5}
                  className="text-right font-semibold text-slate-300"
                >
                  Totais:
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold text-blue-400">
                      {formatPrice(
                        produtos.reduce(
                          (acc, produto) =>
                            acc + Number(produto.punit) * produto.quantidade,
                          0
                        )
                      )}
                    </span>
                    <span className="text-xs text-slate-400">
                      Valor Total da Nota
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold text-red-400">
                      {formatPrice(
                        produtos.reduce((acc, produto) => {
                          const produtoRetornado = produtosRetornados.find(
                            (p) => p.cod_prod === produto.cod_prod
                          );
                          const quantidadeDevolvida =
                            produtoRetornado?.quantidade || 0;
                          return acc + Number(produto.punit) * quantidadeDevolvida;
                        }, 0)
                      )}
                    </span>
                    <span className="text-xs text-slate-400">
                      Valor Total Devolvido
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
