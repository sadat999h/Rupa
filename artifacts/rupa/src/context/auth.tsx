import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGetMe, getGetMeQueryKey } from '@workspace/api-client-react';
import type { User } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rupa_token'));

  const { data: user, isLoading, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
    }
  });

  const handleLogin = (newToken: string) => {
    localStorage.setItem('rupa_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('rupa_token');
    setToken(null);
    queryClient.removeQueries({ queryKey: getGetMeQueryKey() });
  };

  useEffect(() => {
    if (error) {
      handleLogout();
    }
  }, [error]);

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading: isLoading && !!token,
        isAuthenticated: !!user,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
