// src/components/layout/Footer.tsx

import { Link } from 'react-router-dom';
import { MessageCircle, Shield, FileText } from 'lucide-react'; // Íconos relevantes

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900/50 border-t border-gray-800 mt-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Columna 1: Logo e Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">WepComic</h2>
            <p className="text-sm text-gray-400">
              Una plataforma comunitaria para leer, compartir y descubrir nuevas obras.
            </p>
            <p className="text-xs text-gray-500">
              © {currentYear} WepComic. Todos los derechos reservados.
            </p>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Navegación</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-[var(--primary-accent)] transition-colors">Inicio</Link></li>
              <li><Link to="/explore" className="text-gray-400 hover:text-[var(--primary-accent)] transition-colors">Explorar</Link></li>
              <li><Link to="/creator-studio" className="text-gray-400 hover:text-[var(--primary-accent)] transition-colors">Creator Studio</Link></li>
            </ul>
          </div>

          {/* Columna 3: Legal y Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms-of-service" className="flex items-center gap-2 text-gray-400 hover:text-[var(--primary-accent)] transition-colors">
                  <FileText size={16} /> Términos de Servicio
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="flex items-center gap-2 text-gray-400 hover:text-[var(--primary-accent)] transition-colors">
                  <Shield size={16} /> Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/contact" className="flex items-center gap-2 text-gray-400 hover:text-[var(--primary-accent)] transition-colors">
                  <MessageCircle size={16} /> Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/*
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
          <p>Este sitio es un proyecto de portafolio. El contenido es proporcionado por la comunidad y APIs externas.</p>
        </div>
        */}
      </div>
    </footer>
  );
};

export default Footer;