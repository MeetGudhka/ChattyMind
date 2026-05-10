import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

import ChatLayout from './components/ChatLayout';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
        auth: { token: localStorage.getItem('token') }
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
         newSocket.emit('join_user', user._id || user.id);
      });

      return () => newSocket.close();
    }
  }, [user]);

  return (
    <Router>
      <div className="App tracking-wide">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login setAuth={setUser} />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register setAuth={setUser} />} />
          <Route path="/" element={!user ? <Navigate to="/login" /> : socket ? <ChatLayout socket={socket} user={user} setAuth={setUser} /> : <div className="flex h-screen items-center justify-center text-textSecondary tracking-wider animate-pulse">Connecting to ChattyMind...</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
