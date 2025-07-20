// src/components/common/HeroBanner.tsx

import { Link } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';

// --- HELPER FUNCTIONS ---
// 1. Función para quitar etiquetas HTML
const stripHtml = (html: string): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

// 2. Función para truncar texto
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};


type HeroBannerProps = {
  comic: any;
};

const HeroBanner = ({ comic }: HeroBannerProps) => {
  if (!comic) {
    return (
      <div className="w-full h-80 bg-[var(--surface-dark)] rounded-lg animate-pulse mb-12"></div>
    );
  }

  // 3. Preparamos la sinopsis limpia y truncada
  const cleanSynopsis = stripHtml(comic.synopsis);
  const displaySynopsis = truncateText(cleanSynopsis, 150); // Truncamos a 150 caracteres

  return (
    <div className="relative w-full h-80 rounded-lg overflow-hidden mb-12 text-white shadow-2xl">
      {/* Imagen de fondo */}
      <img
        src={comic.coverUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover filter blur-md scale-110 brightness-50"
      />
      {/* Contenedor del contenido */}
      <div className="relative z-10 flex items-center h-full p-6 md:p-10 gap-6">
        {/* Portada del cómic */}
        <img
          src={comic.coverUrl}
          alt={`Portada de ${comic.title}`}
          className="h-full max-h-[270px] w-auto rounded-md shadow-lg object-contain hidden md:block"
        />
        {/* Detalles y Call to Action */}
        <div className="flex flex-col justify-center h-full">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg">
            {comic.title}
          </h1>
          <p className="text-lg mt-1 text-gray-300 drop-shadow-md">
            {comic.author}
          </p>
          {/* 4. Usamos la sinopsis preparada */}
          <p className="mt-4 max-w-lg text-gray-200 text-sm md:text-base leading-relaxed">
            {displaySynopsis}
          </p>
          <Link
            to={`/comic/${comic.id}`}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary-accent)] font-bold rounded-lg shadow-lg transition-transform hover:scale-105 w-fit"
          >
            <PlayCircle />
            Ver Detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;