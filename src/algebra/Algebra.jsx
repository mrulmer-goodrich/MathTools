// Algebra.jsx - Main orchestrator
import React, { useState, useEffect } from 'react';
import AvatarSelection from './components/AvatarSelection';
import StoryIntro from './components/StoryIntro';
import BaseCamp from './components/BaseCamp';
import PracticeMode from './components/PracticeMode';
import FloatingIcons from './components/FloatingIcons';
import ModulePlayer from './components/ModulePlayer';
import Header from './components/Header';
import StatsPanel from './components/StatsPanel';
import MapDisplay from './components/MapDisplay';
import './styles/algebra.css';

const Algebra = () => {
  const [showAvatarSelection, setShowAvatarSelection] = useState(!localStorage.getItem('algebra_player_name'));
  const [showStory, setShowStory] = useState(!localStorage.getItem('algebra_story_seen'));
  const [gameState, setGameState] = useState('baseCamp');
  const [difficulty, setDifficulty] = useState(null);
  const [playMode, setPlayMode] = useState(null);
  const [currentModule, setCurrentModule] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
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

  const handleStoryComplete = () => {
    localStorage.setItem('algebra_story_seen', 'true');
    setShowStory(false);
  };

  const handleStartGame = (selectedDifficulty, isContinue = false) => {
    if (!isContinue) {
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
    setGameState('practice');
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

      {gameState === 'practice' && (
        <PracticeMode
          onSelectLevel={(levelId) => {
            setPlayMode('practice');
            setCurrentLevel(levelId);
            setGameState('playing');
          }}
          onBackToBaseCamp={() => setGameState('baseCamp')}
          completedLevels={progress.completedLevels}
          playerName={playerData.name}
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

      {!showAvatarSelection && !showStory && (
        <FloatingIcons
          onOpenStory={() => setShowStoryModal(true)}
          onOpenBadges={() => setShowBadges(true)}
          onOpenStats={handleViewStats}
          onOpenMap={handleViewMap}
          playerName={playerData.name}
        />
      )}

      {showStoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <StoryIntro onComplete={() => setShowStoryModal(false)} />
          </div>
        </div>
      )}

      {showBadges && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setShowBadges(false)}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ 
              fontFamily: 'Poppins, sans-serif', 
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: 700
            }}>
              {playerData.name}'s Badges
            </h2>
            <p style={{ fontFamily: 'Poppins, sans-serif', marginBottom: '1.5rem' }}>
              Earn badges by completing skill groups!
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              {['🔢', '📦', '🧮', '⛺', '🌊', '⛰️', '🏔️', '🗝️', '🏆', '⚖️'].map((badge, i) => (
                <div key={i} style={{
                  fontSize: '3rem',
                  textAlign: 'center',
                  opacity: progress.badges?.includes(`badge-${i+1}`) ? 1 : 0.3,
                  filter: progress.badges?.includes(`badge-${i+1}`) ? 'none' : 'grayscale(100%)'
                }}>
                  {badge}
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowBadges(false)}
              className="base-camp-tile-button"
              style={{ width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
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
