// src/components/common/FloatingActionButton.tsx

import { Link } from 'react-router-dom';
import { UploadCloud } from 'lucide-react';

const FloatingActionButton = () => {
  return (
    // Usamos un Link para que la navegación sea interna de React
    <Link
      to="/creator-studio" // Esta es la ruta a tu Creator Studio
      className="fixed bottom-6 right-6 z-20 flex items-center gap-3 px-5 py-3 bg-[var(--primary-accent)] text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl group"
      title="Sube tu propio manga"
    >
      <UploadCloud className="h-6 w-6 transition-transform group-hover:animate-bounce" />
      {/* El texto se oculta en pantallas pequeñas para que solo quede el ícono */}
      <span className="hidden sm:block">Sube tu Manga</span>
    </Link>
  );
};

export default FloatingActionButton;