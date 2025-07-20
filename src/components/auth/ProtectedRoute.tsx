// src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { user } = useAuth();

  // Si no hay usuario, redirige a /login.
  // 'replace' evita que la página protegida se añada al historial del navegador.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, renderiza el componente hijo (la página protegida).
  return <Outlet />;
};

export default ProtectedRoute;