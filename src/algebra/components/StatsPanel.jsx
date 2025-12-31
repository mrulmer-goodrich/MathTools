// StatsPanel.jsx - FIXED CSS IMPORT
// Location: src/algebra/components/StatsPanel.jsx

import React from 'react';
import '../styles/stats-panel.css';

const StatsPanel = ({ stats, progress, onClose }) => {
  const sessionTime = Math.floor((Date.now() - stats.sessionStart) / 1000 / 60); // minutes
  const accuracy = stats.problemsAttempted > 0 
    ? Math.round((stats.problemsCorrect / stats.problemsAttempted) * 100) 
    : 0;

  return (
    <div className="stats-panel-overlay">
      <div className="stats-panel-container">
        <div className="stats-header">
          <h2>📊 Your Statistics</h2>
          <button className="btn-close-panel" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="stats-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{stats.problemsAttempted}</div>
              <div className="stat-label">Problems Attempted</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{stats.problemsCorrect}</div>
              <div className="stat-label">Problems Correct</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-value">{accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{stats.currentStreak}</div>
              <div className="stat-label">Current Streak</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-value">{sessionTime}</div>
              <div className="stat-label">Minutes Played</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-value">{progress.badges.length}</div>
              <div className="stat-label">Badges Earned</div>
            </div>
          </div>

          <div className="progress-section">
            <h3>Progress Overview</h3>
            <div className="progress-details">
              <div className="progress-item">
                <span className="progress-label">Levels Completed:</span>
                <span className="progress-value">{progress.completedLevels.length} / 37</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${(progress.completedLevels.length / 37) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {progress.badges && progress.badges.length > 0 && (
            <div className="badges-section">
              <h3>Your Badges</h3>
              <div className="badges-grid">
                {progress.badges.map((badge, index) => (
                  <div key={index} className="badge-display-item">
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="stats-footer">
          <button className="btn-primary" onClick={onClose}>
            Continue Playing
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
