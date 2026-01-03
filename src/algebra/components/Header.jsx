// Header.jsx - FINAL REDESIGN
// Transparent, minimal, with level info on right
// Location: src/algebra/components/Header.jsx

import React from 'react';
import '../styles/algebra.css';

const Header = ({ 
  onReturnToMenu,
  currentLevel,
  levelName
}) => {
  return (
    <div className="algebra-header">
      <div className="header-left">
        <button className="btn-return-base" onClick={onReturnToMenu}>
          ← Return to Base Camp
        </button>
      </div>
      
      <div className="header-right">
        {currentLevel && levelName && (
          <div className="level-info-display">
            <div className="level-number">
              Level {typeof currentLevel === 'string' ? currentLevel.split('-')[1] : currentLevel}
            </div>
            <div className="level-name">
              {levelName}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
