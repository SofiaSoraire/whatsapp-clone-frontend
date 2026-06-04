import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import ChatRoom from './pages/ChatRoom';
import GroupSettings from './pages/GroupSettings';
import PrivateRoute from './components/PrivateRoute';
import ProfileEditor from './pages/ProfileEditor';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/chat/:chatId" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
            <Route path="/group/:groupId/settings" element={<PrivateRoute><GroupSettings /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfileEditor /></PrivateRoute>} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;