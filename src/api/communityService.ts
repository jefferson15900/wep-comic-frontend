// src/api/communityService.ts
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_API_URL}/community/`;

const getConfig = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Función para crear un nuevo manga.
// Recibe un objeto FormData porque estamos enviando un archivo.
export const createManga = async (formData: FormData, token: string) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data', // Esencial para enviar archivos
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(API_URL + 'mangas', formData, config);
  return response.data;
};

// Función para añadir un nuevo capítulo a un manga existente.
export const addChapter = async (mangaId: string, formData: FormData, token: string) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${API_URL}mangas/${mangaId}/chapters`, formData, config);
  return response.data;
};

// Función para editar los metadatos de un manga existente.
export const editManga = async (mangaId: string, formData: FormData, token: string) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${API_URL}mangas/${mangaId}`, formData, config);
  return response.data;
};

// Función para editar los metadatos de un capítulo existente.
export const editChapter = async (chapterId: string, data: { chapterNumber?: number; title?: string }, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${API_URL}chapters/${chapterId}`, data, config);
  return response.data;
};

// Función para proponer una edición a un manga.
// Usa FormData porque podría incluir una nueva imagen de portada.
export const proposeMangaEdit = async (mangaId: string, formData: FormData, token: string) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${API_URL}mangas/${mangaId}/propose-edit`, formData, config);
  return response.data;
};

// "Borra" un manga (lo cambia a estado ARCHIVED).
export const archiveManga = async (mangaId: string, token: string) => {
  const response = await axios.delete(`${API_URL}mangas/${mangaId}`, getConfig(token));
  return response.data;
};