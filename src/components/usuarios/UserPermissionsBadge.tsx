import React from 'react';
import { Badge } from '../ui/badge';
import { UserPermission } from './types';

interface UserPermissionsBadgeProps {
  permissions: UserPermission[];
}

export function UserPermissionsBadge({ permissions }: UserPermissionsBadgeProps) {
  if (!permissions || permissions.length === 0) {
    return (
      <Badge variant="outline" className="text-slate-400 border-slate-600">
        Sem permissões
      </Badge>
    );
  }

  const categories = permissions.reduce((acc, up) => {
    const category = up.permission.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(up.permission);
    return acc;
  }, {} as Record<string, { id: number; label: string; category: string }[]>);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'solicitacoes': return 'Solicitações';
      case 'usuarios': return 'Usuários';
      case 'sistema': return 'Sistema';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'solicitacoes': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'usuarios': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'sistema': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(categories).map(([category, categoryPermissions]) => (
        <Badge 
          key={category}
          variant="outline" 
          className={`text-xs ${getCategoryColor(category)} hover:opacity-80`}
          title={`${getCategoryLabel(category)}: ${categoryPermissions.map(p => p.label).join(', ')}`}
        >
          {getCategoryLabel(category)} ({categoryPermissions.length})
        </Badge>
      ))}
    </div>
  );
}
