import React, { useState, useEffect } from 'react';
import LevelPlayer from './LevelPlayer/LevelPlayer';
import levels from '../data/levelData';

const ModulePlayer = ({ 
  difficulty, 
  playMode, 
  currentModule, 
  currentLevel,
  progress,
  stats,
  setStats,
  onLevelComplete,
  onReturnToMenu 
}) => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    if (playMode === 'play') {
      // Auto-select next uncompleted level
      const nextLevel = getNextUncompletedLevel();
      setSelectedLevel(nextLevel);
    }
  }, [playMode, currentModule]);

  const getNextUncompletedLevel = () => {
    const moduleLevels = Object.keys(levels).filter(id => 
      id.startsWith(`${currentModule}-`)
    );
    
    const uncompleted = moduleLevels.find(id => 
      !progress.completedLevels.includes(id)
    );
    
    return uncompleted || moduleLevels[0];
  };

  if (playMode === 'practice') {
    return (
      <div className="module-player">
        <div className="practice-selector">
          <h2>Practice Mode - Select a Level</h2>
          <p>Choose any skill to practice:</p>
          
          {Object.keys(levels)
            .filter(id => id.startsWith(`${currentModule}-`))
            .map(levelId => {
              const level = levels[levelId];
              return (
                <div 
                  key={levelId}
                  className="practice-level-option"
                  onClick={() => setSelectedLevel(levelId)}
                >
                  <h3>{level.name}</h3>
                  <p>{level.skill}</p>
                  <code>{level.exampleProblem[difficulty]}</code>
                </div>
              );
            })}
          
          <button onClick={onReturnToMenu}>Back to Menu</button>
        </div>
      </div>
    );
  }

  if (!selectedLevel) {
    return (
      <div className="loading">
        <p>Loading level...</p>
      </div>
    );
  }

  // NO MODULE INTRO - go straight to level
  return (
    <div className="module-player">
      <LevelPlayer
        levelId={selectedLevel}
        difficulty={difficulty}
        playMode={playMode}
        stats={stats}
        setStats={setStats}
        onLevelComplete={onLevelComplete}
        onReturnToMenu={onReturnToMenu}
      />
    </div>
  );
};

export default ModulePlayer;
