// src/components/profile/ContributionsTab.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as userService from '../../api/userService';
import Spinner from '../common/Spinner';
import { Edit, FilePlus } from 'lucide-react';

// Interfaces para tipado
type ContributionType = 'CHAPTER_ADDITION' | 'METADATA_EDIT';
interface Contribution {
  id: string;
  type: ContributionType;
  mangaId: string;
  mangaTitle: string;
  description: string;
  date: string;
}

const ContributionCard = ({ contribution }: { contribution: Contribution }) => {
  const contributionDate = new Date(contribution.date).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="p-4 bg-[var(--surface-dark)] rounded-lg flex items-center gap-4">
      <div className="p-2 bg-gray-700 rounded-full">
        {contribution.type === 'CHAPTER_ADDITION' ? 
          <FilePlus className="text-green-400" size={24} /> : 
          <Edit className="text-cyan-400" size={24} />}
      </div>
      <div className="flex-1">
        <p className="text-white font-semibold">{contribution.description}</p>
        <p className="text-sm text-gray-400">
          para <Link to={`/comic/${contribution.mangaId}`} className="font-bold text-gray-300 hover:underline">{contribution.mangaTitle}</Link>
        </p>
      </div>
      <p className="text-xs text-gray-500 self-start">{contributionDate}</p>
    </div>
  );
};

const ContributionsTab = () => {
  const { username } = useParams<{ username: string }>();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prev => prev + 15);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    setContributions([]);
    setOffset(0);
    setHasMore(true);
  }, [username]);

  useEffect(() => {
    if (!username || !hasMore) return;

    setLoading(true);
    userService.getUserContributions(username, 15, offset)
      .then(response => {
        setContributions(prev => offset === 0 ? response.data : [...prev, ...response.data]);
        setHasMore(response.meta.hasMore);
      })
      .catch(error => {
        console.error("Error fetching user contributions:", error);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [username, offset]);

  if (loading && offset === 0) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  if (contributions.length === 0) {
    return <p className="text-center text-gray-500 py-10">Este usuario aún no ha hecho ninguna contribución.</p>;
  }

  return (
    <div className="space-y-4">
      {contributions.map((contribution, index) => {
        if (contributions.length === index + 1) {
          return <div ref={lastElementRef as any} key={contribution.id}><ContributionCard contribution={contribution} /></div>;
        }
        return <ContributionCard key={contribution.id} contribution={contribution} />;
      })}
      {loading && offset > 0 && <div className="flex justify-center py-8"><Spinner /></div>}
    </div>
  );
};

export default ContributionsTab;