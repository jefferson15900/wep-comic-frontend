// src/pages/LoginPage.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login({ email, password });
      authLogin({ ...data.user, token: data.token });
      navigate('/'); // Redirigir a la página de inicio después del login
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center mt-20">
      <form onSubmit={handleSubmit} className="p-8 bg-[var(--surface-dark)] rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Iniciar Sesión</h2>
        
        {error && <p className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-md text-center">{error}</p>}
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-bold mb-2 text-gray-400">Email</label>
          <input 
            id="email"
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-bold mb-2 text-gray-400">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full p-3 bg-[var(--primary-accent)] rounded text-white font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        {/* --- ENLACE A LA PÁGINA DE REGISTRO --- */}
        <p className="text-center text-sm text-gray-400 mt-6">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-semibold text-[var(--primary-accent)] hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;