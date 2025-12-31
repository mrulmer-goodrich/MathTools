// MainMenu.jsx - COMPLETE FIX (37 levels)
// Location: src/algebra/components/MainMenu.jsx

import React from 'react';
import '../styles/algebra.css';

const MainMenu = ({ onStartPlay, onStartPractice, onViewMap, progress }) => {
  const totalLevels = 37; // FIXED: Was 31
  const completedLevels = progress.completedLevels.length;
  const progressPercent = Math.round((completedLevels / totalLevels) * 100);

  return (
    <div className="main-menu">
      <div className="menu-container">
        <h1 className="menu-title">Algebra Expedition</h1>
        
        <div className="progress-summary">
          <h2>Expedition Progress: {progressPercent}%</h2>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="progress-text">
            {completedLevels} / {totalLevels} levels completed
          </p>
        </div>

        <div className="journal-teaser">
          <p>
            Dr. Martinez's journal lies open before you. Her map shows three distinct regions. 
            You must master each challenge to progress deeper into the mountains.
          </p>
        </div>

        <div className="menu-options">
          <div className="menu-card play-card">
            <div className="card-icon">📍</div>
            <h3>Play Mode</h3>
            <div className="mode-badge sequential">Sequential</div>
            <p>
              Follow Dr. Martinez's path. Master each challenge to unlock the next. 
              Earn badges as you progress through the expedition.
            </p>
            <button className="btn-start-play" onClick={onStartPlay}>
              Start Playing →
            </button>
          </div>

          <div className="menu-card practice-card">
            <div className="card-icon">🎯</div>
            <h3>Practice Mode</h3>
            <div className="mode-badge free-practice">Free Practice</div>
            <p>
              Review any level you've encountered. Practice without pressure. 
              Perfect for reinforcement and skill building.
            </p>
            <button className="btn-start-practice" onClick={onStartPractice}>
              Practice Skills →
            </button>
          </div>
        </div>

        {progress.badges && progress.badges.length > 0 && (
          <div className="badges-preview">
            <h3>Your Badges ({progress.badges.length})</h3>
            <div className="badges-list">
              {progress.badges.map((badge, index) => (
                <div key={index} className="badge-item">
                  {badge}
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
