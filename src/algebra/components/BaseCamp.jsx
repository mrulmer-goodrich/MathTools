// BaseCamp.jsx - Base Camp Landing with 2 tiles
// Location: src/algebra/components/BaseCamp.jsx

import React, { useState } from 'react';
import '../styles/algebra.css';

const BaseCamp = ({ 
  onStartGame, 
  onPracticeMode,
  onExitGame,
  sessionData
}) => {
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const hasSession = sessionData?.hasSession || false;
  const currentLevel = sessionData?.currentLevel || null;
  const difficulty = sessionData?.difficulty || 'easy';
  const levelsCompleted = sessionData?.levelsCompleted || 0;

  const handleGameTileClick = () => {
    if (hasSession) {
      setShowSessionModal(true);
    } else {
      setShowDifficultyModal(true);
    }
  };

  const handleStartNew = (selectedDifficulty) => {
    setShowDifficultyModal(false);
    onStartGame(selectedDifficulty);
  };

  const handleContinue = () => {
    setShowSessionModal(false);
    onStartGame(difficulty, true); // true = continue existing
  };

  const handleStartNewFromSession = () => {
    setShowSessionModal(false);
    setShowDifficultyModal(true);
  };

  return (
    <div className="base-camp-screen">
      <button className="btn-exit-game" onClick={onExitGame}>
        🏠 EXIT
      </button>

      <div className="base-camp-container">
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '3rem', 
          fontWeight: 700, 
          color: '#1F2937',
          marginBottom: '0.5rem',
          textShadow: '2px 2px 4px rgba(255,255,255,0.8)'
        }}>
          Algebra Expedition
        </h1>

        {levelsCompleted > 0 && (
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
            padding: '0.5rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '0.5rem',
            border: '2px solid #10B981',
            display: 'inline-block',
            marginLeft: '50%',
            transform: 'translateX(-50%)'
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#059669' }}>
              {levelsCompleted} / 37 COMPLETED
            </span>
          </div>
        )}

        <div className="base-camp-tiles">
          <div 
            className="base-camp-tile"
            onClick={handleGameTileClick}
            style={{ minHeight: '180px', padding: '1.5rem', cursor: 'pointer' }}
          >
            <div className="base-camp-tile-icon">📍</div>
            <h2 className="base-camp-tile-title" style={{ fontSize: '1.75rem' }}>Game Mode</h2>
            <p className="base-camp-tile-subtitle" style={{ fontSize: '0.875rem' }}>
              Sequential challenges
            </p>

            <button className="base-camp-tile-button" style={{ marginTop: '2rem', padding: '0.75rem 1.5rem' }}>
              {hasSession ? 'Continue →' : 'Start →'}
            </button>
          </div>

          <div 
            className="base-camp-tile"
            onClick={onPracticeMode}
            style={{ minHeight: '180px', padding: '1.5rem', cursor: 'pointer' }}
          >
            <div className="base-camp-tile-icon">🎯</div>
            <h2 className="base-camp-tile-title" style={{ fontSize: '1.75rem' }}>Practice Mode</h2>
            <p className="base-camp-tile-subtitle" style={{ fontSize: '0.875rem' }}>
              Free practice
            </p>

            <button className="base-camp-tile-button" style={{ marginTop: '2rem', padding: '0.75rem 1.5rem' }}>
              Practice →
            </button>
          </div>
        </div>
      </div>

      {/* Difficulty Selection Modal */}
      {showDifficultyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', textAlign: 'center' }}>
              Choose Your Route
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1.5rem', textAlign: 'center' }}>
              This choice applies to your entire expedition.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={() => handleStartNew('easy')}
                style={{
                  padding: '1rem',
                  border: '2px solid #10B981',
                  borderRadius: '0.5rem',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                  📍 Standard Route
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  Whole numbers • Clear problems • Variable always x
                </div>
              </button>

              <button
                onClick={() => handleStartNew('notEasy')}
                style={{
                  padding: '1rem',
                  border: '2px solid #F59E0B',
                  borderRadius: '0.5rem',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                  ⚡ Advanced Route
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  Fractions • Decimals • Multiple variables • Grade-level rigor
                </div>
              </button>

              <button
                onClick={() => setShowDifficultyModal(false)}
                style={{
                  padding: '0.5rem',
                  border: 'none',
                  background: 'transparent',
                  color: '#6B7280',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Modal */}
      {showSessionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', textAlign: 'center' }}>
              Expedition in Progress
            </h2>

            <div style={{
              background: '#F9FAFB',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                Current Progress
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937' }}>
                {currentLevel}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>
                {difficulty === 'easy' ? '📍 Standard Route' : '⚡ Advanced Route'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={handleContinue}
                className="base-camp-tile-button"
                style={{ width: '100%', padding: '1rem' }}
              >
                Continue Expedition →
              </button>

              <button
                onClick={handleStartNewFromSession}
                style={{
                  padding: '1rem',
                  border: '2px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Start New Expedition
              </button>

              <button
                onClick={() => setShowSessionModal(false)}
                style={{
                  padding: '0.5rem',
                  border: 'none',
                  background: 'transparent',
                  color: '#6B7280',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseCamp;
