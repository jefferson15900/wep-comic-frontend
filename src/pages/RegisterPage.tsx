// src/pages/RegisterPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/authService';
import Spinner from '../components/common/Spinner';
import { Check, X } from 'lucide-react';

// --- Sub-componente para mostrar los requisitos de la contraseña ---
const PasswordRequirement = ({ isValid, text }: { isValid: boolean; text: string }) => (
  <li className={`flex items-center gap-2 text-xs transition-colors ${isValid ? 'text-green-400' : 'text-gray-500'}`}>
    {isValid ? <Check size={16} /> : <X size={16} className="text-red-500" />}
    <span>{text}</span>
  </li>
);

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estado para manejar los errores, tanto del formulario como del servidor
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Estado para la validación de la contraseña en tiempo real
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
  });

  // Efecto que se ejecuta cada vez que el campo de contraseña cambia
  useEffect(() => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    });
  }, [password]);
  
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const allPasswordReqsMet = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Limpia errores anteriores

    // Validaciones del lado del cliente antes de enviar
    if (!passwordsMatch) {
      setErrors({ form: 'Las contraseñas no coinciden.' });
      return;
    }
    if (!allPasswordReqsMet) {
      setErrors({ form: 'La contraseña no cumple todos los requisitos.' });
      return;
    }

    setLoading(true);

    try {
      await register({ email, username, password });
      // Si el registro es exitoso, redirigimos al login con un mensaje
      navigate('/login', { state: { successMessage: '¡Cuenta creada con éxito! Por favor, inicia sesión.' } });
    } catch (err: any) {
      if (err.response?.data?.errors) {
        // Maneja los errores específicos de campo que vienen de Zod
        const serverErrors = err.response.data.errors.reduce((acc: any, error: any) => {
          acc[error.field] = error.message;
          return acc;
        }, {});
        setErrors(serverErrors);
      } else {
        // Maneja errores generales (ej. "El email ya existe")
        setErrors({ form: err.response?.data?.message || 'Error al registrar la cuenta' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center mt-12 mb-12">
      <form onSubmit={handleSubmit} className="p-8 bg-[var(--surface-dark)] rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Crear Cuenta</h2>
        
        {errors.form && <p className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-md text-center text-sm">{errors.form}</p>}
        
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-bold mb-2 text-gray-400">Nombre de Usuario</label>
          <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
          {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-bold mb-2 text-gray-400">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-bold mb-2 text-gray-400">Contraseña</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          
          <ul className="mt-2 space-y-1">
            <PasswordRequirement isValid={passwordValidation.minLength} text="Al menos 8 caracteres" />
            <PasswordRequirement isValid={passwordValidation.hasLower} text="Al menos una letra minúscula" />
            <PasswordRequirement isValid={passwordValidation.hasUpper} text="Al menos una letra mayúscula" />
            <PasswordRequirement isValid={passwordValidation.hasNumber} text="Al menos un número" />
          </ul>
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-bold mb-2 text-gray-400">Confirmar Contraseña</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={`w-full p-2 rounded bg-gray-800 text-white border transition-colors ${passwordsMatch ? 'border-green-500' : (confirmPassword ? 'border-red-500' : 'border-gray-700')} focus:outline-none focus:border-[var(--primary-accent)]`} />
          {!passwordsMatch && confirmPassword && <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden.</p>}
        </div>

        <button type="submit" disabled={loading} className="w-full p-3 bg-[var(--primary-accent)] rounded text-white font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
          {loading ? <Spinner /> : 'Crear Cuenta'}
        </button>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-semibold text-[var(--primary-accent)] hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;