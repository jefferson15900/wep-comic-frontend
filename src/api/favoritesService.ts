// src/api/favoritesService.ts
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_API_URL}/favorites/`;

// Función para crear la configuración de cabeceras con el token
const getConfig = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Obtener los IDs de los favoritos del usuario
export const getFavorites = async (token: string) => {
  const response = await axios.get(API_URL, getConfig(token));
  return response.data; // Debería ser un array de IDs
};

// Añadir un favorito
export const addFavorite = async (comicId: string, token: string) => {
  const response = await axios.post(API_URL, { comicId }, getConfig(token));
  return response.data;
};

// Quitar un favorito
export const removeFavorite = async (comicId: string, token: string) => {
  // El ID del cómic va en la URL
  const response = await axios.delete(API_URL + comicId, getConfig(token));
  return response.data;
};