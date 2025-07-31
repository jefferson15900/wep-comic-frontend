// src/components/layout/Footer.tsx

import { Link } from 'react-router-dom';
import { Shield, FileText, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new
 
Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800/50 mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Columna 1: Logo, descripción y redes sociales */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">MangaWebHaven</h2>
            <p className="text-gray-400">
              Tu portal para leer, descubrir y compartir manga. Creado por y para la comunidad.
            </p>
            <div className="flex space-x-6">
              <a href="https://twitter.com/tu-usuario" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter size={24} />
              </a>
              <a href="https://github.com/jefferson15900/wep-comic-frontend" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <Github size={24} />
              </a>
              <a href="https://instagram.com/tu-usuario" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram size={24} />
              </a>
            </div>
          </div>

          {/* Columna 2 y 3: Legal y Disclaimer agrupados */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Legal y Contacto</h3>
              <ul role="list" className="mt-6 space-y-4">
                <li><Link to="/terms-of-service" className="text-sm leading-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"><FileText size={16} />Términos de Servicio</Link></li>
                <li><Link to="/privacy-policy" className="text-sm leading-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"><Shield size={16} />Política de Privacidad</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Descargo de Responsabilidad</h3>
              <p className="mt-6 text-sm text-gray-400">
                MangaWebHaven es un agregador de contenido y no aloja ningún archivo en sus servidores. Toda la información y las imágenes mostradas son obtenidas de fuentes de terceros y se proporcionan únicamente con fines informativos y de entretenimiento.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-base text-gray-500 xl:text-center">
            © {currentYear} MangaWebHaven. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;