// src/components/layout/Sidebar.tsx

import { NavLink } from 'react-router-dom';
import { Home, Compass, Bookmark, Shield, ShieldOff, Languages, Globe } from 'lucide-react';
import { useContentFilter } from '../../context/ContentFilterContext';
import { useLanguage } from '../../context/LanguageContext';

const Sidebar = () => {
  const { showNsfw, toggleNsfw } = useContentFilter();
  const { language, cycleLanguage } = useLanguage();
  
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center p-4 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-[var(--primary-accent)] text-white'
        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-dark)] hover:text-white'
    }`;

  // Helper para obtener el texto y título correctos para el botón de idioma
  const getLangInfo = () => {
    switch(language) {
      case 'en': 
        return { text: 'EN', title: 'English / Switch to All Languages' };
      case 'all': 
        return { text: 'ALL', title: 'All Languages / Switch to Spanish' };
      case 'es':
      default: 
        return { text: 'ES', title: 'Español / Cambiar a Inglés' };
    }
  };
  const langInfo = getLangInfo();

  return (
    <aside className="fixed top-0 left-0 h-screen w-24 bg-[var(--background-dark)] border-r border-r-[var(--surface-dark)] p-4 flex flex-col items-center gap-6 z-20">
      <div className="p-2 bg-[var(--surface-dark)] rounded-lg mb-4">
        <h1 className="font-bold text-2xl text-[var(--primary-accent)]">WC</h1>
      </div>

      <nav className="flex flex-col gap-4 w-full">
        <NavLink to="/" className={getNavLinkClass}>
          <Home size={28} />
          <span className="text-xs mt-1">Inicio</span>
        </NavLink>
        <NavLink to="/explore" className={getNavLinkClass}>
          <Compass size={28} />
          <span className="text-xs mt-1">Explorar</span>
        </NavLink>
        <NavLink to="/favorites" className={getNavLinkClass}>
          <Bookmark size={28} />
          <span className="text-xs mt-1">Favoritos</span>
        </NavLink>
      </nav>

      <div className="mt-auto w-full space-y-4">
        {/* Selector de idioma con tres estados */}
        <button
          onClick={cycleLanguage}
          className="w-full flex flex-col items-center p-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-dark)] hover:text-white transition-colors"
          title={langInfo.title}
        >
          {language === 'all' ? <Globe size={28} /> : <Languages size={28} />}
          <span className="text-lg font-bold mt-1">{langInfo.text}</span>
        </button>

        {/* Interruptor para contenido +18 */}
        <button
          onClick={toggleNsfw}
          className={`w-full flex flex-col items-center p-3 rounded-lg transition-all duration-300 ${
            showNsfw
              ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
              : 'text-[var(--text-secondary)] hover:bg-[var(--surface-dark)] hover:text-white'
          }`}
          title={showNsfw ? "Mostrar solo contenido SFW" : "Mostrar solo contenido para adultos"}
        >
          {showNsfw ? <ShieldOff size={28} /> : <Shield size={28} />}
          <span className="text-xs mt-1">{showNsfw ? '+18' : 'SFW'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;