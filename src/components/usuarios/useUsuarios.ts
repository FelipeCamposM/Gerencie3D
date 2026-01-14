'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Usuario, CreateUserForm, EditUserForm } from './types';
import { fetchUsuarios } from '../../utils/usuarios/fetchUsuarios';
import { createUser, editUser as editUserAPI, deleteUser } from '../../utils/usuarios/apiUtils';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsuariosList = async () => {
    try {
      setLoading(true);
      const data = await fetchUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao buscar os usuários:', error);
      toast.error('Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (form: CreateUserForm) => {
    try {
      await createUser(form);
      toast.success('Usuário criado com sucesso!');
      fetchUsuariosList();
      return true;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário.');
      return false;
    }
  };

  const handleEditUser = async (id: number, form: EditUserForm) => {
    try {
      await editUserAPI(id, form);
      toast.success('Usuário editado com sucesso!');
      fetchUsuariosList();
      return true;
    } catch (error) {
      console.error('Erro ao editar usuário:', error);
      toast.error('Erro ao editar usuário.');
      return false;
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      toast.success('Usuário excluído com sucesso!');
      fetchUsuariosList();
      return true;
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário.');
      return false;
    }
  };

  useEffect(() => {
    fetchUsuariosList();
  }, []);

  return {
    usuarios,
    loading,
    handleCreateUser,
    handleEditUser,
    handleDeleteUser,
    refetch: fetchUsuariosList,
  };
};
