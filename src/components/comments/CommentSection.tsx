// src/components/comments/CommentSection.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as commentService from '../../api/commentService';
import Spinner from '../common/Spinner';
import { XCircle } from 'lucide-react';

// --- Interfaces para el tipado ---
interface CommentAuthor {
  username: string;
  avatarUrl: string | null;
}
interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: CommentAuthor;
}
interface CommentSectionProps {
  mangaId: string;
}

// --- Sub-componente para un solo comentario ---
const CommentCard = ({ comment, onDelete }: { comment: Comment, onDelete?: (commentId: string) => void }) => {
  const { user } = useAuth();
  const commentDate = new Date(comment.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  
  const canDelete = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');

  const handleDelete = () => {
    if (onDelete && window.confirm('¿Estás seguro de que quieres eliminar este comentario permanentemente?')) {
      onDelete(comment.id);
    }
  };

  return (
    <div className="flex gap-4 p-4 border-b border-gray-800 group last:border-b-0">
      <img
        src={comment.user.avatarUrl || `https://api.dicebear.com/8.x/lorelei/svg?seed=${comment.user.username}`}
        alt={comment.user.username}
        className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"
      />
      <div className="flex-1">
        <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="font-bold text-white break-words">{comment.user.username}</p>
                <p className="text-xs text-gray-500 flex-shrink-0">{commentDate}</p>
              </div>
              <p className="text-gray-300 mt-1 whitespace-pre-wrap break-words">{comment.text}</p>
            </div>
            {canDelete && (
                <button
                    onClick={handleDelete}
                    className="p-1 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/50 flex-shrink-0 ml-2"
                    title="Eliminar comentario (Admin/Mod)"
                >
                    <XCircle size={24} className="text-red-500" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};


// --- Componente principal ---
const CommentSection = ({ mangaId }: CommentSectionProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    commentService.getCommentsForManga(mangaId)
      .then(setComments)
      .catch(() => setError('No se pudieron cargar los comentarios.'))
      .finally(() => setLoading(false));
  }, [mangaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const addedComment = await commentService.postComment(mangaId, newComment, user.token);
      setComments(prev => [addedComment, ...prev]);
      setNewComment('');
    } catch (err) {
      setError('No se pudo publicar tu comentario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user?.token) return;

    // Opcional: Mostrar un pequeño spinner local para el comentario que se está borrando
    
    try {
      await commentService.deleteCommentById(mangaId, commentId, user.token);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      setError('No se pudo eliminar el comentario.');
      // Opcional: Ocultar el spinner local de borrado
    }
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-4">Comentarios ({comments.length})</h3>
      
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu comentario..."
            rows={3}
            className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]"
            disabled={submitting}
          />
          <div className="flex justify-between items-center mt-2">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-6 py-2 bg-[var(--primary-accent)] text-white font-bold rounded-md disabled:opacity-50 flex items-center"
            >
              {submitting ? <Spinner size="small" /> : 'Publicar'}
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        </form>
      ) : (
        <p className="text-gray-400 mb-8">Debes <Link to="/login" className="text-[var(--primary-accent)] hover:underline">iniciar sesión</Link> para comentar.</p>
      )}

      <div className="bg-[var(--surface-dark)] rounded-lg">
        {loading ? (
          <div className="p-10 text-center"><Spinner /></div>
        ) : comments.length > 0 ? (
          comments.map(comment => <CommentCard key={comment.id} comment={comment} onDelete={handleDeleteComment} />)
        ) : (
          <p className="p-10 text-center text-gray-500">Sé el primero en comentar.</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;