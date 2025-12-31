// Algebra.jsx - UPDATED: Add onSwitchToPlayMode handler
// Location: src/algebra/Algebra.jsx

import React, { useState, useEffect } from 'react';
import DifficultySelector from './components/DifficultySelector';
import MainMenu from './components/MainMenu';
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
  const [currentLevel, setCurrentLevel] = useState(1);
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
  };

  const handleStartPractice = () => {
    setPlayMode('practice');
    setGameState('playing');
  };

  const handleViewMap = () => {
    setGameState('map');
  };

  const handleViewStats = () => {
    setGameState('stats');
  };

  const handleReturnToMenu = () => {
    setGameState('menu');
    setPlayMode(null);
  };

  // NEW: Switch from practice to play mode
  const handleSwitchToPlayMode = () => {
    setPlayMode('play');
    // Stay in 'playing' state, just change mode
  };

  // NEW: Exit to website landing page
  const handleExitGame = () => {
    window.location.href = '/';  // Or wherever your landing page is
  };

  const handleLevelComplete = (levelId, badgeEarned) => {
    setProgress(prev => ({
      ...prev,
      completedLevels: [...new Set([...prev.completedLevels, levelId])],
      badges: badgeEarned ? [...new Set([...prev.badges, badgeEarned])] : prev.badges
    }));
  };

  return (
    <div className="algebra-app">
      {gameState !== 'difficulty' && (
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
        <DifficultySelector onSelect={handleDifficultySelect} />
      )}

      {gameState === 'menu' && (
        <MainMenu 
          onStartPlay={handleStartPlay}
          onStartPractice={handleStartPractice}
          onViewMap={handleViewMap}
          progress={progress}
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
          onReturnToMenu={handleReturnToMenu}
          onSwitchToPlayMode={handleSwitchToPlayMode}
        />
      )}

      {gameState === 'map' && (
        <MapDisplay 
          progress={progress}
          completedLevels={progress.completedLevels}
          currentLevel={currentLevel}
          onClose={() => setGameState('menu')}
        />
      )}

      {gameState === 'stats' && (
        <StatsPanel 
          stats={stats}
          progress={progress}
          onClose={() => setGameState(playMode ? 'playing' : 'menu')}
        />
      )}
    </div>
  );
};

export default Algebra;
