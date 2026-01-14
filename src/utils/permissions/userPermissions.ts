import { User } from "@/lib/auth";
import {
  getUserPermissions as getNewUserPermissions,
  getUserPermissionsByLevel,
} from "./userPermissionsNew";

// Define the user permissions based on user level
export interface UserPermissions {
  canAprovar: boolean;
  canRecusar: boolean;
  canDesdobrar: boolean;
  canAbater: boolean;
  canFinalizar: boolean;
  canDelete: boolean;
  canAccessAdmin: boolean;
}

/**
 * Get user permissions - now using the new permissions system with fallback
 * @param user The user object
 * @returns UserPermissions object with boolean flags for each permission
 */
export async function getUserPermissions(
  user: User | null
): Promise<UserPermissions> {
  if (!user) {
    return {
      canAprovar: false,
      canRecusar: false,
      canDesdobrar: false,
      canAbater: false,
      canFinalizar: false,
      canDelete: false,
      canAccessAdmin: false,
    };
  }

  try {
    // Try new permissions system first
    const newPermissions = await getNewUserPermissions(user);

    // Verificar se o novo sistema retornou permissões válidas
    const hasAnyPermission = Object.values(newPermissions).some(
      (permission) => permission === true
    );

    if (hasAnyPermission) {
      console.log("Using new permissions system for user:", user.primeiroNome);
      return {
        canAprovar: newPermissions.canAprovar,
        canRecusar: newPermissions.canRecusar,
        canDesdobrar: newPermissions.canDesdobrar,
        canAbater: newPermissions.canAbater,
        canFinalizar: newPermissions.canFinalizar,
        canDelete: newPermissions.canDeleteSolicitacoes,
        canAccessAdmin: newPermissions.canAccessAdmin,
      };
    } else {
      console.log(
        "New permissions system returned empty permissions, using fallback for user:",
        user.primeiroNome
      );
      // Se o novo sistema não retornou nenhuma permissão, usar fallback
      const fallbackPermissions = getUserPermissionsByLevel(user);

      return {
        canAprovar: fallbackPermissions.canAprovar,
        canRecusar: fallbackPermissions.canRecusar,
        canDesdobrar: fallbackPermissions.canDesdobrar,
        canAbater: fallbackPermissions.canAbater,
        canFinalizar: fallbackPermissions.canFinalizar,
        canDelete: fallbackPermissions.canDeleteSolicitacoes,
        canAccessAdmin: fallbackPermissions.canAccessAdmin,
      };
    }
  } catch (error) {
    console.error("Erro ao buscar permissões, usando fallback:", error);

    // Fallback to old system based on user_level
    const fallbackPermissions = getUserPermissionsByLevel(user);

    return {
      canAprovar: fallbackPermissions.canAprovar,
      canRecusar: fallbackPermissions.canRecusar,
      canDesdobrar: fallbackPermissions.canDesdobrar,
      canAbater: fallbackPermissions.canAbater,
      canFinalizar: fallbackPermissions.canFinalizar,
      canDelete: fallbackPermissions.canDeleteSolicitacoes,
      canAccessAdmin: fallbackPermissions.canAccessAdmin,
    };
  }
}

/**
 * Check if user has permission for a specific action
 * @param user The user object
 * @param action The action to check permission for
 * @returns true if user has permission, false otherwise
 */
export async function hasPermission(
  user: User | null,
  action: keyof UserPermissions
): Promise<boolean> {
  const permissions = await getUserPermissions(user);
  return permissions[action];
}
