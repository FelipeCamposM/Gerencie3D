-- Renomeia nomes antigos de permissões para novos nomes can*
UPDATE permissions SET name='canViewSolicitacoes' WHERE name='view_solicitacoes';
UPDATE permissions SET name='canCreateSolicitacoes' WHERE name='create_solicitacoes';
UPDATE permissions SET name='canEditSolicitacoes' WHERE name='edit_solicitacoes';
UPDATE permissions SET name='canAprovar' WHERE name='approve_solicitacoes';
UPDATE permissions SET name='canRecusar' WHERE name='reject_solicitacoes';
UPDATE permissions SET name='canDesdobrar' WHERE name='split_solicitacoes';
UPDATE permissions SET name='canAbater' WHERE name='discount_solicitacoes';
UPDATE permissions SET name='canFinalizar' WHERE name='finalize_solicitacoes';
UPDATE permissions SET name='canDeleteSolicitacoes' WHERE name='delete_solicitacoes';
UPDATE permissions SET name='canViewUsers' WHERE name='view_users';
UPDATE permissions SET name='canCreateUsers' WHERE name='create_users';
UPDATE permissions SET name='canEditUsers' WHERE name='edit_users';
UPDATE permissions SET name='canDeleteUsers' WHERE name='delete_users';
UPDATE permissions SET name='canManagePermissions' WHERE name='manage_permissions';
UPDATE permissions SET name='canAccessAdmin' WHERE name='access_admin_panel';
UPDATE permissions SET name='canViewReports' WHERE name='view_reports';
UPDATE permissions SET name='canSystemSettings' WHERE name='system_settings';
