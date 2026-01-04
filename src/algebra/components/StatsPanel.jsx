// StatsPanel.jsx - REDESIGNED: Comprehensive stats, polished UI, unified modal styling
// Location: src/algebra/components/StatsPanel.jsx

import React from 'react';
import '../styles/stats-panel.css';

const StatsPanel = ({ stats, progress, playerName, onClose }) => {
  const sessionTime = stats?.sessionStart ? Math.floor((Date.now() - stats.sessionStart) / 60000) : 0;
  const accuracy = stats?.problemsAttempted > 0 
    ? Math.round((stats.problemsCorrect / stats.problemsAttempted) * 100) 
    : 0;

  // Calculate practice vs game stats
  const practiceProblems = stats?.practiceProblems || 0;
  const gameProblems = stats?.gameProblems || 0;
  const totalProblems = stats?.problemsAttempted || 0;

  // Get level-by-level stats
  const levelStats = stats?.levelStats || {};
  const recentLevels = Object.entries(levelStats)
    .sort((a, b) => (b[1].lastPlayed || 0) - (a[1].lastPlayed || 0))
    .slice(0, 5);

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="algebra-modal-overlay" onClick={onClose}>
      <div className="algebra-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="algebra-modal-header">
          <h2>📊 {playerName}'s Statistics</h2>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="algebra-modal-content">
          
          {/* Top Stats Grid */}
          <div className="stats-grid-top">
            <div className="stat-card green">
              <div className="stat-icon">✓</div>
              <div className="stat-value">{stats?.problemsCorrect || 0}</div>
              <div className="stat-label">Problems Solved</div>
            </div>

            <div className="stat-card orange">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>

            <div className="stat-card blue">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{stats?.currentStreak || 0}</div>
              <div className="stat-label">Current Streak</div>
            </div>

            <div className="stat-card purple">
              <div className="stat-icon">⏱️</div>
              <div className="stat-value">{sessionTime}</div>
              <div className="stat-label">Minutes Played</div>
            </div>
          </div>

          {/* Practice vs Game Mode */}
          <div className="stats-section">
            <h3>Mode Breakdown</h3>
            <div className="mode-stats">
              <div className="mode-item">
                <div className="mode-label">🎮 Game Mode</div>
                <div className="mode-bar-container">
                  <div 
                    className="mode-bar game" 
                    style={{ width: totalProblems > 0 ? `${(gameProblems / totalProblems) * 100}%` : '0%' }}
                  >
                    <span className="mode-count">{gameProblems}</span>
                  </div>
                </div>
              </div>
              <div className="mode-item">
                <div className="mode-label">📝 Practice Mode</div>
                <div className="mode-bar-container">
                  <div 
                    className="mode-bar practice" 
                    style={{ width: totalProblems > 0 ? `${(practiceProblems / totalProblems) * 100}%` : '0%' }}
                  >
                    <span className="mode-count">{practiceProblems}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Levels Performance */}
          <div className="stats-section">
            <h3>Recent Level Performance</h3>
            {recentLevels.length > 0 ? (
              <div className="level-stats-list">
                {recentLevels.map(([levelId, data]) => {
                  const levelNum = levelId.split('-')[1];
                  const levelAccuracy = data.attempted > 0 
                    ? Math.round((data.correct / data.attempted) * 100) 
                    : 0;
                  
                  return (
                    <div key={levelId} className="level-stat-row">
                      <div className="level-info">
                        <span className="level-number">Level {levelNum}</span>
                        <span className="level-attempts">{data.attempted} attempts</span>
                      </div>
                      <div className="level-metrics">
                        <span className="metric-item">
                          <span className="metric-icon">✓</span>
                          {data.correct}/{data.attempted}
                        </span>
                        <span className="metric-item">
                          <span className="metric-icon">🎯</span>
                          {levelAccuracy}%
                        </span>
                        <span className="metric-item">
                          <span className="metric-icon">⏱️</span>
                          {formatTime(data.timeSpent)}
                        </span>
                        <span className="metric-item">
                          <span className="metric-icon">💎</span>
                          {data.crystalsEarned || 0}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data">No level data yet. Start playing to see stats!</div>
            )}
          </div>

          {/* Knowledge Crystals */}
          <div className="crystals-display">
            <img 
              src="/algebra/KnowledgeCrystal.png" 
              alt="Knowledge Crystal" 
              className="crystal-icon"
            />
            <div className="crystal-info">
              <div className="crystal-count">{progress?.crystals || 0} Knowledge Crystals</div>
              <div className="crystal-subtext">Earned by solving problems correctly</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StatsPanel;
