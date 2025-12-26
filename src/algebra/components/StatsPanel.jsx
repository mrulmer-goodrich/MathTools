import React from 'react';
import '../styles/stats-panel.css';

const StatsPanel = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  const {
    sessionStart,
    totalAttempts,
    totalCorrect,
    currentStreak,
    skillStats,
    moduleProgress,
    practiceStats
  } = stats;

  const sessionDuration = sessionStart ? 
    Math.floor((Date.now() - new Date(sessionStart)) / 1000 / 60) : 0;
  
  const overallAccuracy = totalAttempts > 0 ? 
    Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <div className="stats-panel-overlay" onClick={onClose}>
      <div className="stats-panel-content" onClick={(e) => e.stopPropagation()}>
        <div className="stats-header">
          <h2>📊 Session Statistics</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="stats-grid">
          {/* Current Session */}
          <div className="stats-section">
            <h3>Current Session</h3>
            <div className="stat-row">
              <span>Time:</span>
              <strong>{sessionDuration} minutes</strong>
            </div>
            <div className="stat-row">
              <span>Attempted:</span>
              <strong>{totalAttempts}</strong>
            </div>
            <div className="stat-row">
              <span>Correct:</span>
              <strong>{totalCorrect}</strong>
            </div>
            <div className="stat-row">
              <span>Accuracy:</span>
              <strong>{overallAccuracy}%</strong>
            </div>
            <div className="stat-row">
              <span>Current Streak:</span>
              <strong>🔥 {currentStreak}</strong>
            </div>
          </div>

          {/* Module Progress */}
          <div className="stats-section">
            <h3>Module Progress</h3>
            {Object.entries(moduleProgress || {}).map(([module, data]) => (
              <div key={module} className="module-stat">
                <div className="module-name">{module}</div>
                <div className="module-bar">
                  <div 
                    className="module-bar-fill"
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                </div>
                <div className="module-text">
                  {data.completed} / {data.total} levels ({data.percentage}%)
                </div>
              </div>
            ))}
          </div>

          {/* Skill Mastery */}
          <div className="stats-section">
            <h3>Skill Mastery (This Session)</h3>
            {Object.entries(skillStats || {}).map(([skill, data]) => (
              <div key={skill} className="skill-stat">
                <span className="skill-name">{skill}:</span>
                <span className="skill-data">
                  {data.correct}/{data.total} ({data.accuracy}%)
                </span>
              </div>
            ))}
          </div>

          {/* Practice Mode */}
          <div className="stats-section">
            <h3>Practice Mode (This Session)</h3>
            <div className="stat-row">
              <span>Levels Practiced:</span>
              <strong>{practiceStats?.levelsPracticed || 0}</strong>
            </div>
            <div className="stat-row">
              <span>Attempted:</span>
              <strong>{practiceStats?.attempted || 0}</strong>
            </div>
            <div className="stat-row">
              <span>Correct:</span>
              <strong>{practiceStats?.correct || 0}</strong>
            </div>
            <div className="stat-row">
              <span>Accuracy:</span>
              <strong>
                {practiceStats?.attempted > 0 ? 
                  Math.round((practiceStats.correct / practiceStats.attempted) * 100) : 0}%
              </strong>
            </div>
          </div>
        </div>

        <div className="stats-note">
          💡 <em>Stats reset each session. Screenshot to track progress over time!</em>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
