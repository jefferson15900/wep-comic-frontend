// src/pages/ChapterPage.tsx

import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getChapterPages, getComicById} from '../api/comicService';
import ComicReader from '../components/comic/ComicReader';
import Spinner from '../components/common/Spinner';
import { useLanguage } from '../context/LanguageContext';
import { useContentFilter } from '../context/ContentFilterContext';
import { ChevronLeft, ChevronRight, RectangleHorizontal, RectangleVertical, List, X, Expand, Minimize } from 'lucide-react';
import { getUploadedMangaById} from '../api/mangaService';
import { getUploadedChapterPages} from '../api/chapterService'
import { useAuth } from '../context/AuthContext'; 

export type DisplayMode = 'fitWidth' | 'fitHeight';
const DISPLAY_MODE_KEY = 'wepcomic_reader_displayMode';

const getDefaultDisplayMode = (): DisplayMode => {
  const storedMode = localStorage.getItem(DISPLAY_MODE_KEY);
  if (storedMode === 'fitWidth' || storedMode === 'fitHeight') {
    return storedMode;
  }
  return 'fitWidth'; 
};

const ChapterPage = () => {
  const { comicId, chapterId } = useParams<{ comicId: string; chapterId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { language } = useLanguage();
  const { showNsfw } = useContentFilter();
  const chapterSource = location.state?.chapterSource || 'mangadex';

  const [pages, setPages] = useState<string[]>([]);
  const [comicDetails, setComicDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(getDefaultDisplayMode()); 
  const [isChapterListVisible, setIsChapterListVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  const mainContentRef = useRef<HTMLDivElement>(null);
  const chapterPanelRef = useRef<HTMLDivElement>(null);
  const chapterListButtonRef = useRef<HTMLButtonElement>(null);
   const { user } = useAuth();
  
useEffect(() => {
  if (!comicId || !chapterId) return;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setPages([]);


    // Detectamos si los IDs son locales o externos
    const isLocalComic = comicId.startsWith('c');
    const isLocalChapter = chapterId.startsWith('c');


      try {
        let pagesData: string[];
        let comicData: any;

        if (isLocalComic && isLocalChapter) {
          [pagesData, comicData] = await Promise.all([
            // --- PASO 2: Pasa el token a la función del servicio ---
            getUploadedChapterPages(comicId, chapterId, user?.token),
            getUploadedMangaById(comicId, user?.token) // Asumimos que esta es pública y no necesita token
          ]);
        } else {
          [pagesData, comicData] = await Promise.all([
            getChapterPages(chapterId),
            getComicById(comicId, language, showNsfw)
          ]);
        }

        setPages(pagesData);
        setComicDetails(comicData);

      } catch (err) {
        setError('No se pudo cargar este capítulo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
  fetchData();
}, [comicId, chapterId, language, showNsfw,chapterSource,user]);


  const currentChapterIndex = comicDetails?.chapters.findIndex((ch: any) => ch.id === chapterId) ?? -1;
  const prevChapter = currentChapterIndex > 0 ? comicDetails.chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < (comicDetails?.chapters.length - 1) ? comicDetails.chapters[currentChapterIndex + 1] : null;

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isChapterListVisible) {
        if (event.key === 'Escape') setIsChapterListVisible(false);
        return;
      }
      if (event.key === 'Escape') {
        if (document.fullscreenElement) document.exitFullscreen().catch(console.error);
        else if (comicId) navigate(`/comic/${comicId}`);
        return;
      }
      if (!comicId || !comicDetails) return;
      
      const prevChapterState = { state: { chapterSource: prevChapter?.source || 'mangadex' } };
      const nextChapterState = { state: { chapterSource: nextChapter?.source || 'mangadex' } };

      if (event.ctrlKey) {
        if (event.key === 'ArrowLeft' && prevChapter) navigate(`/comic/${comicId}/chapter/${prevChapter.id}`, prevChapterState);
        else if (event.key === 'ArrowRight' && nextChapter) navigate(`/comic/${comicId}/chapter/${nextChapter.id}`, nextChapterState);
      } else {
        const scrollAmount = window.innerHeight * 0.85; 
        if (event.key === 'ArrowDown' || event.key === ' ') { event.preventDefault(); window.scrollBy({ top: scrollAmount, behavior: 'smooth' }); }
        else if (event.key === 'ArrowUp') { event.preventDefault(); window.scrollBy({ top: -scrollAmount, behavior: 'smooth' }); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, comicId, prevChapter, nextChapter, comicDetails, isChapterListVisible]);

  useEffect(() => {
    if (pages.length === 0) return;
    const handleScroll = () => {
      const pageImages = Array.from(mainContentRef.current?.querySelectorAll('img') || []);
      if (pageImages.length === 0) return;
      let mostVisibleImageIndex = 0;
      let maxVisibility = 0;
      pageImages.forEach((img, index) => {
        const rect = img.getBoundingClientRect();
        const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
        if (visibleHeight > maxVisibility) {
          maxVisibility = visibleHeight;
          mostVisibleImageIndex = index;
        }
      });
      setCurrentPage(mostVisibleImageIndex + 1);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pages, loading]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isChapterListVisible && chapterPanelRef.current && !chapterPanelRef.current.contains(event.target as Node) && chapterListButtonRef.current && !chapterListButtonRef.current.contains(event.target as Node)) {
        setIsChapterListVisible(false);
      }
    };
    if (isChapterListVisible) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isChapterListVisible]);

  const chapterTitle = comicDetails?.chapters[currentChapterIndex]?.title || (comicDetails?.chapters[currentChapterIndex]?.number ? `Capítulo ${comicDetails.chapters[currentChapterIndex].number}` : 'Visor de Capítulos');
  const toggleDisplayMode = () => setDisplayMode(prev => { const newMode = prev === 'fitWidth' ? 'fitHeight' : 'fitWidth'; localStorage.setItem(DISPLAY_MODE_KEY, newMode); return newMode; });
  const toggleChapterListPanel = () => setIsChapterListVisible(prev => !prev);
  const handleChapterSelect = (selectedChapter: any) => {
    if (selectedChapter.id === chapterId) { setIsChapterListVisible(false); return; }
    navigate(`/comic/${comicId}/chapter/${selectedChapter.id}`, { state: { chapterSource: selectedChapter.source || 'mangadex' } });
  };
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen().catch(console.error);
    else await document.exitFullscreen().catch(console.error);
  };

  const panelWidthRemValue = 20; 
  const headerPaddingRightWhenPanelOpen = `${panelWidthRemValue + 0.75}rem`;
  const mainMarginRightWhenPanelOpen = `${panelWidthRemValue}rem`;

  return (
    <div className="bg-black min-h-screen relative text-white">
      {!isFullscreen && (
        <header className="fixed top-0 left-0 w-full bg-black bg-opacity-90 backdrop-blur-sm z-20 p-3 flex justify-between items-center shadow-lg transition-all duration-300" style={isChapterListVisible ? { paddingRight: headerPaddingRightWhenPanelOpen } : {}}>
          <div className="flex items-center gap-1 md:gap-2">
            <Link to={`/comic/${comicId}`} className="p-2 rounded-md hover:bg-gray-700 transition-colors" title={`Volver a ${comicDetails?.title || 'Detalles'}`}><ChevronLeft size={20} /></Link>
            <h1 className="font-bold text-lg hidden sm:block truncate max-w-xs">{comicDetails?.title}</h1>
          </div>
          <div className="text-center flex-grow px-2 mx-1 md:mx-2 overflow-hidden">
            <h2 className="text-sm sm:text-base md:text-lg font-bold truncate" title={chapterTitle}>{chapterTitle}</h2>
            {!loading && pages.length > 0 && (<p className="text-xs text-gray-400">Página {currentPage} de {pages.length}</p>)}
          </div>
          <div className="flex gap-1 md:gap-2 flex-shrink-0 items-center">
            {prevChapter && (<Link to={`/comic/${comicId}/chapter/${prevChapter.id}`} state={{ chapterSource: prevChapter.source || 'mangadex' }} className="p-2 rounded-md hover:bg-gray-700 transition-colors" title={`Anterior: Cap. ${prevChapter.number}`}><ChevronLeft size={20} /></Link>)}
            {nextChapter && (<Link to={`/comic/${comicId}/chapter/${nextChapter.id}`} state={{ chapterSource: nextChapter.source || 'mangadex' }} className="p-2 rounded-md hover:bg-gray-700 transition-colors" title={`Siguiente: Cap. ${nextChapter.number}`}><ChevronRight size={20} /></Link>)}
            <button onClick={toggleDisplayMode} className="p-2 rounded-md hover:bg-gray-700 transition-colors" title={displayMode === 'fitWidth' ? "Ajustar al alto" : "Ajustar al ancho"}>{displayMode === 'fitWidth' ? <RectangleVertical size={20} /> : <RectangleHorizontal size={20} />}</button>
            <button onClick={toggleFullscreen} className="p-2 rounded-md hover:bg-gray-700 transition-colors" title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}>{isFullscreen ? <Minimize size={20} /> : <Expand size={20} />}</button>
            {comicDetails?.chapters && comicDetails.chapters.length > 0 && (<button ref={chapterListButtonRef} onClick={toggleChapterListPanel} className="p-2 rounded-md hover:bg-gray-700 transition-colors" title="Lista de Capítulos"><List size={20} /></button>)}
          </div>
        </header>
      )}

      {isChapterListVisible && comicDetails?.chapters && (
        <div ref={chapterPanelRef} className={`fixed top-0 right-0 h-full w-full max-w-xs md:max-w-sm bg-[var(--surface-dark)] shadow-2xl p-4 overflow-y-auto z-30 transform transition-transform duration-300 ${isChapterListVisible ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
            <h3 className="text-xl font-bold">Capítulos</h3>
            <button onClick={toggleChapterListPanel} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"><X size={24} /></button>
          </div>
          <div className="space-y-1.5">
            {comicDetails.chapters.map((chapter: any) => (<button key={chapter.id} onClick={() => handleChapterSelect(chapter)} className={`w-full text-left block p-3 rounded-lg transition-colors ${chapter.id === chapterId ? 'bg-[var(--primary-accent)] text-white font-semibold' : 'bg-black bg-opacity-20 hover:bg-opacity-40 text-gray-300 hover:text-white'}`} title={`Ir a Capítulo ${chapter.number}`}>
                <div className="flex justify-between items-center"><span className="truncate pr-2">Cap. {chapter.number}{chapter.title && `: ${chapter.title}`}</span>{chapter.id === chapterId && <ChevronRight size={18} className="flex-shrink-0" />}</div>
            </button>))}
          </div>
        </div>
      )}

      <main className={`transition-all duration-300 pt-20 ${!isFullscreen ? '' : '!pt-0'} ${isChapterListVisible && !isFullscreen ? 'filter brightness-50 blur-sm pointer-events-none' : ''}`} style={isChapterListVisible && !isFullscreen ? { marginRight: mainMarginRightWhenPanelOpen } : {}} ref={mainContentRef}>
        {loading && <div className="flex justify-center py-20"><Spinner /></div>}
        {error && <p className="text-center text-red-500 py-20">{error}</p>}
        {!loading && !error && pages.length > 0 && <ComicReader pages={pages} displayMode={displayMode} />}
        {!loading && !error && pages.length === 0 && <p className="text-center text-gray-400 py-20">No hay páginas disponibles para este capítulo.</p>}
      </main>
    </div>
  );
};

export default ChapterPage;