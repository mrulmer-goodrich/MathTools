// StatsPanel.jsx - Fixed props reading
import React from 'react';
import '../styles/stats-panel.css';

const StatsPanel = ({ stats, progress, playerName, onClose }) => {
  const sessionTime = stats?.sessionStart ? Math.floor((Date.now() - stats.sessionStart) / 60000) : 0;
  const accuracy = stats?.problemsAttempted > 0 
    ? Math.round((stats.problemsCorrect / stats.problemsAttempted) * 100) 
    : 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ 
          fontFamily: 'Poppins, sans-serif', 
          marginBottom: '1.5rem',
          fontSize: '1.75rem',
          fontWeight: 700
        }}>
          {playerName}'s Statistics
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: '#F0FDF4',
            border: '2px solid #10B981',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: 700, 
              color: '#10B981',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {stats?.problemsCorrect || 0}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#6B7280',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Problems Correct
            </div>
          </div>

          <div style={{
            background: '#FEF3C7',
            border: '2px solid #F59E0B',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: 700, 
              color: '#F59E0B',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {accuracy}%
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#6B7280',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Accuracy
            </div>
          </div>

          <div style={{
            background: '#EFF6FF',
            border: '2px solid #3B82F6',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: 700, 
              color: '#3B82F6',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {stats?.currentStreak || 0}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#6B7280',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Current Streak
            </div>
          </div>

          <div style={{
            background: '#F5F3FF',
            border: '2px solid #8B5CF6',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: 700, 
              color: '#8B5CF6',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {sessionTime}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#6B7280',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Minutes Played
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '2px solid #F59E0B',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '2.5rem' }}>💎</div>
          <div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700,
              fontFamily: 'Poppins, sans-serif'
            }}>
              {progress?.crystals || 0} Knowledge Crystals
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#6B7280',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Collected this session
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="base-camp-tile-button"
          style={{ width: '100%' }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default StatsPanel;
