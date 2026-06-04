// frontend/src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.resetToken) {
        // En desarrollo, autocompletamos el token
        setToken(res.data.resetToken);
        setStep(2);
      } else {
        // En producción, se enviaría por email, pedimos al usuario que lo ingrese
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setMessage('Contraseña actualizada. Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Recuperar contraseña</h2>
        {message && <div className="bg-green-100 p-2 mb-2">{message}</div>}
        {error && <div className="bg-red-100 p-2 mb-2">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestToken}>
            <input
              type="email"
              placeholder="Tu email"
              className="w-full p-2 border mb-4 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Enviar código</button>
            <Link to="/login" className="block text-center mt-4 text-blue-500">Volver al login</Link>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <input
              type="text"
              placeholder="Token de restablecimiento"
              className="w-full p-2 border mb-2 rounded"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              className="w-full p-2 border mb-4 rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">Cambiar contraseña</button>
          </form>
        )}
      </div>
    </div>
  );
}