// src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner'; // Asegúrate de que Spinner esté importado

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth(); // <-- Obtenemos isLoading

  // --- ¡ESTA ES LA LÓGICA CLAVE! ---
  // Si estamos cargando, no tomes ninguna decisión todavía, solo muestra un spinner.
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  // Si ya no estamos cargando y NO hay usuario, entonces redirige.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si ya no estamos cargando y SÍ hay usuario, muestra el contenido.
  return <Outlet />;
};

export default ProtectedRoute;