// src/components/comic/ComicCard.tsx

import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { XCircle} from 'lucide-react';

// Interfaz para el tipado de los datos del cómic
interface Comic {
  id: string;
  title: string;
  author?: string;
  coverUrl: string;
}

// Interfaz para las props del componente
interface ComicCardProps {
  comic: Comic;
  onDelete?: (comicId: string) => void;
  badgeText?: string;
  size?: 'default' | 'small';
  deleteVariant?: 'favorite' | 'admin'; 
}

const ComicCard = ({ comic, onDelete, badgeText, size = 'default', deleteVariant = 'favorite' }: ComicCardProps) => {
  
  // Manejador para el clic en el botón de borrado
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();  // Evita que el Link navegue
    e.stopPropagation(); // Detiene la propagación del evento
    if (onDelete) {
      onDelete(comic.id);
    }
  };

  // Clases condicionales para el tamaño
  const paddingClass = size === 'small' ? 'p-2' : 'p-3';
  const titleClass = size === 'small' ? 'text-sm' : 'text-base';
  const authorClass = size === 'small' ? 'text-xs' : 'text-sm';

  // Información del botón de borrado según la variante
  const deleteButtonInfo = {
    favorite: {
      icon: <XCircle size={20} />,
      tooltip: 'Quitar de favoritos',
      className: 'bg-black/50 backdrop-blur-sm text-red-400 p-1 hover:bg-black/75 hover:text-red-300'
    },
    admin: {
      icon: <XCircle size={20} />,
      tooltip: 'Eliminar Manga (Admin)',
       className: 'bg-black/50 backdrop-blur-sm text-red-400 p-1 hover:bg-black/75 hover:text-red-300'
    }
  };
  const currentDeleteButton = deleteButtonInfo[deleteVariant];


  return (
    // Contenedor principal: es un "grupo" y reacciona a hover y focus-within
    <div className="relative aspect-[2/3] w-full bg-[var(--surface-dark)] rounded-lg overflow-hidden shadow-lg transition-all duration-300 group hover:scale-105 hover:shadow-2xl focus-within:scale-105 focus-within:shadow-2xl">
      <Link 
        to={`/comic/${comic.id}`} 
        className="block w-full h-full outline-none" // outline-none para quitar el borde de foco azul por defecto
        tabIndex={0} // tabIndex={0} hace que el Link sea "focuseable" al tocarlo
      >

        <LazyLoadImage
          alt={`Portada de ${comic.title}`}
          src={comic.coverUrl}
          effect="blur"
          className="w-full h-full object-cover"
          wrapperClassName="w-full h-full" 
        />

        {/* El degradado también reacciona al foco para una mejor legibilidad del texto */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 via-black/50 to-transparent transition-opacity group-hover:from-black/90 group-focus-within:from-black/90"></div>

        <div className={`absolute bottom-0 left-0 right-0 text-white ${paddingClass}`}>
          <h3 
            className={`${titleClass} font-bold truncate`}
            style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}
          >
            {comic.title}
          </h3>
          {comic.author && (
            <p 
              className={`${authorClass} text-gray-300 truncate`}
              style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}
            >
              {comic.author}
            </p>
          )}
        </div>

        {/* Botón de borrado: se muestra en hover (escritorio) Y en focus-within (táctil) */}
        {onDelete && (
          <button
            onClick={handleRemoveClick}
            className={`absolute top-2 left-2 rounded-full z-20 opacity-0 transition-all hover:scale-110 group-hover:opacity-100 group-focus-within:opacity-100 ${currentDeleteButton.className}`}
            title={currentDeleteButton.tooltip}
            aria-label={currentDeleteButton.tooltip}
          >
            {currentDeleteButton.icon}
          </button>
        )}

        {badgeText && (
          <div className="absolute top-2 right-2 bg-[var(--primary-accent)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
            {badgeText}
          </div>
        )}
      </Link>
    </div>
  );
};

export default ComicCard;