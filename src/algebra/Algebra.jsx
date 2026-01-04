// Algebra.jsx - COMPLETE with new components
// Location: src/algebra/Algebra.jsx

import React, { useState, useEffect } from 'react';
import DifficultySelector from './components/DifficultySelector';
import BaseCamp from './components/BaseCamp';
import ModulePlayer from './components/ModulePlayer';
import Header from './components/Header';
import StatsPanel from './components/StatsPanel';
import MapDisplay from './components/MapDisplay';
import './styles/algebra.css';

const Algebra = () => {
  const [gameState, setGameState] = useState('difficulty');
  const [difficulty, setDifficulty] = useState(null);
  const [playMode, setPlayMode] = useState(null);
  const [currentModule, setCurrentModule] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [progress, setProgress] = useState({
    completedLevels: [],
    badges: [],
    unlockedModules: [1]
  });
  const [stats, setStats] = useState({
    sessionStart: Date.now(),
    problemsAttempted: 0,
    problemsCorrect: 0,
    currentStreak: 0,
    skillBreakdown: {}
  });

  useEffect(() => {
    const savedDifficulty = localStorage.getItem('algebra_difficulty');
    const savedProgress = localStorage.getItem('algebra_progress');
    
    if (savedDifficulty) {
      setDifficulty(savedDifficulty);
      setGameState('menu');
    }
    
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  const handleDifficultySelect = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    localStorage.setItem('algebra_difficulty', selectedDifficulty);
    setGameState('menu');
  };

  useEffect(() => {
    if (progress.completedLevels.length > 0) {
      localStorage.setItem('algebra_progress', JSON.stringify(progress));
    }
  }, [progress]);

  const handleStartPlay = () => {
    setPlayMode('play');
    setGameState('playing');
    const firstIncomplete = getFirstIncompleteLevel();
    setCurrentLevel(firstIncomplete);
  };

  const handleStartPractice = () => {
    setPlayMode('practice');
    setGameState('playing');
    setCurrentLevel(null);
  };

  const handleViewMap = () => {
    setShowMap(true);
  };

  const handleViewStats = () => {
    setShowStats(true);
  };

  const handleReturnToMenu = () => {
    setGameState('menu');
    setPlayMode(null);
    setCurrentLevel(null);
  };

  const handleSwitchToPlayMode = () => {
    setPlayMode('play');
    const firstIncomplete = getFirstIncompleteLevel();
    setCurrentLevel(firstIncomplete);
  };

  const handleExitGame = () => {
    if (window.confirm('Are you sure you want to exit the game?')) {
      window.location.href = '/';
    }
  };

  const getFirstIncompleteLevel = () => {
    for (let i = 1; i <= 37; i++) {
      const levelId = `1-${i}`;
      if (!progress.completedLevels.includes(levelId)) {
        return levelId;
      }
    }
    return '1-1';
  };

  const handleLevelComplete = (levelId, badgeEarned) => {
    setProgress(prev => ({
      ...prev,
      completedLevels: [...new Set([...prev.completedLevels, levelId])],
      badges: badgeEarned ? [...new Set([...prev.badges, badgeEarned])] : prev.badges
    }));
  };

  const handleLevelChange = (newLevelId) => {
    setCurrentLevel(newLevelId);
  };

  return (
    <div className="algebra-app">
      {gameState === 'playing' && (
        <Header 
          onViewMap={handleViewMap}
          onViewStats={handleViewStats}
          onReturnToMenu={handleReturnToMenu}
          onExitGame={handleExitGame}
          badges={progress.badges}
          currentLevel={currentLevel}
        />
      )}

      {gameState === 'difficulty' && (
        <DifficultySelection onSelectDifficulty={handleDifficultySelect} />
      )}

      {gameState === 'menu' && (
        <BaseCamp
          onStartGame={handleStartPlay}
          onContinueGame={handleStartPlay}
          onPracticeMode={handleStartPractice}
          onExitGame={handleExitGame}
          sessionData={{
            hasSession: progress.completedLevels.length > 0,
            currentLevel: getFirstIncompleteLevel(),
            difficulty: difficulty,
            levelsCompleted: progress.completedLevels.length
          }}
        />
      )}

      {gameState === 'playing' && (
        <ModulePlayer
          difficulty={difficulty}
          playMode={playMode}
          currentModule={currentModule}
          currentLevel={currentLevel}
          progress={progress}
          stats={stats}
          setStats={setStats}
          onLevelComplete={handleLevelComplete}
          onLevelChange={handleLevelChange}
          onReturnToMenu={handleReturnToMenu}
          onSwitchToPlayMode={handleSwitchToPlayMode}
        />
      )}

      {showMap && (
        <MapDisplay 
          progress={progress}
          completedLevels={progress.completedLevels}
          currentLevel={currentLevel}
          onClose={() => setShowMap(false)}
        />
      )}

      {showStats && (
        <StatsPanel 
          stats={stats}
          progress={progress}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
};

export default Algebra;
