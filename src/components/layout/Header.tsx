// src/components/layout/Header.tsx

import { useState, useEffect, useRef, Fragment } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useContentFilter } from '../../context/ContentFilterContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Search, UserCircle, LogOut, Settings, PlusSquare, ShieldCheck, 
  Compass, Globe, Bell, Menu, X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationService from '../../api/notificationService';
import { Transition } from '@headlessui/react';


// Interfaz para el tipado de las notificaciones
interface Notification {
  id: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const { showNsfw, toggleNsfw } = useContentFilter();
  const { language, cycleLanguage } = useLanguage();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  const queryClient = useQueryClient();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationService.getNotifications(user!.token),
    enabled: !!user,
    refetchInterval: 60000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: () => notificationService.markNotificationsAsRead(user!.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleBellClick = () => {
    if (unreadCount > 0 && !isNotificationsOpen) {
      markAsReadMutation.mutate();
    }
    setIsNotificationsOpen(prev => !prev);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm('');
      
    }
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false); // También cierra el menú móvil
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target) && buttonRef.current && !buttonRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target) && bellButtonRef.current && !bellButtonRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isMenuOpen || isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, isNotificationsOpen]);

  const getLangInfo = () => {
    switch(language) {
      case 'en': return { text: 'EN', title: 'Switch to All Languages' };
      case 'all': return { text: 'ALL', title: 'Switch to Spanish' };
      case 'es': default: return { text: 'ES', title: 'Switch to English' };
    }
  };
  const langInfo = getLangInfo();



  return (
    <>
<header className="p-4 flex justify-between items-center bg-[var(--background-dark)]/80 backdrop-blur-sm border-b border-b-[var(--surface-dark)] sticky top-0 z-30 h-20">
  
  {/* --- VISTA NORMAL (se oculta cuando la búsqueda está abierta en móvil) --- */}
  <div className={`flex-1 flex justify-between items-center transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
    <Link to="/" className="flex-shrink-0">
      <h1 className="text-white text-2xl font-bold">WepComic</h1>
    </Link>
    
    {/* Contenedor de acciones de la derecha */}
    <div className="flex items-center gap-2">
      {/* --- VISTA DE ESCRITORIO (oculta en móvil) --- */}
     <div className="hidden lg:flex items-center gap-2 lg:gap-3"> {/*test*/}
        <button onClick={toggleNsfw} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border-2 ${showNsfw ? 'bg-red-500/10 border-red-500 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 border-green-500 text-green-400 hover:bg-green-500/20'}`} title={showNsfw ? "Modo Adulto ACTIVO" : "Modo Familiar ACTIVO"}>
         <span className="hidden lg:inline">Modo </span>
         <span>Familiar</span>
        </button>
        <button onClick={cycleLanguage} className="p-2 text-gray-300 hover:text-white hover:bg-[var(--surface-dark)] rounded-full flex items-center gap-1.5" title={langInfo.title}>
          <Globe size={20} />
          <span className="text-sm font-bold">{langInfo.text}</span>
        </button>
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center bg-[var(--surface-dark)] p-2 rounded-lg w-64 lg:w-80">
          <Search className="text-[var(--text-secondary)] mr-2" size={20} />
          <input type="text" placeholder="Buscar..." className="bg-transparent focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </form>
        <NavLink to="/explore" className="text-gray-300 hover:text-white text-sm font-medium">Explorar</NavLink>
        
        {isLoading ? (
          <div className="w-48 h-10 bg-[var(--surface-dark)] rounded-lg animate-pulse"></div>
        ) : user ? (
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-px h-6 bg-gray-700"></div>
            <Link to="/creator-studio" className="px-4 py-2 bg-[var(--primary-accent)] text-white rounded-lg text-sm font-bold hover:bg-opacity-90">Creator Studio</Link>
            
            <div className="relative">
              <button ref={bellButtonRef} onClick={handleBellClick} className="p-2 text-gray-300 hover:text-white hover:bg-[var(--surface-dark)] rounded-full relative" title="Notificaciones">
                <Bell size={24} />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span></span>}
              </button>
              {isNotificationsOpen && (
                  <div ref={notificationsRef} className="absolute right-0 mt-2 w-80 md:w-96 bg-[var(--surface-dark)] rounded-lg shadow-xl z-40 border border-gray-700">
                      <div className="p-3 border-b border-gray-700 font-bold text-white">Notificaciones</div>
                      <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                              notifications.map(notif => (
                                  <Link key={notif.id} to={notif.link} onClick={() => setIsNotificationsOpen(false)} className={`block p-3 border-b border-gray-800 transition-colors ${!notif.isRead ? 'bg-blue-600/20 hover:bg-blue-600/30' : 'hover:bg-gray-800/50'}`}>
                                      <p className={`text-sm ${!notif.isRead ? 'text-white font-semibold' : 'text-gray-300'}`}>{notif.message}</p>
                                      <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                  </Link>
                              ))
                          ) : (
                              <p className="p-4 text-center text-gray-500">No tienes notificaciones nuevas.</p>
                          )}
                      </div>
                  </div>
              )}
            </div>

            <div className="relative">
              <button ref={buttonRef} onClick={() => setIsMenuOpen(prev => !prev)} className="p-2 bg-[var(--surface-dark)] rounded-full cursor-pointer flex-shrink-0" title="Menú de usuario" aria-haspopup="true" aria-expanded={isMenuOpen}>
                <UserCircle className="text-[var(--primary-accent)]" size={28} />
              </button>
              {isMenuOpen && (
                  <div ref={menuRef} className="absolute right-0 mt-2 w-64 bg-[var(--surface-dark)] rounded-lg shadow-xl py-2 z-40 border border-gray-700">
                      <div className="px-4 py-2 border-b border-gray-700"><p className="text-sm font-bold text-white">Hola, {user.username}</p></div>
                      <div className="mt-2 space-y-1">
                          <NavLink to="/explore" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 w-full text-left md:hidden"><Compass size={16} /> Explorar</NavLink>
                          <NavLink to="/creator-studio" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 w-full text-left sm:hidden"><PlusSquare size={16} /> Creator Studio</NavLink>
                          <NavLink to={`/profile/${user.username}`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 w-full text-left"> <Settings size={16} /> Perfil y Configuración</NavLink>
                          {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (<NavLink to="/admin/moderation-queue" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-cyan-400 hover:bg-gray-700/50 w-full text-left"><ShieldCheck size={16} />Panel de Moderación</NavLink>)}
                      </div>
                      <div className="my-1 pt-2 border-t border-gray-700"></div>
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-700/50 w-full text-left"><LogOut size={16} /> Cerrar Sesión</button>
                  </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-px h-6 bg-gray-700 hidden md:block"></div>
            <Link to="/login" className="text-gray-300 hover:text-white text-sm font-medium">Iniciar Sesión</Link>
            <Link to="/register" className="px-4 py-2 bg-[var(--primary-accent)] text-white rounded-lg text-sm font-bold hover:bg-opacity-90">Registrarse</Link>
          </div>
        )}
      </div>

      {/* --- VISTA DE MÓVIL (visible solo en pantallas pequeñas) --- */}
      <div className="flex lg:hidden items-center gap-1">
        <button onClick={() => setIsSearchOpen(true)} className="p-2 text-gray-300 hover:text-white rounded-full" title="Buscar">
          <Search size={22} />
        </button>
        <button onClick={() => setIsMobileMenuOpen(prev => !prev)} className="p-2 text-gray-300 hover:text-white rounded-full" aria-label="Abrir menú">
          <Menu size={24} />
        </button>
      </div>
    </div>
  </div>

  {/* --- BARRA DE BÚSQUEDA MÓVIL (superpuesta) --- */}
  <Transition
    show={isSearchOpen}
    as={Fragment}
    enter="transition duration-300 ease-out"
    enterFrom="opacity-0 scale-95"
    enterTo="opacity-100 scale-100"
    leave="transition duration-200 ease-in"
    leaveFrom="opacity-100 scale-100"
    leaveTo="opacity-0 scale-95"
  >
    <div className="absolute inset-0 flex items-center px-4 bg-[var(--background-dark)]">
      <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center">
        <input 
          type="text" 
          placeholder="Buscar manga..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-lg text-white focus:outline-none"
          autoFocus
        />
      </form>
      <button onClick={() => setIsSearchOpen(false)} className="p-2 text-gray-400">
        <X size={24} />
      </button>
    </div>
  </Transition>
</header>

      {/* --- PANEL DEL MENÚ MÓVIL --- */}
<Transition
  as={Fragment} // Usamos un Fragment para no añadir un div extra al DOM
  show={isMobileMenuOpen}
  enter="transition ease-out duration-300"
  enterFrom="transform opacity-0 -translate-y-4"
  enterTo="transform opacity-100 translate-y-0"
  leave="transition ease-in duration-200"
  leaveFrom="transform opacity-100 translate-y-0"
  leaveTo="transform opacity-0 -translate-y-4"
>
  <div 
    className="fixed top-20 left-0 right-0 w-full bg-[var(--background-dark)] border-t border-gray-800 lg:hidden z-50 p-4 shadow-lg"
    onClick={() => setIsMobileMenuOpen(false)}
  >
    {/* El contenido del menú (el div con space-y-4) no necesita cambiar */}
    <div className="space-y-4">
      <NavLink to="/explore" onClick={() => setIsMobileMenuOpen(false)}   className="block text-lg py-2 text-gray-300 hover:text-white">Explorar</NavLink>
      {user ? (
        <>
          <NavLink to="/creator-studio" onClick={() => setIsMobileMenuOpen(false)}  className="block text-lg py-2 text-gray-300 hover:text-white">Creator Studio</NavLink>
          <NavLink to={`/profile/${user.username}`}  onClick={() => setIsMobileMenuOpen(false)}  className="block text-lg py-2 text-gray-300 hover:text-white">Mi Perfil</NavLink>
          {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
            <NavLink to="/admin/moderation-queue" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg py-2 text-cyan-400 hover:text-cyan-300">Panel de Moderación</NavLink>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-4 pt-2">
          <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg py-2 text-gray-300 hover:text-white">Iniciar Sesión</NavLink>
          <NavLink to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg text-center px-4 py-3 bg-[var(--primary-accent)] text-white rounded-lg font-bold">Registrarse</NavLink>
        </div>
      )}
      
      <div className="border-t border-gray-700 pt-4 space-y-4">
        <button onClick={toggleNsfw} className="w-full flex justify-between items-center text-lg text-gray-300 hover:text-white">
          <span>Modo Familiar</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${showNsfw ? 'bg-red-500/80 text-white' : 'bg-green-500/80 text-white'}`}>{showNsfw ? 'OFF' : 'ON'}</span>
        </button>
        <button onClick={cycleLanguage} className="w-full flex justify-between items-center text-lg text-gray-300 hover:text-white">
          <span>Idioma</span>
          <span className="font-bold">{langInfo.text}</span>
        </button>
      </div>

      {user && (
        <div className="border-t border-gray-700 pt-4">
          <button onClick={handleLogout} className="w-full text-left text-lg text-red-400 hover:text-red-300">Cerrar Sesión</button>
        </div>
      )}
    </div>
  </div>
</Transition>
    </>
  );
};

export default Header;



{/*

       
        <button
          onClick={toggleNsfw}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border-2 ${
            showNsfw
              ? 'bg-red-500/10 border-red-500 text-red-400 hover:bg-red-500/20'       // Estilo Rojo (+18 ACTIVO)
              : 'bg-green-500/10 border-green-500 text-green-400 hover:bg-green-500/20' // Estilo Verde (FAMILIAR)
          }`}
          title={showNsfw ? "Modo Adulto ACTIVO (clic para desactivar)" : "Modo Familiar ACTIVO (clic para activar contenido adulto)"}
        >
          Modo Familiar
        </button>
*/}