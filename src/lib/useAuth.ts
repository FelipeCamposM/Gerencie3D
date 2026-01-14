import { useState, useEffect } from 'react';
import { getStoredUser, getStoredToken, type User } from './auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Só executa no cliente
    if (typeof window !== 'undefined') {
      const storedUser = getStoredUser();
      const storedToken = getStoredToken();
      
      setUser(storedUser);
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const isAuthenticated = Boolean(user && token);

  return {
    user,
    token,
    isAuthenticated,
    isLoading
  };
}
