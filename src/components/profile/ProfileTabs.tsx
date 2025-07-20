// src/components/profile/ProfileTabs.tsx

import { Link, useParams } from 'react-router-dom';

interface ProfileTabsProps {
  activeTab: string;
  isOwner: boolean;
  stats: {
    creations: number;
    contributions: number;
  };
}

const ProfileTabs = ({ activeTab, isOwner, stats }: ProfileTabsProps) => {
  const { username } = useParams<{ username: string }>();

 const getTabClass = (tabName: string) => {
  return `py-3 px-4 text-sm font-semibold transition-colors flex-shrink-0 whitespace-nowrap ${
    activeTab === tabName
      ? 'text-white border-b-2 border-[var(--primary-accent)]'
      // Reducimos el padding horizontal en móvil para que quepan más
      : 'text-gray-400 hover:text-white'
  }`;
};

  return (
<div className="mt-8">
  <div className="border-b border-gray-700">
    {/* 
      - overflow-x-auto: Permite el scroll horizontal si el contenido se desborda.
      - scrollbar-hide: Nuestra clase personalizada para ocultar la barra de scroll.
      - -mb-px: Sigue funcionando para que el borde de la pestaña activa se fusione.
    */}
    <nav className="flex space-x-1 overflow-x-auto scrollbar-hide -mb-px">
      <Link to={`/profile/${username}`} className={getTabClass('favorites')}>
        Favoritos
      </Link>

      {stats.creations > 0 && (
        <Link to={`/profile/${username}/creations`} className={getTabClass('creations')}>
          Creaciones
        </Link>
      )}

      {stats.contributions > 0 && (
        <Link to={`/profile/${username}/contributions`} className={getTabClass('contributions')}>
          Contribuciones
        </Link>
      )}

      {isOwner && (
        <Link to={`/profile/${username}/settings`} className={getTabClass('settings')}>
          Configuración
        </Link>
      )}
    </nav>
  </div>
</div>
  );
};

export default ProfileTabs;