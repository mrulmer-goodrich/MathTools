import React, { useState, useEffect } from 'react';
import { problemSets } from './problems';
import VaultGrid from './components/VaultGrid';
import CodeDisplay from './components/CodeDisplay';
import ProblemDisplay from './components/ProblemDisplay';
import VaultAnimation from './components/VaultAnimation';
import StatsScreen from './components/StatsScreen';
import './styles/vault.css';

const VaultHeist = () => {
  // Game state
  const [currentSet, setCurrentSet] = useState(1);
  const [currentProblem, setCurrentProblem] = useState(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [lockedDigits, setLockedDigits] = useState([]);
  const [alarmCount, setAlarmCount] = useState(0);
  const [vaultsCompleted, setVaultsCompleted] = useState([]);
  const [setStartTime, setSetStartTime] = useState(Date.now());
  const [setTimes, setSetTimes] = useState({});
  const [setAlarms, setSetAlarms] = useState({});
  const [showVaultAnimation, setShowVaultAnimation] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Get current set data
  const currentSetData = problemSets[`set${currentSet}`];
  const currentProblemData = currentSetData.problems[currentProblem - 1];
  const totalProblems = currentSetData.problems.length;

  // Sound effects (simple beep approach - can be replaced with actual sound files)
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
      case 'lock':
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'alarm':
        oscillator.frequency.value = 400;
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'vault':
        oscillator.frequency.value = 200;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      default:
        break;
    }
  };

  // Check if answer is correct
  const checkAnswer = () => {
    const problem = currentProblemData;
    let isCorrect = false;

    if (problem.acceptableAnswers) {
      isCorrect = problem.acceptableAnswers.some(answer => 
        userAnswer.trim().toLowerCase() === answer.toLowerCase()
      );
    } else {
      isCorrect = userAnswer.trim() === problem.correctAnswer;
    }

    if (isCorrect) {
      // Correct answer - lock the digit
      playSound('lock');
      setLockedDigits([...lockedDigits, currentProblem]);
      
      // Move to next problem or complete set
      if (currentProblem < totalProblems) {
        setCurrentProblem(currentProblem + 1);
        setUserAnswer('');
      } else {
        // Set complete!
        completeSet();
      }
    } else {
      // Wrong answer - trigger alarm
      playSound('alarm');
      const newAlarmCount = alarmCount + 1;
      setAlarmCount(newAlarmCount);
      
      // Flash red animation
      document.body.classList.add('alarm-flash');
      setTimeout(() => document.body.classList.remove('alarm-flash'), 300);
      
      if (newAlarmCount >= 3) {
        // Security lockdown - reset set
        setTimeout(() => {
          alert('SECURITY LOCKDOWN - Vault sealed. Starting over...');
          resetSet();
        }, 500);
      } else {
        // Just unlock last digit and retry
        const newLocked = lockedDigits.filter(d => d !== currentProblem);
        setLockedDigits(newLocked);
        setUserAnswer('');
      }
    }
  };

  const completeSet = () => {
    playSound('vault');
    const timeElapsed = Math.floor((Date.now() - setStartTime) / 1000);
    
    setSetTimes({
      ...setSetTimes,
      [currentSet]: timeElapsed
    });
    
    setSetAlarms({
      ...setSetAlarms,
      [currentSet]: alarmCount
    });
    
    setVaultsCompleted([...vaultsCompleted, currentSet]);
    setShowVaultAnimation(true);
    
    // After animation, move to next set or show completion
    setTimeout(() => {
      setShowVaultAnimation(false);
      
      if (currentSet < 6) {
        setCurrentSet(currentSet + 1);
        setCurrentProblem(1);
        setLockedDigits([]);
        setAlarmCount(0);
        setSetStartTime(Date.now());
        setUserAnswer('');
      } else {
        setGameComplete(true);
      }
    }, 3000);
  };

  const resetSet = () => {
    setCurrentProblem(1);
    setLockedDigits([]);
    setAlarmCount(0);
    setSetStartTime(Date.now());
    setUserAnswer('');
  };

  // Calculate elapsed time for current set
  const [currentTime, setCurrentTime] = useState(0);
  useEffect(() => {
    if (!showVaultAnimation && !gameComplete) {
      const interval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - setStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [setStartTime, showVaultAnimation, gameComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameComplete) {
    return (
      <StatsScreen 
        setTimes={setTimes}
        setAlarms={setAlarms}
        onRestart={() => window.location.reload()}
      />
    );
  }

  if (showVaultAnimation) {
    return (
      <VaultAnimation 
        vaultNumber={currentSet}
        time={setTimes[currentSet]}
      />
    );
  }

  return (
    <div className="vault-heist-container">
      {/* Header with vault progress */}
      <div className="game-header">
        <h1 className="game-title">VAULT HEIST</h1>
        <VaultGrid 
          currentSet={currentSet}
          vaultsCompleted={vaultsCompleted}
        />
      </div>

      {/* Main game area */}
      <div className="game-content">
        {/* Set title and description */}
        <div className="set-header">
          <h2 className="set-title">VAULT {currentSet}: {currentSetData.title}</h2>
          <p className="set-description">{currentSetData.description}</p>
        </div>

        {/* Code display - 10 spinning/locked digits */}
        <CodeDisplay 
          totalDigits={totalProblems}
          lockedDigits={lockedDigits}
        />

        {/* Progress bar */}
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(lockedDigits.length / totalProblems) * 100}%` }}
            />
          </div>
        </div>

        {/* Alarm indicators */}
        <div className="alarm-section">
          {[1, 2, 3].map(i => (
            <span 
              key={i} 
              className={`alarm-indicator ${i <= alarmCount ? 'triggered' : ''}`}
            >
              {i <= alarmCount ? '⚠️' : '○'}
            </span>
          ))}
          <span className="alarm-text">Security Alarms</span>
        </div>

        {/* Timer */}
        <div className="timer-section">
          <span className="timer-icon">⏱️</span>
          <span className="timer-text">{formatTime(currentTime)}</span>
        </div>

        {/* Problem display */}
        <ProblemDisplay 
          problem={currentProblemData}
          problemNumber={currentProblem}
          setType={currentSetData.type}
          userAnswer={userAnswer}
          onAnswerChange={setUserAnswer}
          onSubmit={checkAnswer}
        />
      </div>

      {/* Sound toggle */}
      <button 
        className="sound-toggle"
        onClick={() => setSoundEnabled(!soundEnabled)}
        title={soundEnabled ? "Mute sounds" : "Enable sounds"}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>
    </div>
  );
};

export default VaultHeist;
