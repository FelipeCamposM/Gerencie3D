import { UserProfile } from "../../types/impressao";

export const fetchUsuarios = async (): Promise<UserProfile[]> => {
  try {
    const response = await fetch("/api/usuarios", {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });
    if (!response.ok) {
      throw new Error("Erro ao buscar os usuários.");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar os usuários:", error);
    throw error;
  }
};
