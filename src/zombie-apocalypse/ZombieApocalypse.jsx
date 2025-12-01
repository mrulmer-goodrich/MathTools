//Version 3.4.1 CLEAN ROLLBACK
//Last Updated: December 1, 2025
//This is the STABLE version BEFORE zombie walker and warning light were added
//Use this for rollback if v4.0 has issues

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
  // -----------------------------
  // Core game state
  // -----------------------------
  const [gamePhase, setGamePhase] = useState('personalization'); 
  // phases: personalization, intro, playing, level-complete, death, victory

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
  const [hearts, setHearts] = useState(2); // can be wrong once per level
  const [levelStartTime, setLevelStartTime] = useState(Date.now());
  const [levelStats, setLevelStats] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [totalDeaths, setTotalDeaths] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);

  // -----------------------------
  // Minimal sound effects
  // -----------------------------
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioContext = new AudioCtx();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      switch (type) {
        case 'correct':
          oscillator.frequency.value = 800;
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.15);
          break;
        case 'wrong':
          oscillator.frequency.value = 200;
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
        case 'death':
          oscillator.frequency.value = 100;
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.5);
          break;
        default:
          break;
      }
    } catch (err) {
      // silent fail if audio not supported
    }
  };

  // -----------------------------
  // Handlers
  // -----------------------------
  const handlePersonalizationComplete = (data) => {
    setPlayerData(data);
    setGamePhase('intro');
  };

  const handleIntroComplete = () => {
    setGameStartTime(Date.now());
    setGamePhase('playing');
  };

  const handleSkipIntro = () => {
    setGameStartTime(Date.now());
    setGamePhase('playing');
  };

  const handleCorrectAnswer = (timeSpent) => {
    playSound('correct');
  };

  const handleWrongAnswer = () => {
    playSound('wrong');
    if (hearts > 0) {
      setHearts((prev) => prev - 1);
    } else {
      playSound('death');
      setTotalDeaths((prev) => prev + 1);
      setGamePhase('death');
    }
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

    if (!gameStartTime) {
      setGameStartTime(Date.now());
    }

    setCurrentLevel(level);
    setHearts(2);
    setLevelStartTime(Date.now());
    setGamePhase('playing');
  };

  const handleLevelComplete = (levelTime) => {
    // store level stats
    setLevelStats((prev) => ({
      ...prev,
      [currentLevel]: { time: levelTime }
    }));

    // if level 7, victory
    if (currentLevel === 7) {
      setGamePhase('victory');
    } else {
      // show Level Complete screen and wait for click
      setGamePhase('level-complete');
    }
  };

  const handleContinueFromLevel = () => {
    const nextLevel = Math.min(7, currentLevel + 1);
    setCurrentLevel(nextLevel);
    setHearts(2);
    setLevelStartTime(Date.now());
    setGamePhase('playing');
  };

  const formatTime = (seconds) => {
    const safe = Math.max(0, seconds || 0);
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // -----------------------------
  // DEV shortcuts (Ctrl+Shift+7, Ctrl+Shift+V)
  // -----------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.ctrlKey || !e.shiftKey) return;

      // Ctrl+Shift+7 => jump to Level 7
      if (e.key === '7' || e.key === '&') {
        e.preventDefault();
        handleDevJumpToLevel(7);
      }

      // Ctrl+Shift+V => jump directly to Victory
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();

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

        if (!gameStartTime) {
          setGameStartTime(Date.now());
        }

        setGamePhase('victory');
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [playerData, gameStartTime]);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="za-wrapper">
      <div className="za-game-container">
        {(() => {
          switch (gamePhase) {
            case 'personalization':
              return (
                <PersonalizationForm onComplete={handlePersonalizationComplete} />
              );

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
                  onToggleSound={() => setSoundEnabled((prev) => !prev)}
                  onCorrectAnswer={handleCorrectAnswer}
                  onWrongAnswer={handleWrongAnswer}
                  onLevelComplete={handleLevelComplete}
                  onDevJumpToLevel={handleDevJumpToLevel}
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
                  totalTime={
                    gameStartTime
                      ? Math.floor((Date.now() - gameStartTime) / 1000)
                      : 0
                  }
                  formatTime={formatTime}
                  onRestart={() => window.location.reload()}
                />
              );

            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
};

export default ZombieApocalypse;
