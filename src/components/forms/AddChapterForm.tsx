// src/components/forms/AddChapterForm.tsx

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addChapter } from '../../api/communityService';
import Spinner from '../common/Spinner';
import { AlertCircle, CheckCircle, PlusCircle, Trash2 } from 'lucide-react';

// --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
import { DragDropContext, Draggable, type DropResult } from 'react-beautiful-dnd';
import { StrictModeDroppable as Droppable } from '../common/StrictModeDroppable';

interface PagePreview {
  id: string;
  file: File;
  previewUrl: string;
}

interface AddChapterFormProps {
  mangaId: string;
  onChapterAdded: () => void;
}

const AddChapterForm = ({ mangaId, onChapterAdded }: AddChapterFormProps) => {
  const { user } = useAuth();
  const [chapterNumber, setChapterNumber] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [language, setLanguage] = useState('es');
  const [justification, setJustification] = useState('');
  const [pages, setPages] = useState<PagePreview[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPages = Array.from(e.target.files).map(file => ({
        id: `${file.name}-${Date.now()}`,
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setPages(prev => [...prev, ...newPages]);
    }
  };

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPages(items);
  };

  const removePage = (id: string) => {
    setPages(prev => prev.filter(page => page.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!chapterNumber || pages.length === 0 || !user?.token) {
      setError('Número de capítulo y al menos una página son obligatorios.');
      return;
    }
    setLoading(true);
    
    const formData = new FormData();
    formData.append('chapterNumber', chapterNumber);
    if (chapterTitle) formData.append('title', chapterTitle);
    if (justification) formData.append('justification', justification);
    formData.append('language', language);
    pages.forEach(page => {
      formData.append('pages', page.file);
    });
    
    try {
      await addChapter(mangaId, formData, user.token);
      setSuccessMessage('¡Capítulo enviado con éxito! Será revisado por un moderador.');
      setChapterNumber('');
      setChapterTitle('');
      setJustification('');
      setPages([]);
      onChapterAdded(); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hubo un error al añadir el capítulo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-white">Añade un Nuevo Capítulo</h2>
      {error && <div className="p-3 bg-red-900/50 text-red-300 rounded-md flex items-center gap-2"><AlertCircle size={20} /> {error}</div>}
      {successMessage && <div className="p-3 bg-green-900/50 text-green-300 rounded-md flex items-center gap-2"><CheckCircle size={20} /> {successMessage}</div>}
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="sm:col-span-1">
          <label htmlFor="chapterNumber" className="block text-sm font-bold mb-2 text-gray-400">Número de Capítulo</label>
          <input id="chapterNumber" type="number" step="0.1" value={chapterNumber} onChange={e => setChapterNumber(e.target.value)} required className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="chapterTitle" className="block text-sm font-bold mb-2 text-gray-400">Título del Capítulo (Opcional)</label>
          <input id="chapterTitle" type="text" value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="language" className="block text-sm font-bold mb-2 text-gray-400">Idioma</label>
          <select id="language" value={language} onChange={e => setLanguage(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)] h-[42px]">
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="justification" className="block text-sm font-bold mb-2 text-gray-400">Mensaje para Moderadores (Opcional)</label>
        <textarea id="justification" value={justification} onChange={e => setJustification(e.target.value)} rows={3} placeholder="Ej: Es una traducción de mejor calidad, versión a color, etc." className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2 text-gray-400">Páginas del Capítulo</label>
        <input type="file" multiple onChange={handleFileChange} accept="image/*" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-accent)] file:text-white hover:file:bg-opacity-90"/>
        
        {pages.length > 0 && (
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="pagesPreview" direction="horizontal">
              {(provided) => (
                <div className="mt-4 p-2 bg-gray-900/50 rounded-lg flex gap-3 overflow-x-auto" {...provided.droppableProps} ref={provided.innerRef}>
                  {pages.map((page, index) => (
                    <Draggable key={page.id} draggableId={page.id} index={index}>
                      {(provided) => (
                        <div className="relative flex-shrink-0 w-24 h-36 bg-gray-800 rounded-md group" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <img src={page.previewUrl} alt={`Página ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                          <div className="absolute top-1 left-1 bg-black/70 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{index + 1}</div>
                          <button type="button" onClick={() => removePage(page.id)} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      <button type="submit" disabled={loading} className="w-full p-3 bg-[var(--secondary-accent)] rounded text-white font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
        {loading ? <Spinner /> : <><PlusCircle size={20}/> Enviar Capítulo a Revisión</>}
      </button>
    </form>
  );
};

export default AddChapterForm;