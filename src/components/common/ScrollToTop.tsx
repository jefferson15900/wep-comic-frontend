// src/components/common/ScrollToTop.tsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Este componente no renderiza nada visualmente.
 * Su único propósito es escuchar los cambios en la ruta de la URL
 * y, cada vez que cambia, hacer scroll de la ventana hasta la parte superior.
 * Se debe colocar dentro del componente <BrowserRouter> en App.tsx.
 */
const ScrollToTop = () => {
  // El hook useLocation nos da acceso al objeto de ubicación actual.
  // Nos interesa específicamente 'pathname', que es la parte de la URL
  // después del dominio (ej: '/', '/explore', '/comic/123').
  const { pathname } = useLocation();

  // Usamos useEffect para ejecutar un efecto secundario cada vez que 'pathname' cambia.
  useEffect(() => {
    // El efecto es simple: le decimos a la ventana que haga scroll
    // a la posición (0, 0) - arriba del todo, a la izquierda del todo.
    window.scrollTo(0, 0);

    // El array de dependencias [pathname] asegura que este efecto
    // solo se ejecute cuando la URL ha cambiado, y no en cada re-renderizado.
  }, [pathname]);

  // Este componente no necesita renderizar ningún elemento en el DOM,
  // por lo que devolvemos 'null'.
  return null;
};

export default ScrollToTop;