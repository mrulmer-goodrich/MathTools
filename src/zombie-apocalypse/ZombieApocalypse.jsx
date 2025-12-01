// ZombieApocalypse.jsx v4.0 - THE COMPLETE VISION
import React, { useState, useEffect } from 'react';
import PersonalizationForm from './components/PersonalizationForm';
import IntroSequence from './components/IntroSequence';
import GameScreen from './components/GameScreen';
import LevelComplete from './components/LevelComplete';
import DeathScreen from './components/DeathScreen';
import VictoryScreen from './components/VictoryScreen';
import ZombieInterlude from './components/ZombieInterlude';
import './zombietheme.css';

const ZombieApocalypse = () => {
  const [gamePhase, setGamePhase] = useState('personalization');
  const [playerData, setPlayerData] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [hearts, setHearts] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [levelStartTime, setLevelStartTime] = useState(null);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [zombieThemeEnabled, setZombieThemeEnabled] = useState(true);
  
  const [moneyPot, setMoneyPot] = useState(100000);
  const [levelEarnings, setLevelEarnings] = useState(0);
  const [levelStartMoney, setLevelStartMoney] = useState(100000);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [levelPerfect, setLevelPerfect] = useState(true);

  // Scroll to top on phase/level change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [gamePhase, currentLevel]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setZombieThemeEnabled(prev => !prev);
      }
      if (e.ctrlKey && e.shiftKey && e.key === '7') {
        e.preventDefault();
        setCurrentLevel(7);
        setGamePhase('playing');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        setGamePhase('victory');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePersonalizationComplete = (data) => {
    setPlayerData(data);
    setGamePhase('intro');
  };

  const handleIntroComplete = () => {
    setGamePhase('playing');
    setGameStartTime(Date.now());
    setLevelStartTime(Date.now());
    setLevelStartMoney(moneyPot);
  };

  const handleSkipIntro = () => {
    handleIntroComplete();
  };

  const calculateMultiplier = (timeTaken) => {
    let multiplier = 1.0;
    const expectedTime = 60 + (currentLevel * 10);
    
    if (timeTaken < expectedTime * 0.25) multiplier *= 1.5;
    else if (timeTaken < expectedTime * 0.5) multiplier *= 1.25;
    
    if (levelPerfect) multiplier *= 2.0;
    if (correctStreak >= 3) multiplier *= 1.3;
    if (hearts === 1) multiplier *= 1.5;
    if (Math.random() < 0.1) multiplier *= 1.2;
    
    return multiplier;
  };

  const handleCorrectAnswer = () => {
    const tierRewards = {
      1: 500, 2: 500,
      3: 1000, 4: 1000,
      5: 2500, 6: 2500,
      7: 10000
    };
    
    const baseReward = tierRewards[currentLevel] || 500;
    const timeTaken = (Date.now() - levelStartTime) / 1000;
    const multiplier = calculateMultiplier(timeTaken);
    const finalReward = Math.floor(baseReward * multiplier);
    
    setMoneyPot(prev => prev + finalReward);
    setLevelEarnings(prev => prev + finalReward);
    setCorrectStreak(prev => prev + 1);
  };

  const handleWrongAnswer = () => {
    setHearts(prev => {
      const newHearts = prev - 1;
      if (newHearts <= 0) {
        setGamePhase('death');
      }
      return newHearts;
    });
    
    setMoneyPot(prev => Math.max(0, prev - 750));
    setLevelPerfect(false);
    setCorrectStreak(0);
  };

  const handleLevelComplete = () => {
    // Check if interlude should trigger
    if (currentLevel === 2 || currentLevel === 4) {
      setGamePhase('zombie-interlude');
    } else {
      setGamePhase('level-complete');
    }
  };

  const handleInterludeComplete = (earnedMoney) => {
    setMoneyPot(prev => prev + earnedMoney);
    setGamePhase('level-complete');
  };

  const handleContinueFromLevel = () => {
    if (currentLevel >= 7) {
      setGamePhase('victory');
    } else {
      setCurrentLevel(prev => prev + 1);
      setGamePhase('playing');
      setLevelStartTime(Date.now());
      setLevelStartMoney(moneyPot);
      setLevelEarnings(0);
      setLevelPerfect(true);
      setCorrectStreak(0);
    }
  };

  const handleDevJumpToLevel = (level) => {
    setCurrentLevel(level);
    setHearts(3);
    setGamePhase('playing');
    setLevelStartTime(Date.now());
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSceneClass = () => {
    if (currentLevel <= 2) return 'za-scene-classroom';
    if (currentLevel <= 4) return 'za-scene-cafeteria';
    if (currentLevel <= 6) return 'za-scene-lockers';
    return 'za-scene-classroom';
  };

  return (
    <div className={`za-app-root ${zombieThemeEnabled ? 'za-theme-enabled' : ''} ${getSceneClass()}`}>
      <a href="/" className="za-home-button">HOME</a>

      {gamePhase === 'playing' && (
        <>
          <div className="za-money-display">
            <div className="za-money-icon" />
            <div className="za-money-amount">${moneyPot.toLocaleString()}</div>
          </div>
          {zombieThemeEnabled && <div className="za-warning-light" />}
          {zombieThemeEnabled && <div className="za-zombie-walker" />}
        </>
      )}

      <div className="za-content-wrapper">
        {gamePhase === 'personalization' && (
          <PersonalizationForm onComplete={handlePersonalizationComplete} />
        )}

        {gamePhase === 'intro' && (
          <IntroSequence
            playerData={playerData}
            onComplete={handleIntroComplete}
            onSkip={handleSkipIntro}
          />
        )}

        {gamePhase === 'playing' && (
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
        )}

        {gamePhase === 'zombie-interlude' && (
          <ZombieInterlude
            playerData={playerData}
            onComplete={handleInterludeComplete}
          />
        )}

        {gamePhase === 'level-complete' && (
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
        )}

        {gamePhase === 'death' && (
          <DeathScreen currentLevel={currentLevel} playerData={playerData} />
        )}

        {gamePhase === 'victory' && (
          <VictoryScreen
            playerData={playerData}
            totalTime={gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0}
            formatTime={formatTime}
            finalMoney={moneyPot}
            onRestart={() => window.location.reload()}
          />
        )}
      </div>

      {zombieThemeEnabled && (
        <div className="za-theme-indicator">v4.0 | Ctrl+Shift+T</div>
      )}
    </div>
  );
};

export default ZombieApocalypse;
