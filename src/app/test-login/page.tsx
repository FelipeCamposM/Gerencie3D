'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestLogin() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const doLogin = async () => {
    try {
      setMessage('Fazendo login...');
      
      const response = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@teste.com',
          password: '123456'
        }),
        credentials: 'include' // Importante para cookies
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('Login bem-sucedido! Salvando dados...');
        
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', result.token);
        
        setMessage('Dados salvos. Redirecionando...');
        
        // Aguardar um pouco e redirecionar
        setTimeout(() => {
          window.location.href = '/'; // Usar window.location para força uma navegação completa
        }, 1000);
        
      } else {
        setMessage(`Erro: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Erro de conexão: ${error}`);
    }
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl mb-4">Teste de Login</h1>
      
      <button
        onClick={doLogin}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white mb-4"
      >
        Fazer Login de Teste
      </button>
      
      <div className="bg-gray-800 p-4 rounded">
        <h3>Status:</h3>
        <p>{message}</p>
      </div>
      
      <div className="mt-4">
        <button
          onClick={() => router.push('/debug')}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white mr-2"
        >
          Ver Debug
        </button>
        
        <button
          onClick={() => router.push('/login')}
          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
        >
          Ir para Login
        </button>
      </div>
    </div>
  );
}
