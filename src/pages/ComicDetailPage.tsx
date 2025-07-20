// src/pages/ComicDetailPage.tsx

import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as adminService from '../api/adminService';
import { getComicById, getMangaStatistics, findChaptersFromAnySource, type MappedComic } from '../api/comicService';
import { getUploadedMangaById } from '../api/mangaService';
import Spinner from '../components/common/Spinner';
import ChapterList, { type Chapter } from '../components/comic/ChapterList';
import ExpandableText from '../components/common/ExpandableText';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import { useContentFilter } from '../context/ContentFilterContext';
import { useAuth } from '../context/AuthContext';
import { Bookmark, HelpCircle, ArrowUpDown, Star, Heart, Plus, Edit } from 'lucide-react';

interface BaseComic {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  coverUrl: string;
  chapters: Chapter[];
}

interface UploadedComic extends BaseComic {
  createdAt: string;
  userHasPendingProposal?: boolean;
}

type ExternalComic = MappedComic;
type ComicDetail = UploadedComic | ExternalComic;

// --- Componente ---
const ComicDetailPage = () => {
  const { comicId } = useParams<{ comicId: string }>();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { language } = useLanguage();
  const { showNsfw } = useContentFilter();

  const [comic, setComic] = useState<ComicDetail | null>(null);
  const [stats, setStats] = useState<{ rating: number; follows: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortAscending, setSortAscending] = useState(false);
  const [isSearchingOtherSources, setIsSearchingOtherSources] = useState(false);
  const { user } = useAuth(); 
  
  useEffect(() => {
    if (!comicId) return;

    const fetchComicData = async () => {
      setLoading(true);
      setError(null);
      setComic(null);
      const isLocalId = comicId.startsWith('c') && !comicId.includes('-');

      try {
        let comicData: ComicDetail;
        let statsData = null;

        if (isLocalId) {
          const rawData = await getUploadedMangaById(comicId);
          const standardizedChapters: Chapter[] = rawData.chapters.map((chapter: any) => ({
            id: chapter.id,
            number: chapter.chapterNumber,
            title: chapter.title,
            language: chapter.language || 'en',
            source: 'local'
          }));
          comicData = { ...rawData, chapters: standardizedChapters };
        }  else {
          const [externalComicData, mangaStatsData] = await Promise.all([
            getComicById(comicId, language, showNsfw), 
            getMangaStatistics(comicId)
          ]);
          comicData = externalComicData;
          statsData = mangaStatsData;
        }
        setComic(comicData);
        if (statsData) setStats(statsData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'No se pudo encontrar el cómic.');
      } finally {
        setLoading(false);
      }
    };
    fetchComicData();
  }, [comicId, language, showNsfw, user]);

  const handleFavoriteToggle = () => { if (!comic) return; isFavorite(comic.id) ? removeFavorite(comic.id) : addFavorite(comic.id); };
  
  const handleSearchOtherSources = async () => {
    if (!comic || !('allTitlesRaw' in comic)) return;
    setIsSearchingOtherSources(true);
    try {
      const consumetChapters = await findChaptersFromAnySource(comic.allTitlesRaw || [], comic.origin || 'ja');
      if (consumetChapters.length > 0) {
        setComic(prevComic => prevComic ? { ...prevComic, chapters: consumetChapters } : null);
      } else {
        alert('No se encontraron fuentes alternativas.');
      }
    } catch (error) {
      console.error("Error al buscar en otras fuentes", error);
    } finally {
      setIsSearchingOtherSources(false);
    }
  };

  const sortedChapters = useMemo(() => {
    if (!comic?.chapters) return [];
        const filtered = comic.chapters.filter(chapter => language === 'all' || chapter.language === language);
    return [...filtered].sort((a, b) => sortAscending ? a.number - b.number : b.number - a.number);
  }, [comic?.chapters, language, sortAscending]);
  
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };

  if (loading) return <div className="flex justify-center items-center h-96"><Spinner /></div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!comic) return <div className="p-4 text-center text-[var(--text-secondary)]">No hay datos del cómic.</div>;

  const isCommunityManga = 'createdAt' in comic;

    const handleAdminDeleteChapter = async (chapterId: string) => {
    if (!user || user.role !== 'ADMIN') {
      alert('Acción no permitida.');
      return;
    }

    try {
      await adminService.deleteChapter(chapterId, user.token);
      // Actualizamos la UI localmente para quitar el capítulo al instante
      setComic(prev => {
        if (!prev) return null;
        return {
          ...prev,
          chapters: (prev.chapters ?? []).filter(ch => ch.id !== chapterId)

        };
      });
      alert('Capítulo eliminado con éxito.');
    } catch (error) {
      console.error("Error al eliminar el capítulo:", error);
      alert('No se pudo eliminar el capítulo.');
    }
  };


  return (
    <>
      <div className="flex flex-col md:flex-row gap-8">
        <img src={comic.coverUrl} alt={`Portada de ${comic.title}`} className="w-full md:w-1/3 rounded-lg object-cover self-start shadow-lg" />
        <div className="flex-1">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[var(--text-primary)]">{comic.title}</h1>
              <h2 className="text-xl text-[var(--text-secondary)] mt-1">{comic.author}</h2>
              {isCommunityManga ? (
                <div className="mt-4 text-sm text-gray-500">Subido por la comunidad</div>
              ) : stats && (
                <div className="flex items-center gap-4 mt-4 text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1.5" title="Calificación"><Star className="text-yellow-400" size={20} fill="currentColor" /><span className="font-bold text-lg text-white">{stats.rating > 0 ? stats.rating : 'N/A'}</span></div>
                  <div className="flex items-center gap-1.5" title="Seguidores"><Heart className="text-red-500" size={20} fill="currentColor" /><span className="font-bold text-lg text-white">{formatNumber(stats.follows)}</span></div>
                </div>
              )}
            </div>
            <button onClick={handleFavoriteToggle} className="p-3 bg-[var(--surface-dark)] rounded-lg text-[var(--primary-accent)] transition-colors hover:bg-opacity-80 flex-shrink-0" aria-label="Añadir a favoritos">
              <Bookmark size={24} fill={isFavorite(comic.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          <ExpandableText text={comic.synopsis} />
          
          {/* --- SECCIÓN DE CONTRIBUCIÓN CON ESTILOS COHERENTES --- */}
          {isCommunityManga && user && (
            <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <h4 className="font-bold text-lg mb-3 text-white">¡Ayuda a mejorar esta entrada!</h4>
<div className="flex flex-col sm:flex-row gap-3">
  <Link
    to={`/manga/${comic.id}/add-chapter`}
    className="flex-1 text-center px-4 py-2 bg-[var(--secondary-accent)] text-white font-semibold rounded-md hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
  >
    <Plus size={18} />
    Añadir Capítulo
  </Link>

  {/* --- ¡AQUÍ ESTÁ LA LÓGICA CONDICIONAL! --- */}
  {/* Si el backend nos dice que el usuario tiene una propuesta pendiente... */}
  {comic.userHasPendingProposal ? (
    // ...mostramos un botón deshabilitado.
    <button
      disabled
      className="flex-1 text-center px-4 py-2 bg-gray-800 text-gray-500 rounded-md cursor-not-allowed flex items-center justify-center gap-2"
      title="Ya tienes una propuesta pendiente para este manga. Espera a que sea revisada."
    >
      <Edit size={18} />
      Propuesta Enviada
    </button>
  ) : (
    // ...si no, mostramos el enlace normal.
    <Link
      to={`/manga/${comic.id}/propose-edit`}
      className="flex-1 text-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
    >
      <Edit size={18} />
      Proponer Edición
    </Link>
  )}
</div>
            </div>
          )}
          
          <div className="mt-8">
            <div className="flex justify-between items-center border-b-2 border-[var(--surface-dark)] pb-2 mb-4">
              <h3 className="text-2xl font-bold">Capítulos</h3>
              <button onClick={() => setSortAscending(prev => !prev)} className="p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-dark)]" title="Ordenar capítulos"><ArrowUpDown size={20} /></button>
            </div>
            {sortedChapters.length > 0 ? (
              <ChapterList chapters={sortedChapters} comicId={comic.id} onDeleteChapter={user?.role === 'ADMIN' ? handleAdminDeleteChapter : undefined}/>
            ) : (
              <div className="text-center py-10 text-[var(--text-secondary)] bg-[var(--surface-dark)] rounded-lg">
                <HelpCircle size={40} className="mx-auto mb-4" />
                <p className="font-semibold">{isCommunityManga ? "Este manga aún no tiene capítulos." : "No se encontraron capítulos."}</p>
                <p className="text-sm mb-4">{isCommunityManga ? "¡Sé el primero en añadir uno!" : "Prueba a buscar en otras fuentes."}</p>
                {!isCommunityManga && (
                  <button onClick={handleSearchOtherSources} disabled={isSearchingOtherSources} className="px-5 py-2.5 font-medium bg-[var(--secondary-accent)] text-white rounded-lg shadow-md hover:scale-105 disabled:opacity-50">
                    {isSearchingOtherSources ? 'Buscando...' : 'Buscar en otras fuentes'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ComicDetailPage;