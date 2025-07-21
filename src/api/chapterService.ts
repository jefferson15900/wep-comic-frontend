// src/api/chapterService.ts

import axios from 'axios';

// La ruta base para las operaciones de capítulo siempre se construye dinámicamente
const getChapterApiUrl = (mangaId: string) => `/backend/mangas/${mangaId}/chapters/`;

const getConfig = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- FUNCIONES DE CAPÍTULO ---

// Ya no necesitas 'createChapter' ni 'updateChapter' porque se eliminó la edición

export const deleteChapter = async (mangaId: string, chapterId: string, token: string) => {
  const response = await axios.delete(`${getChapterApiUrl(mangaId)}${chapterId}`, getConfig(token));
  return response.data;
};

// --- FUNCIONES DE PÁGINAS ---

// Renombrada para evitar conflictos con comicService
export const getUploadedChapterPages = async (mangaId: string, chapterId: string, token?: string): Promise<string[]> => {
  const config = token ? getConfig(token) : {};
  const response = await axios.get(`${getChapterApiUrl(mangaId)}${chapterId}/pages`, config);
  
  // --- ESTA ES LA LÓGICA DE CORRECCIÓN ---
  const responseData = response.data;
  console.log("Respuesta del backend para las páginas:", responseData);

  // Verificamos si la respuesta es directamente un array.
  // Como tu backend ya devuelve el array de URLs, esto es todo lo que necesitamos.
  if (Array.isArray(responseData)) {
    return responseData; // ¡Simplemente devolvemos el array tal cual!
  }
  
  // Mantenemos esto como un fallback por si el formato del backend cambia en el futuro.
  if (responseData && Array.isArray(responseData.data)) {
    return responseData.data.map((page: { imageUrl: string }) => page.imageUrl);
  }
  
  // Si no es un array, devolvemos uno vacío para evitar errores.
  console.warn('La respuesta de getUploadedChapterPages no es un array esperado:', responseData);
  return []; 
};
// Ya no necesitas 'addPagesToChapter', 'reorderPages', 'updatePage' o 'deletePage'
// porque se eliminó la edición y gestión de páginas.