// AvatarSelection.jsx - FIXED: Poppins font, no scroll, opacity, no white bar
// Location: src/algebra/components/AvatarSelection.jsx

import React, { useState } from 'react';
import '../styles/algebra.css';

const AvatarSelection = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const avatars = Array.from({ length: 20 }, (_, i) => i + 1);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter your name!');
      return;
    }
    if (!selectedAvatar) {
      alert('Please choose an avatar!');
      return;
    }
    
    localStorage.setItem('algebra_player_name', name);
    localStorage.setItem('algebra_player_avatar', selectedAvatar);
    
    onComplete({ name, avatar: selectedAvatar });
  };

  return (
    <div className="base-camp-screen" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '90%',
        padding: '2rem 1rem',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          color: '#1F2937',
          marginBottom: '0.5rem',
          textShadow: '2px 2px 4px rgba(255,255,255,0.8)',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Welcome, Explorer!
        </h1>
        
        <p style={{ 
          fontSize: '1rem', 
          color: '#4B5563',
          marginBottom: '1.5rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Before you begin your expedition, tell us about yourself.
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '1rem', 
            fontWeight: 600, 
            color: '#1F2937',
            marginBottom: '0.5rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Your Name:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your first name"
            maxLength={20}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              border: '2px solid #D1D5DB',
              borderRadius: '0.5rem',
              width: '300px',
              maxWidth: '100%',
              textAlign: 'center',
              fontWeight: 600,
              fontFamily: 'Poppins, sans-serif'
            }}
          />
        </div>

        <h2 style={{ 
          fontSize: '1.125rem', 
          fontWeight: 600, 
          color: '#1F2937',
          marginBottom: '1rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Choose Your Avatar:
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          maxWidth: '700px',
          margin: '0 auto 1.5rem'
        }}>
          {avatars.map((num) => (
            <div
              key={num}
              onClick={() => setSelectedAvatar(num)}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: selectedAvatar === num ? '3px solid #10B981' : '2px solid #E5E7EB',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: selectedAvatar === num ? 'scale(1.1)' : 'scale(1)',
                boxShadow: selectedAvatar === num ? '0 4px 12px rgba(16, 185, 129, 0.4)' : '0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img 
                src={`/algebra/avatar-${num}.png`} 
                alt={`Avatar ${num}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="base-camp-tile-button"
          style={{ 
            padding: '1rem 3rem',
            fontSize: '1.25rem',
            cursor: name && selectedAvatar ? 'pointer' : 'not-allowed',
            opacity: name && selectedAvatar ? 1 : 0.5,
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          Begin Your Journey →
        </button>
      </div>
    </div>
  );
};

export default AvatarSelection;
