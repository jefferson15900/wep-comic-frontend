// src/pages/HomePage.tsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ComicCarousel from '../components/comic/ComicCarousel';
import HeroCarousel from '../components/common/HeroCarousel';
import { 
  getRecentlyUpdatedComics, 
  getNewlyAddedComics // <-- Importamos la función restaurada
} from '../api/comicService';
import { getUploadedMangas } from '../api/mangaService'; 
import { deleteManga } from '../api/adminService';
import { useContentFilter } from '../context/ContentFilterContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext'; 
import { UploadCloud } from 'lucide-react';

const HomePage = () => {
  const { showNsfw } = useContentFilter();
  const { language } = useLanguage();
  const { user } = useAuth();

  const [recentlyUpdated, setRecentlyUpdated] = useState<any[]>([]);
  const [newlyAdded, setNewlyAdded] = useState<any[]>([]); // <-- Restauramos el estado
  const [communityMangas, setCommunityMangas] = useState<any[]>([]);
  
  const [loadingUpdated, setLoadingUpdated] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true); // <-- Restauramos el estado de carga
  const [loadingCommunity, setLoadingCommunity] = useState(true);

  useEffect(() => {
    setRecentlyUpdated([]);
    setNewlyAdded([]); // <-- Reseteamos el estado
    setCommunityMangas([]);
    setLoadingUpdated(true);
    setLoadingNew(true); // <-- Reseteamos el estado de carga
    setLoadingCommunity(true);

    const fetchAllData = async () => {
      // Añadimos la llamada a la nueva función en Promise.allSettled
      const [updatedResult, newResult, communityResult] = await Promise.allSettled([
        getRecentlyUpdatedComics(25, showNsfw, language),
        getNewlyAddedComics(15, showNsfw), // <-- Llamamos a la nueva función
        getUploadedMangas(1, 20, '', showNsfw) 
      ]);

      // Lógica para 'recentlyUpdated' (sin cambios)
      if (updatedResult.status === 'fulfilled' && updatedResult.value.length > 0) {
        setRecentlyUpdated(updatedResult.value);
      } else if (updatedResult.status === 'rejected') {
        console.error("Error fetching recently updated comics:", updatedResult.reason);
      }
      setLoadingUpdated(false);

      // --- Lógica para 'newlyAdded' (restaurada) ---
      if (newResult.status === 'fulfilled') {
        setNewlyAdded(newResult.value);
      } else if (newResult.status === 'rejected') {
        console.error("Error fetching newly added comics:", newResult.reason);
      }
      setLoadingNew(false);

      // Lógica para 'communityMangas' (sin cambios)
      if (communityResult.status === 'fulfilled') {
        setCommunityMangas(communityResult.value.data);
      } else if (communityResult.status === 'rejected') {
        console.error("Error fetching community mangas:", communityResult.reason);
      }
      setLoadingCommunity(false);
    };
    
    fetchAllData();
  }, [showNsfw, language]);

   const handleAdminDelete = async (mangaId: string) => {
    // Doble chequeo de seguridad
    if (user?.role !== 'ADMIN') {
      alert('Acción no permitida.');
      return;
    }
    
    // Confirmación del usuario
    if (window.confirm('¿Estás seguro de que quieres ELIMINAR este manga de forma permanente?')) {
      try {
        await deleteManga(mangaId, user.token);
        // Actualizamos la UI al instante para quitar el manga eliminado
        setCommunityMangas(prev => prev.filter(manga => manga.id !== mangaId));
        alert('Manga eliminado con éxito.');
      } catch (error) {
        console.error("Error al eliminar el manga:", error);
        alert('No se pudo eliminar el manga.');
      }
    }
  };

  return (
      <div>
       {/* Este no necesita borrado, así que no se le pasan las props */}
       <HeroCarousel comics={recentlyUpdated.slice(0, 5)} />
        <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Añadido por la Comunidad</h2>
        <Link to="/community" className="text-sm font-semibold text-[var(--primary-accent)] hover:underline">
             Ver todos
         </Link>
      </div>
        {/* Aquí manejamos el caso vacío por separado antes de renderizar el carrusel */}
        {!loadingCommunity && communityMangas.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-secondary)] bg-[var(--surface-dark)] rounded-lg">
            <UploadCloud size={48} className="mx-auto mb-4 text-[var(--primary-accent)]" />
            <p className="font-semibold text-lg text-white">¡La comunidad aún no ha añadido contenido!</p>
            <p className="mt-2 text-sm mb-6">
              El contenido añadido por administradores aparecerá aquí.
            </p>
            <Link to="/creator-studio" className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-[var(--primary-accent)] text-white font-bold rounded-lg shadow-lg transition-transform hover:scale-105">
              Subir Manga
            </Link>
          </div>
        ) : (
          <ComicCarousel
            title="" 
            comics={communityMangas}
            loading={loadingCommunity}
            // --- ¡AQUÍ ESTÁ LA MAGIA! ---
            // Solo pasamos la función de borrado si el usuario es un ADMIN
            onDeleteComic={user?.role === 'ADMIN' ? handleAdminDelete : undefined}
            // Y le decimos qué estilo de botón usar
            deleteVariant="admin"
          />
        )}
      </section>
      
      {/* Estos carruseles no necesitan la funcionalidad de borrado */}
      <ComicCarousel
        title="Nuevos Episodios"
        comics={recentlyUpdated.slice(5)}
        loading={loadingUpdated}
      />
      
      <ComicCarousel
        title="Nuevas Obras en la Plataforma"
        comics={newlyAdded}
        loading={loadingNew}
      />
    </div>
  );
};


export default HomePage;