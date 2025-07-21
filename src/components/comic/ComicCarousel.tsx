// src/components/comic/ComicCarousel.tsx

import { useState, useRef, useLayoutEffect } from 'react';
import ComicCard from './ComicCard';
import Spinner from '../common/Spinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Interfaz de props
type ComicCarouselProps = {
  title: string;
  comics: any[];
  loading: boolean;
  onDeleteComic?: (comicId: string) => void;
  deleteVariant?: 'favorite' | 'admin';
};

const ComicCarousel = ({ title, comics, loading, onDeleteComic, deleteVariant = 'favorite' }: ComicCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const checkScrollButtons = () => {
    const el = scrollContainerRef.current;
    if (el) {
      const isScrollable = el.scrollWidth > el.clientWidth;
      setShowPrev(el.scrollLeft > 0);
      setShowNext(isScrollable && Math.ceil(el.scrollLeft) < el.scrollWidth - el.clientWidth - 1);
    }
  };

  useLayoutEffect(() => {
    if (!loading && scrollContainerRef.current) {
      checkScrollButtons();
    }
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [comics, loading]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.8; 
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollButtons, 500);
    }
  };

  return (
    <section className="mb-12">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}

      {loading ? (
         <div className="flex justify-center items-center min-h-[300px]"><Spinner /></div>
      ) : (
        // Este es el "GRUPO EXTERNO". Controla los botones de navegación.
        <div className="relative group/carousel"> 
          
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollButtons}
            className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide"
          >
            {comics.map(comic => (
              // Este es el "GRUPO INTERNO". Controla el botón de borrado de cada tarjeta.
              <div key={comic.id} className="flex-shrink-0 w-48">
                <ComicCard 
                  comic={comic} 
                  onDelete={onDeleteComic}
                  deleteVariant={deleteVariant}
                />
              </div>
            ))}
          </div>

          {/* Este botón 'group-hover' reacciona al GRUPO EXTERNO */}
          {showPrev && (
            <button
              onClick={() => scroll('left')}
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 opacity-0 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Este botón 'group-hover' también reacciona al GRUPO EXTERNO */}
          {showNext && (
            <button
              onClick={() => scroll('right')}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      )}
    </section>
  );
};

// Mueve esto a tu archivo CSS global si es posible
if (!document.getElementById('scrollbar-styles')) {
  const styleSheet = document.createElement("style");
  styleSheet.id = 'scrollbar-styles';
  styleSheet.innerText = `
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `;
  document.head.appendChild(styleSheet);
}

export default ComicCarousel;