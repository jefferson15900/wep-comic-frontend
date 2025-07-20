// src/components/profile/ProfileHeader.tsx

import { Link } from 'react-router-dom';
import { User, Star, CheckCircle, Brush } from 'lucide-react';

// --- Interfaces para un tipado robusto ---
interface UserProfileData {
  username: string;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

interface UserStats {
  favorites: number;
  creations: number;
  contributions: number;
}

interface ProfileHeaderProps {
  profile: UserProfileData;
  stats: UserStats;
  isOwner: boolean;
}

// --- Componente para los Badges de Rol ---
const RoleBadge = ({ role, creations, contributions }: { role: string, creations: number, contributions: number }) => {
  let badgeText = 'Miembro';
  let badgeClass = 'bg-gray-700 text-gray-300';

  if (role === 'ADMIN') {
    badgeText = 'Administrador';
    badgeClass = 'bg-cyan-500/20 text-cyan-300';
  }else if(role === 'MODERATOR'){
    badgeText = 'Moderador'; 
    badgeClass = 'bg-blue-500/20 text-blue-300';
  } else if (creations > 0) {
    badgeText = 'Creador';
    badgeClass = 'bg-purple-500/20 text-purple-300';
  } else if (contributions > 0) {
    badgeText = 'Contribuidor';
    badgeClass = 'bg-green-500/20 text-green-300';
  }

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badgeClass}`}>
      {badgeText}
    </span>
  );
};

// --- Componente Principal del Header del Perfil ---
const ProfileHeader = ({ profile, stats, isOwner }: ProfileHeaderProps) => {
  
  const joinDate = new Date(profile.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long',
  });

  return (
    <div className="bg-[var(--surface-dark)] p-6 md:p-8 rounded-lg shadow-lg flex flex-col md:flex-row items-center gap-6 md:gap-8">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-28 h-28 md:w-36 md:h-36 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={`Avatar de ${profile.username}`} className="w-full h-full object-cover" />
          ) : (
            <User size={64} className="text-gray-500" />
          )}
        </div>
      </div>

      {/* Información y Estadísticas */}
      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
        {/* Nombre y Rol */}
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-bold text-white">@{profile.username}</h1>
          <RoleBadge role={profile.role} creations={stats.creations} contributions={stats.contributions} />
        </div>
        
        {/* Fecha de Ingreso */}
        <p className="text-sm text-gray-400 mt-1">Se unió en {joinDate}</p>
        
        {/* Estadísticas */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 mt-4 pt-4 border-t border-gray-700/50 w-full">
          <div className="flex items-center gap-2 text-gray-300">
            <Star size={18} className="text-yellow-400" />
            <span className="font-bold text-white">{stats.favorites}</span>
            Favoritos
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Brush size={18} className="text-purple-400" />
            <span className="font-bold text-white">{stats.creations}</span>
            Creaciones
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <CheckCircle size={18} className="text-green-400" />
            <span className="font-bold text-white">{stats.contributions}</span>
            Contribuciones
          </div>
        </div>
      </div>
      
      {/* Botón de Editar Perfil (Contextual) */}
      {isOwner && (
        <div className="md:ml-auto self-center md:self-start">
          <Link
            to={`/profile/${profile.username}/settings`} // Enlazará a la pestaña de configuración
            className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm font-semibold hover:bg-gray-600 transition-colors"
          >
            Editar Perfil
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;