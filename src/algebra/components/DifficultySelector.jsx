// DifficultySelector.jsx - Choose Standard or Advanced Route
// Location: src/algebra/components/DifficultySelector.jsx

import React from 'react';
import '../styles/algebra.css';

const DifficultySelection = ({ onSelectDifficulty }) => {
  return (
    <div className="base-camp-screen">
      <div className="base-camp-container">
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          color: '#1F2937',
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(255,255,255,0.8)'
        }}>
          Choose Your Path
        </h1>
        
        <p style={{ 
          textAlign: 'center', 
          fontSize: '1rem', 
          color: '#1F2937',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          Dr. Martinez left two sets of coordinates. Choose the path that matches your skill level.
        </p>

        <div className="base-camp-tiles">
          {/* Standard Route */}
          <div 
            className="base-camp-tile"
            onClick={() => onSelectDifficulty('easy')}
            style={{ padding: '2rem', minHeight: '220px', cursor: 'pointer' }}
          >
            <div className="base-camp-tile-icon">📍</div>
            <h2 className="base-camp-tile-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
              Standard Route
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem' }}>
              <strong>Best for:</strong> Building solid foundations
            </p>
            
            <ul style={{ 
              textAlign: 'left', 
              fontSize: '0.875rem', 
              color: '#4B5563',
              lineHeight: 1.6,
              paddingLeft: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <li>Whole numbers only</li>
              <li>Clear, straightforward problems</li>
              <li>Variable always x</li>
              <li>Focus on core concepts</li>
            </ul>

            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontStyle: 'italic' }}>
              Example: 3(x + 5)2x + 7 = 15
            </div>

            <button 
              className="base-camp-tile-button" 
              style={{ marginTop: '1rem', padding: '0.75rem 1.5rem' }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectDifficulty('easy');
              }}
            >
              Select Standard Route
            </button>
          </div>

          {/* Advanced Route */}
          <div 
            className="base-camp-tile"
            onClick={() => onSelectDifficulty('notEasy')}
            style={{ padding: '2rem', minHeight: '220px', cursor: 'pointer' }}
          >
            <div className="base-camp-tile-icon">⚡</div>
            <h2 className="base-camp-tile-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
              Advanced Route
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem' }}>
              <strong>Best for:</strong> Seeking a challenge
            </p>
            
            <ul style={{ 
              textAlign: 'left', 
              fontSize: '0.875rem', 
              color: '#4B5563',
              lineHeight: 1.6,
              paddingLeft: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <li>Fractions and decimals</li>
              <li>Multiple variables</li>
              <li>Complex problem types</li>
              <li>Grade-level rigor</li>
            </ul>

            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontStyle: 'italic' }}>
              Example: (1/2)(n - 6)1.5y + 3 = 9
            </div>

            <button 
              className="base-camp-tile-button" 
              style={{ marginTop: '1rem', padding: '0.75rem 1.5rem' }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectDifficulty('hard');
              }}
            >
              Select Advanced Route
            </button>
          </div>
        </div>

        <p style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          fontSize: '0.875rem',
          color: '#6B7280',
          fontWeight: 600
        }}>
          <strong>Note:</strong> This choice applies to your entire expedition. Choose the path that will challenge you without overwhelming you.
        </p>
      </div>
    </div>
  );
};

export default DifficultySelection;
