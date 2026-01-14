const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPermissions() {
  try {
    console.log('=== Checking Permissions ===');
    
    // Verificar se existem permissões
    const permissions = await prisma.permissions.findMany();
    console.log('Available permissions:', permissions);
    
    // Verificar usuários
    const users = await prisma.user_profiles.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        user_level: true,
        permission_preset_id: true
      }
    });
    console.log('Users:', users);
    
    // Verificar permissões do usuário
    const userPermissions = await prisma.user_permissions.findMany({
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        },
        permission: true
      }
    });
    console.log('User permissions:', userPermissions);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPermissions();
