// Algebra.jsx - Main orchestrator with avatar, story, base camp
// Location: src/algebra/Algebra.jsx

import React, { useState, useEffect } from 'react';
import AvatarSelection from './components/AvatarSelection';
import StoryIntro from './components/StoryIntro';  // ← ADD THIS LINE
import BaseCamp from './components/BaseCamp';
import ModulePlayer from './components/ModulePlayer';
import Header from './components/Header';
import StatsPanel from './components/StatsPanel';
import MapDisplay from './components/MapDisplay';
import './styles/algebra.css';

const Algebra = () => {
  const [showAvatarSelection, setShowAvatarSelection] = useState(!localStorage.getItem('algebra_player_name'));
  const [showStory, setShowStory] = useState(!localStorage.getItem('algebra_story_seen'));  // ← ADD THIS LINE
  const [gameState, setGameState] = useState('baseCamp');
  const [difficulty, setDifficulty] = useState(null);
  const [playMode, setPlayMode] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [playerData, setPlayerData] = useState({
    name: localStorage.getItem('algebra_player_name') || '',
    avatar: localStorage.getItem('algebra_player_avatar') || null
  });
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
    const savedLevel = localStorage.getItem('algebra_current_level');
    
    if (savedDifficulty) {
      setDifficulty(savedDifficulty);
    }
    
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }

    if (savedLevel) {
      setCurrentLevel(savedLevel);
    }
  }, []);

  useEffect(() => {
    if (progress.completedLevels.length > 0) {
      localStorage.setItem('algebra_progress', JSON.stringify(progress));
    }
  }, [progress]);

  const handleAvatarComplete = (data) => {
    setPlayerData(data);
    setShowAvatarSelection(false);
  };

  // ← ADD THIS FUNCTION
  const handleStoryComplete = () => {
    localStorage.setItem('algebra_story_seen', 'true');
    setShowStory(false);
  };

  const handleStartGame = (selectedDifficulty, isContinue = false) => {
    if (!isContinue) {
      // Starting new game - clear progress
      setDifficulty(selectedDifficulty);
      localStorage.setItem('algebra_difficulty', selectedDifficulty);
      localStorage.removeItem('algebra_current_level');
      setCurrentLevel(null);
    }
    
    setPlayMode('play');
    setGameState('playing');
    const firstIncomplete = getFirstIncompleteLevel();
    setCurrentLevel(firstIncomplete);
    localStorage.setItem('algebra_current_level', firstIncomplete);
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
    setGameState('baseCamp');
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
    localStorage.setItem('algebra_current_level', newLevelId);
  };

  if (showAvatarSelection) {
    return <AvatarSelection onComplete={handleAvatarComplete} />;
  }

  // ← ADD THIS BLOCK
  if (showStory) {
    return <StoryIntro onComplete={handleStoryComplete} />;
  }

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
          playerName={playerData.name}
          playerAvatar={playerData.avatar}
        />
      )}

      {gameState === 'baseCamp' && (
        <BaseCamp
          onStartGame={handleStartGame}
          onPracticeMode={handleStartPractice}
          onExitGame={handleExitGame}
          sessionData={{
            hasSession: !!currentLevel && !!difficulty,
            currentLevel: currentLevel || getFirstIncompleteLevel(),
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
          playerName={playerData.name}
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
          playerName={playerData.name}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
};

export default Algebra;
