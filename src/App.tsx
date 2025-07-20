// src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import { ContentFilterProvider } from './context/ContentFilterContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

import MainLayout from './components/layout/MainLayout';
import Spinner from './components/common/Spinner';
import ScrollToTop from './components/common/ScrollToTop';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRouteGuard from './components/auth/AdminRouteGuard'; 
const MyCreationsPage = lazy(() => import('./pages/MyCreationsPage'));
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Carga diferida de todas las páginas
const HomePage = lazy(() => import('./pages/HomePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const ComicDetailPage = lazy(() => import('./pages/ComicDetailPage'));
const ChapterPage = lazy(() => import('./pages/ChapterPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CreatorStudioPage = lazy(() => import('./pages/CreatorStudioPage'));
const ModerationQueuePage = lazy(() => import('./pages/admin/ModerationQueuePage'));
const ReviewPage = lazy(() => import('./pages/admin/ReviewPage'));
const ReviewProposalPage = lazy(() => import('./pages/admin/ReviewProposalPage'));
const AddChapterPage = lazy(() => import('./pages/AddChapterPage'));
const ProposeEditPage = lazy(() => import('./pages/ProposeEditPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage')); 
const CommunityPage = lazy(() => import('./pages/CommunityPage'));

const queryClient = new QueryClient();

function App() {
  return (
   <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ContentFilterProvider>
        <LanguageProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={
              <div className="flex justify-center items-center h-screen bg-[var(--background-dark)]">
                <Spinner />
              </div>
            }>
              <Routes>
                {/* --- Rutas con el Layout Principal (Header + Contenido) --- */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/comic/:comicId" element={<ComicDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  
                  {/* --- Rutas Protegidas (Requieren inicio de sesión) --- */}
                  <Route element={<ProtectedRoute />}>
                    {/* RUTAS DE PERFIL UNIFICADAS */}
                    <Route path="/profile/:username" element={<UserProfilePage />} />
                    <Route path="/profile/:username/:tab" element={<UserProfilePage />} />
                    <Route path="/profile/:username/settings" element={<UserProfilePage />} />
                    
                    {/* RUTAS DE CONTRIBUCIÓN */}
                    <Route path="/creator-studio" element={<MyCreationsPage />} />
                    <Route path="/edit/manga/:mangaId" element={<CreatorStudioPage />} />
                    <Route path="/manga/:mangaId/add-chapter" element={<AddChapterPage />} />
                    <Route path="/manga/:mangaId/propose-edit" element={<ProposeEditPage />} />

                    {/* RUTAS DE ADMINISTRADOR (Requieren rol de Admin) */}
                    <Route element={<AdminRouteGuard />}>
                      <Route path="/admin/moderation-queue" element={<ModerationQueuePage />} />
                      <Route path="/admin/review/manga/:mangaId" element={<ReviewPage />} />
                      <Route path="/admin/review/proposal/:proposalId" element={<ReviewProposalPage />} />
                    </Route>
                  </Route>
                </Route>

                {/* --- Ruta de Lectura (sin layout principal) --- */}
                <Route path="/comic/:comicId/chapter/:chapterId" element={<ChapterPage />} />

                {/* --- Ruta de Not Found (404) --- */}
                <Route path="*" element={<NotFoundPage />} />   
                       
              </Routes>
            </Suspense>
          </BrowserRouter>
        </LanguageProvider>
      </ContentFilterProvider>
    </AuthProvider>
   </QueryClientProvider>
  );
}

export default App;