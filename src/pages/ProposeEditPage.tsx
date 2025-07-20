// src/pages/ProposeEditPage.tsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUploadedMangaById } from '../api/mangaService';
import { proposeMangaEdit } from '../api/communityService';
import Spinner from '../components/common/Spinner';
import { Edit, AlertCircle, CheckCircle, ArrowLeft, UploadCloud } from 'lucide-react';

const ProposeEditPage = () => {
  const { mangaId } = useParams<{ mangaId: string }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para los campos del formulario
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [justification, setJustification] = useState('');

  useEffect(() => {
    if (mangaId) {
      setLoading(true);
      getUploadedMangaById(mangaId).then(data => {
        setTitle(data.title);
        setAuthor(data.author);
        setSynopsis(data.synopsis);
        setCoverPreview(data.coverUrl);
      }).catch(_ => {
        setError('No se pudo cargar la información del manga.');
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [mangaId]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mangaId || !user?.token || !justification) {
      setError('La justificación del cambio es obligatoria.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('synopsis', synopsis);
    formData.append('justification', justification);
    if (coverFile) {
      formData.append('coverImage', coverFile);
    }
    
    try {
      await proposeMangaEdit(mangaId, formData, user.token);
      setSuccessMessage('¡Propuesta enviada con éxito! Será revisada por un moderador.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hubo un error al enviar la propuesta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <Link to={`/comic/${mangaId}`} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft size={20} /> Volver a {title || "Detalles del Manga"}
      </Link>
      <h1 className="text-3xl font-bold mb-2">Proponer Edición</h1>
      <h2 className="text-xl text-gray-400 mb-6">para "{title}"</h2>
      
      <form onSubmit={handleSubmit} className="p-8 bg-[var(--surface-dark)] rounded-lg shadow-lg">
        {error && <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-md flex items-center gap-2"><AlertCircle size={20} /> {error}</div>}
        {successMessage && <div className="mb-4 p-3 bg-green-900/50 text-green-300 rounded-md flex items-center gap-2"><CheckCircle size={20} /> {successMessage}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-400">Portada Propuesta</label>
            <div className="w-full h-80 border-2 border-dashed border-gray-600 rounded-lg flex justify-center items-center bg-gray-800/50 relative">
              {coverPreview ? <img src={coverPreview} alt="Vista previa" className="h-full w-full object-contain rounded-md" /> : <div className="text-center text-gray-500"><UploadCloud size={48} className="mx-auto" /><p>Selecciona una imagen</p></div>}
              <input type="file" onChange={handleCoverChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-bold mb-2 text-gray-400">Título</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
            </div>
            <div>
              <label htmlFor="author" className="block text-sm font-bold mb-2 text-gray-400">Autor</label>
              <input id="author" type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
            </div>
            <div>
              <label htmlFor="synopsis" className="block text-sm font-bold mb-2 text-gray-400">Sinopsis</label>
              <textarea id="synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} required rows={6} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <label htmlFor="justification" className="block text-sm font-bold mb-2 text-gray-400">Justificación del Cambio (Obligatorio)</label>
          <textarea id="justification" value={justification} onChange={(e) => setJustification(e.target.value)} required rows={3} placeholder="Ej: Corregí el nombre del autor, añadí una sinopsis más completa..." className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full mt-6 p-3 bg-green-600 rounded text-white font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
          {isSubmitting ? <Spinner /> : <><Edit size={20}/> Enviar Propuesta a Revisión</>}
        </button>
      </form>
    </div>
  );
};

export default ProposeEditPage;