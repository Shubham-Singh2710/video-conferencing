import React, { useState } from 'react';
import { Video, ArrowRight } from 'lucide-react';

const Home = ({ onJoinRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');

  const generateRandomRoom = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const handleCreateRoom = () => {
    const newRoomId = generateRandomRoom();
    onJoinRoom(newRoomId, name);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      onJoinRoom(roomId, name);
    }
  };

  return (
    <div className="home-container fade-in">
      <div className="home-card glass-panel">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div className="btn-icon" style={{ background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)' }}>
            <Video size={32} color="white" />
          </div>
        </div>
        <h1 className="home-title">Connect Live</h1>
        <p className="home-subtitle">Premium video meetings. Free for everyone.</p>

        <div className="input-group">
          <label className="input-label">Your Name</label>
          <input 
            type="text" 
            placeholder="Enter your name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginBottom: '20px' }} 
          onClick={handleCreateRoom}
        >
           Start New Meeting
        </button>

        <div className="divider">or join existing</div>

        <form onSubmit={handleJoinSubmit}>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Enter Room Code" 
              value={roomId} 
              onChange={(e) => setRoomId(e.target.value)} 
            />
          </div>
          <button 
            type="submit" 
            className="btn glass-panel" 
            style={{ width: '100%', background: 'rgba(255,255,255,0.1)' }}
            disabled={!roomId.trim()}
          >
            Join Meeting <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
