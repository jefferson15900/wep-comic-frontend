// src/api/userService.ts
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_API_URL}/users/`;

const getConfig = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const changePassword = async (passwords: any, token: string) => {
  // Hacemos una petición PUT a /users/me/password
  const response = await axios.put(API_URL + 'me/password', passwords, getConfig(token));
  return response.data;
};

export const getUploadedMangaById = async (mangaId: string) => {
  const response = await axios.get(`${API_URL}${mangaId}`);
  return response.data;
};

// Obtener el perfil público de cualquier usuario por su nombre de usuario
export const getUserProfileByUsername = async (username: string) => {
  // Nota: esta es una llamada a una API pública, no necesita token
  const response = await axios.get(`${API_URL}profile/${username}`);
  return response.data;
};

// Obtener los IDs de los favoritos de un usuario (paginados)
export const getUserFavorites = async (username: string, limit: number, offset: number) => {
  const response = await axios.get(`${API_URL}profile/${username}/favorites`, {
    params: { limit, offset }
  });
  return response.data;
};

// Obtener las creaciones de un usuario (paginadas)
export const getUserCreations = async (username: string, limit: number, offset: number, token?: string) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await axios.get(`${API_URL}profile/${username}/creations`, {
    ...config,
    params: { limit, offset }
  });
  return response.data;
};

// Obtener las contribuciones de un usuario (paginadas)
export const getUserContributions = async (username: string, limit: number, offset: number) => {
  const response = await axios.get(`${API_URL}profile/${username}/contributions`, {
    params: { limit, offset }
  });
  return response.data;
};


export const updateUserProfile = async (formData: FormData, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(API_URL + 'me/profile', formData, config);
  return response.data;
};