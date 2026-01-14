import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserPermissions,
  UserPermissions,
} from "@/utils/permissions/userPermissions";

export const PermissionsDebug: React.FC = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      if (user) {
        try {
          setLoading(true);
          console.log("Debug: Loading permissions for user:", user);
          const perms = await getUserPermissions(user);
          console.log("Debug: Loaded permissions:", perms);
          setPermissions(perms);
        } catch (err) {
          console.error("Debug: Error loading permissions:", err);
          setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [user]);

  if (!user) {
    return (
      <div className="bg-red-900 text-white p-4 m-4 rounded">
        Debug: No user found
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-yellow-900 text-white p-4 m-4 rounded">
        Debug: Loading permissions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 text-white p-4 m-4 rounded">
        Debug: Error loading permissions: {error}
      </div>
    );
  }

  return (
    <div className="bg-blue-900 text-white p-4 m-4 rounded">
      <h3 className="font-bold mb-2">Debug: User Permissions</h3>
      <p>
        <strong>User ID:</strong> {user.id}
      </p>
      <p>
        <strong>User Name:</strong> {user.primeiroNome} {user.ultimoNome}
      </p>
      <p>
        <strong>User Role:</strong> {user.role}
      </p>

      {permissions && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Permissions:</h4>
          <ul className="grid grid-cols-2 gap-1 text-sm">
            <li
              className={
                permissions.canAprovar ? "text-green-400" : "text-red-400"
              }
            >
              canAprovar: {permissions.canAprovar ? "true" : "false"}
            </li>
            <li
              className={
                permissions.canRecusar ? "text-green-400" : "text-red-400"
              }
            >
              canRecusar: {permissions.canRecusar ? "true" : "false"}
            </li>
            <li
              className={
                permissions.canDesdobrar ? "text-green-400" : "text-red-400"
              }
            >
              canDesdobrar: {permissions.canDesdobrar ? "true" : "false"}
            </li>
            <li
              className={
                permissions.canAbater ? "text-green-400" : "text-red-400"
              }
            >
              canAbater: {permissions.canAbater ? "true" : "false"}
            </li>
            <li
              className={
                permissions.canFinalizar ? "text-green-400" : "text-red-400"
              }
            >
              canFinalizar: {permissions.canFinalizar ? "true" : "false"}
            </li>
            <li
              className={
                permissions.canDelete ? "text-green-400" : "text-red-400"
              }
            >
              canDelete: {permissions.canDelete ? "true" : "false"}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
