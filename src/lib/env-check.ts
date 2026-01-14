// Utilitário para verificar e validar variáveis de ambiente
export function getApiUrl(): string {
  const apiUrl = process.env.API_URL;
  
  if (!apiUrl) {
    console.error('API_URL não está configurada nas variáveis de ambiente');
    console.error('Usando URL padrão: http://192.168.7.104:3001/api');
    return "http://192.168.7.104:3001/api";
  }
  
  console.log(`Usando API_URL configurada: ${apiUrl}`);
  return apiUrl;
}

export function validateEnvironment(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    'API_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}

export function logEnvironmentStatus(): void {
  const { isValid, missingVars } = validateEnvironment();
  
  if (isValid) {
    console.log('✅ Todas as variáveis de ambiente necessárias estão configuradas');
  } else {
    console.error('❌ Variáveis de ambiente faltando:', missingVars);
  }
  
  // Log do ambiente atual
  console.log(`Ambiente atual: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Vercel: ${process.env.VERCEL ? 'Sim' : 'Não'}`);
}
