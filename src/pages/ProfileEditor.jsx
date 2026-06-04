import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ProfileEditor() {
  const { user, setUser } = useContext(AuthContext);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage('');
  setError('');
  try {
    const res = await api.put('/users/me', { nickname, bio });
    console.log('Respuesta del servidor:', res.data); // 👈 Verifica en consola
    if (setUser) {
      setUser(res.data); // actualiza el contexto
    } else {
      console.error('setUser no está disponible en el contexto');
    }
    setMessage('Perfil actualizado correctamente');
    setTimeout(() => navigate('/'), 1500);
  } catch (err) {
    console.error('Error detallado:', err);
    console.error('Respuesta del error:', err.response);
    setError(err.response?.data?.message || 'Error al actualizar');
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Editar Perfil</h2>
        {message && <div className="bg-green-100 p-2 mb-2">{message}</div>}
        {error && <div className="bg-red-100 p-2 mb-2">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full border p-2 rounded"
              rows="3"
              placeholder="Escribe algo sobre ti..."
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Guardar Cambios
          </button>
        </form>
        <button
          onClick={() => navigate('/')}
          className="w-full mt-2 text-gray-600 underline"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}