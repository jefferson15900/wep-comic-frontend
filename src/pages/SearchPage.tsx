// src/pages/SearchPage.tsx

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ComicCard from '../components/comic/ComicCard';
import Spinner from '../components/common/Spinner';
import { getAllComics } from '../api/comicService';
import { getUploadedMangas } from '../api/mangaService';
import { useContentFilter } from '../context/ContentFilterContext'; // <-- 1. IMPORTA EL HOOK

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const { showNsfw } = useContentFilter(); // <-- 2. USA EL HOOK

  const [comics, setComics] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  
 const observer = useRef<IntersectionObserver | null>(null);

  const lastComicElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prevOffset => prevOffset + 20);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    if (!query) {
      setComics([]);
      setLoading(false);
      setHasMore(false);
      return;
    }
    
    if (offset === 0) {
      setComics([]);
    }
    
    setLoading(true);
    const fetchComics = async () => {
      try {
        const mangaDexPromise = getAllComics(20, offset, query, showNsfw, 'all');
        
        const communityPromise = offset === 0 
            ? getUploadedMangas(1, 100, query, showNsfw) // <-- 3. PASA EL VALOR DE 'showNsfw'
            : Promise.resolve({ data: [] }); // Devuelve un objeto que simula la respuesta paginada
        
        const [mangaDexData, communityResponse] = await Promise.all([
          mangaDexPromise,
          communityPromise
        ]);

        const newComics = mangaDexData.comics;
        const newHasMore = mangaDexData.hasMore;
        
        const communityData = communityResponse.data || [];

        const combinedComics = [...communityData, ...newComics];
        
        setComics(prevComics => {
          const allComics = [...prevComics, ...combinedComics];
          const uniqueComics = Array.from(new Map(allComics.map(comic => [comic.id, comic])).values());
          return uniqueComics;
        });

        setHasMore(newHasMore);

      } catch (error) {
        console.error("Error fetching search results:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
  }, [query, offset, showNsfw]); // <-- Añade showNsfw a las dependencias

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
  }, [query]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Resultados para: "{query}"
      </h1>
      
      {comics.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {comics.map((comic, index) => {
            if (comics.length === index + 1) {
              return <div ref={lastComicElementRef} key={comic.id}><ComicCard comic={comic} /></div>;
            } else {
              return <ComicCard key={comic.id} comic={comic} />;
            }
          })}
        </div>
      ) : (
        !loading && query && <p className="text-center text-[var(--text-secondary)] py-20">No se encontraron resultados para "{query}".</p>
      )}
      {!loading && !query && <p className="text-center text-[var(--text-secondary)] py-20">Ingresa un término para buscar.</p>}

      {loading && <div className="flex justify-center py-8"><Spinner /></div>}
      {!hasMore && !loading && comics.length > 0 && <p className="text-center text-[var(--text-secondary)] py-8">Has llegado al final de los resultados.</p>}
    </div>
  );
};

export default SearchPage;