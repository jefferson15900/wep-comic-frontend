// src/components/layout/MainLayout.tsx

import { Outlet } from 'react-router-dom';
import Header from './Header';
import FloatingActionButton from '../common/FloatingActionButton';
import Footer from './Footer'; // <-- 1. IMPORTA EL FOOTER

const MainLayout = () => { 
  return (
    <div className="bg-[var(--background-dark)] text-white min-h-screen flex flex-col">
      <Header />
      
      {/* 'flex-grow' hace que el 'main' ocupe todo el espacio disponible */}
      <main className="flex-grow py-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      {/* El botón flotante y el footer no se ven afectados por el contenedor central */}
      <FloatingActionButton />
      
      <Footer /> {/* <-- 2. AÑADE EL FOOTER AQUÍ */}
    </div>
  );
};

export default MainLayout;