import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function GroupSettings() {
  const { groupId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupInfo();
  }, [groupId]);

  const fetchGroupInfo = async () => {
    try {
      const res = await api.get(`/chats/${groupId}`);
      setGroup(res.data);
      setMembers(res.data.participants || []);
      setInviteCode(res.data.inviteCode);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la información del grupo');
    } finally {
      setLoading(false);
    }
  };

  const copyInvite = () => {
    const link = `${window.location.origin}/join?code=${group.inviteCode}`;
    navigator.clipboard.writeText(link);
    alert('Enlace copiado al portapapeles');
};

  const promoteToAdmin = async (userId) => {
    try {
      await api.post(`/groups/${groupId}/add-admin`, { groupId, userId });
      setMessage('Usuario promovido a administrador');
      fetchGroupInfo(); // refrescar
    } catch (err) {
      setError(err.response?.data?.message || 'Error al promover');
    }
  };

  const demoteFromAdmin = async (userId) => {
    try {
      await api.post(`/groups/${groupId}/remove-admin`, { groupId, userId });
      setMessage('Administrador revocado');
      fetchGroupInfo();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al revocar');
    }
  };

  const leaveGroup = async () => {
    if (window.confirm('¿Estás seguro de que quieres abandonar el grupo?')) {
      try {
        await api.post(`/groups/${groupId}/leave`);
        setMessage('Has abandonado el grupo');
        setTimeout(() => navigate('/'), 1500);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al abandonar');
      }
    }
  };

  if (loading) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!group) return <div className="p-4">Grupo no encontrado</div>;

  const isAdmin = group.adminIds?.includes(user?._id);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{group.groupName}</h1>
      
      {/* Código de invitación */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">Código de invitación</h2>
        <div className="flex gap-2">
          <code className="bg-white p-2 rounded flex-1">{inviteCode}</code>
          <button onClick={copyInviteLink} className="bg-blue-500 text-white px-3 py-1 rounded">Copiar</button>
        </div>
        <p className="text-sm text-gray-500 mt-2">Comparte este código para que otros usuarios se unan.</p>
      </div>

      {/* Lista de miembros */}
      <div className="bg-white border rounded mb-6">
        <h2 className="font-semibold p-3 border-b">Miembros ({members.length})</h2>
        {members.map(member => (
          <div key={member._id} className="flex justify-between items-center p-3 border-b">
            <div>
              <p className="font-medium">{member.nickname}</p>
              <p className="text-sm text-gray-500">{member.email}</p>
              {group.adminIds?.includes(member._id) && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Admin</span>
              )}
            </div>
            {isAdmin && member._id !== user?._id && (
              <div>
                {group.adminIds?.includes(member._id) ? (
                  <button
                    onClick={() => demoteFromAdmin(member._id)}
                    className="text-yellow-600 hover:text-yellow-800 text-sm"
                  >
                    Revocar admin
                  </button>
                ) : (
                  <button
                    onClick={() => promoteToAdmin(member._id)}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Hacer admin
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botón abandonar grupo */}
      <button
        onClick={leaveGroup}
        className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
      >
        Abandonar grupo
      </button>

      {message && <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      {error && <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
    </div>
  );
}