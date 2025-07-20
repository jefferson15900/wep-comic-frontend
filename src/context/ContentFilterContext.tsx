// src/context/ContentFilterContext.tsx

import { createContext, useState, useEffect, useContext , type ReactNode} from 'react';

const CONTENT_FILTER_KEY = 'wepcomic_showNsfw';

interface ContentFilterContextType {
  showNsfw: boolean;
  toggleNsfw: () => void;
}

// Creamos el contexto con un valor inicial por defecto (que no se usará realmente)
const ContentFilterContext = createContext<ContentFilterContextType>({
  showNsfw: false,
  toggleNsfw: () => {},
});

// Hook personalizado para usar el contexto fácilmente
export const useContentFilter = () =>  {
  return useContext(ContentFilterContext);
};

// Provider del contexto que contendrá la lógica
export const ContentFilterProvider = ({ children }: { children: ReactNode }) => {
  const [showNsfw, setShowNsfw] = useState<boolean>(() => {
    const storedValue = localStorage.getItem(CONTENT_FILTER_KEY);
    return storedValue === 'true'; // El valor por defecto es false si no hay nada
  });

  // Efecto para guardar el cambio en localStorage
  useEffect(() => {
    localStorage.setItem(CONTENT_FILTER_KEY, String(showNsfw));
  }, [showNsfw]);

  const toggleNsfw = () => {
    setShowNsfw(prev => !prev);
  };

  const value = {
    showNsfw,
    toggleNsfw,
  };

  return (
    <ContentFilterContext.Provider value={value}>
      {children}
    </ContentFilterContext.Provider>
  );
};