// src/api/notificationService.ts

import axios from 'axios';

// La ruta base para la API de notificaciones en tu backend
const API_URL = `${import.meta.env.VITE_BACKEND_API_URL}/notifications/`;

// Función auxiliar para crear la configuración de cabeceras con el token
const getConfig = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getNotifications = async (token: string) => {
  const response = await axios.get(API_URL, getConfig(token));
  return response.data;
};

export const markNotificationsAsRead = async (token: string) => {
  const response = await axios.post(API_URL + 'read', {}, getConfig(token));
  return response.data;
};