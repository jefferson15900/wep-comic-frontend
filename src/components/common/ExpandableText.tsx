// src/components/common/ExpandableText.tsx

import { useState } from 'react';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
}

const ExpandableText = ({ text, maxLength = 250 }: ExpandableTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Limpiamos el texto de posibles etiquetas HTML
  const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/\n/g, '<br />');

  // Si el texto es más corto que el máximo, simplemente lo mostramos
  if (cleanText.length <= maxLength) {
    return <p className="mt-6 text-[var(--text-primary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: cleanText }} />;
  }

  const truncatedText = cleanText.substring(0, maxLength);

  return (
    <div className="mt-6 text-[var(--text-primary)] leading-relaxed">
      <p dangerouslySetInnerHTML={{ __html: isExpanded ? cleanText : `${truncatedText}...` }} />
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="font-bold text-[var(--primary-accent)] hover:underline mt-2"
      >
        {isExpanded ? 'Leer menos' : 'Leer más'}
      </button>
    </div>
  );
};

export default ExpandableText;