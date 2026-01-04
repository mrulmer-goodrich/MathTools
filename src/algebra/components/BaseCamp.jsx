// BaseCamp.jsx - Complete Redesign
// Location: src/algebra/components/BaseCamp.jsx

import React from 'react';
import '../styles/algebra.css';

const BaseCamp = ({ 
  onStartGame, 
  onContinueGame, 
  onPracticeMode,
  onExitGame,
  sessionData // { hasSession: bool, currentLevel: string, difficulty: string, levelsCompleted: number }
}) => {
  const hasSession = sessionData?.hasSession || false;
  const currentLevel = sessionData?.currentLevel || null;
  const difficulty = sessionData?.difficulty || 'easy';
  const levelsCompleted = sessionData?.levelsCompleted || 0;

  return (
    <div className="base-camp-screen">
      {/* Exit Game Button */}
      <button className="btn-exit-game" onClick={onExitGame}>
        🏠 EXIT
      </button>

      {/* Main Container */}
      <div className="base-camp-container">
        {/* Title Area */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 700, 
            color: '#1F2937',
            marginBottom: '0.5rem',
            textShadow: '2px 2px 4px rgba(255,255,255,0.8)'
          }}>
            Algebra Expedition
          </h1>
          
          {/* Progress Indicator */}
          {levelsCompleted > 0 && (
            <div style={{
              marginTop: '1rem',
              padding: '0.5rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '0.5rem',
              border: '2px solid #10B981',
              display: 'inline-block'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#059669' }}>
                {levelsCompleted} / 37 COMPLETED
              </span>
            </div>
          )}
        </div>

        {/* Two Main Tiles */}
        <div className="base-camp-tiles">
          {/* Game Mode Tile */}
          <div 
            className="base-camp-tile"
            onClick={hasSession ? onContinueGame : onStartGame}
            style={{ minHeight: '200px', padding: '2rem' }}
          >
            <div className="base-camp-tile-icon">📍</div>
            <h2 className="base-camp-tile-title" style={{ fontSize: '1.75rem' }}>Game Mode</h2>
            <p className="base-camp-tile-subtitle" style={{ fontSize: '0.875rem' }}>
              Sequential challenges
            </p>

            {hasSession ? (
              <>
                <div className="base-camp-session-info" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                  <div style={{ fontWeight: 700 }}>
                    {currentLevel} • {difficulty === 'easy' ? 'Standard' : 'Advanced'}
                  </div>
                </div>
                <button className="base-camp-tile-button" style={{ marginTop: '1rem', padding: '0.75rem 1.5rem' }}>
                  Continue →
                </button>
              </>
            ) : (
              <button className="base-camp-tile-button" style={{ marginTop: '2.5rem', padding: '0.75rem 1.5rem' }}>
                Start →
              </button>
            )}
          </div>

          {/* Practice Mode Tile */}
          <div 
            className="base-camp-tile"
            onClick={onPracticeMode}
            style={{ minHeight: '200px', padding: '2rem' }}
          >
            <div className="base-camp-tile-icon">🎯</div>
            <h2 className="base-camp-tile-title" style={{ fontSize: '1.75rem' }}>Practice Mode</h2>
            <p className="base-camp-tile-subtitle" style={{ fontSize: '0.875rem' }}>
              Free practice
            </p>

            <button className="base-camp-tile-button" style={{ marginTop: '2.5rem', padding: '0.75rem 1.5rem' }}>
              Practice →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseCamp;
