// src/pages/admin/ReviewPage.tsx

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as adminService from '../../api/adminService';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { Check, X, Trash2, Eye, AlertTriangle, MessageSquareQuote, ArchiveRestore } from 'lucide-react';

// --- Interfaces para un tipado robusto ---
interface Page {
  id: string;
  pageNumber: number;
  imageUrl: string;
}

interface ChapterForReview {
  id: string;
  chapterNumber: number;
  title: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  justification: string | null;
  language: string;
  pages: Page[];
}

interface MangaForReview {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  uploader: { username: string };
  lastEditedBy: { username: string } | null;
  chapters: ChapterForReview[];
}

// --- Componente ---
const ReviewPage = () => {
  const { mangaId } = useParams<{ mangaId: string }>();
  const [manga, setManga] = useState<MangaForReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagesToView, setPagesToView] = useState<Page[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isLockedByMe, setIsLockedByMe] = useState(false);
  const [lockError, setLockError] = useState('');
  const [conflictingChapters, setConflictingChapters] = useState<Record<string, string[]>>({});

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchMangaData = useCallback(async () => {
    if (!mangaId || !user?.token) return;
    try {
      const data = await adminService.getMangaForReview(mangaId, user.token);
      setManga(data);
    } catch (err) {
      setError('No se pudo recargar la información del manga.');
      console.error(err);
    }
  }, [mangaId, user?.token]);

  useEffect(() => {
    if (!manga?.chapters) {
      setConflictingChapters({});
      return;
    }

    const pendingGroups = manga.chapters
      .filter(c => c.status === 'PENDING')
      .reduce((acc, chapter) => {
        const key = `${chapter.chapterNumber}-${chapter.language}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(chapter.id);
        return acc;
      }, {} as Record<string, string[]>);

    const conflicts = Object.fromEntries(
      Object.entries(pendingGroups).filter(([_key, value]) => value.length > 1)

    );
    setConflictingChapters(conflicts);
  }, [manga]);

  useEffect(() => {
    if (!mangaId || !user?.token) return;
    let isComponentMounted = true;

    const loadPageData = async () => {
      setLoading(true);
      setError('');
      setLockError('');

      try {
        const initialData = await adminService.getMangaForReview(mangaId, user.token);
        if (!isComponentMounted) return;
        setManga(initialData);

        const needsReview = initialData.status === 'PENDING' || initialData.chapters.some((c: ChapterForReview) => c.status === 'PENDING');

        if (initialData.status !== 'ARCHIVED' && needsReview) {
          await adminService.lockManga(mangaId, user.token);
          if (isComponentMounted) setIsLockedByMe(true);
        }
      } catch (err: any) {
        if (!isComponentMounted) return;
        if (err.response?.status === 409) {
          setLockError(err.response.data.message);
          setIsLockedByMe(false);
        } else {
          setError('No se pudo cargar el manga para revisión.');
        }
        console.error(err);
      } finally {
        if (isComponentMounted) setLoading(false);
      }
    };

    loadPageData();

    return () => {
      isComponentMounted = false;
      if (mangaId && user.token && isLockedByMe) {
        adminService.unlockManga(mangaId, user.token);
      }
    };
  }, [mangaId, user?.token]);
  
  const handleAction = async (action: Function, ...args: any[]) => {
    try {
      // Nota: Aquí iría la lógica del modal de rechazo si se implementa
      await action(...args, user?.token);
      await fetchMangaData();
    } catch (err) {
      alert('La operación falló. Revisa la consola para más detalles.');
      console.error(err);
    }
  };
  
  const handleDelete = async () => {
    if (!manga) return;
    if (window.confirm(`¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE "${manga.title}"? Esta acción no se puede deshacer.`)) {
      try {
        await adminService.deleteManga(mangaId!, user!.token);
        navigate('/admin/moderation-queue');
      } catch (err) {
        alert('La operación de eliminación falló.');
      }
    }
  };

const handleRestore = async () => {
  if (!manga) return;
  if (window.confirm(`¿Restaurar "${manga.title}"? Volverá a la cola de revisión.`)) {
    try {
      // --- ¡USA LA NUEVA FUNCIÓN DEL SERVICIO! ---
      await adminService.restoreManga(mangaId!, user!.token);
      alert('Manga restaurado con éxito.');
      navigate('/admin/moderation-queue');
    } catch (err) {
      alert('La operación de restauración falló.');
    }
  }
};

  const sortedChapters = useMemo(() => {
    if (!manga?.chapters) return [];
    return [...manga.chapters].sort((a: ChapterForReview, b: ChapterForReview) => b.chapterNumber - a.chapterNumber);
  }, [manga?.chapters]);

  const hasConflicts = Object.keys(conflictingChapters).length > 0;

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (error) return <div className="text-center py-20 text-red-400"><AlertTriangle size={48} className="mx-auto mb-4"/>{error}</div>;
  if (lockError) return <div className="text-center py-20 text-yellow-400"><AlertTriangle size={48} className="mx-auto mb-4"/>{lockError}</div>;
  if (!manga) return <div className="text-center py-20">No se encontró el manga.</div>;
  
  if (manga.status === 'ARCHIVED') {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-2">Manga Archivado</h1>
        <h2 className="text-xl text-gray-400 mb-8">{manga.title}</h2>
        <div className="bg-red-900/30 border border-red-700 p-6 rounded-lg text-center">
          <p className="text-lg text-red-300">Este manga fue archivado por su creador ({manga.uploader.username}).</p>
          <p className="text-gray-400 mt-2">Puedes restaurarlo para que vuelva a ser visible o eliminarlo permanentemente.</p>
          <div className="flex gap-4 justify-center mt-6">
            <button onClick={handleRestore} className="p-3 bg-green-600 hover:bg-green-700 rounded-md flex items-center gap-2">
              <ArchiveRestore size={18}/> Restaurar Manga
            </button>
            {user?.role === 'ADMIN' && (
              <button onClick={handleDelete} className="p-3 bg-red-700 hover:bg-red-800 rounded-md flex items-center gap-2">
                <Trash2 size={18}/> Eliminar Permanentemente
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Revisión de Contenido</h1>
      <h2 className="text-xl text-gray-400 mb-8">{manga.title}</h2>
      
      {hasConflicts && (
        <div className="p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg mb-8">
          <h3 className="font-bold flex items-center gap-2"><AlertTriangle /> ¡Atención! Se han detectado conflictos</h3>
          <p className="text-sm mt-1">Hay múltiples versiones pendientes para algunos capítulos. Los botones de acción global han sido deshabilitados. Por favor, revisa y decide sobre cada versión individualmente.</p>
        </div>
      )}
      
<div className="bg-[var(--surface-dark)] p-4 rounded-lg mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <p className="font-bold text-lg text-center sm:text-left">Acciones para Todo el Manga</p>
  
  <div className="flex gap-2 justify-center">
    {/* Botón Aprobar */}
    <button 
      onClick={() => handleAction(adminService.approveManga, mangaId)} 
      disabled={!isLockedByMe} 
      className="p-2 sm:px-3 sm:py-2 bg-green-600 hover:bg-green-700 rounded-md flex items-center justify-center gap-2 flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
      title="Aprobar Pendientes"
    >
      <Check size={18}/>
      <span className="hidden sm:inline">Aprobar</span>
    </button>
    
    {/* Botón Rechazar */}
    <button 
      onClick={() => handleAction(adminService.rejectManga, mangaId, { reason: 'Rechazo general.' })} 
      disabled={!isLockedByMe} 
      className="p-2 sm:px-3 sm:py-2 bg-orange-600 hover:bg-orange-700 rounded-md flex items-center justify-center gap-2 flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
      title="Rechazar Pendientes"
    >
      <X size={18}/>
      <span className="hidden sm:inline">Rechazar</span>
    </button>
    
    {/* Botón Eliminar (solo para admins) */}
    {user?.role === 'ADMIN' && (
      <button 
        onClick={handleDelete} 
        disabled={!isLockedByMe} 
        className="p-2 sm:px-3 sm:py-2 bg-red-700 hover:bg-red-800 rounded-md flex items-center justify-center gap-2 flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
        title="Eliminar Manga"
      >
        <Trash2 size={18}/>
        <span className="hidden sm:inline">Eliminar</span>
      </button>
    )}
  </div>
</div>

      <div className="bg-[var(--surface-dark)] p-6 rounded-lg mb-8">
        <h3 className="text-xl font-bold mb-4">Metadatos (Estado: <span className={`font-mono ${manga.status === 'PENDING' ? 'text-yellow-400' : 'text-green-400'}`}>{manga.status}</span>)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <p><strong className="text-gray-400">Título:</strong> {manga.title}</p>
          <p><strong className="text-gray-400">Autor:</strong> {manga.author}</p>
          <p><strong className="text-gray-400">Subido por:</strong> {manga.uploader.username}</p>
          <p><strong className="text-gray-400">Última contribución:</strong> {manga.lastEditedBy?.username || 'N/A'}</p>
          <p className="col-span-2"><strong className="text-gray-400">Sinopsis:</strong> {manga.synopsis}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4">Capítulos</h3>
        <div className="space-y-3">
          {sortedChapters.map((chapter) => {
            const chapterKey = `${chapter.chapterNumber}-${chapter.language}`;
            const isInConflict = conflictingChapters[chapterKey] !== undefined;

            return (
              <div key={chapter.id} className={`p-4 rounded-lg transition-all ${chapter.status === 'PENDING' ? 'bg-yellow-900/50' : 'bg-[var(--surface-dark)]'} ${isInConflict && chapter.status === 'PENDING' ? 'border-2 border-red-500' : 'border border-transparent'}`}>
               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <p className="font-bold text-lg">Capítulo {chapter.chapterNumber} <span className="text-sm font-mono text-gray-400">({chapter.status})</span></p>
                    {chapter.title && <p className="text-gray-300">{chapter.title}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setPagesToView(chapter.pages); setIsModalOpen(true); }} className="p-2 bg-blue-600 hover:bg-blue-700 rounded-md" title="Ver Páginas"><Eye size={18}/></button>
                    {chapter.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleAction(adminService.approveChapter, chapter.id)} disabled={!isLockedByMe} className="p-2 bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed" title="Aprobar Capítulo"><Check size={18}/></button>
                        <button onClick={() => handleAction(adminService.rejectChapter, chapter.id, { reason: 'Rechazo de capítulo individual.' })} disabled={!isLockedByMe} className="p-2 bg-orange-600 hover:bg-orange-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed" title="Rechazar Capítulo"><X size={18}/></button>
                      </>
                    )}
                  </div>
                </div>
                
                {chapter.justification && chapter.status === 'PENDING' && (
                  <div className="mt-3 pt-3 border-t border-yellow-700/50">
                    <h4 className="text-sm font-bold text-yellow-300 mb-1 flex items-center gap-2"><MessageSquareQuote size={16} /> Mensaje del Contribuyente:</h4>
                    <p className="text-sm text-yellow-200/90 bg-black/20 p-2 rounded-md whitespace-pre-wrap">{chapter.justification}</p>
                  </div>
                )}

                {isInConflict && chapter.status === 'PENDING' && (
                  <div className="text-xs text-red-400 font-semibold mt-3 pt-3 border-t border-red-800/60 flex items-center gap-1.5">
                    <AlertTriangle size={14}/>
                    <span>Este es uno de {conflictingChapters[chapterKey]?.length || 0} capítulos pendientes con el mismo número e idioma.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Vista Previa de Páginas">
        <div className="max-h-[80vh] overflow-y-auto">
          {pagesToView.map(page => (
            <img key={page.id} src={page.imageUrl} alt={`Página ${page.pageNumber}`} className="w-full mb-2 border border-gray-700"/>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ReviewPage;