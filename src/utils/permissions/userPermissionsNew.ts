import { User } from "@/lib/auth";
import db from "@/lib/db";

// Interface para representar uma permissão do usuário do banco
interface UserPermissionWithDetails {
  permission: {
    name: string;
  };
}

// Define the user permissions
export interface UserPermissions {
  // Solicitações
  canViewSolicitacoes: boolean;
  canCreateSolicitacoes: boolean;
  canEditSolicitacoes: boolean;
  canAprovar: boolean;
  canRecusar: boolean;
  canDesdobrar: boolean;
  canAbater: boolean;
  canFinalizar: boolean;
  canDeleteSolicitacoes: boolean;

  // Usuários
  canViewUsers: boolean;
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canManagePermissions: boolean;

  // Sistema
  canAccessAdmin: boolean;
  canViewReports: boolean;
  canSystemSettings: boolean;
}

// Mapeamento de permissões do banco para as permissões da interface
// Suporta nomes antigos e novos (can*) para facilitar transição.
const PERMISSION_MAPPING = {
  // Novos nomes (preferidos)
  canViewSolicitacoes: "canViewSolicitacoes",
  canCreateSolicitacoes: "canCreateSolicitacoes",
  canEditSolicitacoes: "canEditSolicitacoes",
  canAprovar: "canAprovar",
  canRecusar: "canRecusar",
  canDesdobrar: "canDesdobrar",
  canAbater: "canAbater",
  canFinalizar: "canFinalizar",
  canDeleteSolicitacoes: "canDeleteSolicitacoes",
  canViewUsers: "canViewUsers",
  canCreateUsers: "canCreateUsers",
  canEditUsers: "canEditUsers",
  canDeleteUsers: "canDeleteUsers",
  canManagePermissions: "canManagePermissions",
  canAccessAdmin: "canAccessAdmin",
  canViewReports: "canViewReports",
  canSystemSettings: "canSystemSettings",
  // Nomes antigos
  view_solicitacoes: "canViewSolicitacoes",
  create_solicitacoes: "canCreateSolicitacoes",
  edit_solicitacoes: "canEditSolicitacoes",
  approve_solicitacoes: "canAprovar",
  reject_solicitacoes: "canRecusar",
  split_solicitacoes: "canDesdobrar",
  discount_solicitacoes: "canAbater",
  finalize_solicitacoes: "canFinalizar",
  delete_solicitacoes: "canDeleteSolicitacoes",
  view_users: "canViewUsers",
  create_users: "canCreateUsers",
  edit_users: "canEditUsers",
  delete_users: "canDeleteUsers",
  manage_permissions: "canManagePermissions",
  access_admin_panel: "canAccessAdmin",
  view_reports: "canViewReports",
  system_settings: "canSystemSettings",
} as const;

/**
 * Get user permissions from database
 * @param user The user object
 * @returns UserPermissions object with boolean flags for each permission
 */
export async function getUserPermissions(
  user: User | null
): Promise<UserPermissions> {
  if (!user) {
    return createEmptyPermissions();
  }

  try {
    // Buscar permissões do usuário no banco de dados
    const userPermissions = await db.user_permissions.findMany({
      where: { user_id: Number(user.id) },
      include: {
        permission: true,
      },
    });

    // Criar objeto de permissões inicializado com false
    const permissions = createEmptyPermissions();

    // Mapear permissões do banco para o objeto de permissões
    userPermissions.forEach((up: UserPermissionWithDetails) => {
      const permissionKey =
        PERMISSION_MAPPING[
          up.permission.name as keyof typeof PERMISSION_MAPPING
        ];
      if (permissionKey) {
        permissions[permissionKey as keyof UserPermissions] = true;
      }
    });

    return permissions;
  } catch (error) {
    console.error("Erro ao buscar permissões do usuário:", error);
    return createEmptyPermissions();
  }
}

/**
 * Get user permissions based on their role (fallback for compatibility)
 * @param user The user object
 * @returns UserPermissions object with boolean flags for each permission
 */
