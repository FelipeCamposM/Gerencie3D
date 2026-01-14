'use client';
import { useEffect, useState } from 'react';

export default function Debug() {
  const [cookieInfo, setCookieInfo] = useState<string>('');
  const [localStorageInfo, setLocalStorageInfo] = useState<string>('');

  useEffect(() => {
    // Verificar cookies
    setCookieInfo(document.cookie);
    
    // Verificar localStorage
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    setLocalStorageInfo(`User: ${user}, Token: ${token}`);
  }, []);

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl mb-4">Debug de Autenticação</h1>
      
      <div className="mb-4">
        <h2 className="text-xl mb-2">Cookies:</h2>
        <pre className="bg-gray-800 p-4 rounded">{cookieInfo || 'Nenhum cookie encontrado'}</pre>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl mb-2">localStorage:</h2>
        <pre className="bg-gray-800 p-4 rounded">{localStorageInfo}</pre>
      </div>
      
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
      >
        Recarregar
      </button>
    </div>
  );
}
