import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await api.get('/chats');
      setChats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    try {
      const res = await api.get(`/users/search?q=${query}`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createDirectChat = async (otherUserId) => {
    try {
      const res = await api.post('/chats/direct', { otherUserId });
      navigate(`/chat/${res.data._id}`);
      setShowNewChat(false);
      setSearch('');
      setUsers([]);
    } catch (err) {
      alert('Error al crear chat');
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      alert('Nombre del grupo requerido');
      return;
    }
    try {
      const res = await api.post('/groups', {
        groupName,
        participantIds: selectedUsers.map(u => u._id)
      });
      navigate(`/chat/${res.data._id}`);
      setShowNewChat(false);
      setGroupName('');
      setSelectedUsers([]);
      setSearch('');
      setUsers([]);
    } catch (err) {
      alert('Error al crear grupo');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar izquierdo */}
      <div className="w-80 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <p className="font-bold">{user?.nickname}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-gray-600 p-1 rounded mt-2 text-sm hover:bg-gray-500 transition"
          >
            Editar Perfil
          </button>
        </div>
        <div className="p-2">
          <button
            onClick={() => setShowNewChat(true)}
            className="w-full bg-green-600 p-2 rounded mb-2 hover:bg-green-700 transition"
          >
            + Nuevo Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <p className="text-center text-gray-400 mt-4">No hay chats aún. Crea uno nuevo.</p>
          ) : (
            chats.map(chat => (
              <div
                key={chat._id}
                onClick={() => navigate(`/chat/${chat._id}`)}
                className="p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
              >
                {chat.type === 'direct' ? (
                  <p>{chat.participants.find(p => p._id !== user?._id)?.nickname || 'Chat'}</p>
                ) : (
                  <p className="font-semibold">{chat.groupName}</p>
                )}
              </div>
            ))
          )}
        </div>
        <div className="p-2">
          <button
            onClick={logout}
            className="w-full bg-red-600 p-2 rounded hover:bg-red-700 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Panel derecho (placeholder) */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Selecciona un chat para comenzar</p>
      </div>

      {/* Modal para nuevo chat directo o grupo */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nuevo Chat</h2>

            {/* Chat directo */}
            <div className="mb-6">
              <label className="block font-semibold mb-2">Chat Directo</label>
              <input
                type="text"
                placeholder="Buscar por nickname..."
                className="w-full border p-2 rounded mb-2"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  searchUsers(e.target.value);
                }}
              />
              {users.length > 0 && (
                <ul className="border max-h-40 overflow-auto">
                  {users.map(u => (
                    <li
                      key={u._id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => createDirectChat(u._id)}
                    >
                      {u.nickname} ({u.email})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <hr className="my-4" />

            {/* Crear grupo */}
            <div>
              <label className="block font-semibold mb-2">Crear Grupo</label>
              <input
                type="text"
                placeholder="Nombre del grupo"
                className="w-full border p-2 rounded mb-2"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Buscar participantes..."
                className="w-full border p-2 rounded mb-2"
                onChange={(e) => searchUsers(e.target.value)}
              />
              <div className="border max-h-40 overflow-auto mb-4">
                {users.map(u => (
                  <div key={u._id} className="flex items-center gap-2 p-2 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedUsers.some(s => s._id === u._id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedUsers([...selectedUsers, u]);
                        else setSelectedUsers(selectedUsers.filter(s => s._id !== u._id));
                      }}
                    />
                    <span>{u.nickname} ({u.email})</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowNewChat(false);
                    setSearch('');
                    setUsers([]);
                    setGroupName('');
                    setSelectedUsers([]);
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={createGroup}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Crear Grupo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}