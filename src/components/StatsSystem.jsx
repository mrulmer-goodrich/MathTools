// src/components/StatsSystem.jsx - ENHANCED with recurring turkey rewards!
import React from 'react';

// Red X Overlay Component
export function ErrorOverlay({ show }) {
  if (!show) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        pointerEvents: 'none',
        animation: 'fadeInOut 1s ease-in-out',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <line
          x1="20"
          y1="20"
          x2="80"
          y2="80"
          stroke="#ef4444"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <line
          x1="80"
          y1="20"
          x2="20"
          y2="80"
          stroke="#ef4444"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ENHANCED Turkey Celebration Overlay - Now bigger, centered, and shows for 3, 6, 9, etc!
export function TurkeyOverlay({ show, streak, isGolden = false }) {
  if (!show) return null;
  
  // Determine if this is a golden turkey (multiples of 9)
  const showGolden = isGolden || (streak >= 9 && streak % 9 === 0);
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        background: showGolden 
          ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.95) 0%, rgba(245, 158, 11, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(16, 185, 129, 0.95) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'turkeyFadeIn 0.5s ease-out',
      }}
    >
      {/* Giant Turkey Emoji */}
      <div 
        style={{ 
          fontSize: '180px', 
          marginBottom: '30px',
          animation: 'turkeyBounce 0.6s ease-out',
          filter: showGolden ? 'drop-shadow(0 0 30px rgba(234, 179, 8, 0.8))' : 'none',
        }}
      >
        🦃
      </div>
      
      {/* Title */}
      <div 
        style={{ 
          fontSize: '72px', 
          fontWeight: 900, 
          color: showGolden ? '#854d0e' : 'white',
          marginBottom: '15px',
          textShadow: showGolden 
            ? '0 4px 8px rgba(0, 0, 0, 0.3)' 
            : '0 4px 8px rgba(0, 0, 0, 0.2)',
          animation: 'titlePulse 0.8s ease-out',
        }}
      >
        {showGolden ? '🏆 GOLDEN TURKEY! 🏆' : 'TURKEY!'}
      </div>
      
      {/* Streak display */}
      <div 
        style={{ 
          fontSize: '42px', 
          fontWeight: 700, 
          color: showGolden ? '#78350f' : 'white',
          marginBottom: '25px',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      >
        {streak} Perfect in a Row! 🔥
      </div>
      
      {/* 100% Badge */}
      <div 
        style={{ 
          fontSize: '96px', 
          fontWeight: 900, 
          color: showGolden ? '#a16207' : '#ecfdf5',
          textShadow: showGolden 
            ? '0 6px 12px rgba(0, 0, 0, 0.4)' 
            : '0 6px 12px rgba(0, 0, 0, 0.3)',
          animation: 'percentGrow 0.7s ease-out',
        }}
      >
        100%
      </div>
      
      {/* Special message for golden turkey */}
      {showGolden && (
        <div 
          style={{ 
            fontSize: '32px', 
            fontWeight: 700, 
            color: '#78350f',
            marginTop: '20px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            animation: 'fadeInUp 0.8s ease-out',
          }}
        >
          ✨ LEGENDARY! ✨
        </div>
      )}
      
      <style>{`
        @keyframes turkeyFadeIn {
          0% { 
            opacity: 0; 
            transform: scale(0.8); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        
        @keyframes turkeyBounce {
          0% { 
            transform: translateY(-100px) scale(0.5); 
            opacity: 0;
          }
          60% { 
            transform: translateY(10px) scale(1.1); 
          }
          100% { 
            transform: translateY(0) scale(1); 
            opacity: 1;
          }
        }
        
        @keyframes titlePulse {
          0% { 
            transform: scale(0.5); 
            opacity: 0;
          }
          50% { 
            transform: scale(1.05); 
          }
          100% { 
            transform: scale(1); 
            opacity: 1;
          }
        }
        
        @keyframes percentGrow {
          0% { 
            transform: scale(0); 
            opacity: 0;
          }
          70% { 
            transform: scale(1.15); 
          }
          100% { 
            transform: scale(1); 
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          0% { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
      `}</style>
    </div>
  );
}

// Stats Report Modal
export function StatsReport({ stats, onClose, moduleName }) {
  if (!stats) return null;
  
  // Safely access stats with defaults for any missing fields
  const questionsAttempted = stats.questionsAttempted ?? 0;
  const questionsPerfect = stats.questionsPerfect ?? 0;
  const totalErrors = stats.totalErrors ?? 0;
  const currentStreak = stats.currentStreak ?? 0;
  
  // Fix divide-by-zero: show 0.0% if no questions attempted, otherwise calculate
  const firstTryAccuracy = questionsAttempted > 0 
    ? ((questionsPerfect / questionsAttempted) * 100).toFixed(1)
    : '0.0';
  
  const avgErrors = questionsAttempted > 0
    ? (totalErrors / questionsAttempted).toFixed(2)
    : '0.00';
  
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '500px',
          width: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '24px', textAlign: 'center' }}>
          📊 Session Stats
        </h2>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Module</div>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>{moduleName}</div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <StatCard label="Questions Attempted" value={questionsAttempted} />
          <StatCard label="First-Try Perfect" value={questionsPerfect} color="#10b981" />
          <StatCard label="First-Try Accuracy" value={`${firstTryAccuracy}%`} color="#3b82f6" />
          <StatCard label="Avg Errors/Question" value={avgErrors} color="#f59e0b" />
        </div>
        
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '12px' }}>
          <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>Current Streak</div>
          <div style={{ fontSize: '36px', fontWeight: 900, color: '#b45309', textAlign: 'center' }}>
            {currentStreak} 🔥
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="button primary gradient-button"
          style={{ width: '100%' }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = '#0f172a' }) {
  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '2px solid #e2e8f0',
      }}
    >
      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 900, color }}>{value}</div>
    </div>
  );
}
