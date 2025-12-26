import React from 'react';

const MainMenu = ({ onStartPlay, onStartPractice, onViewMap, progress }) => {
  const getProgressPercentage = () => {
    const totalLevels = 31;
    const completed = progress.completedLevels.length;
    return Math.round((completed / totalLevels) * 100);
  };

  return (
    <div className="main-menu">
      <div className="menu-container">
        <div className="menu-header">
          <h1>Algebra Expedition</h1>
          <div className="progress-summary">
            <p>Expedition Progress: <strong>{getProgressPercentage()}%</strong> ({progress.completedLevels.length} / 31 levels)</p>
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
            Dr. Martinez's journal lies open before you. Her map shows three distinct regions. 
            You must master each challenge to progress deeper into the mountains.
          </p>
        </div>

        <div className="menu-options">
          <div className="menu-card play-mode" onClick={onStartPlay}>
            <div className="card-header">
              <h2>📍 Play Mode</h2>
              <span className="mode-badge">Sequential</span>
            </div>
            <p>
              Follow Dr. Martinez's path. Master each challenge to unlock the next. 
              Earn badges as you progress through the expedition.
            </p>
            <button className="btn-primary">Start Playing →</button>
          </div>

          <div className="menu-card practice-mode" onClick={onStartPractice}>
            <div className="card-header">
              <h2>🎯 Practice Mode</h2>
              <span className="mode-badge practice-badge">Free Practice</span>
            </div>
            <p>
              Review any level you've encountered. Practice without pressure. 
              Perfect for reinforcement and skill building.
            </p>
            <button className="btn-secondary">Practice Skills →</button>
          </div>
        </div>

        {progress.badges && progress.badges.length > 0 && (
          <div style={{textAlign: 'center', marginTop: '1rem'}}>
            <p style={{fontSize: '0.9rem', color: '#666'}}>
              <strong>Badges Earned:</strong> {progress.badges.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainMenu;
