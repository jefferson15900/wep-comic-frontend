// src/components/auth/AdminRouteGuard.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner'; // Asumiendo que quieres un spinner de carga

const AdminRouteGuard = () => {
  const { user, isLoading } = useAuth(); // Usamos también isLoading

  // Mientras se verifica el estado de autenticación, muestra un spinner.
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
  // Si el usuario está logueado y su rol es ADMIN o MODERATOR, permite el acceso.
  if (user && (user.role === 'ADMIN' || user.role === 'MODERATOR')) {
    return <Outlet />; // Renderiza la página de administración anidada
  }

  // Si no cumple la condición, lo redirigimos a la página de inicio.
  return <Navigate to="/" replace />;
};

export default AdminRouteGuard;