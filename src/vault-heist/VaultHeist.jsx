import React, { useState, useEffect } from 'react';
import { problemSets } from './problems'; 
import VaultGrid from './components/VaultGrid';
import CodeDisplay from './components/CodeDisplay';
import ProblemDisplay from './components/ProblemDisplay';
import VaultAnimation from './components/VaultAnimation';
import StatsScreen from './components/StatsScreen';
import MissionBriefing from './components/MissionBriefing';
import './styles/vault.css';
import VaultCodeStorage from './components/VaultCodeStorage';


const VaultHeist = () => {
  const [showBriefing, setShowBriefing] = useState(true);
  const [gameState, setGameState] = useState('playing');
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
  const [shuffledChoicesMap, setShuffledChoicesMap] = useState({});
  const [unlockedCodes, setUnlockedCodes] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  });
  const [showInGameStats, setShowInGameStats] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Get current set data
  const currentSetData = problemSets[`set${currentSet}`];
  const currentProblemData = currentSetData?.problems[currentProblem - 1];
  const totalProblems = currentSetData?.problems.length || 0;

  // Shuffle choices for a problem and store the mapping
  const getShuffledChoices = (setNum, problemNum, choices, correctAnswer) => {
    const key = `${setNum}-${problemNum}`;
    
    if (shuffledChoicesMap[key]) {
      return shuffledChoicesMap[key];
    }
    
    if (!choices || choices.length === 0) {
      return null;
    }
    
    const shuffled = [...choices];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const newMap = {
      ...shuffledChoicesMap,
      [key]: shuffled
    };
    setShuffledChoicesMap(newMap);
    
    return shuffled;
  };

  // Get shuffled choices for current problem
  const currentShuffledChoices = currentProblemData?.choices 
    ? getShuffledChoices(
        currentSet, 
        currentProblem, 
        currentProblemData.choices, 
        currentProblemData.correctAnswer
      )
    : null;

  // Timer effect
  useEffect(() => {
    if (!showVaultAnimation && !gameComplete && !showBriefing) {
      const interval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - setStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [setStartTime, showVaultAnimation, gameComplete, showBriefing]);

  const handleAcceptMission = () => {
    setShowBriefing(false);
    setSetStartTime(Date.now());
  };

  const handleSkipBriefing = () => {
    setShowBriefing(false);
    setSetStartTime(Date.now());
  };

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
      playSound('lock');
      setLockedDigits([...lockedDigits, currentProblem]);
      
      if (currentProblem < totalProblems) {
        setCurrentProblem(currentProblem + 1);
        setUserAnswer('');
      } else {
        completeSet();
      }
    } else {
      playSound('alarm');
      const newAlarmCount = alarmCount + 1;
      setAlarmCount(newAlarmCount);
      
      document.body.classList.add('alarm-flash');
      setTimeout(() => document.body.classList.remove('alarm-flash'), 300);
      
      if (newAlarmCount >= 3) {
        setGameState('lockdown');
        setTimeout(() => {
          resetSet();
          setGameState('playing');
        }, 4000);
      } else {
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
      ...setTimes,
      [currentSet]: timeElapsed
    });
    
    setSetAlarms({
      ...setAlarms,
      [currentSet]: alarmCount
    });
    
    setVaultsCompleted([...vaultsCompleted, currentSet]);
    
    setUnlockedCodes({
      ...unlockedCodes,
      [currentSet]: true
    });
    
    setShowVaultAnimation(true);
    
    setTimeout(() => {
      setShowVaultAnimation(false);
      
      if (currentSet < 6) {
        setCurrentSet(currentSet + 1);
        setCurrentProblem(1);
        setLockedDigits([]);
        setAlarmCount(0);
        setSetStartTime(Date.now());
        setUserAnswer('');
        const newMap = {};
        Object.keys(shuffledChoicesMap).forEach(key => {
          if (!key.startsWith(`${currentSet}-`)) {
            newMap[key] = shuffledChoicesMap[key];
          }
        });
        setShuffledChoicesMap(newMap);
      } else {
        setGameComplete(true);
      }
    }, 10000);
  };

  const resetSet = () => {
    setCurrentProblem(1);
    setLockedDigits([]);
    setAlarmCount(0);
    setSetStartTime(Date.now());
    setUserAnswer('');
    const newMap = {};
    Object.keys(shuffledChoicesMap).forEach(key => {
      if (!key.startsWith(`${currentSet}-`)) {
        newMap[key] = shuffledChoicesMap[key];
      }
    });
    setShuffledChoicesMap(newMap);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Conditional renders AFTER all hooks
  if (showBriefing) {
    return (
      <MissionBriefing 
        onAccept={handleAcceptMission}
        onSkip={handleSkipBriefing}
      />
    );
  }

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

  if (gameState === 'lockdown') {
    return (
      <div className="lockdown-screen">
        <div className="lockdown-content">
          <div className="lockdown-icon">🚨</div>
          <div className="lockdown-title">SECURITY LOCKDOWN</div>
          <div className="lockdown-message">VAULT SEALED</div>
          <div className="lockdown-subtitle">RESTARTING VAULT {currentSet}...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="vault-heist-game">
      <div className="vault-heist-container">
      <VaultGrid 
        currentSet={currentSet}
        vaultsCompleted={vaultsCompleted}
      />

      <div className="main-game-area">
        <div className="game-content">
        <CodeDisplay 
          totalDigits={totalProblems}
          lockedDigits={lockedDigits}
          codeSequence={currentSetData.codeSequence}
        />

        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(lockedDigits.length / totalProblems) * 100}%` }}
            />
          </div>
        </div>

        <ProblemDisplay 
          problem={currentProblemData}
          problemNumber={currentProblem}
          setType={currentSetData.type}
          questionPrompt={currentSetData.questionPrompt}
          userAnswer={userAnswer}
          onAnswerChange={setUserAnswer}
          onSubmit={checkAnswer}
          shuffledChoices={currentShuffledChoices}
        />

        <div className="bottom-info-bar">
          <div className="timer-section">
            <span className="timer-icon">⏱️</span>
            <span className="timer-text">{formatTime(currentTime)}</span>
          </div>

          <div className="alarm-section">
            {[1, 2, 3].map(i => (
              <span 
                key={i} 
                className={`alarm-indicator ${i <= alarmCount ? 'triggered' : ''}`}
              >
                {i <= alarmCount ? '🚨' : '○'}
              </span>
            ))}
            <span className="alarm-text">Alarms</span>
          </div>
        </div>
      </div>
      </div>

      <button 
        className="stats-toggle"
        onClick={() => setShowInGameStats(!showInGameStats)}
        title="View Current Stats"
      >
        📊
      </button>

      <button 
        className="sound-toggle"
        onClick={() => setSoundEnabled(!soundEnabled)}
        title={soundEnabled ? "Mute sounds" : "Enable sounds"}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>
      
      <VaultCodeStorage unlockedCodes={unlockedCodes} />
      
      {showInGameStats && (
        <div className="in-game-stats-overlay" onClick={() => setShowInGameStats(false)}>
          <div className="in-game-stats-modal" onClick={(e) => e.stopPropagation()}>
            <div className="stats-header">
              <h2>📊 Current Progress</h2>
              <button className="close-button" onClick={() => setShowInGameStats(false)}>✕</button>
            </div>
            
            <div className="stats-list">
              {[1, 2, 3, 4, 5, 6].map(vaultNum => (
                <div key={vaultNum} className={`stat-item ${vaultsCompleted.includes(vaultNum) ? 'completed' : currentSet === vaultNum ? 'active' : 'locked'}`}>
                  <div className="stat-vault">Vault {vaultNum}</div>
                  <div className="stat-info">
                    {vaultsCompleted.includes(vaultNum) ? (
                      <>
                        <span className="stat-time">✅ {formatTime(setTimes[vaultNum])}</span>
                        {setAlarms[vaultNum] > 0 && (
                          <span className="stat-alarm">⚠️ {setAlarms[vaultNum]}</span>
                        )}
                      </>
                    ) : currentSet === vaultNum ? (
                      <span className="stat-current">🎯 In Progress... {formatTime(currentTime)}</span>
                    ) : (
                      <span className="stat-locked">🔒 Locked</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default VaultHeist;
