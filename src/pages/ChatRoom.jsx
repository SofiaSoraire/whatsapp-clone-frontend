// frontend/src/pages/ChatRoom.jsx (con asistente IA)
import { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

export default function ChatRoom() {
  const { chatId } = useParams();
  const { user } = useContext(AuthContext);
  const socket = useSocket();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatInfo, setChatInfo] = useState(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const messagesEndRef = useRef(null);

  // Cargar mensajes y datos del chat
  useEffect(() => {
    fetchMessages();
    fetchChatInfo();
  }, [chatId]);

  // Socket: unirse a la sala y escuchar nuevos mensajes
  useEffect(() => {
    if (!socket) return;
    socket.emit('join-chat', chatId);
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });
    return () => {
      socket.off('new-message');
    };
  }, [socket, chatId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chats/${chatId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChatInfo = async () => {
    try {
      const res = await api.get(`/chats/${chatId}`);
      setChatInfo(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    socket.emit('send-message', { chatId, content: input });
    setInput('');
  };

  const askAI = async () => {
    if (!aiQuestion.trim()) return;
    setAiAnswer('Consultando...');
    try {
      const res = await api.post('/ai/ask', { chatId, question: aiQuestion });
      setAiAnswer(res.data.answer);
      // Opcional: recargar mensajes para mostrar el historial del bot
      fetchMessages();
    } catch (err) {
      console.error(err);
      setAiAnswer('Error al consultar al asistente. Intenta más tarde.');
    }
  };

  const goToGroupSettings = () => {
    navigate(`/group/${chatId}/settings`);
  };

  let chatTitle = 'Chat';
  if (chatInfo) {
    if (chatInfo.type === 'direct') {
      const other = chatInfo.participants?.find(p => p._id !== user?._id);
      chatTitle = other?.nickname || 'Usuario';
    } else {
      chatTitle = chatInfo.groupName || 'Grupo';
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <button 
        onClick={() => navigate('/')} 
        className="md:hidden bg-gray-200 px-2 py-1 rounded text-sm"
      >
        ← Volver
      </button>
      <div className="bg-white border-b px-4 py-2 flex justify-between items-center">
        <h1 className="text-xl font-bold">{chatTitle}</h1>
        {chatInfo?.type === 'group' && (
          <button onClick={() => navigate(`/group/${chatId}/settings`)} className="bg-gray-200 px-3 py-1 rounded">
            Configuración
          </button>
        )}
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 flex ${msg.senderId?._id === user?._id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs p-2 rounded ${msg.senderId?._id === user?._id ? 'bg-green-100' : 'bg-white shadow'}`}>
              <p className="text-xs text-gray-500 mb-1">{msg.senderId?.nickname || 'Sistema'}</p>
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-gray-400 text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulario de mensaje */}
      <form onSubmit={sendMessage} className="bg-white border-t p-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Escribe un mensaje..."
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Enviar</button>
      </form>

      {/* Asistente IA */}
      <div className="bg-white border-t p-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={aiQuestion}
            onChange={e => setAiQuestion(e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder="Preguntar al asistente (ej: ¿Qué se habló la semana pasada?)"
          />
          <button onClick={askAI} className="bg-purple-500 text-white px-4 py-2 rounded">IA</button>
        </div>
        {aiAnswer && (
          <div className="mt-2 p-2 bg-gray-100 rounded">
            <p className="text-sm font-bold">Asistente:</p>
            <p>{aiAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
}