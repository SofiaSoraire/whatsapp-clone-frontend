import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function JoinGroup() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!code) return;
    const join = async () => {
      try {
        await api.post('/groups/join', { code });
        setMessage('✅ Te has unido al grupo');
        setTimeout(() => navigate('/'), 2000);
      } catch (err) {
        setMessage('❌ Código inválido o expirado');
      }
    };
    join();
  }, [code]);

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold">Unirse al grupo</h2>
      <p>{message || 'Procesando invitación...'}</p>
    </div>
  );
}