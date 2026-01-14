import React, { useEffect, useState } from 'react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Permission } from './types';
import { Separator } from '../ui/separator';

interface PermissionsSelectProps {
  selectedPermissions: number[];
  onPermissionsChange: (permissions: number[]) => void;
}

export function PermissionsSelect({ selectedPermissions, onPermissionsChange }: PermissionsSelectProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions');
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    if (checked) {
      onPermissionsChange([...selectedPermissions, permissionId]);
    } else {
      onPermissionsChange(selectedPermissions.filter(id => id !== permissionId));
    }
  };

  const toggleCategory = (category: string, checked: boolean) => {
    const categoryPermissions = permissions
      .filter(p => p.category === category)
      .map(p => p.id);

    if (checked) {
      // Adicionar todas as permissões da categoria
      const newPermissions = [...selectedPermissions];
      categoryPermissions.forEach(id => {
        if (!newPermissions.includes(id)) {
          newPermissions.push(id);
        }
      });
      onPermissionsChange(newPermissions);
    } else {
      // Remover todas as permissões da categoria
      onPermissionsChange(
        selectedPermissions.filter(id => !categoryPermissions.includes(id))
      );
    }
  };

  const isCategorySelected = (category: string) => {
    const categoryPermissions = permissions
      .filter(p => p.category === category)
      .map(p => p.id);

    return categoryPermissions.length > 0 &&
      categoryPermissions.every(id => selectedPermissions.includes(id));
  };

  const isCategoryPartiallySelected = (category: string) => {
    const categoryPermissions = permissions
      .filter(p => p.category === category)
      .map(p => p.id);

    return categoryPermissions.some(id => selectedPermissions.includes(id)) &&
      !categoryPermissions.every(id => selectedPermissions.includes(id));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-600 rounded w-32 mb-2"></div>
          <div className="space-y-2">
            <div className="h-6 bg-slate-700 rounded"></div>
            <div className="h-6 bg-slate-700 rounded"></div>
            <div className="h-6 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const categories = [...new Set(permissions.map(p => p.category))];

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'solicitacoes': return 'Solicitações';
      case 'usuarios': return 'Usuários';
      case 'sistema': return 'Sistema';
      default: return category;
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-slate-300 font-medium">Permissões</Label>

      {categories.map(category => {
        const categoryPermissions = permissions.filter(p => p.category === category);
        const isSelected = isCategorySelected(category);
        const isPartiallySelected = isCategoryPartiallySelected(category);

        return (
          <Card key={category} className="bg-slate-700/50 border-slate-600">
            <CardHeader className="px-0 ml-3.5">
              <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => toggleCategory(category, checked as boolean)}
                  className={`hover:cursor-pointer border-slate-400 ${isPartiallySelected ? 'data-[state=checked]:bg-blue-600/50' : ''}`}
                />
                {getCategoryLabel(category)}
                <span className="text-xs text-slate-400">
                  ({categoryPermissions.filter(p => selectedPermissions.includes(p.id)).length}/{categoryPermissions.length})
                </span>
              </CardTitle>
            </CardHeader>
            <Separator className='p-0 bg-slate-600' />
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-5 ml-4">
                {categoryPermissions.map(permission => (
                  <div key={permission.id} className="flex items-start gap-2">
                    <Checkbox
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(permission.id, checked as boolean)
                      }
                      className="border-slate-200 bg-slate-800 hover:cursor-pointer data-[state=checked]:bg-green-500 data-[state=checked]:border-green-300 border-2v "
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        className="text-sm text-slate-300 cursor-pointer leading-4"
                        onClick={() => handlePermissionChange(
                          permission.id,
                          !selectedPermissions.includes(permission.id)
                        )}
                      >
                        {permission.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
