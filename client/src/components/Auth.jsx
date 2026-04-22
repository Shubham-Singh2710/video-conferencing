import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Video, Mail, Lock, User as UserIcon } from 'lucide-react';
import { SparklesCore } from './ui/Sparkles';

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
      <div className="auth-hero relative" style={{ backgroundColor: '#000', backgroundImage: 'none' }}>
        
        {/* Core component */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1.5}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
          {/* Radial Gradient to prevent sharp edges */}
          <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'black', maskImage: 'radial-gradient(350px 200px at top, transparent 20%, white)', WebkitMaskImage: 'radial-gradient(400px 300px at center, transparent 30%, black)' }}></div>
        </div>

        <div style={{ zIndex: 2, textAlign: 'center', position: 'relative' }}>
          <div className="btn-icon" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', width: '80px', height: '80px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={40} color="#fff" />
          </div>
          
          <h1 style={{ fontSize: '4.5rem', fontWeight: 800, margin: '0 0 15px 0', letterSpacing: '-0.02em', background: 'linear-gradient(to bottom, #ffffff, #a3a3a3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MeetSync
          </h1>
          
          <div style={{ position: 'relative', width: '300px', height: '2px', margin: '0 auto 20px' }}>
            <div style={{ position: 'absolute', left: '10%', top: 0, background: 'linear-gradient(to right, transparent, #4f46e5, transparent)', height: '2px', width: '80%', filter: 'blur(2px)' }} />
            <div style={{ position: 'absolute', left: '10%', top: 0, background: 'linear-gradient(to right, transparent, #4f46e5, transparent)', height: '1px', width: '80%' }} />
            <div style={{ position: 'absolute', left: '30%', top: 0, background: 'linear-gradient(to right, transparent, #0ea5e9, transparent)', height: '4px', width: '40%', filter: 'blur(3px)' }} />
            <div style={{ position: 'absolute', left: '30%', top: 0, background: 'linear-gradient(to right, transparent, #0ea5e9, transparent)', height: '1px', width: '40%' }} />
          </div>

          <p style={{ fontSize: '1.2rem', color: '#a3a3a3', maxWidth: '400px', margin: '0 auto' }}>
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
