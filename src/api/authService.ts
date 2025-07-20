// src/api/authService.ts
import axios from 'axios';

// Apuntamos al proxy de nuestro backend que configuraremos en Vite
const API_URL = `${import.meta.env.VITE_BACKEND_API_URL}/auth/`;

// Función para registrar un nuevo usuario
export const register = async (userData: any) => {
  const response = await axios.post(API_URL + 'register', userData);
  return response.data;
};

// Función para iniciar sesión
export const login = async (userData: any) => {
  const response = await axios.post(API_URL + 'login', userData);
  // La respuesta del backend incluye el usuario y el token
  return response.data;
};