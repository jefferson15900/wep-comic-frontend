// src/components/profile/SettingsTab.tsx

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as userService from '../../api/userService';
import Spinner from '../common/Spinner';
import { Save, KeyRound, User, Lock } from 'lucide-react';

// --- Sub-componente para editar el perfil público ---
const EditProfileForm = ({ profile, onProfileUpdate }: { profile: any, onProfileUpdate: (updatedUser: any) => void }) => {
  const { user } = useAuth();
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl || null);
  const [isPublic, setIsPublic] = useState(profile.favoritesArePublic);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('favoritesArePublic', String(isPublic));
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

        // --- AÑADIR ESTE LOG PARA DEPURACIÓN ---
    console.log('--- Sending FormData from Frontend ---');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    // ----------------------------------------


    try {
      const response = await userService.updateUserProfile(formData, user.token);
      setMessage({ type: 'success', text: response.message });
      onProfileUpdate(response.user); // Notificar al padre sobre el cambio
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al actualizar el perfil.' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 bg-[var(--surface-dark)] rounded-lg">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><User size={22}/> Perfil Público</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-400">Avatar</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-700 rounded-full overflow-hidden">
              {avatarPreview ? <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" /> : <User size={40} className="text-gray-500 m-auto mt-5" />}
            </div>
            <input type="file" onChange={handleAvatarChange} accept="image/*" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--secondary-accent)] file:text-white hover:file:bg-opacity-90"/>
          </div>
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-bold mb-2 text-gray-400">Biografía</label>
          <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-[var(--primary-accent)] focus:ring-[var(--primary-accent)]"/>
          <label htmlFor="isPublic" className="text-sm text-gray-300">Hacer mi lista de favoritos pública</label>
        </div>
        
        <button type="submit" disabled={loading} className="w-full p-2 bg-green-600 rounded text-white font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
          {loading ? <Spinner /> : <><Save size={18}/> Guardar Cambios de Perfil</>}
        </button>
        {message && <div className={`mt-2 p-2 rounded-md text-sm ${message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>{message.text}</div>}
      </form>
    </div>
  );
};


// --- Sub-componente para cambiar la contraseña ---
const ChangePasswordForm = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }
    if (!user?.token) return;
    setLoading(true);

    try {
      const response = await userService.changePassword({ currentPassword, newPassword }, user.token);
      setMessage({ type: 'success', text: response.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Ocurrió un error.' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 bg-[var(--surface-dark)] rounded-lg">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><KeyRound size={22}/> Seguridad de la Cuenta</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-400">Contraseña Actual</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-400">Nueva Contraseña</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoComplete="new-password" className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-400">Confirmar Nueva Contraseña</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[var(--primary-accent)]" />
        </div>
        <button type="submit" disabled={loading} className="w-full p-2 bg-[var(--primary-accent)] rounded text-white font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
          {loading ? <Spinner /> : <><Lock size={18}/> Cambiar Contraseña</>}
        </button>
        {message && <div className={`mt-2 p-2 rounded-md text-sm ${message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>{message.text}</div>}
      </form>
    </div>
  );
};


// --- Componente Principal de la Pestaña ---
const SettingsTab = ({ profile, onProfileUpdate }: { profile: any, onProfileUpdate: (updatedUser: any) => void }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <EditProfileForm profile={profile} onProfileUpdate={onProfileUpdate} />
      <ChangePasswordForm />
    </div>
  );
};

export default SettingsTab;