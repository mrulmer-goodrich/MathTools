// ZombieApocalypse.jsx
// Version: 3.7 FINAL
// Last Updated: December 1, 2024
// Changes: Minimal containers, animated sprites integrated, floating money display, professional layout

import React, { useState, useEffect } from 'react';
import PersonalizationForm from './components/PersonalizationForm';
import IntroSequence from './components/IntroSequence';
import GameScreen from './components/GameScreen';
import VictoryScreen from './components/VictoryScreen';
import DeathScreen from './components/DeathScreen';
import LevelComplete from './components/LevelComplete';
import './styles/zombie.css';
import './styles/zombietheme.css';

const ZombieApocalypse = () => {
  // ============================================
  // THEME TOGGLE - Easy on/off for zombie visuals
  // ============================================
  const [zombieThemeEnabled, setZombieThemeEnabled] = useState(true);
  // Set to false to use original design, true for zombie atmosphere
  
  // ============================================
  // CORE GAME STATE
  // ============================================
  const [gamePhase, setGamePhase] = useState('personalization');
  const [playerData, setPlayerData] = useState({
    playerName: '',
    friendName: '',
    cityName: 'Charlotte, NC',
    favoriteColor: '',
    favoriteSubject: '',
    dreamJob: '',
    biggestFear: ''
  });

  const [currentLevel, setCurrentLevel] = useState(1);
  const [hearts, setHearts] = useState(2);
  const [levelStartTime, setLevelStartTime] = useState(Date.now());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameStartTime, setGameStartTime] = useState(null);

  // ============================================
  // MONEY SYSTEM
  // ============================================
  const [moneyPot, setMoneyPot] = useState(100000);
  const [levelEarnings, setLevelEarnings] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [levelPerfect, setLevelPerfect] = useState(true);

  // ============================================
  // SOUND EFFECTS
  // ============================================
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch(type) {
        case 'correct':
          oscillator.frequency.value = 800;
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
          break;
        case 'wrong':
          oscillator.frequency.value = 200;
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
        default:
          break;
      }
    } catch (err) {
      console.warn('Audio error:', err);
    }
  };

  // ============================================
  // PHASE HANDLERS
  // ============================================
  const handlePersonalizationComplete = (data) => {
    setPlayerData(data);
    setGamePhase('intro');
  };

  const handleIntroComplete = () => {
    setGamePhase('playing');
    setGameStartTime(Date.now());
    setLevelStartTime(Date.now());
  };

  const handleSkipIntro = () => {
    setGamePhase('playing');
    setGameStartTime(Date.now());
    setLevelStartTime(Date.now());
  };

  const handleCorrectAnswer = () => {
    playSound('correct');
    const basePay = currentLevel <= 2 ? 500 : currentLevel <= 4 ? 1000 : 2500;
    let multiplier = 1.0;
    
    // Streak bonus
    const newStreak = correctStreak + 1;
    setCorrectStreak(newStreak);
    if (newStreak >= 3) multiplier *= 1.3;
    
    // Clutch bonus
    if (hearts === 1) multiplier *= 1.5;
    
    // Lucky break
    if (Math.random() < 0.1) multiplier *= 1.2;
    
    const earned = Math.round(basePay * multiplier);
    setMoneyPot(prev => prev + earned);
    setLevelEarnings(prev => prev + earned);
  };

  const handleWrongAnswer = () => {
    playSound('wrong');
    setCorrectStreak(0);
    setLevelPerfect(false);
    setMoneyPot(prev => Math.max(0, prev - 750));
    
    const newHearts = hearts - 1;
    setHearts(newHearts);
    
    if (newHearts <= 0) {
      // Death - drop back a level
      setTimeout(() => {
        const newLevel = Math.max(1, currentLevel - 1);
        setMoneyPot(prev => Math.max(0, Math.floor(prev * 0.5))); // -50% penalty
        setCurrentLevel(newLevel);
        setHearts(2);
        setLevelStartTime(Date.now());
        setGamePhase('playing');
      }, 2000);
      setGamePhase('death');
    }
  };

  const handleLevelComplete = () => {
    // Apply multipliers
    if (levelPerfect) {
      const bonus = Math.round(levelEarnings * 1.0); // 2x total
      setMoneyPot(prev => prev + bonus);
    }
    
    // Level bonus
    const levelBonus = 500 * currentLevel;
    setMoneyPot(prev => prev + levelBonus);
    
    if (currentLevel === 7) {
      setGamePhase('victory');
    } else {
      setGamePhase('level-complete');
    }
  };

  const handleContinueFromLevel = () => {
    setCurrentLevel(prev => prev + 1);
    setHearts(2);
    setLevelStartTime(Date.now());
    setLevelEarnings(0);
    setCorrectStreak(0);
    setLevelPerfect(true);
    setGamePhase('playing');
  };

  const handleDevJumpToLevel = (level) => {
    if (!playerData.playerName) {
      setPlayerData({
        playerName: 'Test Player',
        friendName: 'Test Friend',
        cityName: 'Charlotte, NC',
        favoriteColor: 'Blue',
        favoriteSubject: 'Math',
        dreamJob: 'Developer',
        biggestFear: 'Bugs'
      });
    }
    if (!gameStartTime) setGameStartTime(Date.now());
    setCurrentLevel(level);
    setHearts(2);
    setLevelStartTime(Date.now());
    setGamePhase('playing');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================
  // DEV SHORTCUTS
  // ============================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === '7' || e.key === '&')) {
        e.preventDefault();
        handleDevJumpToLevel(7);
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'V' || e.key === 'v')) {
        e.preventDefault();
        if (!playerData.playerName) {
          setPlayerData({
            playerName: 'Test',
            friendName: 'Friend',
            cityName: 'Charlotte',
            favoriteColor: 'Blue',
            favoriteSubject: 'Math',
            dreamJob: 'Dev',
            biggestFear: 'Bugs'
          });
        }
        if (!gameStartTime) setGameStartTime(Date.now());
        setGamePhase('victory');
      }
      // Toggle theme: Ctrl+Shift+T
      if (e.ctrlKey && e.shiftKey && (e.key === 'T' || e.key === 't')) {
        e.preventDefault();
        setZombieThemeEnabled(prev => !prev);
        console.log('🎨 Theme toggled:', !zombieThemeEnabled ? 'ZOMBIE' : 'ORIGINAL');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [playerData, gameStartTime, zombieThemeEnabled]);

  // ============================================
  // SCENE SELECTION (based on level)
  // ============================================
  const getSceneClass = () => {
    if (currentLevel <= 2) return 'za-scene-classroom';
    if (currentLevel <= 4) return 'za-scene-cafeteria';
    if (currentLevel <= 6) return 'za-scene-lockers';
    return 'za-scene-classroom'; // Level 7 back to classroom
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={`za-app-root ${zombieThemeEnabled ? 'za-theme-enabled' : ''} ${getSceneClass()}`}>
      {/* HOME BUTTON */}
      <a href="/" className="za-home-button" title="Return to Home">
        HOME
      </a>

      {/* MONEY DISPLAY - Always visible in game */}
      {gamePhase === 'playing' && (
        <div className="za-money-display">
          <div className="za-money-icon" />
          <div className="za-money-amount">${moneyPot.toLocaleString()}</div>
        </div>
      )}

      {/* ANIMATED WARNING LIGHT - Top right */}
      {zombieThemeEnabled && gamePhase === 'playing' && (
        <div className="za-warning-light" />
      )}

      {/* ZOMBIE WALKER - Bottom animated */}
      {zombieThemeEnabled && gamePhase === 'playing' && (
        <div className="za-zombie-walker" />
      )}

      {/* Content wrapper */}
      <div className="za-content-wrapper">
        {(() => {
          switch(gamePhase) {
            case 'personalization':
              return <PersonalizationForm onComplete={handlePersonalizationComplete} />;
            
            case 'intro':
              return (
                <IntroSequence
                  playerData={playerData}
                  onComplete={handleIntroComplete}
                  onSkip={handleSkipIntro}
                />
              );
            
            case 'playing':
              return (
                <GameScreen
                  playerData={playerData}
                  currentLevel={currentLevel}
                  hearts={hearts}
                  soundEnabled={soundEnabled}
                  onToggleSound={() => setSoundEnabled(prev => !prev)}
                  onCorrectAnswer={handleCorrectAnswer}
                  onWrongAnswer={handleWrongAnswer}
                  onLevelComplete={handleLevelComplete}
                  levelStartTime={levelStartTime}
                  formatTime={formatTime}
                  onDevJumpToLevel={handleDevJumpToLevel}
                  moneyPot={moneyPot}
                />
              );
            
            case 'level-complete':
              return (
                <div onClick={handleContinueFromLevel}>
                  <LevelComplete
                    level={currentLevel}
                    playerData={playerData}
                    time={Math.floor((Date.now() - levelStartTime) / 1000)}
                    formatTime={formatTime}
                    moneyEarned={levelEarnings}
                    totalPot={moneyPot}
                  />
                </div>
              );
            
            case 'death':
              return (
                <DeathScreen
                  currentLevel={currentLevel}
                  playerData={playerData}
                />
              );
            
            case 'victory':
              return (
                <VictoryScreen
                  playerData={playerData}
                  totalTime={gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0}
                  formatTime={formatTime}
                  finalMoney={moneyPot}
                  onRestart={() => window.location.reload()}
                />
              );
            
            default:
              return null;
          }
        })()}
      </div>

      {/* Dev indicator */}
      {zombieThemeEnabled && (
        <div className="za-theme-indicator">
          v3.7 | Ctrl+Shift+T
        </div>
      )}
    </div>
  );
};

export default ZombieApocalypse;
