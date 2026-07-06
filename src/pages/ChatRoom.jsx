import { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function ChatRoom() {
  const { chatId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatInfo, setChatInfo] = useState(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // ======================
  // FUNCIONES PARA OBTENER DATOS
  // ======================
  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chats/${chatId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error al obtener mensajes:', err);
    }
  };

  const fetchChatInfo = async () => {
    try {
      const res = await api.get(`/chats/${chatId}`);
      setChatInfo(res.data);
    } catch (err) {
      console.error('Error al obtener info del chat:', err);
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // EFECTOS
  // ======================
  // Carga inicial y polling cada 3 segundos
  useEffect(() => {
    fetchMessages();
    fetchChatInfo();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ======================
  // ENVIAR MENSAJE (HTTP)
  // ======================
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await api.post('/messages', { chatId, content: input });
      setInput('');
      await fetchMessages(); // recarga inmediata
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      alert('No se pudo enviar el mensaje');
    }
  };

  // ======================
  // ASISTENTE IA
  // ======================
  const askAI = async () => {
    if (!aiQuestion.trim()) return;
    setAiAnswer('Consultando...');
    try {
      const res = await api.post('/ai/ask', { chatId, question: aiQuestion });
      setAiAnswer(res.data.answer);
      // Recarga mensajes para mostrar el historial del bot (si se guarda como mensaje)
      await fetchMessages();
    } catch (err) {
      console.error('Error al consultar IA:', err);
      setAiAnswer('Error al consultar al asistente. Intenta más tarde.');
    }
  };

  // ======================
  // IR A CONFIGURACIÓN DE GRUPO
  // ======================
  const goToGroupSettings = () => {
    navigate(`/group/${chatId}/settings`);
  };

  // ======================
  // TÍTULO DEL CHAT
  // ======================
  let chatTitle = 'Chat';
  if (chatInfo) {
    if (chatInfo.type === 'direct') {
      const other = chatInfo.participants?.find(p => p._id !== user?._id);
      chatTitle = other?.nickname || 'Usuario';
    } else {
      chatTitle = chatInfo.groupName || 'Grupo';
    }
  }

  // ======================
  // RENDER
  // ======================
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando chat...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* HEADER */}
      <div className="bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold">{chatTitle}</h1>
          <p className="text-sm text-gray-500">
            {chatInfo?.type === 'group' && `${chatInfo.participants?.length} miembros`}
          </p>
        </div>
        {chatInfo?.type === 'group' && (
          <button
            onClick={goToGroupSettings}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm transition"
          >
            Configuración
          </button>
        )}
      </div>

      {/* LISTA DE MENSAJES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">No hay mensajes aún. ¡Envía el primero!</p>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.senderId?._id === user?._id;
            return (
              <div
                key={idx}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                    isOwn
                      ? 'bg-green-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-xs font-semibold mb-0.5">
                    {isOwn ? 'Tú' : msg.senderId?.nickname || 'Usuario'}
                  </p>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 text-right mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* FORMULARIO DE MENSAJE */}
      <form onSubmit={sendMessage} className="bg-white border-t p-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Escribe un mensaje..."
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full transition disabled:opacity-50"
          disabled={!input.trim()}
        >
          Enviar
        </button>
      </form>

      {/* ASISTENTE IA */}
      <div className="bg-white border-t p-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Preguntar al asistente (ej: ¿Qué se habló la semana pasada?)"
          />
          <button
            onClick={askAI}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition"
          >
            IA
          </button>
        </div>
        {aiAnswer && (
          <div className="mt-2 p-3 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-purple-700">🤖 Asistente:</p>
            <p className="text-sm whitespace-pre-wrap">{aiAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
}