"use client";
import { useState } from "react";
import { Users } from "lucide-react";
import Header from "../../components/header";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminRoute from "../../components/AdminRoute";
import {
  UsuariosStats,
  UsuariosControls,
  UsuariosTable,
  CreateUserModal,
  EditUserModal,
  DeleteConfirmModal,
  useUsuarios,
  filterUsuarios,
  Usuario,
} from "../../components/usuarios";

export default function Usuarios() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <UsuariosContent />
      </AdminRoute>
    </ProtectedRoute>
  );
}

function UsuariosContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const {
    usuarios,
    loading,
    handleCreateUser,
    handleEditUser,
    handleDeleteUser,
  } = useUsuarios();

  const filteredUsuarios = filterUsuarios(usuarios, searchTerm, selectedLevel);

  const handleEditUserClick = (usuario: Usuario) => {
    setEditUser(usuario);
  };

  const handleDeleteUserClick = (id: string) => {
    setConfirmDeleteId(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header />

      {loading ? (
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-xl text-slate-700">Carregando usuários...</div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-200">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Gerenciar Usuários
                </h1>
                <p className="text-slate-600">
                  Administre os usuários do sistema
                </p>
              </div>
            </div>
          </div>

          <UsuariosStats usuarios={usuarios} />

          <UsuariosControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
          />

          <UsuariosTable
            usuarios={filteredUsuarios}
            onEditUser={handleEditUserClick}
            onDeleteUser={handleDeleteUserClick}
            onCreateUser={() => setShowCreateModal(true)}
          />

          <CreateUserModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            onSubmit={handleCreateUser}
          />

          <EditUserModal
            user={editUser}
            onOpenChange={() => setEditUser(null)}
            onSubmit={handleEditUser}
          />

          <DeleteConfirmModal
            userId={confirmDeleteId}
            onOpenChange={() => setConfirmDeleteId(null)}
            onConfirm={handleDeleteUser}
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-200">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Gerenciar Usuários
              </h1>
              <p className="text-slate-600">
                Administre os usuários do sistema
              </p>
            </div>
          </div>
        </div>

        <UsuariosStats usuarios={usuarios} />

        <UsuariosControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
        />

        <UsuariosTable
          usuarios={filteredUsuarios}
          onEditUser={handleEditUserClick}
          onDeleteUser={handleDeleteUserClick}
          onCreateUser={() => setShowCreateModal(true)}
        />

        <CreateUserModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSubmit={handleCreateUser}
        />

        <EditUserModal
          user={editUser}
          onOpenChange={() => setEditUser(null)}
          onSubmit={handleEditUser}
        />

        <DeleteConfirmModal
          userId={confirmDeleteId}
          onOpenChange={() => setConfirmDeleteId(null)}
          onConfirm={handleDeleteUser}
        />
      </div>
    </div>
  );
}
