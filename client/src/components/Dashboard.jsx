import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneIncoming, X, Video, ArrowRight, LayoutDashboard, Users, Clock, Settings, LogOut } from 'lucide-react';

const Dashboard = ({ user, socket, onLogout }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !socket) return;

    socket.emit('register-user', { userId: user.id, username: user.username });

    socket.on('online-users', (users) => {
      setOnlineUsers(users.filter(u => u.userId !== user.id));
    });

    socket.on('incoming-call', ({ callerId, callerName, roomId }) => {
      setIncomingCall({ callerId, callerName, roomId });
    });

    socket.on('call-accepted', ({ roomId }) => {
      // Small delay for UI smoothness
      setTimeout(() => navigate(`/room/${roomId}`), 300);
    });

    socket.on('call-rejected', () => {
      alert('Call was rejected');
    });

    return () => {
      socket.off('online-users');
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('call-rejected');
    };
  }, [user, socket, navigate]);

  const initiateCall = (targetUserId) => {
    const roomId = Math.random().toString(36).substring(2, 9);
    socket.emit('call-user', { 
      targetUserId, 
      callerId: user.id, 
      callerName: user.username,
      roomId
    });
    alert('Calling user, waiting for their response...');
  };

  const acceptCall = () => {
    if (incomingCall) {
      socket.emit('accept-call', { 
        targetSocketId: incomingCall.callerId, 
        roomId: incomingCall.roomId 
      });
      navigate(`/room/${incomingCall.roomId}`);
      setIncomingCall(null);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
        socket.emit('reject-call', { targetSocketId: incomingCall.callerId });
        setIncomingCall(null);
    }
  };

  const startInstantMeeting = () => {
    const roomId = Math.random().toString(36).substring(2, 9);
    navigate(`/room/${roomId}`);
  };

  const joinMeeting = (e) => {
    e.preventDefault();
    if (joinRoomId.trim()) {
      navigate(`/room/${joinRoomId}`);
    }
  };

  return (
    <div className="dashboard-layout fade-in">
      {/* Sidebar Area */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <Video size={28} color="var(--primary)" />
          MeetSync
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div className={`nav-item ${activeTab === 'Overview' ? 'active' : ''}`} onClick={() => setActiveTab('Overview')}>
            <LayoutDashboard size={20} /> Overview
          </div>
          <div className="nav-item">
            <Users size={20} /> Contacts
          </div>
          <div className="nav-item">
            <Clock size={20} /> Recent Calls
          </div>
          <div className="nav-item">
            <Settings size={20} /> Settings
          </div>
        </div>

        <div className="nav-item" onClick={onLogout} style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
          <LogOut size={20} /> Logout
        </div>
      </div>

      {/* Main Content */}
      <div className="dash-content">
        <div className="hero-banner fade-in">
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
              Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.username}</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
              Host a new meeting or connect with your team members instantly.
            </p>
          </div>
          
          <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
            {user?.username ? user.username.substring(0, 1).toUpperCase() : 'U'}
            <div className="status-dot"></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '50px' }}>
          <div className="action-card" onClick={startInstantMeeting}>
            <div className="action-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
              <Video size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem' }}>New Meeting</h3>
            <p style={{ color: 'var(--text-muted)' }}>Start an instant video call and share the link.</p>
          </div>

          <div className="action-card" style={{ cursor: 'default' }}>
            <div className="action-icon-wrap" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem' }}>Join Meeting</h3>
            <form onSubmit={joinMeeting} style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '5px' }}>
              <input 
                type="text" 
                placeholder="Enter Room Code" 
                value={joinRoomId} 
                onChange={(e) => setJoinRoomId(e.target.value)} 
                style={{ flex: 1, background: 'rgba(0,0,0,0.3)' }}
              />
              <button type="submit" className="btn glass-panel" disabled={!joinRoomId.trim()}>
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="fade-in">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
            Online Contacts ({onlineUsers.length})
          </h2>
          
          {onlineUsers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No other users are online at the moment.</p>
            </div>
          ) : (
            <div className="users-list">
              {onlineUsers.map((u, idx) => (
                <div key={idx} className="user-card">
                  <div className="user-info">
                    <div className="avatar">
                      {u.username.substring(0,1).toUpperCase()}
                      <div className="status-dot pulse"></div>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{u.username}</h4>
                      <span style={{ fontSize: '0.85rem', color: '#22c55e' }}>Active Now</span>
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => initiateCall(u.userId)} style={{ padding: '8px 15px' }}>
                    <Phone size={16} /> Call
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Styled Incoming Call Modal Dropdown */}
      {incomingCall && (
        <div className="call-modal-overlay fade-in">
          <div className="call-modal">
            <div className="caller-avatar-ring">
              {incomingCall.callerName.substring(0,1).toUpperCase()}
            </div>
            
            <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Incoming Call...</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '40px' }}>
              <strong>{incomingCall.callerName}</strong> wants to video chat.
            </p>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button 
                onClick={rejectCall} 
                style={{ 
                  background: 'var(--danger)', border: 'none', borderRadius: '50%', 
                  width: '60px', height: '60px', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', cursor: 'pointer', color: 'white',
                  boxShadow: '0 4px 15px rgba(239,68,68,0.4)' 
                }}
              >
                <X size={28} />
              </button>
              
              <button 
                onClick={acceptCall} 
                style={{ 
                  background: '#22c55e', border: 'none', borderRadius: '50%', 
                  width: '60px', height: '60px', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', cursor: 'pointer', color: 'white',
                  boxShadow: '0 4px 15px rgba(34,197,94,0.4)' 
                }}
              >
                <PhoneIncoming size={28} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
