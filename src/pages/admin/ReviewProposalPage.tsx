// src/pages/admin/ReviewProposalPage.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as adminService from '../../api/adminService';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { Check, X, AlertTriangle } from 'lucide-react';

// Pequeño componente para mostrar una comparación de campos
const ComparisonField = ({ label, originalValue, proposedValue }: { label: string, originalValue?: any, proposedValue?: any }) => {
  const hasChanged = proposedValue !== undefined && proposedValue !== null && proposedValue !== originalValue;
  return (
    <div className={`p-3 rounded-md ${hasChanged ? 'bg-yellow-900/30' : 'bg-gray-800/50'}`}>
      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{label}</label>
      <p className="text-gray-300 whitespace-pre-wrap">{originalValue || 'N/A'}</p>
      {hasChanged && (
        <div className="mt-2 pt-2 border-t border-yellow-700">
          <p className="text-yellow-300 whitespace-pre-wrap">{proposedValue}</p>
        </div>
      )}
    </div>
  );
};

const ReviewProposalPage = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para el modal de rechazo
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (proposalId && user?.token) {
      setLoading(true);
      adminService.getProposalForReview(proposalId, user.token)
        .then(setProposal)
        .catch(() => setError('No se pudo cargar la propuesta para revisión.'))
        .finally(() => setLoading(false));
    }
  }, [proposalId, user]);

  const handleApprove = async () => {
    if (!user?.token) return;
    if (window.confirm('¿Estás seguro de que quieres APROBAR y aplicar estos cambios?')) {
      setIsSubmitting(true);
      try {
        await adminService.approveProposal(proposalId!, user.token);
        navigate('/admin/moderation-queue');
      } catch (err) {
        alert('La operación falló.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleOpenRejectModal = () => {
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmRejection = async () => {
    if (!user?.token) return;
    if (!rejectionReason.trim()) {
      alert('Por favor, escribe un motivo para el rechazo.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await adminService.rejectProposal(proposalId!, { reason: rejectionReason }, user.token);
      navigate('/admin/moderation-queue');
    } catch (err) {
      alert('La operación falló.');
    } finally {
      setIsSubmitting(false);
      setIsRejectModalOpen(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (error) return <div className="text-center py-20 text-red-400"><AlertTriangle size={48} className="mx-auto mb-4"/>{error}</div>;
  if (!proposal) return <div className="text-center py-20">No se encontró la propuesta.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Revisión de Propuesta de Edición</h1>
      <h2 className="text-xl text-gray-400 mb-8">Para: {proposal.manga.title}</h2>
      
<div className="bg-[var(--surface-dark)] p-4 rounded-lg mb-8">
  {/* Contenedor flex que se apila en móvil y se pone en fila en escritorio */}
  <div className="flex flex-col sm:flex-row justify-end gap-3">
    <button 
      onClick={handleOpenRejectModal} 
      disabled={isSubmitting} 
      className="p-3 bg-orange-600 hover:bg-orange-700 rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <X size={18}/> Rechazar Propuesta
    </button>
    <button 
      onClick={handleApprove} 
      disabled={isSubmitting} 
      className="p-3 bg-green-600 hover:bg-green-700 rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Check size={18}/> Aprobar y Aplicar
    </button>
  </div>
</div>

      <div className="bg-cyan-900/30 border border-cyan-700 p-4 rounded-lg mb-8">
        <h3 className="text-lg font-bold text-cyan-300 mb-2">Justificación del Proponente ({proposal.proposer.username})</h3>
        <p className="text-white whitespace-pre-wrap">{proposal.justification}</p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Comparación de Cambios</h3>
        <p className="text-sm text-gray-400 mb-4">Mostrando el valor <span className="text-gray-300">ACTUAL</span> arriba y el valor <span className="text-yellow-300">PROPUESTO</span> abajo (solo si hay cambios).</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ComparisonField label="Título" originalValue={proposal.manga.title} proposedValue={proposal.title} />
            <ComparisonField label="Autor" originalValue={proposal.manga.author} proposedValue={proposal.author} />
            <ComparisonField label="Sinopsis" originalValue={proposal.manga.synopsis} proposedValue={proposal.synopsis} />
          </div>
          <div>
            <div className={`p-3 rounded-md ${proposal.coverUrl ? 'bg-yellow-900/30' : 'bg-gray-800/50'}`}>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Portada</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-gray-300 text-center mb-2 text-sm">Actual</p>
                  <img src={proposal.manga.coverUrl} alt="Portada actual" className="w-full h-auto rounded-md" />
                </div>
                {proposal.coverUrl && (
                  <div className="flex-1">
                    <p className="text-yellow-300 text-center mb-2 text-sm">Propuesta</p>
                    <img src={proposal.coverUrl} alt="Portada propuesta" className="w-full h-auto rounded-md" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Motivo del Rechazo">
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Proporciona una razón clara. El usuario recibirá este mensaje en una notificación.
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]"
            placeholder="Ej: La sinopsis propuesta es incorrecta, la portada no corresponde, etc."
          />
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 rounded bg-gray-600 text-white font-bold hover:bg-gray-700">Cancelar</button>
            <button onClick={handleConfirmRejection} disabled={isSubmitting} className="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 flex justify-center items-center">
              {isSubmitting ? <Spinner size="sm" /> : 'Confirmar Rechazo'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReviewProposalPage;