// ModulePlayer.jsx - FIXED: Passes onLevelChange to LevelPlayer
// Location: src/algebra/components/ModulePlayer.jsx

import React, { useState, useEffect } from 'react';
import LevelPlayer from './LevelPlayer/LevelPlayer';
import levels from '../data/levelData';

const ModulePlayer = ({ 
  difficulty, 
  playMode, 
  currentModule, 
  progress,
  stats,
  setStats,
  onLevelComplete,
  onReturnToMenu,
  onSwitchToPlayMode,
  onLevelChange  // ADDED: Pass this down to LevelPlayer
}) => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    if (playMode === 'play') {
      const nextLevel = getNextUncompletedLevel();
      setSelectedLevel(nextLevel);
      // Update parent when level changes
      if (onLevelChange && nextLevel) {
        onLevelChange(nextLevel);
      }
    } else {
      setSelectedLevel(null);
    }
  }, [playMode, currentModule, progress.completedLevels]);

  const getNextUncompletedLevel = () => {
    // Get ALL levels (1-37)
    const allLevels = Object.keys(levels).sort((a, b) => {
      const aNum = parseInt(a.split('-')[1]);
      const bNum = parseInt(b.split('-')[1]);
      return aNum - bNum;
    });
    
    const uncompleted = allLevels.find(id => 
      !progress.completedLevels.includes(id)
    );
    
    return uncompleted || allLevels[0];
  };

  const handleLevelCompleteInternal = (levelId, badge) => {
    onLevelComplete(levelId, badge);
    
    if (playMode === 'play') {
      const nextLevel = getNextLevelAfter(levelId);
      if (nextLevel) {
        setTimeout(() => {
          setSelectedLevel(nextLevel);
          // Update parent when level advances
          if (onLevelChange) {
            onLevelChange(nextLevel);
          }
        }, 500);
      } else {
        onReturnToMenu();
      }
    } else {
      setSelectedLevel(null);
    }
  };

  const getNextLevelAfter = (currentLevelId) => {
    const allLevels = Object.keys(levels).sort((a, b) => {
      const aNum = parseInt(a.split('-')[1]);
      const bNum = parseInt(b.split('-')[1]);
      return aNum - bNum;
    });
    
    const currentIndex = allLevels.indexOf(currentLevelId);
    return allLevels[currentIndex + 1] || null;
  };

  if (playMode === 'practice') {
    // PRACTICE MODE: Show ALL 37 levels
    const allLevels = Object.keys(levels).sort((a, b) => {
      const aNum = parseInt(a.split('-')[1]);
      const bNum = parseInt(b.split('-')[1]);
      return aNum - bNum;
    });

    if (selectedLevel) {
      return (
        <div className="module-player">
          <LevelPlayer
            levelId={selectedLevel}
            difficulty={difficulty}
            playMode={playMode}
            stats={stats}
            setStats={setStats}
            onLevelComplete={handleLevelCompleteInternal}
            onReturnToMenu={() => setSelectedLevel(null)}
            onLevelChange={onLevelChange}  // PASS IT DOWN
          />
        </div>
      );
    }

    return (
      <div className="module-player">
        <div className="practice-selector">
          <h2>Practice Mode - Choose Any Level</h2>
          <p>All 37 levels available for practice (cheat code activated! 🎮)</p>
          
          <div className="practice-level-grid">
            {allLevels.map(levelId => {
              const level = levels[levelId];
              const isCompleted = progress.completedLevels.includes(levelId);
              
              return (
                <button
                  key={levelId}
                  className={`practice-level-card ${isCompleted ? 'completed' : 'not-completed'}`}
                  onClick={() => {
                    setSelectedLevel(levelId);
                    // Update parent when selecting practice level
                    if (onLevelChange) {
                      onLevelChange(levelId);
                    }
                  }}
                >
                  <div className="level-number">Level {levelId.split('-')[1]}</div>
                  <div className="level-name">{level.name}</div>
                  <div className="level-skill">{level.skill}</div>
                  {isCompleted && <div className="completed-badge">✓</div>}
                  {level.badge && (
                    <div className="badge-indicator">{level.badge}</div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="practice-mode-actions">
            {onSwitchToPlayMode && (
              <button className="btn-primary btn-large" onClick={onSwitchToPlayMode}>
                Continue Expedition →
              </button>
            )}
            <button className="btn-secondary" onClick={onReturnToMenu}>
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PLAY MODE
  if (!selectedLevel) {
    return (
      <div className="loading">
        <p>Loading level...</p>
      </div>
    );
  }

  return (
    <div className="module-player">
      <LevelPlayer
        levelId={selectedLevel}
        difficulty={difficulty}
        playMode={playMode}
        stats={stats}
        setStats={setStats}
        onLevelComplete={handleLevelCompleteInternal}
        onReturnToMenu={onReturnToMenu}
        onLevelChange={onLevelChange}  // PASS IT DOWN
      />
    </div>
  );
};

export default ModulePlayer;
