// src/components/profile/CreationsTab.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as userService from '../../api/userService';
import { useAuth } from '../../context/AuthContext';
import ComicCard from '../comic/ComicCard';
import Spinner from '../common/Spinner';
import { Edit } from 'lucide-react';

// Interfaces para tipado
type ContentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
interface Creation {
  id: string;
  title: string;
  coverUrl: string;
  status: ContentStatus;
}

// Sub-componente para la tarjeta de creación con estado y botón de gestionar
const CreationCard = ({ creation }: { creation: Creation }) => {
  
  const getStatusInfo = () => {
    switch (creation.status) {
      case 'PENDING':
        return { text: 'Pendiente', classes: 'bg-yellow-500/20 text-yellow-300' };
      case 'REJECTED':
        return { text: 'Rechazado', classes: 'bg-red-500/20 text-red-400' };
      default:
        return null; // No mostramos nada para 'APPROVED'
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="relative">
      <ComicCard comic={creation} size="small" />
      <Link
        to={`/edit/manga/${creation.id}`}
        className="absolute bottom-2 right-2 p-2 bg-gray-900/80 text-white rounded-full hover:bg-[var(--primary-accent)] transition-all"
        title="Gestionar manga"
      >
        <Edit size={16} />
      </Link>
      {statusInfo && (
        <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${statusInfo.classes}`}>
          {statusInfo.text}
        </div>
      )}
    </div>
  );
};


const CreationsTab = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [creations, setCreations] = useState<Creation[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLElement | null) => {
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
    setCreations([]);
    setOffset(0);
    setHasMore(true);
  }, [username]);

  useEffect(() => {
    if (!username || !hasMore) return;
    
    setLoading(true);
    userService.getUserCreations(username, 20, offset, user?.token)
      .then(response => {
        setCreations(prev => offset === 0 ? response.data : [...prev, ...response.data]);
        setHasMore(response.meta.hasMore);
      })
      .catch(error => {
        console.error("Error fetching user creations:", error);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [username, offset, user?.token]);

  if (loading && offset === 0) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  if (creations.length === 0) {
    return <p className="text-center text-gray-500 py-10">Este usuario aún no ha subido ninguna creación.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
        {creations.map((creation, index) => {
          if (creations.length === index + 1) {
            return <div ref={lastElementRef as any} key={creation.id}><CreationCard creation={creation} /></div>;
          }
          return <CreationCard key={creation.id} creation={creation} />;
        })}
      </div>
      {loading && offset > 0 && <div className="flex justify-center py-8"><Spinner /></div>}
    </>
  );
};

export default CreationsTab;