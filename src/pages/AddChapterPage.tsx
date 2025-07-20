// src/pages/AddChapterPage.tsx

import { useState, useEffect } from 'react';
import { useParams, Link} from 'react-router-dom';
import { getUploadedMangaById } from '../api/mangaService';
import { ArrowLeft } from 'lucide-react';
import AddChapterForm from '../components/forms/AddChapterForm'; // <-- IMPORTA EL NUEVO COMPONENTE

const AddChapterPage = () => {
  const { mangaId } = useParams<{ mangaId: string }>();
  //const navigate = useNavigate();
  const [mangaTitle, setMangaTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mangaId) {
      getUploadedMangaById(mangaId)
        .then(data => setMangaTitle(data.title))
        .catch(() => setError('No se pudo cargar la información del manga.'));
    }
  }, [mangaId]);

  const handleChapterAdded = () => {
    // Después de añadir un capítulo, podríamos redirigir al usuario
    // o simplemente mostrar un mensaje de éxito. Por ahora, lo dejamos aquí.
    // Opcional: navegar a la página del manga
    // navigate(`/comic/${mangaId}`);
  };

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <Link to={`/comic/${mangaId}`} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft size={20} /> Volver a {mangaTitle || "Detalles del Manga"}
      </Link>
      
      {/* El título se ha movido al propio formulario, así que no es necesario aquí */}
      
      <div className="p-8 bg-[var(--surface-dark)] rounded-lg shadow-lg">
        {mangaId && <AddChapterForm mangaId={mangaId} onChapterAdded={handleChapterAdded} />}
      </div>
    </div>
  );
};

export default AddChapterPage;