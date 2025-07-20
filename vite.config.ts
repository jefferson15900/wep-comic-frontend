// En: Proyecto-WepComic/wep-comic/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Configuración del servidor de desarrollo
  server: {
    proxy: {
      // 1. Proxy para la API externa de MangaDex
      '/api': {
        target: 'https://api.mangadex.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      
      // 2. Proxy para TU PROPIO BACKEND de autenticación y favoritos
      // Se ejecuta en el puerto 4000, según lo que configuramos.
      '/backend': {
        target: 'http://localhost:4000', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, ''),
      },     
       // ¡NUEVO! Proxy para tu API de Consumet local
      '/consumet': {
        target: 'http://localhost:3000', // Apunta a tu servidor local
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/consumet/, ''), // Quita /consumet
      },

      // NOTA: El proxy para '/consumet' ya no es necesario si no lo estás usando,
      // a menos que quieras mantener ambas funcionalidades. 
      // Para simplificar, lo he quitado.
    },
  },

})



/*
// En: Proyecto-WepComic/wep-comic/vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'; // No olvides importar 'path' si usas alias

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Configuración del servidor de desarrollo
  server: {
    proxy: {
      // 1. Proxy para la API externa de MangaDex
      '/api': {
        target: 'https://api.mangadex.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      
      // 2. Proxy para TU PROPIO BACKEND de autenticación y favoritos
      // Se ejecuta en el puerto 4000, según lo que configuramos.
      '/backend': {
        target: 'http://localhost:4000', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, ''),
      },

      // NOTA: El proxy para '/consumet' ya no es necesario si no lo estás usando,
      // a menos que quieras mantener ambas funcionalidades. 
      // Para simplificar, lo he quitado.
    },
  },

  // (Opcional) Alias de ruta para que `import ... from '@/components/...'` funcione.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
  */