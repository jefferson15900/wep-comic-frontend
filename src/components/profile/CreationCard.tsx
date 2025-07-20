// src/components/profile/CreationCard.tsx

import ComicCard from '../comic/ComicCard';
import { Link } from 'react-router-dom';
import { Edit} from 'lucide-react';

// Interfaz para el tipado
interface Creation {
  id: string;
  title: string;
  coverUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
}

interface CreationCardProps {
  creation: Creation;
  onArchive: (mangaId: string) => void; // Función para archivar
}

const CreationCard = ({ creation, onArchive }: CreationCardProps) => {
  
  // Lógica para el badge de estado
  const getStatusInfo = () => {
    switch (creation.status) {
      case 'PENDING':
        return { text: 'Pendiente', classes: 'bg-yellow-500/20 text-yellow-300' };
      case 'REJECTED':
        return { text: 'Rechazado', classes: 'bg-red-500/20 text-red-400' };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="relative group">
      {/* 
        Usamos el ComicCard genérico. Le pasamos una función a 'onDelete'.
        El ComicCard no sabe qué hace, solo que tiene que mostrar un botón.
      */}
      <ComicCard 
        comic={creation} 
        size="small" 
        onDelete={() => onArchive(creation.id)} // Llama a onArchive con el ID
        deleteVariant="admin" // Podemos reutilizar el estilo de 'admin' (papelera)
      />
      
      {/* Botón para ir a la página de edición/gestión */}
      <Link
        to={`/edit/manga/${creation.id}`}
        className="absolute bottom-2 right-2 p-2 bg-gray-900/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--primary-accent)]"
        title="Gestionar manga"
      >
        <Edit size={16} />
      </Link>
      
      {/* Badge de estado */}
      {statusInfo && (
        <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${statusInfo.classes}`}>
          {statusInfo.text}
        </div>
      )}
    </div>
  );
};

export default CreationCard;