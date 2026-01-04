// Algebra.jsx - ModulePlayer removed, direct LevelPlayer integration
import React, { useState, useEffect } from 'react';
import AvatarSelection from './components/AvatarSelection';
import StoryIntro from './components/StoryIntro';
import BaseCamp from './components/BaseCamp';
import PracticeMode from './components/PracticeMode';
import FloatingIcons from './components/FloatingIcons';
import LevelPlayer from './components/LevelPlayer/LevelPlayer';
import StatsPanel from './components/StatsPanel';
import MapDisplay from './components/MapDisplay';
import './styles/algebra.css';

const Algebra = () => {
  const [showAvatarSelection, setShowAvatarSelection] = useState(!localStorage.getItem('algebra_player_name'));
  const [showStory, setShowStory] = useState(!localStorage.getItem('algebra_story_seen'));
  const [gameState, setGameState] = useState('baseCamp');
  const [difficulty, setDifficulty] = useState(null);
  const [playMode, setPlayMode] = useState(null);
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
    artifacts: [],
    crystals: 0
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

  const handleLevelComplete = (levelId, artifact) => {
    setProgress(prev => ({
      ...prev,
      completedLevels: [...new Set([...prev.completedLevels, levelId])],
      artifacts: artifact ? [...new Set([...prev.artifacts, artifact])] : prev.artifacts
    }));

    if (playMode === 'play') {
      // Auto-advance to next level in play mode
      const nextLevel = getNextLevelAfter(levelId);
      if (nextLevel) {
        setTimeout(() => {
          setCurrentLevel(nextLevel);
          localStorage.setItem('algebra_current_level', nextLevel);
        }, 500);
      } else {
        // Completed all 37 levels!
        handleReturnToMenu();
      }
    } else {
      // Practice mode - return to practice grid
      setGameState('practice');
    }
  };

  const getNextLevelAfter = (currentLevelId) => {
    const currentNum = parseInt(currentLevelId.split('-')[1]);
    if (currentNum < 37) {
      return `1-${currentNum + 1}`;
    }
    return null;
  };

  const handleLevelChange = (newLevelId) => {
    setCurrentLevel(newLevelId);
    localStorage.setItem('algebra_current_level', newLevelId);
  };

  const handleProblemSolved = (crystalsEarned) => {
    setProgress(prev => ({
      ...prev,
      crystals: prev.crystals + crystalsEarned
    }));
  };

  if (showAvatarSelection) {
    return <AvatarSelection onComplete={handleAvatarComplete} />;
  }

  if (showStory) {
    return <StoryIntro onComplete={handleStoryComplete} />;
  }

  return (
    <div className="algebra-app">
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

      {gameState === 'playing' && currentLevel && (
        <LevelPlayer
          levelId={currentLevel}
          difficulty={difficulty}
          playMode={playMode}
          stats={stats}
          setStats={setStats}
          progress={progress}
          onLevelComplete={handleLevelComplete}
          onReturnToMenu={handleReturnToMenu}
          onProblemSolved={handleProblemSolved}
        />
      )}

      {!showAvatarSelection && !showStory && (
  <FloatingIcons
    onOpenStory={() => setShowStoryModal(true)}
    onOpenBadges={() => setShowBadges(true)}
    onOpenStats={handleViewStats}
    onOpenMap={handleViewMap}
    playerName={playerData.name}
    crystalCount={progress.crystals}
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
            maxWidth: '700px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ 
              fontFamily: 'Poppins, sans-serif', 
              marginBottom: '0.5rem',
              fontSize: '1.75rem',
              fontWeight: 700
            }}>
              {playerData.name}'s Collection
            </h2>
            
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '2rem' }}>💎</div>
              <div>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 700,
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {progress.crystals} Knowledge Crystals
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: '#6B7280',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Earned by solving problems
                </div>
              </div>
            </div>

            <h3 style={{ 
              fontFamily: 'Poppins, sans-serif', 
              marginBottom: '1rem',
              fontSize: '1.25rem',
              fontWeight: 700
            }}>
              Math Artifacts
            </h3>
            <p style={{ 
              fontFamily: 'Poppins, sans-serif', 
              marginBottom: '1.5rem',
              color: '#6B7280',
              fontSize: '0.875rem'
            }}>
              Ancient relics discovered by completing skill groups
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              {[
                { id: 'artifact-1', emoji: '🔢', name: 'Integer Compass' },
                { id: 'artifact-2', emoji: '📦', name: 'Distribution Lens' },
                { id: 'artifact-3', emoji: '🧮', name: 'Combining Crystal' },
                { id: 'artifact-4', emoji: '⛺', name: 'Summit Stone' },
                { id: 'artifact-5', emoji: '🌊', name: 'River Tablet' },
                { id: 'artifact-6', emoji: '⛰️', name: 'Mountain Seal' },
                { id: 'artifact-7', emoji: '🏔️', name: 'Peak Marker' },
                { id: 'artifact-8', emoji: '🗝️', name: 'Vault Key' },
                { id: 'artifact-9', emoji: '🏆', name: 'Ultimate Relic' },
                { id: 'artifact-10', emoji: '⚖️', name: 'Balance Scale' }
              ].map((artifact) => (
                <div key={artifact.id} style={{
                  background: progress.artifacts?.includes(artifact.id) ? '#F0FDF4' : '#F9FAFB',
                  border: `2px solid ${progress.artifacts?.includes(artifact.id) ? '#10B981' : '#E5E7EB'}`,
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  textAlign: 'center',
                  opacity: progress.artifacts?.includes(artifact.id) ? 1 : 0.4
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    {artifact.emoji}
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    fontFamily: 'Poppins, sans-serif',
                    color: '#1F2937'
                  }}>
                    {artifact.name}
                  </div>
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
