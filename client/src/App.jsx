import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './App.css';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Room from './components/Room';
import Home from './components/Home';

let globalSocket = null;

function App() {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    globalSocket = io('http://localhost:3001');
    setSocket(globalSocket);

    return () => {
      if (globalSocket) {
        globalSocket.disconnect();
      }
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="app-container">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Auth setAuthUser={setUser} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} socket={socket} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/room/:roomId" 
            element={user ? <Room socket={socket} user={user} onLeave={() => window.location.href='/dashboard'} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Home user={user} />} 
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
