// src/api/chapterService.ts

import axios from 'axios';

// --- ¡CORRECCIÓN CLAVE! ---
// Usamos la variable de entorno para la URL base.
// En producción: "https://wep-comic-backend.onrender.com"
// En local: "/backend"
const API_URL = `${import.meta.env.VITE_BACKEND_API_URL}`;

// Esta función ahora construye la URL completa
const getChapterApiUrl = (mangaId: string) => `${API_URL}/mangas/${mangaId}/chapters/`;

const getConfig = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- FUNCIONES DE CAPÍTULO ---

export const deleteChapter = async (mangaId: string, chapterId: string, token: string) => {
  // Ahora getChapterApiUrl devuelve la URL completa correcta
  const response = await axios.delete(`${getChapterApiUrl(mangaId)}${chapterId}`, getConfig(token));
  return response.data;
};

// --- FUNCIONES DE PÁGINAS ---

export const getUploadedChapterPages = async (mangaId: string, chapterId: string, token?: string): Promise<string[]> => {
  const config = token ? getConfig(token) : {};
  // Ahora getChapterApiUrl devuelve la URL completa correcta
  const response = await axios.get(`${getChapterApiUrl(mangaId)}${chapterId}/pages`, config);
  
  const responseData = response.data;
  console.log("Respuesta del backend para las páginas:", responseData);

  // Verificamos si la respuesta es directamente un array de URLs
  if (Array.isArray(responseData)) {
    return responseData; 
  }
  
  // Verificamos si la respuesta es un objeto con una propiedad 'data' que es un array
  if (responseData && Array.isArray(responseData.data)) {
    return responseData.data.map((page: { imageUrl: string }) => page.imageUrl);
  }

  // Si no coincide con ninguno, devolvemos un array vacío
  console.warn('La respuesta de getUploadedChapterPages no es un array esperado:', responseData);
  return []; 
};