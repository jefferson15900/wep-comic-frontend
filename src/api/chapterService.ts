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
export const getUploadedChapterPages = async (mangaId: string, chapterId: string, token?: string) => {
  const config = token ? getConfig(token) : {};
  const response = await axios.get(`${getChapterApiUrl(mangaId)}${chapterId}/pages`, config);
  return response.data;
};

// Ya no necesitas 'addPagesToChapter', 'reorderPages', 'updatePage' o 'deletePage'
// porque se eliminó la edición y gestión de páginas.