// src/components/comic/ChapterList.tsx

import { Link } from 'react-router-dom';
import { BookOpen,Trash2 } from 'lucide-react';

export interface Chapter {
  id: string;
  number: number;
  title?: string;
  source?: string;
}

interface ChapterListProps {
  chapters: Chapter[];
  comicId: string;
  onDeleteChapter?: (chapterId: string) => void;
}

const ChapterList = ({ chapters, comicId, onDeleteChapter }: ChapterListProps) => {
  if (!chapters || chapters.length === 0) {
    return null;
  }

  const handleDeleteClick = (e: React.MouseEvent, chapterId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDeleteChapter) {
      if (window.confirm('¿Estás seguro de que quieres ELIMINAR este capítulo permanentemente?')) {
        onDeleteChapter(chapterId);
      }
    }
  };

  return (
    <div className="space-y-2 max-h-[52rem] overflow-y-auto pr-2">
      {chapters.map((chapter) => (
        <div key={chapter.id} className="group flex items-center bg-[var(--surface-dark)] rounded-lg transition-colors hover:bg-gray-800/50">
          <Link 
            to={`/comic/${comicId}/chapter/${chapter.id}`}
            state={{ chapterSource: chapter.source || 'local' }}
            className="flex-grow p-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-[var(--text-primary)]">
                  Capítulo {chapter.number}
                </p>
                {chapter.title && (
                  <p className="text-sm text-[var(--text-secondary)]">{chapter.title}</p>
                )}
              </div>
              <BookOpen className="text-[var(--primary-accent)]" />
            </div>
          </Link>

          {onDeleteChapter && (
            <button
              onClick={(e) => handleDeleteClick(e, chapter.id)}
              className="p-2 mr-2 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/50"
              title="Eliminar capítulo (Admin)"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChapterList;