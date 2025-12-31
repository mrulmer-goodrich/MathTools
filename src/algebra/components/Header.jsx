// Header.jsx - COMPLETE FIX
// Location: src/algebra/components/Header.jsx

import React from 'react';
import BadgeCollection from './BadgeCollection';
import '../styles/algebra.css';

const Header = ({ 
  onViewMap, 
  onViewStats, 
  onReturnToMenu,
  onExitGame,
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
          <div className="current-level-display">
            Level {typeof currentLevel === 'string' ? currentLevel.split('-')[1] : currentLevel}
          </div>
        )}
      </div>
      
      <div className="header-right">
        {/* Badge Collection - Always Visible */}
        <BadgeCollection 
          completedLevels={[]} 
          isCompact={true}
          badges={badges || []}
        />
        
        {/* Stats Button */}
        {onViewStats && (
          <button 
            className="btn-header-icon" 
            onClick={onViewStats}
            title="View Statistics"
          >
            📊
          </button>
        )}
        
        {/* Map Button */}
        {onViewMap && (
          <button 
            className="btn-header-icon" 
            onClick={onViewMap}
            title="View Map"
          >
            🗺️
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
