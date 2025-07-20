// src/pages/CommunityPage.tsx

import { useEffect, useState, useRef, useCallback } from 'react';
import { getUploadedMangas } from '../api/mangaService';
import Spinner from '../components/common/Spinner';
import ComicCard from '../components/comic/ComicCard';
import { useContentFilter } from '../context/ContentFilterContext';
import { AlertTriangle } from 'lucide-react';

interface Comic {
  id: string;
  title: string;
  author?: string;
  coverUrl: string;
}

const CommunityPage = () => {
  const { showNsfw } = useContentFilter();

  const [comics, setComics] = useState<Comic[]>([]);
  const [offset, setOffset] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastComicElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prevOffset => prevOffset + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);


  // Efecto para resetear cuando el filtro cambia.
  // Esto está correcto y es muy importante.
  useEffect(() => {
    setComics([]);
    setOffset(1);
    setHasMore(true);
    setError(null);
  }, [showNsfw]); // Se resetea cuando showNsfw cambia.


  // Efecto principal para cargar los datos.
  useEffect(() => {
    // Si ya no hay más páginas, detenemos la ejecución.
    if (!hasMore && offset > 1) return;
    
    const fetchData = async () => {
      // Diferenciamos entre la carga inicial y las cargas subsecuentes.
      if (offset === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        // La función de servicio ahora recibe el valor actual de 'showNsfw'.
        const data = await getUploadedMangas(offset, 21, '', showNsfw);
        
        // Actualizamos los cómics y si hay más páginas.
        setComics(prev => (offset === 1 ? data.data : [...prev, ...data.data]));
        setHasMore(data.pagination.page < data.pagination.totalPages);

      } catch (err) {
        console.error("Error loading community mangas:", err);
        setError("No se pudieron cargar las obras de la comunidad.");
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    
    // Llamamos a la función para obtener los datos.
    fetchData();

  // --- ¡AQUÍ ESTÁ LA CORRECCIÓN CLAVE! ---
  // El efecto ahora depende tanto de 'offset' (para el scroll infinito)
  // como de 'showNsfw' (para reaccionar al cambio de filtro).
  // Como el primer useEffect ya limpia el estado, este se ejecutará con offset=1
  // y traerá los datos correctos para el nuevo filtro.
  }, [offset, showNsfw]);


  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Añadido por la Comunidad</h1>
      
      {loading && comics.length === 0 ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : error ? (
        <div className="text-center py-20 text-red-400 flex flex-col items-center gap-4">
            <AlertTriangle size={48} />
            <p className="font-semibold text-lg">{error}</p>
        </div>
      ) : comics.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
          {comics.map((comic, index) => {
            const isLastElement = comics.length === index + 1;
            return (
              <div ref={isLastElement ? lastComicElementRef : null} key={comic.id}>
                <ComicCard comic={comic} size="small" />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-[var(--text-secondary)] py-20">No hay obras de la comunidad que coincidan con tus filtros.</p>
      )}

      {loadingMore && <div className="flex justify-center py-8"><Spinner /></div>}
      {!hasMore && !loading && comics.length > 0 && <p className="text-center text-[var(--text-secondary)] py-8">Has llegado al final.</p>}
    </div>
  );
};

export default CommunityPage;