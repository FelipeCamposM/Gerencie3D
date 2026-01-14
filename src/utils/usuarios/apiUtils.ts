// Função para criar usuário via API
export const createUser = async (userData: {
  primeiroNome: string;
  ultimoNome: string;
  email: string;
  password: string;
  role: string;
  permissions?: number[];
}) => {
  const response = await fetch("/api/usuarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao criar usuário");
  }

  return await response.json();
};

// Função para editar usuário via API
export const editUser = async (
  id: number,
  userData: {
    primeiroNome?: string;
    ultimoNome?: string;
    email?: string;
    role?: string;
    permissions?: number[];
  }
) => {
  const response = await fetch(`/api/usuarios/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao editar usuário");
  }

  return await response.json();
};

// Função para deletar usuário via API
export const deleteUser = async (id: string) => {
  const response = await fetch(`/api/usuarios/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao excluir usuário");
  }

  return await response.json();
};
