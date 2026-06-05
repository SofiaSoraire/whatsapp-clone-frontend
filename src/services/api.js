import axios from 'axios';

// Fijamos la URL del backend en Render (incluyendo /api al final)
const API_URL = 'https://whatsapp-clone-backend-qcw9.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export default api;