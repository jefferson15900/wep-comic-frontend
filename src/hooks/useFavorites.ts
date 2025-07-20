// src/hooks/useFavorites.ts

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as favoritesService from '../api/favoritesService';

const LOCAL_FAVORITES_KEY = 'wepcomic_local_favorites';

const getLocalFavorites = (): string[] => {
  const stored = localStorage.getItem(LOCAL_FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const useFavorites = () => {
  const { user } = useAuth(); // Obtenemos el usuario (y su token) del AuthContext
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Efecto para cargar los favoritos cuando el componente se monta o el usuario cambia
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      if (user) {
        // --- Usuario LOGUEADO: Usar la API ---
        try {
          const ids = await favoritesService.getFavorites(user.token);
          setFavoriteIds(ids);
        } catch (error) {
          console.error("Error al cargar los favoritos del usuario:", error);
          // Opcional: podríamos desloguear al usuario si el token es inválido
        }
      } else {
        // --- Usuario ANÓNIMO: Usar localStorage ---
        setFavoriteIds(getLocalFavorites());
      }
      setLoading(false);
    };

    fetchFavorites();
  }, [user]); // Se re-ejecuta si el usuario hace login o logout

  // --- Funciones para modificar los favoritos ---

  const addFavorite = useCallback(async (comicId: string) => {
    if (user) {
      // Lógica para usuario logueado
      await favoritesService.addFavorite(comicId, user.token);
    } else {
      // Lógica para usuario anónimo
      const localFavorites = getLocalFavorites();
      localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify([...localFavorites, comicId]));
    }
    // Actualizamos el estado local para que la UI responda al instante
    setFavoriteIds(prev => [...prev, comicId]);
  }, [user]);

  const removeFavorite = useCallback(async (comicId: string) => {
    if (user) {
      // Lógica para usuario logueado
      await favoritesService.removeFavorite(comicId, user.token);
    } else {
      // Lógica para usuario anónimo
      const localFavorites = getLocalFavorites();
      localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(localFavorites.filter(id => id !== comicId)));
    }
    // Actualizamos el estado local
    setFavoriteIds(prev => prev.filter(id => id !== comicId));
  }, [user]);

  const isFavorite = useCallback((comicId: string): boolean => {
    return favoriteIds.includes(comicId);
  }, [favoriteIds]);

  // Devolvemos el estado y las funciones para que los componentes los usen
  return { favoriteIds, addFavorite, removeFavorite, isFavorite, loadingFavorites: loading };
};