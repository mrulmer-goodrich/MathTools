import React, { useState, useEffect } from 'react';
import DifficultySelector from './components/DifficultySelector';
import MainMenu from './components/MainMenu';
import ModulePlayer from './components/ModulePlayer';
import Header from './components/Header';
import StatsPanel from './components/StatsPanel';
import MapDisplay from './components/MapDisplay';
import './styles/algebra.css';

const Algebra = () => {
  const [gameState, setGameState] = useState('difficulty'); // difficulty, menu, playing, map, stats
  const [difficulty, setDifficulty] = useState(null); // 'easy' or 'notEasy'
  const [playMode, setPlayMode] = useState(null); // 'play' or 'practice'
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

  // Load saved data from localStorage on mount
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

  // Save difficulty when set
  const handleDifficultySelect = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    localStorage.setItem('algebra_difficulty', selectedDifficulty);
    setGameState('menu');
  };

  // Save progress whenever it changes
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

  const handleLevelComplete = (levelId, badgeEarned) => {
    // Update progress
    setProgress(prev => ({
      ...prev,
      completedLevels: [...new Set([...prev.completedLevels, levelId])],
      badges: badgeEarned ? [...prev.badges, badgeEarned] : prev.badges
    }));

    // Check if module complete, unlock next
    const currentModuleLevels = getLevelsForModule(currentModule);
    const allComplete = currentModuleLevels.every(level => 
      [...progress.completedLevels, levelId].includes(level)
    );

    if (allComplete && currentModule < 3) {
      setProgress(prev => ({
        ...prev,
        unlockedModules: [...prev.unlockedModules, currentModule + 1]
      }));
    }
  };

  const getLevelsForModule = (moduleNum) => {
    if (moduleNum === 1) return Array.from({length: 15}, (_, i) => `1-${i + 1}`);
    if (moduleNum === 2) return Array.from({length: 10}, (_, i) => `2-${i + 1}`);
    if (moduleNum === 3) return Array.from({length: 6}, (_, i) => `3-${i + 1}`);
    return [];
  };

  return (
    <div className="algebra-app">
      {gameState !== 'difficulty' && (
        <Header 
          onViewMap={handleViewMap}
          onViewStats={handleViewStats}
          onReturnToMenu={handleReturnToMenu}
          badges={progress.badges}
          currentLevel={`${currentModule}-${currentLevel}`}
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
        />
      )}

      {gameState === 'map' && (
        <MapDisplay 
          progress={progress}
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
