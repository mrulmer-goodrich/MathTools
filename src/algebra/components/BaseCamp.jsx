// BaseCamp.jsx - FIXED: Title top-aligned, completion badge repositioned
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
    onStartGame(difficulty, true);
  };

  const handleStartNewFromSession = () => {
    setShowSessionModal(false);
    setShowDifficultyModal(true);
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
      flexDirection: 'column'
    }}>
      <button className="btn-exit-game" onClick={onExitGame}>
        🏠 EXIT
      </button>

      {/* FIXED: Title at top, completion badge inline */}
      <div style={{
        paddingTop: '4rem',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 700, 
          color: '#1F2937',
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(255,255,255,0.8)',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Algebra Expedition
        </h1>

        {levelsCompleted > 0 && (
          <div style={{
            display: 'inline-block',
            padding: '0.5rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '0.5rem',
            border: '2px solid #10B981',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
          }}>
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: 700, 
              color: '#059669',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {levelsCompleted} / 37 COMPLETED
            </span>
          </div>
        )}
      </div>

      {/* Centered tiles */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 2rem 4rem'
      }}>
        <div className="base-camp-tiles" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          maxWidth: '800px',
          width: '100%'
        }}>
          <div 
            className="base-camp-tile"
            onClick={handleGameTileClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="base-camp-tile-icon">📍</div>
            <h2 className="base-camp-tile-title" style={{ 
              fontSize: '1.75rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Game Mode
            </h2>
            <p className="base-camp-tile-subtitle" style={{ 
              fontSize: '0.875rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Sequential challenges
            </p>

            <button className="base-camp-tile-button" style={{ 
              marginTop: '2rem', 
              padding: '0.75rem 1.5rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {hasSession ? 'Continue →' : 'Start →'}
            </button>
          </div>

          <div 
            className="base-camp-tile"
            onClick={onPracticeMode}
            style={{ cursor: 'pointer' }}
          >
            <div className="base-camp-tile-icon">🎯</div>
            <h2 className="base-camp-tile-title" style={{ 
              fontSize: '1.75rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Practice Mode
            </h2>
            <p className="base-camp-tile-subtitle" style={{ 
              fontSize: '0.875rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Free practice
            </p>

            <button className="base-camp-tile-button" style={{ 
              marginTop: '2rem', 
              padding: '0.75rem 1.5rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
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
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              marginBottom: '1rem', 
              textAlign: 'center',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Choose Your Route
            </h2>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#6B7280', 
              marginBottom: '1.5rem', 
              textAlign: 'center',
              fontFamily: 'Poppins, sans-serif'
            }}>
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
                  transition: 'all 0.2s ease',
                  fontFamily: 'Poppins, sans-serif'
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
                  transition: 'all 0.2s ease',
                  fontFamily: 'Poppins, sans-serif'
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
                  fontSize: '0.875rem',
                  fontFamily: 'Poppins, sans-serif'
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
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              marginBottom: '1rem', 
              textAlign: 'center',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Expedition in Progress
            </h2>

            <div style={{
              background: '#F9FAFB',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#6B7280', 
                marginBottom: '0.5rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Current Progress
              </div>
              <div style={{ 
                fontSize: '1.25rem', 
                fontWeight: 700, 
                color: '#1F2937',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {currentLevel}
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#6B7280', 
                marginTop: '0.25rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {difficulty === 'easy' ? '📍 Standard Route' : '⚡ Advanced Route'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={handleContinue}
                className="base-camp-tile-button"
                style={{ 
                  width: '100%', 
                  padding: '1rem',
                  fontFamily: 'Poppins, sans-serif'
                }}
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
                  fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif'
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
                  fontSize: '0.875rem',
                  fontFamily: 'Poppins, sans-serif'
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
