// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR'; 
const USER_INFO_KEY = 'wepcomic_userInfo';

export interface User { // <-- Exporta para usarla en otros sitios
  id: string;
  email: string;
  username: string;
  token: string;
  createdAt: string;
  role: UserRole; 
}

export interface AuthContextType { // <-- Exporta para usarla en otros sitios
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean; // <-- AÑADIDO: Para saber si aún estamos verificando la sesión
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true, // <-- AÑADIDO: Por defecto, asumimos que estamos cargando
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // <-- AÑADIDO: Estado para la carga inicial

  // Este useEffect se ejecuta solo una vez para verificar si hay un usuario en localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_INFO_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error al leer el usuario del localStorage", error);
      localStorage.removeItem(USER_INFO_KEY); // Limpiar si está corrupto
    } finally {
      setIsLoading(false); // <-- AÑADIDO: Terminamos la carga inicial
    }
  }, []); // El array vacío asegura que solo se ejecute al montar

  const login = (userData: User) => {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(USER_INFO_KEY);
    setUser(null);
    window.location.reload(); 
  };

  // Pasamos 'isLoading' en el valor del contexto
  const value = { user, login, logout, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};