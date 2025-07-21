// src/api/mangaService.ts

import axios from 'axios';
import qs from 'qs';

const API_URL = `${import.meta.env.VITE_BACKEND_API_URL}/mangas/`;

const getConfig = (token?: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Obtener lista de mangas (para 'Añadido por la Comunidad' y búsqueda)
export const getUploadedMangas = async (page: number = 1, limit: number = 20, searchTerm: string = '', showNsfw: boolean) => {
  const params = {
    page,
    limit,
    title: searchTerm || undefined,
    showNsfw: showNsfw.toString(),
  };
  // Usamos axios directamente con la URL base
  const response = await axios.get(API_URL, { params });
  // La respuesta del backend ya está paginada, la devolvemos tal cual
  return response.data;
};
// Obtener detalles de un manga específico (ahora también maneja permisos)
export const getUploadedMangaById = async (mangaId: string, token?: string) => {
  const config = token ? getConfig(token) : {};
  const response = await axios.get(`${API_URL}${mangaId}`, config);
  return response.data;
};

// Obtener múltiples mangas por sus IDs (para favoritos)
export const getUploadedMangasByIds = async (ids: string[]) => {
  if (ids.length === 0) return [];
  const params = { ids };
  const response = await axios.get(API_URL, {
    params,
    paramsSerializer: params => qs.stringify(params, { arrayFormat: 'brackets' })
  });
  return response.data;
};

