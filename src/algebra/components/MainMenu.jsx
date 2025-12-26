import React from 'react';

const MainMenu = ({ onStartPlay, onStartPractice, onViewMap, progress }) => {
  const getProgressPercentage = () => {
    const totalLevels = 31;
    const completed = progress.completedLevels.length;
    return Math.round((completed / totalLevels) * 100);
  };

  const getModuleStatus = (moduleNum) => {
    if (moduleNum === 1) return 'unlocked';
    return progress.unlockedModules.includes(moduleNum) ? 'unlocked' : 'locked';
  };

  return (
    <div className="main-menu">
      <div className="menu-container">
        <div className="menu-header">
          <h1>The Lost Expedition</h1>
          <div className="progress-summary">
            <p>Expedition Progress: {getProgressPercentage()}% Complete</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>

        <div className="menu-story">
          <p>
            Dr. Martinez's journal lies open before you. Her map shows three distinct regions, 
            each more treacherous than the last. You must master each area to progress deeper 
            into the mountains.
          </p>
        </div>

        <div className="menu-options">
          <div className="menu-card play-mode" onClick={onStartPlay}>
            <div className="card-header">
              <h2>📍 Continue Expedition</h2>
              <span className="mode-badge">Play Mode</span>
            </div>
            <p>
              Follow Dr. Martinez's path chronologically. Master each challenge to unlock the next. 
              Earn badges and reveal the map as you progress.
            </p>
            <div className="module-preview">
              <div className={`module-status ${getModuleStatus(1)}`}>
                <span className="module-num">1</span>
                <span className="module-name">Base Camp</span>
              </div>
              <div className={`module-status ${getModuleStatus(2)}`}>
                <span className="module-num">2</span>
                <span className="module-name">Territory</span>
              </div>
              <div className={`module-status ${getModuleStatus(3)}`}>
                <span className="module-num">3</span>
                <span className="module-name">Frontier</span>
              </div>
            </div>
            <button className="btn-primary">Continue Expedition →</button>
          </div>

          <div className="menu-card practice-mode" onClick={onStartPractice}>
            <div className="card-header">
              <h2>🎯 Practice Skills</h2>
              <span className="mode-badge practice-badge">Practice Mode</span>
            </div>
            <p>
              Review any mathematical skill from your journey. Practice without pressure. 
              Perfect for preparation or reinforcement.
            </p>
            <ul className="practice-features">
              <li>Access any level you've encountered</li>
              <li>No progression requirements</li>
              <li>Track practice session stats</li>
            </ul>
            <button className="btn-secondary">Practice Skills →</button>
          </div>
        </div>

        <div className="menu-actions">
          <button className="btn-map" onClick={onViewMap}>
            🗺️ View Expedition Map
          </button>
        </div>

        {progress.badges.length > 0 && (
          <div className="badges-earned">
            <h3>Badges Earned</h3>
            <div className="badge-display">
              {progress.badges.map((badge, index) => (
                <div key={index} className="badge-icon" title={badge}>
                  🏆
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainMenu;
