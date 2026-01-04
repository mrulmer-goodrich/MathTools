// PracticeMode.jsx - MINIMAL FIX: Just add difficulty selection
// Replace your current PracticeMode with this - it preserves your existing structure

import React, { useState } from 'react';
import '../styles/algebra.css';

const PracticeMode = ({ onStartLevel, onBack, levelsCompleted = [] }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);

  // Your existing skill groups - UNCHANGED
  const skillGroups = [
    { name: '🔢 Operations with Integers', levels: ['1-1', '1-2', '1-3', '1-4'] },
    { name: '📦 Distribution', levels: ['1-5', '1-6', '1-7', '1-8'] },
    { name: '🧮 Combining Like Terms', levels: ['1-9', '1-10', '1-11', '1-12'] },
    { name: '⛺ Distribute Then Combine', levels: ['1-13', '1-14', '1-15', '1-16'] },
    { name: '🌊 One-Step Equations', levels: ['1-17', '1-18', '1-19', '1-20'] },
    { name: '⛰️ Two-Step Equations', levels: ['1-21', '1-22', '1-23', '1-24'] },
    { name: '🏔️ Multi-Step Equations', levels: ['1-25', '1-26', '1-27', '1-28'] },
    { name: '🗝️ Variables on Both Sides', levels: ['1-29', '1-30', '1-31'] },
    { name: '🏆 Ultimate Challenges', levels: ['1-32', '1-33'] },
    { name: '⚖️ Inequalities', levels: ['1-34', '1-35', '1-36', '1-37'] }
  ];

  const handleLevelClick = (levelId) => {
    setSelectedLevel(levelId);
    setShowDifficultyModal(true);
  };

  const handleDifficultySelect = (difficulty) => {
    setShowDifficultyModal(false);
    onStartLevel(selectedLevel, difficulty, 'practice');
  };

  const handleCancel = () => {
    setShowDifficultyModal(false);
    setSelectedLevel(null);
  };

  return (
    <>
      {/* YOUR EXISTING PRACTICE MODE JSX - Copy exactly what you had */}
      {/* Just change onClick to call handleLevelClick instead of onStartLevel */}
      
      <div className="practice-mode">
        <button className="btn-back" onClick={onBack}>
          ← Back to Base Camp
        </button>

        <div className="practice-header">
          <h1>Practice Mode</h1>
          <p>Choose any skill to practice</p>
        </div>

        {skillGroups.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.25rem',
              marginBottom: '1rem',
              color: '#374151'
            }}>
              {group.name}
            </h3>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              {group.levels.map((levelId) => {
                const levelNum = levelId.split('-')[1];
                const isCompleted = levelsCompleted.includes(levelId);
                
                return (
                  <button
                    key={levelId}
                    onClick={() => handleLevelClick(levelId)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: isCompleted ? '#10B981' : 'white',
                      color: isCompleted ? 'white' : '#1F2937',
                      border: '2px solid #D1D5DB',
                      borderRadius: '0.5rem',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Level {levelNum}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* DIFFICULTY MODAL - NEW */}
      {showDifficultyModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={handleCancel}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.75rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: '#1F2937'
            }}>
              Select Difficulty
            </h2>
            
            <p style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1rem',
              color: '#6B7280',
              marginBottom: '2rem'
            }}>
              Choose your route for this practice session:
            </p>
            
            <button 
              onClick={() => handleDifficultySelect('easy')}
              style={{
                width: '100%',
                padding: '1.5rem',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📍 Standard Route</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                Whole numbers, clear problems, variable always x
              </div>
            </button>
            
            <button 
              onClick={() => handleDifficultySelect('notEasy')}
              style={{
                width: '100%',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡ Advanced Route</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                Fractions, decimals, multiple variables, grade-level rigor
              </div>
            </button>
            
            <button 
              onClick={handleCancel}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                color: '#6B7280',
                border: '2px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PracticeMode;
