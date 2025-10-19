// src/components/StatsSystem.jsx
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

// Turkey Celebration Overlay
export function TurkeyOverlay({ show, streak }) {
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'turkeyFadeIn 0.5s ease-out',
      }}
    >
      <div style={{ fontSize: '120px', marginBottom: '20px' }}>🦃</div>
      <div style={{ fontSize: '48px', fontWeight: 900, color: '#10b981', marginBottom: '10px' }}>
        TURKEY!
      </div>
      <div style={{ fontSize: '32px', fontWeight: 700, color: '#059669' }}>
        {streak} in a row!
      </div>
      <div style={{ fontSize: '72px', fontWeight: 900, color: '#10b981', marginTop: '20px' }}>
        100%
      </div>
      <style>{`
        @keyframes turkeyFadeIn {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
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
