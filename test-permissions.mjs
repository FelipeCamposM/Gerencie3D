import db from '@/lib/db';

// Simular o usuário
const user = {
  id: 2,
  first_name: 'Gustavo',
  last_name: 'Martins',
  email: 'gustavo.martins@r3suprimentos.com.br',
  role: 'admin',
  user_level: 'adm',
  created_at: '2023-01-01T00:00:00.000Z'
};

async function testPermissions() {
  try {
    // Importar a função
    const { getUserPermissions } = await import('@/utils/permissions/userPermissions');
    
    console.log('Testing getUserPermissions with user:', user);
    const permissions = await getUserPermissions(user);
    console.log('Result:', permissions);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testPermissions();
