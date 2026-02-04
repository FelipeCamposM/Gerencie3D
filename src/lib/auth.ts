export interface User {
  id: number;
  primeiroNome: string;
  ultimoNome: string;
  email: string;
  role: string;
  imagemUsuario?: string | null;
  impressoesRealizadas?: number | null;
  createdAt: string;
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;

  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Erro ao obter usuário do localStorage:", error);
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  return getStoredUser() !== null && getStoredToken() !== null;
}

export function logout(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("user");
  localStorage.removeItem("token");

  // Limpar cookie do servidor
  document.cookie =
    "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // Redirecionar para login
  window.location.href = "/login";
}

export function getUserDisplayName(user: User | null): string {
  if (!user) return "";
  return `${user.primeiroNome} ${user.ultimoNome}`;
}

export function isUserAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.role === "admin";
}

export function canCreateSolicitacao(user: User | null): boolean {
  if (!user) return false;
  // Use o sistema de permissões ao invés de verificar role diretamente
  return user.role !== "financeiro" && user.role !== "marketplace";
}
