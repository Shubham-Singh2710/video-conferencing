import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Video, Mail, Lock, User as UserIcon } from 'lucide-react';

const Auth = ({ setAuthUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { username, email, password };
      
      const res = await axios.post(`http://localhost:3001${endpoint}`, payload);
      
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setAuthUser(res.data.user);
        navigate('/dashboard');
      } else {
        setIsLogin(true);
        setError('Registration successful. Please log in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="split-layout fade-in">
      {/* Left Branding Side */}
      <div className="auth-hero">
        <div style={{ zIndex: 1, textAlign: 'center' }}>
          <div className="btn-icon" style={{ background: 'var(--bg-dark)', width: '80px', height: '80px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={40} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '15px' }}>MeetSync</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '400px', margin: '0 auto' }}>
            Experience next-generation high definition video meetings designed for modern teams.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-form-container">
        <div className="auth-box glass-panel">
          <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
            {isLogin ? 'Sign in to access your dashboard.' : 'Start your journey with us.'}
          </p>
          
          {error && <div style={{ color: 'var(--danger)', marginBottom: '20px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-group">
                <label className="input-label">Username</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Choose a username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required
                    style={{ paddingLeft: '45px' }}
                  />
                </div>
              </div>
            )}
            
            <div className="input-group">
              <label className="input-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                  style={{ paddingLeft: '45px' }}
                />
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  placeholder="Enter password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                  style={{ paddingLeft: '45px' }}
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '15px' }}>
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="divider">or</div>
          
          <button 
            className="btn glass-panel" 
            style={{ width: '100%', background: 'transparent' }}
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
          >
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
