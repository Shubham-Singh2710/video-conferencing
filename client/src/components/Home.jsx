import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { SparklesCore } from './ui/Sparkles';

const Home = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000', color: 'white', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Sparkles */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1.5}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'black', maskImage: 'linear-gradient(to bottom, transparent, black 80%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 80%)' }}></div>
      </div>

      {/* Navbar */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 'bold' }}>
          <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '12px', display: 'flex' }}>
            <Video size={24} color="white" />
          </div>
          MeetYaar
        </div>
        <div>
          {user ? (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Log In / Sign Up
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
        
        <div style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '20px', color: '#818cf8', marginBottom: '30px', fontWeight: 600, fontSize: '0.9rem' }}>
          🚀 Version 2.0 Now Live
        </div>

        <h1 style={{ fontSize: '5rem', fontWeight: 900, marginBottom: '20px', maxWidth: '900px', lineHeight: 1.1, background: 'linear-gradient(to bottom right, #ffffff, #a3a3a3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Connect securely from anywhere with MeetYaar.
        </h1>
        
        <p style={{ fontSize: '1.3rem', color: '#a3a3a3', maxWidth: '600px', marginBottom: '50px', lineHeight: 1.6 }}>
          Experience next-generation high definition video meetings designed for modern teams, friends, and families. Fast, secure, and entirely browser-based.
        </p>

        <button 
          onClick={() => navigate(user ? '/dashboard' : '/login')}
          style={{ 
            background: 'white', color: 'black', border: 'none', padding: '16px 40px', 
            fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '30px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '12px',
            boxShadow: '0 10px 30px rgba(255,255,255,0.2)', transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {user ? 'Go to Dashboard' : 'Get Started For Free'} <ArrowRight size={20} />
        </button>

        {/* Feature Highlights */}
        <div style={{ display: 'flex', gap: '40px', marginTop: '100px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: <Shield size={30} />, title: 'End-to-End Secure', desc: 'Enterprise grade WebRTC mesh connection.' },
            { icon: <Zap size={30} />, title: 'Lightning Fast', desc: 'No downloads required. Join directly from browser.' },
            { icon: <Globe size={30} />, title: 'Global Infrastructure', desc: 'Low latency signalling built on Socket.IO.' }
          ].map((feat, i) => (
             <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', borderRadius: '20px', width: '280px', textAlign: 'left', backdropFilter: 'blur(10px)' }}>
               <div style={{ color: 'var(--primary)', marginBottom: '15px' }}>{feat.icon}</div>
               <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{feat.title}</h3>
               <p style={{ color: '#a3a3a3', fontSize: '0.95rem', lineHeight: 1.5 }}>{feat.desc}</p>
             </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.1)', padding: '40px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', color: '#737373', fontSize: '0.9rem', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>
            <Video size={20} /> MeetYaar
          </div>
          <p>© {new Date().getFullYear()} MeetYaar Inc. All rights reserved.</p>
        </div>
        <div style={{ display: 'flex', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <strong style={{ color: 'white' }}>Product</strong>
            <span style={{ cursor: 'pointer' }}>Features</span>
            <span style={{ cursor: 'pointer' }}>Security</span>
            <span style={{ cursor: 'pointer' }}>Pricing</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <strong style={{ color: 'white' }}>Company</strong>
            <span style={{ cursor: 'pointer' }}>About Us</span>
            <span style={{ cursor: 'pointer' }}>Careers</span>
            <span style={{ cursor: 'pointer' }}>Contact</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <strong style={{ color: 'white' }}>Legal</strong>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span style={{ cursor: 'pointer' }}>Cookie Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
