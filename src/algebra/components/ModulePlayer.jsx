import React, { useState, useEffect } from 'react';
import LevelPlayer from './LevelPlayer/LevelPlayer';
import levels, { storyline } from '../data/levelData';

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
  const [showModuleIntro, setShowModuleIntro] = useState(true);

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
          
          {/* Module selector would go here */}
          {Object.keys(levels)
            .filter(id => id.startsWith(`${currentModule}-`))
            .map(levelId => {
              const level = levels[levelId];
              return (
                <div 
                  key={levelId}
                  className="practice-level-option"
                  onClick={() => {
                    setSelectedLevel(levelId);
                    setShowModuleIntro(false);
                  }}
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

  if (showModuleIntro && storyline.modules[currentModule]) {
    return (
      <div className="module-intro">
        <div className="intro-container">
          <div className="journal-entry">
            <div className="journal-header">
              <h2>Module {currentModule}: {storyline.modules[currentModule].name}</h2>
            </div>
            <div className="journal-content">
              <p>{storyline.modules[currentModule].intro}</p>
            </div>
          </div>
          <button 
            className="btn-continue"
            onClick={() => setShowModuleIntro(false)}
          >
            Begin Module →
          </button>
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
