// ModulePlayer.jsx - UPDATED: Practice Mode shows ALL levels (no completion required)
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
  onAdvanceToNextLevel
}) => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    if (playMode === 'play') {
      const nextLevel = getNextUncompletedLevel();
      setSelectedLevel(nextLevel);
    } else {
      setSelectedLevel(null);
    }
  }, [playMode, currentModule, progress.completedLevels]);

  const getNextUncompletedLevel = () => {
    const moduleLevels = Object.keys(levels).filter(id => 
      id.startsWith(`${currentModule}-`)
    );
    
    const uncompleted = moduleLevels.find(id => 
      !progress.completedLevels.includes(id)
    );
    
    return uncompleted || moduleLevels[0];
  };

  const handleLevelCompleteInternal = (levelId, badge) => {
    onLevelComplete(levelId, badge);
    
    if (playMode === 'play') {
      const nextLevel = getNextLevelAfter(levelId);
      if (nextLevel) {
        setTimeout(() => {
          setSelectedLevel(nextLevel);
        }, 500);
      } else {
        onReturnToMenu();
      }
    } else {
      // In practice mode, return to level selection
      setSelectedLevel(null);
    }
  };

  const getNextLevelAfter = (currentLevelId) => {
    const allLevels = Object.keys(levels).filter(id => 
      id.startsWith(`${currentModule}-`)
    ).sort((a, b) => {
      const aNum = parseInt(a.split('-')[1]);
      const bNum = parseInt(b.split('-')[1]);
      return aNum - bNum;
    });
    
    const currentIndex = allLevels.indexOf(currentLevelId);
    return allLevels[currentIndex + 1] || null;
  };

  if (playMode === 'practice') {
    // PRACTICE MODE: Show ALL levels (no completion requirement!)
    const allLevelsInModule = Object.keys(levels)
      .filter(id => id.startsWith(`${currentModule}-`))
      .sort((a, b) => {
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
          />
        </div>
      );
    }

    return (
      <div className="module-player">
        <div className="practice-selector">
          <h2>Practice Mode - Choose Any Level</h2>
          <p>All levels available for practice (cheat code activated! 🎮)</p>
          
          <div className="practice-level-grid">
            {allLevelsInModule.map(levelId => {
              const level = levels[levelId];
              const isCompleted = progress.completedLevels.includes(levelId);
              
              return (
                <button
                  key={levelId}
                  className={`practice-level-card ${isCompleted ? 'completed' : 'not-completed'}`}
                  onClick={() => setSelectedLevel(levelId)}
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
          
          <button className="btn-secondary" onClick={onReturnToMenu}>
            Back to Menu
          </button>
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
      />
    </div>
  );
};

export default ModulePlayer;
