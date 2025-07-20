// src/components/forms/CreateMangaForm.tsx

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createManga } from '../../api/communityService';
import Spinner from '../common/Spinner';
import { UploadCloud, AlertCircle} from 'lucide-react';

// Interfaz para las props del componente
interface CreateMangaFormProps {
  // Función que se llamará cuando un manga se cree con éxito.
  // Pasará los datos del nuevo manga al componente padre.
  onMangaCreated: (newManga: any) => void;
}

const CreateMangaForm = ({ onMangaCreated }: CreateMangaFormProps) => {
  const { user } = useAuth();
  
  // Estados específicos de este formulario
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [contentRating, setContentRating] = useState<'SFW' | 'NSFW'>('SFW');
  const [originalLanguage, setOriginalLanguage] = useState('es');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!coverFile || !user?.token) {
      setError('Todos los campos, incluida la portada, son obligatorios.');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('synopsis', synopsis);
    formData.append('contentRating', contentRating);
    formData.append('originalLanguage', originalLanguage);
    formData.append('coverImage', coverFile);
    
    try {
      const response = await createManga(formData, user.token);
      // Llamamos al callback para notificar al padre, pasándole el nuevo manga.
      onMangaCreated(response.manga); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hubo un error al subir el manga.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Subir una Nueva Obra</h2>
      {error && <div className="p-3 bg-red-900/50 text-red-300 rounded-md flex items-center gap-2"><AlertCircle size={20} /> {error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-400">Portada (Obligatorio)</label>
          <div className="w-full h-80 border-2 border-dashed border-gray-600 rounded-lg flex justify-center items-center bg-gray-800/50 relative">
            {coverPreview ? <img src={coverPreview} alt="Vista previa" className="h-full w-full object-contain rounded-md" /> : <div className="text-center text-gray-500"><UploadCloud size={48} className="mx-auto" /><p>Selecciona o arrastra una imagen</p></div>}
            <input type="file" onChange={handleCoverChange} required accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-bold mb-2 text-gray-400">Título</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
          </div>
          <div>
            <label htmlFor="author" className="block text-sm font-bold mb-2 text-gray-400">Autor/Artista</label>
            <input id="author" type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
          </div>
          <div>
            <label htmlFor="synopsis" className="block text-sm font-bold mb-2 text-gray-400">Sinopsis</label>
            <textarea id="synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} required rows={6} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <option value="jp">Japonés</option>
                <option value="kr">Coreano</option>
                <option value="zh">Chino</option>
                <option value="other">Otro</option>
              </select>
          </div>
      </div>
      <button type="submit" disabled={loading} className="w-full p-3 bg-[var(--primary-accent)] rounded text-white font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
        {loading ? <Spinner /> : 'Crear Manga y Enviar a Revisión'}
      </button>
    </form>
  );
};

export default CreateMangaForm;