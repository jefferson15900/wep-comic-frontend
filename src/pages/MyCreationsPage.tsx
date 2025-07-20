// src/pages/MyCreationsPage.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as userService from '../api/userService';
import * as communityService from '../api/communityService';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import CreateMangaForm from '../components/forms/CreateMangaForm';
import CreationCard from '../components/profile/CreationCard';
import { Plus } from 'lucide-react';

// Interfaces para el tipado
interface Creation {
  id: string;
  title: string;
  coverUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
}

const MyCreationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [creations, setCreations] = useState<Creation[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Lógica para el scroll infinito
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prev => prev + 20); // Cargar los siguientes 20
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Función para cargar las creaciones
  const fetchCreations = useCallback(() => {
    if (!user?.username || !hasMore) {
      if (!user?.username) setLoading(false);
      return;
    }
    setLoading(true);
    userService.getUserCreations(user.username, 20, offset, user.token)
      .then(response => {
        setCreations(prev => (offset === 0 ? response.data : [...prev, ...response.data]));
        setHasMore(response.meta.hasMore);
      })
      .catch(error => {
        console.error("Error fetching user creations:", error);
        setHasMore(false); // Detener la carga si hay un error
      })
      .finally(() => setLoading(false));
  }, [user, offset, hasMore]);

  // Efecto para resetear en cambio de usuario
  useEffect(() => {
    setCreations([]);
    setOffset(0);
    setHasMore(true);
  }, [user]);

  // Efecto para cargar los datos
  useEffect(() => {
    fetchCreations();
  }, [fetchCreations]);

  // Callback que se ejecuta cuando el formulario de creación tiene éxito
  const handleMangaCreated = (newManga: { id: string }) => {
    setIsCreateModalOpen(false);
    // Redirigimos al usuario a la página de gestión del nuevo manga
    navigate(`/edit/manga/${newManga.id}`);
  };

  // Función para manejar el archivado de un manga
  const handleArchive = async (mangaId: string) => {
    if (!user) return;
    
    const mangaToArchive = creations.find(c => c.id === mangaId);
    if (!mangaToArchive) return;

    if (window.confirm(`¿Estás seguro de que quieres Eliminar "${mangaToArchive.title}"? Ya no será visible públicamente.`)) {
      try {
        await communityService.archiveManga(mangaId, user.token);
        // Actualizamos la UI al instante para quitar el manga de la lista.
        setCreations(prev => prev.filter(manga => manga.id !== mangaId));
        alert('Manga eliminado  con éxito.');
      } catch (error) {
        console.error("Error al eliminar el manga:", error);
        alert('No se pudo eliminar el manga.');
      }
    }
  };

  return (
    <div>
<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
  <h1 className="text-3xl font-bold">Creator Studio</h1>
  <button
    onClick={() => setIsCreateModalOpen(true)}
    className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-[var(--primary-accent)] text-white font-bold rounded-lg shadow-lg transition-transform hover:scale-105"
  >
    <Plus size={20} />
    Subir Nueva Obra
  </button>
</div>

      {loading && creations.length === 0 ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : creations.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {creations.map((creation, index) => {
            const isLastElement = creations.length === index + 1;
            return (
               <div ref={isLastElement ? lastElementRef : null} key={creation.id}>
                   <CreationCard 
                       creation={creation} 
                       onArchive={handleArchive} 
                   />
               </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-20 border-2 border-dashed border-gray-700 rounded-lg">
          <p className="text-lg font-semibold">Aún no has subido ninguna creación.</p>
          <p className="mt-2">¡Haz clic en "Subir Nueva Obra" para empezar a compartir tu contenido!</p>
        </div>
      )}

      {loading && creations.length > 0 && <div className="flex justify-center py-8"><Spinner /></div>}
      {!hasMore && !loading && creations.length > 0 && <p className="text-center text-gray-400 py-8">Has llegado al final de tus creaciones.</p>}
      
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title=""
      >
        <CreateMangaForm onMangaCreated={handleMangaCreated} />
      </Modal>
    </div>
  );
};

export default MyCreationsPage;