//Update 1

import React, { useState, useEffect } from 'react';
import PersonalizationForm from './components/PersonalizationForm';
import IntroSequence from './components/IntroSequence';
import GameScreen from './components/GameScreen';
import VictoryScreen from './components/VictoryScreen';
import DeathScreen from './components/DeathScreen';
import LevelComplete from './components/LevelComplete';
import './styles/zombie.css';

const ZombieApocalypse = () => {
  // Game state management
  const [gamePhase, setGamePhase] = useState('personalization'); // personalization, intro, playing, level-complete, death, victory
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
  const [hearts, setHearts] = useState(2); // Can be wrong once per level
  const [levelStartTime, setLevelStartTime] = useState(Date.now());
  const [levelStats, setLevelStats] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [totalDeaths, setTotalDeaths] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);

  // Sound effect player (based on VaultHeist pattern)
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
      case 'correct':
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
      case 'wrong':
        oscillator.frequency.value = 200;
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.4);
        break;
      case 'death':
        oscillator.frequency.value = 150;
        gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.8);
        break;
      case 'level-complete':
        oscillator.frequency.value = 1000;
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.6);
        break;
      case 'victory':
        // Epic victory fanfare
        oscillator.frequency.value = 1200;
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1.0);
        break;
      default:
        break;
    }
  };

  // Handle personalization complete
  const handlePersonalizationComplete = (data) => {
    setPlayerData(data);
    setGamePhase('intro');
  };

  // Handle intro complete
  const handleIntroComplete = () => {
    setGamePhase('playing');
    setGameStartTime(Date.now());
    setLevelStartTime(Date.now());
  };

  // Skip intro
  const handleSkipIntro = () => {
    setGamePhase('playing');
    setGameStartTime(Date.now());
    setLevelStartTime(Date.now());
  };

  // Handle correct answer
  const handleCorrectAnswer = () => {
    playSound('correct');
  };

  // Handle wrong answer
  const handleWrongAnswer = () => {
    playSound('wrong');
    
    // Flash screen red
    document.body.classList.add('za-wrong-flash');
    setTimeout(() => document.body.classList.remove('za-wrong-flash'), 300);
    
    const newHearts = hearts - 1;
    setHearts(newHearts);
    
    if (newHearts <= 0) {
      // Death - go back a level
      playSound('death');
      setTotalDeaths(totalDeaths + 1);
      setGamePhase('death');
      
      setTimeout(() => {
        const newLevel = Math.max(1, currentLevel - 1);
        setCurrentLevel(newLevel);
        setHearts(2);
        setLevelStartTime(Date.now());
        setGamePhase('playing');
      }, 4000);
    }
  };

  // Handle level complete
  const handleLevelComplete = () => {
    playSound('level-complete');
    
    const timeElapsed = Math.floor((Date.now() - levelStartTime) / 1000);
    setLevelStats({
      ...levelStats,
      [currentLevel]: {
        time: timeElapsed,
        hearts: hearts
      }
    });
    
    if (currentLevel === 7) {
      // VICTORY!
      playSound('victory');
      setGamePhase('victory');
    } else {
      setGamePhase('level-complete');
      // NO auto-advance - wait for click
    }
  };

  // Handle click to continue from level-complete screen
  const handleContinueFromLevel = () => {
    setCurrentLevel(currentLevel + 1);
    setHearts(2);
    setLevelStartTime(Date.now());
    setGamePhase('playing');
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render based on game phase
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
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onCorrectAnswer={handleCorrectAnswer}
          onWrongAnswer={handleWrongAnswer}
          onLevelComplete={handleLevelComplete}
          levelStartTime={levelStartTime}
          formatTime={formatTime}
        />
      );
    
    case 'level-complete':
      return (
        <div onClick={handleContinueFromLevel}>
          <LevelComplete
            level={currentLevel}
            playerData={playerData}
            time={levelStats[currentLevel]?.time || 0}
            formatTime={formatTime}
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
          levelStats={levelStats}
          totalDeaths={totalDeaths}
          totalTime={Math.floor((Date.now() - gameStartTime) / 1000)}
          formatTime={formatTime}
          onRestart={() => window.location.reload()}
        />
      );
    
    default:
      return null;
  }
};

export default ZombieApocalypse;
