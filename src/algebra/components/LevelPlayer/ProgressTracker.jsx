// ProgressTracker.jsx - Enhanced with level and difficulty display
// Location: src/algebra/components/LevelPlayer/ProgressTracker.jsx

import React from 'react';
import '../../styles/algebra.css';

const ProgressTracker = ({ 
  current, 
  required,
  levelId = '',
  levelName = '',
  difficulty = 'easy'
}) => {
  // Format difficulty for display
  const difficultyDisplay = difficulty === 'easy' ? 'Standard Route' : 'Advanced Route';
  
  // Extract level number from levelId (e.g., "1-13" => "13")
  const levelNumber = levelId ? levelId.split('-')[1] : '';

  return (
    <div className="progress-tracker">
      <div className="progress-tracker-header">
        <div className="progress-tracker-info">
          <span className="progress-level-number">Level {levelNumber}</span>
          {levelName && <span className="progress-level-name">{levelName}</span>}
          <span className="progress-difficulty">{difficultyDisplay}</span>
        </div>
        <div className="progress-label">Correct in a Row: {current} / {required}</div>
      </div>
      <div className="progress-dots">
        {Array.from({ length: required }).map((_, index) => (
          <div
            key={index}
            className={`progress-dot ${index < current ? 'filled' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;
