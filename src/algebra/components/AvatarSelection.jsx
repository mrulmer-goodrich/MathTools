// AvatarSelection.jsx - Avatar and Name Selection
import React, { useState } from 'react';
import '../styles/algebra.css';

const AvatarSelection = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  // Avatar grid - 20 avatars from your image
  const avatars = [
    'avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5',
    'avatar-6', 'avatar-7', 'avatar-8', 'avatar-9', 'avatar-10',
    'avatar-11', 'avatar-12', 'avatar-13', 'avatar-14', 'avatar-15',
    'avatar-16', 'avatar-17', 'avatar-18', 'avatar-19', 'avatar-20'
  ];

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter your name!');
      return;
    }
    if (!selectedAvatar) {
      alert('Please choose an avatar!');
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('algebra_player_name', name);
    localStorage.setItem('algebra_player_avatar', selectedAvatar);
    
    onComplete({ name, avatar: selectedAvatar });
  };

  return (
    <div className="base-camp-screen">
      <div className="avatar-selection-container">
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          color: '#1F2937',
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(255,255,255,0.8)'
        }}>
          Welcome, Explorer!
        </h1>
        
        <p style={{ 
          textAlign: 'center', 
          fontSize: '1rem', 
          color: '#4B5563',
          marginBottom: '2rem'
        }}>
          Before you begin your expedition, tell us about yourself.
        </p>

        {/* Name Input */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '1rem', 
            fontWeight: 600, 
            color: '#1F2937',
            marginBottom: '0.5rem'
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
              textAlign: 'center',
              fontWeight: 600
            }}
          />
        </div>

        {/* Avatar Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '1.25rem', 
            fontWeight: 600, 
            color: '#1F2937',
            marginBottom: '1rem'
          }}>
            Choose Your Avatar:
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '1rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {avatars.map((avatar, index) => (
              <div
                key={avatar}
                onClick={() => setSelectedAvatar(avatar)}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  border: selectedAvatar === avatar ? '4px solid #10B981' : '2px solid #D1D5DB',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: selectedAvatar === avatar ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: selectedAvatar === avatar ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none',
                  overflow: 'hidden',
                  background: '#F9FAFB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {/* Avatar image - we'll use CSS sprites or individual images */}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: `url('/algebra/avatars.png')`,
                    backgroundSize: '500% 400%',
                    backgroundPosition: `${(index % 5) * 25}% ${Math.floor(index / 5) * 33.33}%`
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleSubmit}
            className="base-camp-tile-button"
            style={{ 
              padding: '1rem 3rem',
              fontSize: '1.25rem',
              cursor: name && selectedAvatar ? 'pointer' : 'not-allowed',
              opacity: name && selectedAvatar ? 1 : 0.5
            }}
          >
            Begin Your Journey →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelection;
