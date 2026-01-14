// Tipo do usuário conforme o schema Prisma
export interface Usuario {
  id: string | number;
  primeiroNome: string;
  ultimoNome: string;
  role: string;
  createdAt?: string;
  email: string;
  permissions?: UserPermission[];
}

export interface UserPermission {
  id: number;
  permission: {
    id: number;
    name: string;
    label: string;
    description?: string;
    category: string;
  };
}

export interface Permission {
  id: number;
  name: string;
  label: string;
  description?: string;
  category: string;
}

export interface CreateUserForm
  extends Omit<Usuario, "id" | "createdAt" | "permissions"> {
  password: string;
  permissions?: number[]; // IDs das permissões selecionadas
}

export interface EditUserForm
  extends Omit<Usuario, "id" | "createdAt" | "permissions"> {
  password?: string; // Senha opcional para edição
  permissions?: number[]; // IDs das permissões selecionadas
}
