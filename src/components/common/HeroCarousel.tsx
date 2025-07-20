// src/components/common/HeroCarousel.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';

// Interfaz para el tipado de los datos del cómic
interface HeroComic {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  coverUrl: string;
}

// Interfaz para las props del componente principal
interface HeroCarouselProps {
  comics: HeroComic[];
  interval?: number;
}

// --- Sub-componente para una sola Slide ---
// Este componente ahora tiene dos diseños diferentes para móvil y escritorio.
const HeroSlide = ({ comic, isActive }: { comic: HeroComic, isActive: boolean }) => {
  return (
    // Toda la slide es un enlace a la página de detalles del cómic.
    <Link 
      to={`/comic/${comic.id}`}
      className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
    >
      {/* 1. IMAGEN DE FONDO/PRINCIPAL */}
      {/* En móvil, es la imagen principal (nítida, object-cover). */}
      {/* En escritorio (md en adelante), se le añaden filtros de desenfoque y brillo. */}
      <img
        src={comic.coverUrl}
        alt={`Portada de ${comic.title}`}
        className="absolute inset-0 w-full h-full object-cover md:filter md:blur-md md:scale-110 md:brightness-50"
      />
      
      {/* 2. CONTENIDO SUPERPUESTO (SOLO PARA ESCRITORIO) */}
      {/* Este div está completamente oculto en móvil ('hidden') y aparece en escritorio ('md:flex'). */}
      <div className="relative z-10 h-full p-10 gap-6 hidden md:flex items-center">
        {/* Portada nítida, solo visible en escritorio */}
        <img
          src={comic.coverUrl}
          alt="" // El alt ya está en la imagen principal, este es decorativo.
          className="h-full max-h-[270px] w-auto rounded-md shadow-lg object-contain"
        />
        {/* Detalles del cómic, solo visibles en escritorio */}
        <div className="flex flex-col justify-center h-full">
          <h1 className="text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
            {comic.title}
          </h1>
          <p className="text-lg mt-1 text-gray-300 drop-shadow-md">
            {comic.author}
          </p>
          <p className="mt-4 max-w-lg text-gray-200 text-base leading-relaxed">
            {comic.synopsis.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
          </p>
          <div
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary-accent)] font-bold rounded-lg shadow-lg transition-transform hover:scale-105 w-fit"
          >
            <PlayCircle />
            Ver Detalles
          </div>
        </div>
      </div>
    </Link>
  );
};


// --- Componente principal del Carrusel ---
const HeroCarousel = ({ comics, interval = 7000 }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lógica para el cambio automático de slide (sin cambios)
  useEffect(() => {
    if (comics.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % comics.length);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [comics, comics.length, interval]);

  // Esqueleto de carga con altura responsiva
  if (!comics || comics.length === 0) {
    return <div className="w-full h-80 md:h-96 bg-[var(--surface-dark)] rounded-lg animate-pulse mb-8 sm:mb-12"></div>;
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    // Altura responsiva: más alto en escritorio para el diseño con texto
    <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden mb-8 sm:mb-12 text-white shadow-2xl">
      {comics.map((comic, index) => (
        <HeroSlide key={comic.id} comic={comic} isActive={index === currentIndex} />
      ))}
      
      {/* Puntos de navegación para controlar el carrusel */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {comics.map((_, index) => (
          <button
            key={index}
            onClick={(e) => { 
              // Evitamos que el clic en el botón active el Link de la slide
              e.preventDefault(); 
              e.stopPropagation();
              goToSlide(index); 
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentIndex === index ? 'bg-[var(--primary-accent)] scale-125' : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Ir a la slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;