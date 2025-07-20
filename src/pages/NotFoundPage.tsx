// src/pages/NotFoundPage.tsx

import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-200px)] text-[var(--text-primary)]">
      <AlertTriangle className="w-24 h-24 text-[var(--primary-accent)] mb-6" />
      
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold mt-2 text-[var(--text-secondary)]">Página no encontrada</h2>
      
      <p className="mt-4 max-w-md">
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </p>
      
      <Link
        to="/"
        className="mt-8 px-6 py-3 bg-[var(--primary-accent)] text-white font-bold rounded-lg shadow-lg transition-transform hover:scale-105"
      >
        Volver a la Página de Inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;