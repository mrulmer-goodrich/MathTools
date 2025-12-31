// Header.jsx - UPDATED: "Exit Game" instead of "Back to Home"
// Location: src/algebra/components/Header.jsx 

import React from 'react';
import BadgeCollection from './BadgeCollection';
import '../styles/algebra.css';

const Header = ({ 
  onViewMap, 
  onViewStats, 
  onReturnToMenu,
  onExitGame,  // NEW: exits to website landing
  badges, 
  currentLevel 
}) => {
  return (
    <div className="algebra-header">
      <div className="header-left">
        {onExitGame && (
          <button className="btn-exit-game" onClick={onExitGame}>
            ← Exit Game
          </button>
        )}
      </div>
      
      <div className="header-center">
        <h1>Algebra Expedition</h1>
        {currentLevel && (
          <div className="current-level">Level {currentLevel}</div>
        )}
      </div>
      
      <div className="header-right">
        {badges && badges.length > 0 && (
          <BadgeCollection 
            completedLevels={[]} 
            isCompact={true}
            badges={badges}
          />
        )}
        
        {onViewStats && (
          <button className="btn-header-icon" onClick={onViewStats}>
            📊
          </button>
        )}
        
        {onViewMap && (
          <button className="btn-header-icon" onClick={onViewMap}>
            🗺️
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
