import React from 'react';

const Header = ({ onViewMap, onViewStats, onReturnToMenu, badges, currentLevel }) => {
  return (
    <div className="algebra-header">
      <div className="header-left">
        <h1 className="app-title">Algebra Expedition</h1>
        {currentLevel && (
          <span className="current-level">Level {currentLevel}</span>
        )}
      </div>

      <div className="header-center">
        {badges && badges.length > 0 && (
          <div className="header-badges">
            {badges.map((badge, index) => (
              <span key={index} className="badge-mini" title={badge}>
                🏆
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="header-right">
        <button className="header-btn" onClick={onViewMap} title="View Map">
          🗺️
        </button>
        <button className="header-btn" onClick={onViewStats} title="View Stats">
          📊
        </button>
        <button className="header-btn" onClick={onReturnToMenu} title="Menu">
          🏠
        </button>
      </div>
    </div>
  );
};

export default Header;
