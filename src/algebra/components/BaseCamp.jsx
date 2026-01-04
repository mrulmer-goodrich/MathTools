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
        <span className="btn-exit-game-icon">🏠</span>
        Exit Game
      </button>

      {/* Main Container */}
      <div className="base-camp-container">
        {/* Title Area */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 700, 
            color: '#1F2937',
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            Algebra Expedition
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#4B5563',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Dr. Martinez's journal lies open before you. Her map shows three distinct regions. 
            You must master each challenge to progress deeper into the mountains.
          </p>
          
          {/* Progress Indicator */}
          {levelsCompleted > 0 && (
            <div style={{
              marginTop: '2rem',
              padding: '1rem 2rem',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '0.75rem',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              display: 'inline-block'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669' }}>
                EXPEDITION PROGRESS: {levelsCompleted} / 37 LEVELS COMPLETED
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
          >
            <div className="base-camp-tile-icon">📍</div>
            <h2 className="base-camp-tile-title">Game Mode</h2>
            <p className="base-camp-tile-subtitle">
              Follow Dr. Martinez's path. Master each challenge to unlock the next. 
              Earn badges as you progress through the expedition.
            </p>

            {hasSession ? (
              <>
                <div className="base-camp-session-info">
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
                    Session in Progress
                  </div>
                  <div>
                    {currentLevel} • {difficulty === 'easy' ? 'Standard Route' : 'Advanced Route'}
                  </div>
                </div>
                <button className="base-camp-tile-button">
                  Continue Journey →
                </button>
              </>
            ) : (
              <button className="base-camp-tile-button">
                Start New Journey →
              </button>
            )}
          </div>

          {/* Practice Mode Tile */}
          <div 
            className="base-camp-tile"
            onClick={onPracticeMode}
          >
            <div className="base-camp-tile-icon">🎯</div>
            <h2 className="base-camp-tile-title">Practice Mode</h2>
            <p className="base-camp-tile-subtitle">
              Review any level you've encountered. Practice without pressure. 
              Perfect for reinforcement and skill building.
            </p>

            <button className="base-camp-tile-button" style={{ marginTop: '3.375rem' }}>
              Practice Skills →
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '3rem',
          fontSize: '0.875rem',
          color: '#6B7280'
        }}>
          <p>
            <strong>Standard Route:</strong> Building solid foundations • Whole numbers only • Clear, straightforward problems
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <strong>Advanced Route:</strong> Seeking a challenge • Fractions and decimals • Multiple variables • Grade-level rigor
          </p>
        </div>
      </div>
    </div>
  );
};

export default BaseCamp;
