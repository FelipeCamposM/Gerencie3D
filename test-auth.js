// Script para testar a criação de usuário e login
// Execute este script no console do navegador ou use o Node.js

async function testCreateUser() {
  const userData = {
    first_name: "Admin",
    last_name: "Teste",
    email: "admin@teste.com",
    password: "123456",
    role: "administrador",
    user_level: "alto"
  };

  try {
    const response = await fetch('http://localhost:3001/api/usuarios/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    console.log('Usuário criado:', result);
    return result;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  }
}

async function testLogin() {
  const loginData = {
    email: "admin@teste.com",
    password: "123456"
  };

  try {
    const response = await fetch('http://localhost:3001/api/usuarios/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const result = await response.json();
    console.log('Login resultado:', result);
    return result;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
  }
}

// Executar testes
testCreateUser().then(() => {
  console.log('Aguardando 2 segundos antes do teste de login...');
  setTimeout(testLogin, 2000);
});
