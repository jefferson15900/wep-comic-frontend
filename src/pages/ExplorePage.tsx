// src/pages/ExplorePage.tsx

import { useEffect, useState, useRef, useCallback } from 'react';
import { getMangaTags, getComicsByTag, getPopularComics } from '../api/comicService';
import Spinner from '../components/common/Spinner';
import ComicCard from '../components/comic/ComicCard';
import { useContentFilter } from '../context/ContentFilterContext';
import { useLanguage } from '../context/LanguageContext';
import { AlertTriangle } from 'lucide-react';

// Interfaces para dar forma a nuestros datos y mejorar la seguridad de tipos.
interface Tag {
  id: string;
  name: string;
}
interface Comic {
  id: string;
  title: string;
  author?: string;
  coverUrl: string;
}

const ExplorePage = () => {
  const { showNsfw } = useContentFilter();
  const { language } = useLanguage();

  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [comics, setComics] = useState<Comic[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('Más Populares');

 const observer = useRef<IntersectionObserver | null>(null);

  // Hook para el scroll infinito, observa el último elemento.
  const lastComicElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prevOffset => prevOffset + 20); // Cargar los siguientes 20
      }
    });

    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  // Efecto para resetear la lista cuando cambian los filtros principales.
  useEffect(() => {
    setComics([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
  }, [showNsfw, language, selectedTag]);

  // Efecto principal para cargar los datos de cómics.
  useEffect(() => {
    // Si no hay más por cargar, no hacemos nada.
    if (!hasMore) return;
    
    const fetchData = async () => {
      if (offset === 0) {
        setLoading(true); // Spinner grande para la carga inicial
      } else {
        setLoadingMore(true); // Spinner pequeño para scroll infinito
      }

      try {
        let data;
        if (selectedTag) {
          setPageTitle(`Resultados para: ${selectedTag.name}`);
          data = await getComicsByTag(selectedTag.id, 20, offset, showNsfw, language);
        } else {
          setPageTitle(showNsfw ? 'Más Populares (+18)' : 'Más Populares');
          data = await getPopularComics(20, offset, showNsfw, language);
        }
        
        setComics(prev => (offset === 0 ? data.comics : [...prev, ...data.comics]));
        setHasMore(data.hasMore);

      } catch (err) {
        console.error("Error fetching comics in ExplorePage:", err);
        setError("No se pudieron cargar los cómics. Por favor, inténtalo de nuevo más tarde.");
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    
    fetchData();

  }, [selectedTag, offset, showNsfw, language]); // Se ejecuta al cambiar filtros u offset

  // Efecto para cargar los tags (géneros), se ejecuta solo una vez.
  useEffect(() => {
    getMangaTags()
      .then(setTags)
      .catch(err => console.error("Error fetching tags:", err));
  }, []);

  const handleTagClick = (tag: Tag | null) => {
    if (tag?.id === selectedTag?.id) return; // Evitar recarga si se hace clic en el mismo tag
    setSelectedTag(tag);
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Explorar</h1>
      
      {/* Barra de filtros por Tags/Géneros */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button
          onClick={() => handleTagClick(null)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            !selectedTag ? 'bg-[var(--primary-accent)] text-white' : 'bg-[var(--surface-dark)] text-[var(--text-secondary)] hover:bg-[var(--primary-accent)] hover:text-white'
          }`}
        >
          Populares
        </button>
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => handleTagClick(tag)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              selectedTag?.id === tag.id ? 'bg-[var(--primary-accent)] text-white' : 'bg-[var(--surface-dark)] text-[var(--text-secondary)] hover:bg-[var(--primary-accent)] hover:text-white'
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">{pageTitle}</h2>
        
        {loading ? ( // Spinner grande en la carga inicial
            <div className="flex justify-center py-20"><Spinner /></div>
        ) : error ? ( // Mensaje de error si la carga falló
            <div className="text-center py-20 text-red-400 flex flex-col items-center gap-4">
                <AlertTriangle size={48} />
                <p className="font-semibold text-lg">{error}</p>
            </div>
        ) : comics.length > 0 ? ( // Cuadrícula de cómics
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
            {comics.map((comic, index) => {
              // Asignamos la ref al último elemento para el scroll infinito
              if (comics.length === index + 1) {
                return <div ref={lastComicElementRef} key={comic.id}><ComicCard comic={comic} size="small" /></div>;
              } else {
                return <ComicCard key={comic.id} comic={comic} size="small" />;
              }
            })}
          </div>
        ) : ( // Mensaje si no hay resultados
          <p className="text-center text-[var(--text-secondary)] py-20">No se encontraron resultados para esta categoría.</p>
        )}

        {/* Spinner pequeño para el scroll infinito */}
        {loadingMore && <div className="flex justify-center py-8"><Spinner /></div>}

        {/* Mensaje al llegar al final */}
        {!hasMore && !loading && comics.length > 0 && <p className="text-center text-[var(--text-secondary)] py-8">Has llegado al final.</p>}
      </div>
    </div>
  );
};

export default ExplorePage;