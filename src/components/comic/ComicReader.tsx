// src/components/comic/ComicReader.tsx

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

// El tipo DisplayMode no cambia
type DisplayMode = 'fitWidth' | 'fitHeight';

interface ComicReaderProps {
  pages: string[];
  displayMode: DisplayMode;
}

const ComicReader = ({ pages, displayMode }: ComicReaderProps) => {
  // Simplificamos la lógica de clases. Ya no necesitamos un contenedor separado
  // con clases complejas para cada imagen.
  const containerClasses = "flex flex-col items-center";

  return (
    <div className={containerClasses}>
      {pages.map((pageUrl, index) => {
        // --- LÓGICA DE CLASES MEJORADA ---
        let imageClasses = "mx-auto"; // Centramos la imagen por defecto

        if (displayMode === 'fitWidth') {
          // Para 'fitWidth', queremos que la imagen ocupe todo el ancho disponible.
          // Eliminamos el max-w-4xl. 'w-full' hará que se estire al 100% del contenedor.
          // 'h-auto' mantendrá la proporción.
           imageClasses += " w-full max-w-6xl h-auto"; 
        } else { // displayMode === 'fitHeight'
          // Para 'fitHeight', queremos que la imagen ocupe toda la altura visible.
          // 'h-[calc(100vh-80px)]' calcula la altura de la ventana menos el header.
          // 'w-auto' mantendrá la proporción.
       imageClasses += " h-[calc(100vh-80px)] w-auto object-contain";
        }

        return (
          <div key={index} className="mb-1 w-full"> {/* Un contenedor simple para el margen */}
            <LazyLoadImage
              alt={`Página ${index + 1}`}
              src={pageUrl}
              effect="blur"
              className={imageClasses} // Aplicamos las clases calculadas
              threshold={500} // Aumentamos un poco el umbral para una carga más suave
              width="100%" // Damos una pista al lazy-loader sobre el ancho
            />
          </div>
        );
      })}
    </div>
  );
};

export default ComicReader;