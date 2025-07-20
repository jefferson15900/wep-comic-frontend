// src/pages/admin/ModerationQueuePage.tsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as adminService from '../../api/adminService';
import Spinner from '../../components/common/Spinner';
import { FilePlus, Edit3, MessageSquareQuote, Archive } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

// --- COMPONENTES AUXILIARES ---

// Tarjeta para las colas de mangas
const ModerationCard = ({ manga, type }: { manga: any, type: 'new' | 'edit' | 'archived' }) => {
  const cardLink = `/admin/review/manga/${manga.id}`;
  let icon = <FilePlus size={16} />;
  let tooltip = 'Nueva Obra';
  let subtext = `Subido por: ${manga.uploader?.username}`;
  
  if (type === 'edit') {
    icon = <Edit3 size={16} />;
    tooltip = 'Edición Pendiente';
    subtext = manga.lastEditedBy ? `Editado por: ${manga.lastEditedBy.username}` : `Subido por: ${manga.uploader?.username}`;
  } else if (type === 'archived') {
    icon = <Archive size={16} />;
    tooltip = 'Obra Archivada';
    subtext = `Archivado por: ${manga.uploader?.username}`;
  }

  return (
    <Link 
      to={cardLink} 
      className={`block bg-[var(--surface-dark)] rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 group ${type === 'archived' ? 'border border-gray-700' : ''}`}
    >
      <div className="relative">
        <LazyLoadImage
          alt={`Portada de ${manga.title}`}
          src={manga.coverUrl}
          effect="blur"
          className={`w-full h-48 md:h-56 object-cover ${type === 'archived' ? 'filter grayscale' : ''}`} 
          wrapperClassName="w-full h-48 md:h-56"
        />
        <div className="absolute top-1.5 left-1.5 p-1 bg-black/60 backdrop-blur-sm rounded-full text-white" title={tooltip}>
          {icon}
        </div>
      </div>
      <div className="p-3"> 
        <h3 className={`text-base font-bold truncate transition-colors ${type === 'archived' ? 'text-gray-400 group-hover:text-red-400' : 'text-white group-hover:text-[var(--primary-accent)]'}`}>
          {manga.title}
        </h3>
        <p className={`text-xs truncate ${type === 'archived' ? 'text-gray-500' : 'text-gray-400'}`}>
          {subtext}
        </p>
      </div>
    </Link>
  );
};

// Controles de paginación reutilizables
const PaginationControls = ({ pagination, onPageChange, isLoading }: { pagination: any, onPageChange: (page: number) => void, isLoading: boolean }) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }
  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button 
        onClick={() => onPageChange(pagination.page - 1)} 
        disabled={pagination.page === 1 || isLoading}
        className="px-4 py-2 bg-gray-700 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
      >
        Anterior
      </button>
      <span className="font-semibold text-gray-400">
        Página {pagination.page} de {pagination.totalPages}
      </span>
      <button 
        onClick={() => onPageChange(pagination.page + 1)} 
        disabled={pagination.page === pagination.totalPages || isLoading}
        className="px-4 py-2 bg-gray-700 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
      >
        Siguiente
      </button>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
const ModerationQueuePage = () => {
  const [newSubmissions, setNewSubmissions] = useState<{ data: any[], pagination: any } | null>(null);
  const [pendingEdits, setPendingEdits] = useState<{ data: any[], pagination: any } | null>(null);
  const [archivedMangas, setArchivedMangas] = useState<{ data: any[], pagination: any } | null>(null);
  const [pendingProposals, setPendingProposals] = useState<any[]>([]);
  
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [editsPage, setEditsPage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.token) return;

    setLoading(true);
    Promise.allSettled([
      adminService.getNewSubmissions(user.token, submissionsPage),
      adminService.getPendingEdits(user.token, editsPage),
      adminService.getArchivedMangas(user.token, archivedPage),
      adminService.getPendingProposals(user.token),
    ]).then(results => {
      if (results[0].status === 'fulfilled' && results[0].value) setNewSubmissions(results[0].value);
      if (results[1].status === 'fulfilled' && results[1].value) setPendingEdits(results[1].value);
      if (results[2].status === 'fulfilled' && results[2].value) setArchivedMangas(results[2].value);
      if (results[3].status === 'fulfilled' && Array.isArray(results[3].value)) setPendingProposals(results[3].value);

      results.forEach(result => {
        if (result.status === 'rejected') {
          console.error("Error cargando una de las colas:", result.reason);
          setError(prev => prev || 'Error al cargar algunas de las colas de moderación.');
        }
      });
    }).finally(() => {
      setLoading(false);
    });
  }, [user, submissionsPage, editsPage, archivedPage]);

  if (loading && submissionsPage === 1 && editsPage === 1 && archivedPage === 1) {
    return <div className="flex justify-center items-center h-96"><Spinner /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Cola de Moderación</h1>
       {error && <div className="p-3 bg-red-900/50 text-red-300 rounded-md mb-6">{error}</div>}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-[var(--surface-dark)] pb-2">
          Propuestas de Edición ({pendingProposals?.length || 0})
        </h2>
        {pendingProposals?.length > 0 ? (
          <div className="space-y-3">
            {pendingProposals.map((proposal: any) => (
              <Link to={`/admin/review/proposal/${proposal.id}`} key={proposal.id} className="block p-3 bg-[var(--surface-dark)] rounded-lg hover:bg-gray-800 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <MessageSquareQuote className="text-cyan-400" size={20} />
                    <div>
                      <p className="font-semibold text-white">Edición propuesta para: <span className="font-bold">{proposal.manga.title}</span></p>
                      <p className="text-sm text-gray-400">Por: {proposal.proposer.username}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded-full">REVISAR</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic py-4">No hay propuestas de edición esperando revisión.</p>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-[var(--surface-dark)] pb-2">
          Nuevas Obras y Capítulos ({newSubmissions?.pagination?.total || 0})
        </h2>
        {newSubmissions?.data?.length ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
              {newSubmissions?.data.map((manga: any) => <ModerationCard key={manga.id} manga={manga} type="new" />)}
            </div>
            <PaginationControls pagination={newSubmissions?.pagination} onPageChange={setSubmissionsPage} isLoading={loading} />
          </>
        ) : (
          <p className="text-gray-500 italic py-4">No hay nuevas obras esperando revisión.</p>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-[var(--surface-dark)] pb-2">
          Ediciones de Contenido Existente ({pendingEdits?.pagination?.total || 0})
        </h2>
        {pendingEdits?.data?.length ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
              {pendingEdits?.data.map((manga: any) => <ModerationCard key={manga.id} manga={manga} type="edit" />)}
            </div>
            <PaginationControls pagination={pendingEdits?.pagination} onPageChange={setEditsPage} isLoading={loading} />
          </>
        ) : (
          <p className="text-gray-500 italic py-4">No hay ediciones esperando revisión.</p>
        )}
      </section>
      
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-red-800/50 pb-2 text-red-300 flex items-center gap-2">
          <Archive size={24} /> Obras Archivadas por Usuarios ({archivedMangas?.pagination?.total || 0})
        </h2>
        {archivedMangas?.data?.length ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
              {archivedMangas?.data.map((manga: any) => <ModerationCard key={manga.id} manga={manga} type="archived" />)}
            </div>
            <PaginationControls pagination={archivedMangas?.pagination} onPageChange={setArchivedPage} isLoading={loading} />
          </>
        ) : (
          <p className="text-gray-500 italic py-4">No hay obras archivadas.</p>
        )}
      </section>
    </div>
  );
};

export default ModerationQueuePage;