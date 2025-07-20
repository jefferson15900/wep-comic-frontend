// src/pages/CreatorStudioPage.tsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { editManga, editChapter } from '../api/communityService';
import { getUploadedMangaById } from '../api/mangaService';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import AddChapterForm from '../components/forms/AddChapterForm';
import { UploadCloud, CheckCircle, Save, List, Edit, Eye, ArrowLeft, ArrowUpDown  } from 'lucide-react';

// Interfaces para el tipado
interface Page {
  id: string;
  pageNumber: number;
  imageUrl: string;
}

interface Chapter {
  id: string;
  chapterNumber: number;
  title?: string;
  pages: Page[];
}

const CreatorStudioPage = () => {
  const { mangaId } = useParams<{ mangaId: string }>();
  const { user } = useAuth();

  // Estados generales de la página
  const [mangaData, setMangaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estados para el formulario de metadatos del manga
  const [mangaTitle, setMangaTitle] = useState('');
  const [mangaAuthor, setMangaAuthor] = useState('');
  const [mangaSynopsis, setMangaSynopsis] = useState('');
  const [mangaCoverFile, setMangaCoverFile] = useState<File | null>(null);
  const [mangaCoverPreview, setMangaCoverPreview] = useState<string | null>(null);
  const [contentRating, setContentRating] = useState<'SFW' | 'NSFW'>('SFW');
  const [originalLanguage, setOriginalLanguage] = useState('es');
  const [savingManga, setSavingManga] = useState(false);

  // Estados para el modal de editar capítulo
  const [isEditChapterModalOpen, setIsEditChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editChapterNumber, setEditChapterNumber] = useState('');
  const [editChapterTitle, setEditChapterTitle] = useState('');
  const [isSavingChapter, setIsSavingChapter] = useState(false);
  
  // Estados para el modal de previsualización de páginas
  const [pagesToView, setPagesToView] = useState<Page[]>([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // ESTADO PARA EL ORDEN
  const [sortAscending, setSortAscending] = useState(false);
  
  // Función reutilizable para cargar o recargar los datos del manga
  const fetchMangaData = async () => {
    if (!mangaId) return;
    try {
      const data = await getUploadedMangaById(mangaId, user?.token);
      setMangaData(data);
      setMangaTitle(data.title);
      setMangaAuthor(data.author);
      setMangaSynopsis(data.synopsis);
      setMangaCoverPreview(data.coverUrl);
      setContentRating(data.contentRating || 'SFW');
      setOriginalLanguage(data.originalLanguage || 'es');
    } catch (err) {
      console.error('No se pudo cargar la información del manga.', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMangaData().finally(() => setLoading(false));
  }, [mangaId, user?.token]);

  const handleMangaCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMangaCoverFile(file);
      setMangaCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleEditManga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mangaId || !user?.token) return;
    setSavingManga(true);
    setSuccessMessage('');
    const formData = new FormData();
    formData.append('title', mangaTitle);
    formData.append('author', mangaAuthor);
    formData.append('synopsis', mangaSynopsis);
    formData.append('contentRating', contentRating);
    formData.append('originalLanguage', originalLanguage);
    if (mangaCoverFile) {
      formData.append('coverImage', mangaCoverFile);
    }
    try {
      await editManga(mangaId, formData, user.token);
      setSuccessMessage('¡Manga actualizado con éxito! Tus cambios serán revisados.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Hubo un error al guardar los cambios.');
    } finally {
      setSavingManga(false);
    }
  };
  
  const openEditChapterModal = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setEditChapterNumber(String(chapter.chapterNumber));
    setEditChapterTitle(chapter.title || '');
    setIsEditChapterModalOpen(true);
  };

  const handleEditChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter || !user?.token) return;
    setIsSavingChapter(true);
    try {
      const dataToUpdate = {
        chapterNumber: parseFloat(editChapterNumber),
        title: editChapterTitle,
      };
      await editChapter(editingChapter.id, dataToUpdate, user.token);
      setIsEditChapterModalOpen(false);
      setEditingChapter(null);
      await fetchMangaData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al editar capítulo.');
    } finally {
      setIsSavingChapter(false);
    }
  };

  const openPreviewModal = (pages: Page[]) => {
    const sortedPages = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);
    setPagesToView(sortedPages);
    setIsPreviewModalOpen(true);
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  if (!mangaData) return <div className="text-center py-20">No se pudo encontrar la información de este manga.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link to="/creator-studio" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft size={20} /> Volver a Mis Creaciones
      </Link>
      <div className="p-4 bg-green-900/50 text-green-300 rounded-md mb-8 text-center">
        <h3 className="font-bold">Gestionando: {mangaData.title}</h3>
        <p className="text-sm">Recuerda que todos los cambios que hagas aquí deberán ser aprobados por un moderador.</p>
      </div>
      
      <form onSubmit={handleEditManga} className="p-8 bg-[var(--surface-dark)] rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-white">Información del Manga</h2>
        {successMessage && <div className="mb-4 p-3 bg-green-900/50 text-green-300 rounded-md flex items-center gap-2"><CheckCircle size={20} /> {successMessage}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-400">Portada</label>
            <div className="w-full h-80 border-2 border-dashed border-gray-600 rounded-lg flex justify-center items-center bg-gray-800/50 relative">
              {mangaCoverPreview ? <img src={mangaCoverPreview} alt="Vista previa" className="h-full w-full object-contain rounded-md" /> : <div className="text-center text-gray-500"><UploadCloud size={48} className="mx-auto" /><p>Selecciona una imagen</p></div>}
              <input type="file" onChange={handleMangaCoverChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-bold mb-2 text-gray-400">Título</label>
              <input id="title" type="text" value={mangaTitle} onChange={(e) => setMangaTitle(e.target.value)} required className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
            </div>
            <div>
              <label htmlFor="author" className="block text-sm font-bold mb-2 text-gray-400">Autor/Artista</label>
              <input id="author" type="text" value={mangaAuthor} onChange={(e) => setMangaAuthor(e.target.value)} required className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
            </div>
            <div>
              <label htmlFor="synopsis" className="block text-sm font-bold mb-2 text-gray-400">Sinopsis</label>
              <textarea id="synopsis" value={mangaSynopsis} onChange={(e) => setMangaSynopsis(e.target.value)} required rows={6} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
              <label className="block text-sm font-bold mb-2 text-gray-400">Clasificación de Contenido</label>
              <div className="flex gap-4">
                <button type="button" onClick={() => setContentRating('SFW')} className={`px-4 py-2 rounded-md font-semibold w-full transition-colors ${contentRating === 'SFW' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Familiar (SFW)</button>
                <button type="button" onClick={() => setContentRating('NSFW')} className={`px-4 py-2 rounded-md font-semibold w-full transition-colors ${contentRating === 'NSFW' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Adulto (+18)</button>
              </div>
          </div>
          <div>
              <label htmlFor="language" className="block text-sm font-bold mb-2 text-gray-400">Idioma Original</label>
              <select id="language" value={originalLanguage} onChange={(e) => setOriginalLanguage(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)] h-[42px]">
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="jp">Japonés</option><option value="kr">Coreano</option><option value="zh">Chino</option><option value="other">Otro</option>
              </select>
          </div>
        </div>
        <div className="w-full mt-6">
            <button type="submit" disabled={savingManga} className="w-full p-3 bg-green-600 rounded text-white font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
              {savingManga ? <Spinner /> : <><Save size={20}/> Guardar Cambios del Manga</>}
            </button>
        </div>
      </form>

      <div className="p-8 mt-8 bg-[var(--surface-dark)] rounded-lg shadow-lg max-w-4xl mx-auto">
        <AddChapterForm mangaId={mangaId!} onChapterAdded={fetchMangaData} />
      </div>

<div className="p-8 mt-8 bg-[var(--surface-dark)] rounded-lg shadow-lg max-w-4xl mx-auto">
  
  {/* Contenedor para alinear el título y el botón de ordenamiento */}
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold text-white flex items-center gap-2">
      <List /> Lista de Capítulos
    </h2>
    
    {/* Botón para cambiar el orden de la lista */}
    <button 
      onClick={() => setSortAscending(prev => !prev)}
      className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
      title={sortAscending ? "Ordenar del más nuevo al más antiguo" : "Ordenar del más antiguo al más nuevo"}
    >
      <ArrowUpDown size={20} />
    </button>
  </div>
  
  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
    {mangaData.chapters?.length > 0 ? (
      // Creamos una copia del array antes de ordenarlo para no mutar el estado
      [...mangaData.chapters]
        .sort((a: Chapter, b: Chapter) => 
          // Aplicamos el ordenamiento basado en el estado 'sortAscending'
          sortAscending 
            ? a.chapterNumber - b.chapterNumber // Ascendente (1, 2, 3...)
            : b.chapterNumber - a.chapterNumber  // Descendente (..., 3, 2, 1)
        )
        .map((chap: Chapter) => (
          <div key={chap.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-md">
            {/* Detalles del capítulo */}
            <div>
              <p className="font-semibold text-white">Capítulo {chap.chapterNumber}</p>
              {chap.title && <p className="text-sm text-gray-400">{chap.title}</p>}
            </div>
            
            {/* Botones de acción para cada capítulo */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => openPreviewModal(chap.pages)} 
                disabled={!chap.pages || chap.pages.length === 0} 
                className="p-2 text-blue-400 hover:text-white hover:bg-blue-900/50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed" 
                title="Ver páginas del capítulo"
              >
                <Eye size={18} />
              </button>
              <button 
                onClick={() => openEditChapterModal(chap)} 
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md" 
                title="Editar detalles del capítulo"
              >
                <Edit size={18} />
              </button>
            </div>
          </div>
        ))
    ) : (
      // Mensaje si no hay capítulos
      <p className="text-center text-gray-500 py-4">Este manga aún no tiene capítulos.</p>
    )}
  </div>
</div>

      <Modal isOpen={isEditChapterModalOpen} onClose={() => setIsEditChapterModalOpen(false)} title={`Editando Capítulo ${editingChapter?.chapterNumber}`}>
        <form onSubmit={handleEditChapter} className="space-y-4">
          <div>
            <label htmlFor="editChapterNumber" className="block text-sm font-bold mb-2 text-gray-400">Número de Capítulo</label>
            <input id="editChapterNumber" type="number" step="0.1" value={editChapterNumber} onChange={(e) => setEditChapterNumber(e.target.value)} required className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
          </div>
          <div>
            <label htmlFor="editChapterTitle" className="block text-sm font-bold mb-2 text-gray-400">Título del Capítulo (Opcional)</label>
            <input id="editChapterTitle" type="text" value={editChapterTitle} onChange={(e) => setEditChapterTitle(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={() => setIsEditChapterModalOpen(false)} className="px-4 py-2 rounded bg-gray-600 text-white font-bold hover:bg-gray-700">Cancelar</button>
            <button type="submit" disabled={isSavingChapter} className="px-4 py-2 rounded bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 flex justify-center items-center">
              {isSavingChapter ? <Spinner /> : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title="Vista Previa de Páginas">
        <div className="max-h-[80vh] overflow-y-auto">
          {pagesToView.map(page => (
            <img key={page.id} src={page.imageUrl} alt={`Página ${page.pageNumber}`} className="w-full mb-2 border border-gray-700"/>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default CreatorStudioPage;