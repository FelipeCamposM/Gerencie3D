import { getStoredToken } from "@/lib/auth";
import { toast } from "sonner";

// Função auxiliar para obter headers com token de autenticação
function getAuthHeaders(includeContentType = true): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Cache-Control": "no-cache",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export async function AprovarSolicitacao(
  id: number,
  nfDevolucao?: File,
  recibo?: File,
  vale?: string
) {
  try {
    const formData = new FormData();

    if (nfDevolucao) {
      formData.append("arquivo_nf_devolucao", nfDevolucao);
    }

    if (recibo) {
      formData.append("arquivo_recibo", recibo);
    }

    if (vale) {
      formData.append("vale", vale);
    }

    // Para FormData, não incluímos Content-Type (o browser define automaticamente)
    const authHeaders = getAuthHeaders(false);

    const response = await fetch(
      `/api/btnsSolicitacoes/aprovarSolicitacao/${id}`,
      {
        method: "POST",
        headers: authHeaders,
        body: formData,
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      const errorMessage =
        (data && typeof data.error === "string" && data.error) ||
        "Erro ao mudar Status da solicitação para Aprovada.";

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error(
        "Erro inesperado ao mudar Status da solicitação para Aprovada."
      );
    }
  }
}

export async function RecusarSolicitacao(id: number, motivo_recusa: string) {
  try {
    const response = await fetch(
      `/api/btnsSolicitacoes/recusarSolicitacao/${id}`,
      {
        method: "POST",
        headers: getAuthHeaders(true), // incluir Content-Type para JSON
        body: JSON.stringify({ motivo_recusa }),
      }
    );
    if (!response.ok) {
      throw new Error("Erro ao mudar Status da solicitação para Recusada.");
    }
  } catch (error) {
    console.error("Erro ao mudar Status da solicitação para Recusada:", error);
  }
}

export async function DesdobrarSolicitacao(id: number) {
  try {
    const response = await fetch(
      `/api/btnsSolicitacoes/desdobrarSolicitacao/${id}`,
      {
        method: "POST",
        headers: getAuthHeaders(false),
      }
    );
    if (!response.ok) {
      throw new Error("Erro ao mudar Status da solicitação para Desdobrada.");
    }
  } catch (error) {
    console.error(
      "Erro ao mudar Status da solicitação para Desdobrada:",
      error
    );
  }
}

export async function AbaterSolicitacao(id: number) {
  try {
    const response = await fetch(
      `/api/btnsSolicitacoes/abaterSolicitacao/${id}`,
      {
        method: "POST",
        headers: getAuthHeaders(false),
      }
    );
    if (!response.ok) {
      throw new Error("Erro ao mudar Status da solicitação para Abatida.");
    }
  } catch (error) {
    console.error("Erro ao mudar Status da solicitação para Abatida:", error);
  }
}

export async function FinalizarSolicitacao(id: number) {
  try {
    const response = await fetch(
      `/api/btnsSolicitacoes/finalizarSolicitacao/${id}`,
      {
        method: "POST",
        headers: getAuthHeaders(false),
      }
    );
    if (!response.ok) {
      throw new Error("Erro ao mudar Status da solicitação para Finalizada.");
    }
  } catch (error) {
    console.error(
      "Erro ao mudar Status da solicitação para Finalizada:",
      error
    );
  }
}

export async function ReenviarSolicitacao(id: number) {
  try {
    const response = await fetch(
      `/api/btnsSolicitacoes/reenviarSolicitacao/${id}`,
      {
        method: "POST",
        headers: getAuthHeaders(false),
      }
    );
    if (!response.ok) {
      const data = await response.json().catch(() => null);

      const errorMessage =
        (data && typeof data.error === "string" && data.error) ||
        "Erro ao reenviar solicitação.";

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Erro inesperado ao reenviar solicitação.");
    }
    throw error;
  }
}

export async function ExcluirSolicitacoes(ids: number[]) {
  try {
    const response = await fetch(`/api/solicitacoes/bulk-delete`, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || "Erro ao excluir solicitações");
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Erro inesperado ao excluir solicitações.");
    }
    throw error;
  }
}
