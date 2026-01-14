import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export interface UserTokenPayload {
  userId: number;
  email: string;
  role: string;
  name: string;
}

/**
 * Extract user information from JWT token in the request
 * @param request The NextRequest object
 * @returns User payload or null if invalid
 */
export function getUserFromToken(
  request: NextRequest
): UserTokenPayload | null {
  try {
    // Try to get token from cookies first
    let token = request.cookies.get("auth-token")?.value;

    // If not in cookies, try Authorization header
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return null;
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as UserTokenPayload;

    return payload;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

/**
 * Check if user has permission for a specific action based on their role
 * @param userLevel The user's role (user, admin)
 * @param action The action to check permission for
 * @returns true if user has permission, false otherwise
 */
export function hasServerPermission(
  userLevel: string,
  action:
    | "aprovar"
    | "recusar"
    | "desdobrar"
    | "abater"
    | "finalizar"
    | "excluir"
): boolean {
  const level = userLevel?.toLowerCase();

  switch (level) {
    case "vendas":
      return action === "aprovar" || action === "recusar";

    case "financeiro":
      return (
        action === "desdobrar" || action === "abater" || action === "finalizar"
      );

    case "logistica":
      return false;

    case "adm":
    case "administrador":
      // Admin has all permissions, including excluir
      return true;

    default:
      return false;
  }
}

/**
 * Middleware function to validate user permissions for an action
 * @param request The NextRequest object
 * @param requiredAction The action that requires permission
 * @returns Object with success status and user info or error
 */
export function validateUserPermission(
  request: NextRequest,
  requiredAction:
    | "aprovar"
    | "recusar"
    | "desdobrar"
    | "abater"
    | "finalizar"
    | "excluir"
): { success: boolean; user?: UserTokenPayload; error?: string } {
  const user = getUserFromToken(request);

  if (!user) {
    return {
      success: false,
      error: "Token de autenticação inválido ou expirado",
    };
  }

  const hasPermission = hasServerPermission(user.user_level, requiredAction);

  if (!hasPermission) {
    return {
      success: false,
      error: `Usuário não tem permissão para executar a ação: ${requiredAction}`,
    };
  }

  return {
    success: true,
    user,
  };
}
