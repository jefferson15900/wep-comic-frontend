// src/api/commentService.ts
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_API_URL}/mangas`;

const getConfig = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getCommentsForManga = async (mangaId: string) => {
  const response = await axios.get(`${API_URL}/${mangaId}/comments`);
  return response.data;
};

export const postComment = async (mangaId: string, text: string, token: string) => {
  const response = await axios.post(`${API_URL}/${mangaId}/comments`, { text }, getConfig(token));
  return response.data;
};

export const deleteCommentById = async (mangaId: string, commentId: string, token: string) => {
  await axios.delete(`${API_URL}/${mangaId}/comments/${commentId}`, getConfig(token));
};