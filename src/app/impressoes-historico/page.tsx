"use client";
import { useEffect, useState } from "react";
import Header from "../../components/header";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserPermissions,
  UserPermissions,
} from "@/utils/permissions/userPermissions";
import { useImpressoes } from "@/hooks/useImpressoes";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  StatsCards,
  FiltersControls,
  ImpressoesTable,
  PageHeader,
} from "@/components/impressoes";

export default function VisualizacaoImpressoes() {
  return (
    <ProtectedRoute>
      <ImpressoesContent />
    </ProtectedRoute>
  );
}

function ImpressoesContent() {
  // Authentication and permissions
  const { user, isAuthenticated, isLoading } = useAuth();
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    canAprovar: false,
    canRecusar: false,
    canDesdobrar: false,
    canAbater: false,
    canFinalizar: false,
    canDelete: false,
    canAccessAdmin: false,
  });
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  // Custom hook for all impressões logic
  const {
    impressoes,
    currentItems,
    finalImpressoes,
    status,
    setStatus,
    busca,
    setBusca,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    currentPage,
    setCurrentPage,
    totalPages,
    startPage,
    endPage,
    sortColumns,
    handleSort,
    handleClearSort,
    refreshing,
    fetchImpressoes,
  } = useImpressoes();

  // Load user permissions
  useEffect(() => {
    const loadPermissions = async () => {
      if (user) {
        try {
          setPermissionsLoading(true);
          const permissions = await getUserPermissions(user);
          console.log("Permissions loaded in page:", permissions);
          setUserPermissions(permissions);
        } catch (error) {
          console.error("Error loading permissions:", error);
        } finally {
          setPermissionsLoading(false);
        }
      } else {
        setPermissionsLoading(false);
      }
    };
    loadPermissions();
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated, isLoading]);

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Show loading while permissions are being loaded
  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Carregando permissões...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <PageHeader />

        {/* Stats Cards */}
        <StatsCards impressoes={impressoes} />

        {/* Controls Section */}
        <FiltersControls
          busca={busca}
          setBusca={setBusca}
          status={status}
          setStatus={setStatus}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          refreshing={refreshing}
          onRefresh={fetchImpressoes}
          filteredImpressoes={finalImpressoes}
          setCurrentPage={setCurrentPage}
        />

        {/* Main Table */}
        <ImpressoesTable
          currentItems={currentItems}
          totalImpressoes={impressoes.length}
          filteredCount={finalImpressoes.length}
          currentPage={currentPage}
          totalPages={totalPages}
          startPage={startPage}
          endPage={endPage}
          sortColumns={sortColumns}
          onSort={handleSort}
          onClearSort={handleClearSort}
          onPageChange={setCurrentPage}
          onRefreshList={fetchImpressoes}
          userPermissions={userPermissions}
        />
      </div>
    </div>
  );
}
