// src/pages/UserProfilePage.tsx

import { useEffect, useState } from 'react';
import { useParams, useMatch, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfileByUsername } from '../api/userService';
import Spinner from '../components/common/Spinner';
import { AlertTriangle } from 'lucide-react';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import FavoritesTab from '../components/profile/FavoritesTab';
import CreationsTab from '../components/profile/CreationsTab';
import ContributionsTab from '../components/profile/ContributionsTab';
import SettingsTab from '../components/profile/SettingsTab';

// --- Interfaces para un tipado robusto ---
interface UserProfileData {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  favoritesArePublic: boolean;
}

interface UserStats {
  favorites: number;
  creations: number;
  contributions: number;
}

const UserProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: loggedInUser } = useAuth();
  
  // Usamos useMatch para determinar la pestaña activa desde la URL.
  // Esto hace que la URL sea la "fuente de la verdad".
  const match = useMatch('/profile/:username/:tab');
  const activeTab = match?.params.tab || 'favorites'; // 'favorites' es la pestaña por defecto.

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const handleProfileUpdate = (updatedUser: UserProfileData) => {
    setProfileData(prev => prev ? { ...prev, ...updatedUser } : updatedUser);
   }
  // Efecto de seguridad: si un usuario intenta acceder a la pestaña de 'settings'
  // de otro usuario, lo redirigimos a la pestaña principal de ese perfil.
  useEffect(() => {
    if (activeTab === 'settings' && loggedInUser?.username !== username) {
      navigate(`/profile/${username}`, { replace: true });
    }
  }, [activeTab, loggedInUser, username, navigate]);

  // Efecto para cargar los datos de la cabecera del perfil.
  useEffect(() => {
    if (!username) return;

    setLoading(true);
    setError(null);
    getUserProfileByUsername(username)
      .then(response => {
        setProfileData(response.profile);
        setStats(response.stats);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'No se pudo cargar el perfil.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [username]);

  const isOwner = loggedInUser?.username === username;

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (error) return <div className="text-center py-20 text-red-400"><AlertTriangle size={48} className="mx-auto mb-4"/>{error}</div>;
  if (!profileData || !stats) return <div className="text-center py-20">Perfil no encontrado.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 1. Cabecera del Perfil */}
      <ProfileHeader profile={profileData} stats={stats} isOwner={isOwner} />
      
      {/* 2. Barra de Pestañas de Navegación */}
      <ProfileTabs activeTab={activeTab} isOwner={isOwner} stats={stats} />

      {/* 3. Contenido dinámico basado en la pestaña activa */}
      <div className="mt-8">
        {activeTab === 'favorites' && <FavoritesTab />}
        
       {activeTab === 'creations' && stats.creations > 0 && (<CreationsTab />)}
        
       {activeTab === 'contributions' && stats.contributions > 0 && (<ContributionsTab />)}
        
       {isOwner && activeTab === 'settings' && (<SettingsTab profile={profileData} onProfileUpdate={handleProfileUpdate} />)}
      </div>
    </div>
  );
};

export default UserProfilePage;