export function getUserPermissionsByLevel(user: User | null): UserPermissions {
  if (!user) {
    return createEmptyPermissions();
  }

  const userLevel = user.role?.toLowerCase();

  switch (userLevel) {
    case "vendas":
      return {
        ...createEmptyPermissions(),
        canViewSolicitacoes: true,
        canCreateSolicitacoes: true,
        canEditSolicitacoes: true,
        canAprovar: true,
        canRecusar: true,
        canViewReports: true,
      };

    case "marketplace":
      return {
        ...createEmptyPermissions(),
        canViewSolicitacoes: true,
        canCreateSolicitacoes: true,
      };

    case "financeiro":
      return {
        ...createEmptyPermissions(),
        canViewSolicitacoes: true,
        canDesdobrar: true,
        canAbater: true,
        canFinalizar: true,
        canViewReports: true,
      };

    case "logistica":
      return {
        ...createEmptyPermissions(),
        canViewSolicitacoes: true,
        canViewReports: true,
      };

    case "adm":
      return createFullPermissions();

    default:
      return createEmptyPermissions();
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

/**
 * Check if user has permission based on permission name from database
 * @param user The user object
 * @param permissionName The permission name from database
 * @returns true if user has permission, false otherwise
 */
export async function hasPermissionByName(
  user: User | null,
  permissionName: string
): Promise<boolean> {
  if (!user) return false;

  try {
    const userPermission = await db.user_permissions.findFirst({
      where: {
        user_id: Number(user.id),
        permission: {
          name: permissionName,
        },
      },
    });

    return !!userPermission;
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return false;
  }
}

/**
 * Get all available permissions
 */
export async function getAllPermissions() {
  try {
    return await db.permissions.findMany({
      orderBy: [{ category: "asc" }, { label: "asc" }],
    });
  } catch (error) {
    console.error("Erro ao buscar permissões:", error);
    return [];
  }
}

/**
 * Get user permissions with details
 */
export async function getUserPermissionsDetailed(userId: number) {
  try {
    return await db.user_permissions.findMany({
      where: { user_id: userId },
      include: {
        permission: true,
      },
      orderBy: {
        permission: {
          category: "asc",
        },
      },
    });
  } catch (error) {
    console.error("Erro ao buscar permissões detalhadas do usuário:", error);
    return [];
  }
}

/**
 * Update user permissions
 */
export async function updateUserPermissions(
  userId: number,
  permissionIds: number[]
) {
  try {
    // Remove todas as permissões existentes
    await db.user_permissions.deleteMany({
      where: { user_id: userId },
    });

    // Adiciona as novas permissões
    if (permissionIds.length > 0) {
      await db.user_permissions.createMany({
        data: permissionIds.map((permissionId) => ({
          user_id: userId,
          permission_id: permissionId,
        })),
      });
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar permissões do usuário:", error);
    return false;
  }
}

// Helper functions
function createEmptyPermissions(): UserPermissions {
  return {
    canViewSolicitacoes: false,
    canCreateSolicitacoes: false,
    canEditSolicitacoes: false,
    canAprovar: false,
    canRecusar: false,
    canDesdobrar: false,
    canAbater: false,
    canFinalizar: false,
    canDeleteSolicitacoes: false,
    canViewUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canManagePermissions: false,
    canAccessAdmin: false,
    canViewReports: false,
    canSystemSettings: false,
  };
}

function createFullPermissions(): UserPermissions {
  return {
    canViewSolicitacoes: true,
    canCreateSolicitacoes: true,
    canEditSolicitacoes: true,
    canAprovar: true,
    canRecusar: true,
    canDesdobrar: true,
    canAbater: true,
    canFinalizar: true,
    canDeleteSolicitacoes: true,
    canViewUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canManagePermissions: true,
    canAccessAdmin: true,
    canViewReports: true,
    canSystemSettings: true,
  };
}
