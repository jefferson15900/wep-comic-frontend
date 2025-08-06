// src/api/adminService.ts
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_API_URL}/admin/`;

const getConfig = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- Funciones para OBTENER datos ---
export const getNewSubmissions = async (token: string, page: number) => {
  const response = await axios.get(API_URL + 'new-submissions', {
    ...getConfig(token),
    params: {
      page: page // Esto añadirá "?page=X" a la URL de la petición
    }
  });
  return response.data;
};
export const getPendingEdits = async (token: string, page: number) => { // <-- Añade page
  const response = await axios.get(API_URL + 'pending-edits', {
    ...getConfig(token),
    params: { page } // <-- Usa page
  });
  return response.data;
};

export const getMangaForReview = async (mangaId: string, token: string) => {
  const response = await axios.get(`${API_URL}review/manga/${mangaId}`, getConfig(token));
  return response.data;
};

// --- NUEVAS Funciones de ACCIÓN ---

// Aprobar un manga completo y sus capítulos pendientes
export const approveManga = async (mangaId: string, token: string) => {
  const response = await axios.post(`${API_URL}manga/${mangaId}/approve`, {}, getConfig(token));
  return response.data;
};

// Aprobar un capítulo específico
export const approveChapter = async (chapterId: string, token: string) => {
  const response = await axios.post(`${API_URL}chapter/${chapterId}/approve`, {}, getConfig(token));
  return response.data;
};

// Rechazar un manga completo
export const rejectManga = async (mangaId: string, data: { reason: string }, token: string) => {
  const response = await axios.post(`${API_URL}manga/${mangaId}/reject`, data, getConfig(token));
  return response.data;
};

// Rechazar un capítulo específico
export const rejectChapter = async (chapterId: string, data: { reason: string }, token: string) => {
  const response = await axios.post(`${API_URL}chapter/${chapterId}/reject`, data, getConfig(token));
  return response.data;
};

// Eliminar un manga de forma permanente
export const deleteManga = async (mangaId: string, token: string) => {
  const response = await axios.delete(`${API_URL}manga/${mangaId}`, getConfig(token));
  return response.data;
};


// Obtener la lista de propuestas de edición pendientes
export const getPendingProposals = async (token: string) => {
  const response = await axios.get(API_URL + 'pending-proposals', getConfig(token));
  return response.data;
};

// Obtener los detalles de una propuesta específica para revisión
export const getProposalForReview = async (proposalId: string, token: string) => {
  const response = await axios.get(`${API_URL}review/proposal/${proposalId}`, getConfig(token));
  return response.data;
};

// Aprobar una propuesta de edición
export const approveProposal = async (proposalId: string, token: string) => {
  const response = await axios.post(`${API_URL}proposals/${proposalId}/approve`, {}, getConfig(token));
  return response.data;
};

// Rechazar una propuesta de edición
export const rejectProposal = async (proposalId: string, data: { reason: string }, token: string) => {
  const response = await axios.post(`${API_URL}proposals/${proposalId}/reject`, data, getConfig(token));
  return response.data;
};


// Solicitar el bloqueo de un manga para revisión
export const lockManga = async (mangaId: string, token: string) => {
  // No necesitamos devolver nada, si falla, lanzará un error.
  await axios.post(`${API_URL}review/manga/${mangaId}/lock`, {}, getConfig(token));
};

// Liberar el bloqueo de un manga
export const unlockManga = async (mangaId: string, token: string) => {
  await axios.post(`${API_URL}review/manga/${mangaId}/unlock`, {}, getConfig(token));
};

export const getArchivedMangas = async (token: string, page: number) => { // <-- Añade page
  const response = await axios.get(`${API_URL}archived-mangas`, {
    ...getConfig(token),
    params: { page } // <-- Usa page
  });
  return response.data;
};

export const deleteChapter = async (chapterId: string, token: string) => {
  await axios.delete(`${API_URL}chapter/${chapterId}`, getConfig(token));
};

export const restoreManga = async (mangaId: string, token: string) => {
  const response = await axios.post(`${API_URL}manga/${mangaId}/restore`, {}, getConfig(token));
  return response.data;
};