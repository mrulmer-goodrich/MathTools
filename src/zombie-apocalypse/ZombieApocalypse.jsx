//Version 3.4.1
//Last Updated: December 1, 2025
//Changes: Rebuilt full component (no ellipses), scoped visuals via .za-wrapper,
//         added local fog layers, kept original game state & flow intact.

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

      const now = audioContext.currentTime;

      switch (type) {
        case 'correct':
          oscillator.frequency.value = 800;
          gainNode.gain.setValueAtTime(0.25, now);
          oscillator.start();
          oscillator.stop(now + 0.15);
          break;
        case 'wrong':
          oscillator.frequency.value = 220;
          gainNode.gain.setValueAtTime(0.4, now);
          oscillator.start();
          oscillator.stop(now + 0.35);
          break;
        case 'death':
          oscillator.frequency.value = 160;
          gainNode.gain.setValueAtTime(0.55, now);
          oscillator.start();
          oscillator.stop(now + 0.7);
          break;
        case 'level-complete':
          oscillator.frequency.value = 980;
          gainNode.gain.setValueAtTime(0.35, now);
          oscillator.start();
          oscillator.stop(now + 0.5);
          break;
        case 'victory':
          oscillator.frequency.value = 1200;
          gainNode.gain.setValueAtTime(0.45, now);
          oscillator.start();
          oscillator.stop(now + 0.9);
          break;
        default:
          oscillator.frequency.value = 600;
          gainNode.gain.setValueAtTime(0.2, now);
          oscillator.start();
          oscillator.stop(now + 0.1);
          break;
      }
    } catch (err) {
      // fail silently if AudioContext is blocked or unavailable
      console.warn('ZombieApocalypse sound error:', err);
    }
  };

  // -----------------------------
  // Phase handlers
  // -----------------------------
  const handlePersonalizationComplete = (data) => {
    setPlayerData(data);
    setGamePhase('intro');
  };

  const handleIntroComplete = () => {
    const now = Date.now();
    setGamePhase('playing');
    setGameStartTime(now);
    setLevelStartTime(now);
  };

  const handleSkipIntro = () => {
    const now = Date.now();
    setGamePhase('playing');
    setGameStartTime(now);
    setLevelStartTime(now);
  };

  // Dev: jump directly to a level
  const handleDevJumpToLevel = (level) => {
    const safeLevel = Math.max(1, Math.min(7, level || 1));
    console.log(`🎮 DEV: Jumping to Level ${safeLevel}`);

    // ensure we have some player data
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

    setCurrentLevel(safeLevel);
    setHearts(2);
    setLevelStartTime(Date.now());
    setGamePhase('playing');
  };

  const handleCorrectAnswer = () => {
    playSound('correct');
  };

  const handleWrongAnswer = () => {
    playSound('wrong');

    // brief global flash (ZA only; class removed quickly)
    document.body.classList.add('za-wrong-flash');
    setTimeout(() => {
      document.body.classList.remove('za-wrong-flash');
    }, 280);

    const nextHearts = hearts - 1;
    setHearts(nextHearts);

    if (nextHearts <= 0) {
      // death: lose a level, then restart after a short delay
      playSound('death');
      setTotalDeaths((prev) => prev + 1);
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

  const handleLevelComplete = () => {
    playSound('level-complete');
    const elapsedSeconds = Math.floor((Date.now() - levelStartTime) / 1000);

    setLevelStats((prev) => ({
      ...prev,
      [currentLevel]: {
        time: elapsedSeconds,
        hearts
      }
    }));

    if (currentLevel === 7) {
      // final victory
      playSound('victory');
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
  // Render by phase
  // -----------------------------
  return (
    <div className="za-wrapper scene-classroom">
      {/* ZA-only fog strips; do not block clicks or scroll */}
      <div className="fog-layer fog-top" aria-hidden="true" />
      <div className="fog-layer fog-mid" aria-hidden="true" />
      <div className="fog-layer fog-bottom" aria-hidden="true" />

      <div className="za-root">
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
