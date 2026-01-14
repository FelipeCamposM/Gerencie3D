import { useState, useCallback } from "react";

interface SolicitacaoExistente {
  id: number;
  numero_nf: string;
  status: string;
  created_at: string;
  nome: string;
  cod_cliente: string;
}

interface CheckSolicitacaoResponse {
  existe: boolean;
  solicitacoes: SolicitacaoExistente[];
  total: number;
}

interface InfosNF {
  codcli: number;
  numcar: number;
  codusur: number;
  codcob: string;
  cobranca: string;
  cliente: string;
  codfilial: string;
  cgcent: string;
}

export const useNFVerification = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] =
    useState<CheckSolicitacaoResponse | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const checkExistingSolicitacoes = useCallback(
    async (numeroNF: string): Promise<CheckSolicitacaoResponse | null> => {
      if (!numeroNF || numeroNF.length < 4) {
        setCheckResult(null);
        setShowWarning(false);
        return null;
      }

      setIsChecking(true);
      try {
        const response = await fetch(`/api/checkSolicitacao/${numeroNF}`);

        if (!response.ok) {
          throw new Error("Erro ao verificar solicitações existentes");
        }

        const result: CheckSolicitacaoResponse = await response.json();
        setCheckResult(result);
        setShowWarning(result.existe);

        return result;
      } catch (error) {
        console.error("Erro ao verificar solicitações:", error);
        setCheckResult(null);
        setShowWarning(false);
        return null;
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  const fetchInfosNF = useCallback(
    async (numeroNF: string): Promise<InfosNF | null> => {
      if (!numeroNF || numeroNF.length < 4) {
        return null;
      }

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const response = await fetch(`${apiUrl}/getInfosNF/${numeroNF}`);

        if (!response.ok) {
          if (response.status === 404) {
            return null; // NF não encontrada
          }
          throw new Error("Erro ao buscar informações da NF");
        }

        const infos: InfosNF = await response.json();
        return infos;
      } catch (error) {
        console.error("Erro ao buscar informações da NF:", error);
        return null;
      }
    },
    []
  );

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
  }, []);

  return {
    isChecking,
    checkResult,
    showWarning,
    checkExistingSolicitacoes,
    fetchInfosNF,
    dismissWarning,
  };
};
