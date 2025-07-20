// src/components/profile/FavoritesTab.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as userService from '../../api/userService';
import { getComicsByIds } from '../../api/comicService';
import { getUploadedMangasByIds } from '../../api/mangaService';
import ComicCard from '../comic/ComicCard';
import Spinner from '../common/Spinner';
import { useFavorites } from '../../hooks/useFavorites';

interface Comic {
  id: string;
  title: string;
  author?: string;
  coverUrl: string;
}

const FavoritesTab = () => {
  const { username } = useParams<{ username: string }>();
  const { removeFavorite } = useFavorites();

  const [comics, setComics] = useState<Comic[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastComicElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prev => prev + 20);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    setComics([]);
    setOffset(0);
    setHasMore(true);
  }, [username]);

  useEffect(() => {
    if (!username || !hasMore) return;
    
    setLoading(true);
    const fetchFavoritesDetails = async () => {
      try {
        const { data: comicIds, meta } = await userService.getUserFavorites(username, 20, offset);

        if (comicIds.length === 0) {
          setHasMore(false);
          setLoading(false);
          return;
        }

        const mangaDexIds: string[] = comicIds.filter((id: string) => !(id.startsWith('c') && !id.includes('-')));
        const localIds: string[] = comicIds.filter((id: string) => id.startsWith('c') && !id.includes('-'));

        const [mangaDexResults, localResultsResponse] = await Promise.all([
          getComicsByIds(mangaDexIds),
          getUploadedMangasByIds(localIds)
        ]);

        // --- LÓGICA DE SEGURIDAD PARA MANEJAR AMBOS TIPOS DE RESPUESTA ---
        const localResults = Array.isArray(localResultsResponse) 
          ? localResultsResponse 
          : localResultsResponse?.data || [];

        const newComics = [...mangaDexResults, ...localResults];
        const sortedNewComics = comicIds
          .map((id: string) => newComics.find(comic => comic.id === id))
          .filter(Boolean) as Comic[];
        
        setComics(prev => (offset === 0 ? sortedNewComics : [...prev, ...sortedNewComics]));
        setHasMore(meta.hasMore);

      } catch (error) {
        console.error("Error fetching user favorites:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    fetchFavoritesDetails();
  }, [username, offset]);
  
  const handleRemoveFavorite = (comicIdToRemove: string) => {
    removeFavorite(comicIdToRemove);
    setComics(prevComics => prevComics.filter(comic => comic.id !== comicIdToRemove));
  };

  if (loading && offset === 0) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  if (comics.length === 0) {
    return <p className="text-center text-gray-500 py-10">Este usuario no tiene favoritos públicos.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
        {comics.map((comic, index) => {
          const isLastElement = comics.length === index + 1;
          return (
            <div ref={isLastElement ? lastComicElementRef : null} key={comic.id}>
              <ComicCard
                comic={comic}
                size="small"
                onDelete={handleRemoveFavorite}
                deleteVariant="favorite"
              />
            </div>
          );
        })}
      </div>
      {loading && offset > 0 && <div className="flex justify-center py-8"><Spinner /></div>}
    </>
  );
};

export default FavoritesTab;