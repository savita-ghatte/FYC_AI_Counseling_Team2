import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { setAuthToken } from '../utils/api';

interface User {
  id: string;
  email: string;
  role: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User, rememberMe?: boolean) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setAuthToken(storedToken);
    }
    
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User, rememberMe: boolean = true) => {
    setToken(newToken);
    setUser(newUser);
    setAuthToken(newToken);
    
    if (rememberMe) {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } else {
      sessionStorage.setItem('token', newToken);
      sessionStorage.setItem('user', JSON.stringify(newUser));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
