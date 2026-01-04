// LevelIntro.jsx - FIXED: Poppins font throughout
// Location: src/algebra/components/LevelIntro.jsx

import React from 'react';
import '../styles/algebra.css';

const LevelIntro = ({ levelData, onContinue }) => {
  // Level-specific story and clues
  const levelStories = {
    '1-1': {
      story: 'You arrive at the supply depot. The quartermaster needs help organizing integer supplies.',
      clue: 'Remember: Adding a negative is the same as subtracting a positive.'
    },
    '1-5': {
      story: 'The path ahead is blocked by fallen logs. You must distribute supplies evenly to clear it.',
      clue: 'When distributing, multiply the outside number by EACH term inside the parentheses.'
    },
    '1-13': {
      story: 'You reach Pack It Up station. Multiple steps are required here.',
      clue: 'First distribute, then combine like terms. Work methodically!'
    },
    // Add more as needed
  };

  const story = levelStories[levelData.id] || {
    story: 'You continue your journey through the Algebraic Mountains.',
    clue: 'Read the problem carefully and work step by step.'
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
        maxWidth: '700px',
        width: '90%',
        padding: '2rem 1rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '1rem',
          padding: '2.5rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          border: '3px solid #4CAF50'
        }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#10B981',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Level {levelData.id.split('-')[1]}
          </div>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#1F2937',
            marginBottom: '1.5rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            {levelData.name}
          </h1>

          <p style={{
            fontSize: '1.125rem',
            lineHeight: 1.7,
            color: '#374151',
            marginBottom: '2rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            {story.story}
          </p>

          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '2px solid #F59E0B',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📝</span>
              <span style={{
                fontWeight: 700,
                color: '#92400E',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Dr. Martinez's Journal
              </span>
            </div>
            <p style={{
              fontSize: '1rem',
              color: '#78350F',
              fontStyle: 'italic',
              lineHeight: 1.6,
              fontFamily: 'Poppins, sans-serif'
            }}>
              "{story.clue}"
            </p>
          </div>

          <button
            onClick={onContinue}
            className="base-camp-tile-button"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.125rem',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            Begin Level →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelIntro;
