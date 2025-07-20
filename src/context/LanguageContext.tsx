// src/context/LanguageContext.tsx

import { createContext, useState, useEffect,useContext,  type ReactNode } from 'react';

const LANGUAGE_KEY = 'wepcomic_language';

// Añadimos 'all' como una opción de idioma válida
export type Language = 'es' | 'en' | 'all';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  cycleLanguage: () => void; // Nueva función para rotar entre los idiomas
}

// Creamos el contexto
const LanguageContext = createContext<LanguageContextType>({
  language: 'all', // Valor inicial por defecto
  setLanguage: () => {},
  cycleLanguage: () => {},
});

// Hook personalizado para facilitar el uso del contexto
export const useLanguage = () => {
  return useContext(LanguageContext);
};

// Componente Provider que envuelve la aplicación y gestiona el estado
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem(LANGUAGE_KEY) as Language;
    // Comprobar si el valor almacenado es uno de los válidos
    if (['es', 'en', 'all'].includes(storedLang)) {
      return storedLang;
    }
    return 'all'; // 'es' como valor por defecto si no hay nada o es inválido
  });

  // Guardar el idioma en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  // Función para establecer un idioma específico
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Función para rotar entre los tres estados: ES -> EN -> ALL -> ES
  const cycleLanguage = () => {
    setLanguageState(prev => {
      if (prev === 'all') return 'es';
      if (prev === 'es') return 'en';
      return 'all'; // Si es 'all', vuelve a 'es'
    });
  };

  const value = {
    language,
    setLanguage,
    cycleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};