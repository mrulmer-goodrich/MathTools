import React from 'react';

const StatsPanel = ({ stats, progress, onClose }) => {
  const getAccuracy = () => {
    if (stats.problemsAttempted === 0) return 0;
    return Math.round((stats.problemsCorrect / stats.problemsAttempted) * 100);
  };

  const getSessionTime = () => {
    const elapsed = Date.now() - stats.sessionStart;
    const minutes = Math.floor(elapsed / 60000);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="stats-overlay">
      <div className="stats-panel">
        <div className="stats-header">
          <h2>Session Statistics</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="stats-content">
          <div className="stat-card">
            <h3>Current Session</h3>
            <div className="stat-row">
              <span>Time:</span>
              <strong>{getSessionTime()}</strong>
            </div>
            <div className="stat-row">
              <span>Problems Attempted:</span>
              <strong>{stats.problemsAttempted}</strong>
            </div>
            <div className="stat-row">
              <span>Problems Correct:</span>
              <strong>{stats.problemsCorrect}</strong>
            </div>
            <div className="stat-row">
              <span>Accuracy:</span>
              <strong>{getAccuracy()}%</strong>
            </div>
            <div className="stat-row">
              <span>Current Streak:</span>
              <strong>{stats.currentStreak}</strong>
            </div>
          </div>

          <div className="stat-card">
            <h3>Expedition Progress</h3>
            <div className="stat-row">
              <span>Levels Completed:</span>
              <strong>{progress.completedLevels.length} / 31</strong>
            </div>
            <div className="stat-row">
              <span>Badges Earned:</span>
              <strong>{progress.badges.length}</strong>
            </div>
            <div className="stat-row">
              <span>Modules Unlocked:</span>
              <strong>{progress.unlockedModules.length} / 3</strong>
            </div>
          </div>

          <div className="stats-note">
            <p><em>Note: Stats reset each session. Take a screenshot to track progress over time!</em></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
