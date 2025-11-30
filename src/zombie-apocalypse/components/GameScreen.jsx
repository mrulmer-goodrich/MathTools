// GameScreen.jsx
// VERSION: 2.0.0
// Last Updated: November 29, 2024 11:30pm
// Changes: Fixed input freeze bug, timer stops after Level 1, "I get it now!" button, overall time tracking

import React, { useState, useEffect } from 'react';
import FactionTracker from './FactionTracker';
import Calculator from './Calculator';
import Notepad from './Notepad';
import ProblemDisplay from './ProblemDisplay';
import {
  generateLevel1Bank,
  generateLevel2Problem,
  generateLevel3Problem,
  generateLevel4Problem,
  generateLevel5Problem,
  generateLevel6Problem,
  generateLevel7Problem
} from '../problems';

const GameScreen = ({
  playerData,
  currentLevel,
  hearts,
  soundEnabled,
  onToggleSound,
  onCorrectAnswer,
  onWrongAnswer,
  onLevelComplete,
  levelStartTime,
  formatTime
}) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [problemBank, setProblemBank] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [problemsCorrect, setProblemsCorrect] = useState(0);
  const [showCalculator, setShowCalculator] = useState(currentLevel >= 3);
  const [showNotepad, setShowNotepad] = useState(currentLevel >= 4);
  const [wrongAnswerFeedback, setWrongAnswerFeedback] = useState(null);

  // Level configurations
  const levelConfig = {
    1: { total: 7, required: 6, timeLimit: 120 },
    2: { total: 7, required: 6 },
    3: { total: 6, required: 5 },
    4: { total: 5, required: 4 },
    5: { total: 4, required: 3 },
    6: { total: 3, required: 2 },
    7: { total: 1, required: 1 }
  };

  const config = levelConfig[currentLevel];

  // Tick sound for Level 1
  const playTickSound = () => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 880;
    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.05);
  };

  // Timer effect with tick sound
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - levelStartTime) / 1000);
      setCurrentTime(elapsed);
      
      // Play tick sound every second on Level 1 (if time remaining)
      if (currentLevel === 1 && elapsed < 120) {
        playTickSound();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [levelStartTime, currentLevel, soundEnabled]);

  // Generate problems when level changes
  useEffect(() => {
    generateProblems();
    setCurrentProblemIndex(0);
    setProblemsCorrect(0);
    setUserAnswer('');
    setShowCalculator(currentLevel >= 3);
    setShowNotepad(currentLevel >= 4);
    setWrongAnswerFeedback(null);
  }, [currentLevel]);

  // Clear input when problem index changes - FIXES INPUT FREEZE BUG
  useEffect(() => {
    setUserAnswer('');
  }, [currentProblemIndex]);

  // Level 1 time limit check - COUNTDOWN MODE
  useEffect(() => {
    if (currentLevel === 1 && currentTime >= 120 && problemsCorrect < 6) {
      // Time's up!
      onWrongAnswer();
      onWrongAnswer(); // Kill them (2 hearts lost)
    }
  }, [currentTime, currentLevel, problemsCorrect]);

  const generateProblems = () => {
    let problems = [];
    
    switch(currentLevel) {
      case 1:
        const allLevel1 = generateLevel1Bank();
        const shuffled = [...allLevel1].sort(() => Math.random() - 0.5);
        problems = shuffled.slice(0, 7);
        break;
      case 2:
        const allLevel2 = generateLevel2Problem(playerData);
        problems = allLevel2.sort(() => Math.random() - 0.5).slice(0, 7);
        break;
      case 3:
        const allLevel3 = generateLevel3Problem(playerData);
        problems = allLevel3.sort(() => Math.random() - 0.5).slice(0, 6);
        break;
      case 4:
        const allLevel4 = generateLevel4Problem(playerData);
        problems = allLevel4.sort(() => Math.random() - 0.5).slice(0, 5);
        break;
      case 5:
        const allLevel5 = generateLevel5Problem(playerData);
        problems = allLevel5.sort(() => Math.random() - 0.5).slice(0, 4);
        break;
      case 6:
        const allLevel6 = generateLevel6Problem(playerData);
        problems = allLevel6.sort(() => Math.random() - 0.5).slice(0, 3);
        break;
      case 7:
        problems = [generateLevel7Problem(playerData)];
        break;
      default:
        break;
    }
    
    setProblemBank(problems);
  };

  const currentProblem = problemBank[currentProblemIndex];

  const checkAnswer = (overrideAnswer) => {
    if (!currentProblem) return;
    
    const rawUser =
      overrideAnswer !== undefined && overrideAnswer !== null
        ? overrideAnswer
        : userAnswer;

    const userAns = rawUser.trim().toLowerCase();
    const correctAns = currentProblem.correctAnswer.toLowerCase();
    
    // DEBUG LOGGING
    console.log('═══ ANSWER CHECK ═══');
    console.log('Level:', currentLevel);
    console.log('Problem:', currentProblem.question);
    console.log('User answer:', `"${userAns}"`);
    console.log('Correct answer:', `"${correctAns}"`);
    console.log('Type:', currentProblem.type);
    
    // Check if answer is correct
    let isCorrect = false;
    
    if (currentProblem.type === 'multiple-choice') {
      isCorrect = userAns === correctAns;
      console.log('Multiple choice match:', isCorrect);
    } else {
      // For free response, check exact match or numerical equivalence
      if (userAns === correctAns) {
        isCorrect = true;
      } else {
        // Try parsing as numbers and check within tolerance
        const userNum = parseFloat(userAns);
        const correctNum = parseFloat(correctAns);
        if (!isNaN(userNum) && !isNaN(correctNum)) {
          isCorrect = Math.abs(userNum - correctNum) < 0.02;
        }
      }
      console.log('Free response match:', isCorrect);
    }
    
    console.log('Final result:', isCorrect ? 'CORRECT ✓' : 'WRONG ✗');
    console.log('═══════════════════');
    
    if (isCorrect) {
      onCorrectAnswer();
      const newCorrect = problemsCorrect + 1;
      setProblemsCorrect(newCorrect);
      setUserAnswer('');
      setWrongAnswerFeedback(null);
      
      // Check if level is complete
      if (newCorrect >= config.required) {
        onLevelComplete();
      } else if (currentProblemIndex < config.total - 1) {
        setCurrentProblemIndex(currentProblemIndex + 1);
      }
    } else {
      // Show feedback for Level 1
      if (currentLevel === 1) {
        setWrongAnswerFeedback({
          userAnswer: userAnswer,
          correctAnswer: currentProblem.correctAnswer,
          question: currentProblem.question
        });
        // No auto-dismiss - user must click "I get it now!" button
      }
      
      onWrongAnswer();
      setUserAnswer('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const getLevelTitle = () => {
    const titles = {
      1: "LEVEL 1: The Outbreak",
      2: "LEVEL 2: Faction Wars Begin",
      3: "LEVEL 3: The Traders Fall",
      4: "LEVEL 4: Scavengers Eliminated",
      5: "LEVEL 5: The Fortress Falls",
      6: "LEVEL 6: The Engineers Fail",
      7: "LEVEL 7: THE FINAL CALCULATION"
    };
    return titles[currentLevel];
  };

  const getFactionsRemaining = () => 8 - currentLevel;

  // Calculate time remaining for Level 1 countdown
  const getDisplayTime = () => {
    if (currentLevel === 1) {
      const timeRemaining = Math.max(0, 120 - currentTime);
      return formatTime(timeRemaining);
    } else {
      return formatTime(currentTime);
    }
  };

  if (!currentProblem) {
    return <div className="za-loading">Loading problems...</div>;
  }

  return (
    <div className="za-game-screen">
      {/* Top Bar */}
      <div className="za-top-bar">
        <div className="za-level-info">
          <h2 className="za-level-title">{getLevelTitle()}</h2>
          <div className="za-faction-count">
            {getFactionsRemaining()} Factions Remaining
          </div>
        </div>

        <div className="za-game-stats">
          <div className="za-timer">
            <span className="za-timer-icon">⏱️</span>
            <span className={`za-timer-text ${currentLevel === 1 && currentTime >= 90 ? 'za-timer-warning' : ''}`}>
              {getDisplayTime()}
            </span>
            {currentLevel === 1 && currentTime >= 90 && (
              <span className="za-time-warning">
                {' '}TIME RUNNING OUT!
              </span>
            )}
          </div>

          <div className="za-hearts">
            {[1, 2].map(i => (
              <span 
                key={i} 
                className={`za-heart ${i <= hearts ? 'active' : 'lost'}`}
              >
                {i <= hearts ? '❤️' : '🖤'}
              </span>
            ))}
          </div>

          <button 
            className="za-sound-toggle"
            onClick={onToggleSound}
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Faction Tracker */}
      <FactionTracker 
        currentLevel={currentLevel}
      />

      {/* Main Game Area */}
      <div className="za-main-game">
        <div className="za-progress-section">
          <div className="za-progress-text">
            Progress: {problemsCorrect} / {config.required} correct
          </div>
          <div className="za-progress-bar">
            <div 
              className="za-progress-fill"
              style={{ width: `${(problemsCorrect / config.required) * 100}%` }}
            />
          </div>
        </div>

        <ProblemDisplay
          problem={currentProblem}
          problemNumber={currentProblemIndex + 1}
          totalProblems={config.total}
          userAnswer={userAnswer}
          onAnswerChange={setUserAnswer}
          onSubmit={checkAnswer}
          onKeyPress={handleKeyPress}
        />
      </div>

      {/* Wrong Answer Feedback (Level 1 only) */}
      {wrongAnswerFeedback && currentLevel === 1 && (
        <div className="za-wrong-feedback">
          <div className="za-wrong-title">Not quite!</div>
          <div className="za-wrong-yours">You answered: {wrongAnswerFeedback.userAnswer}</div>
          <div className="za-wrong-correct">Correct answer: {wrongAnswerFeedback.correctAnswer}</div>
          
          <div className="za-decimal-helper">
            <div className="za-helper-title">💡 Converting Percents to Decimals:</div>
            <div className="za-helper-visual">
              <span className="za-percent-num">25%</span>
              <span className="za-arrow">→</span>
              <span className="za-decimal-movement">
                <span className="za-move-left">0.</span>
                <span className="za-moved">25</span>
              </span>
            </div>
            <div className="za-helper-note">Move the decimal point 2 places to the LEFT</div>
            <div className="za-helper-examples">
              Examples: 8% = 0.08  |  50% = 0.50  |  125% = 1.25
            </div>
          </div>
          
          <button 
            className="za-btn-primary za-got-it-btn"
            onClick={() => setWrongAnswerFeedback(null)}
          >
            I get it now!
          </button>
        </div>
      )}

      {/* Calculator (Level 3+) */}
      {showCalculator && <Calculator />}

      {/* Notepad (Level 4+) */}
      {showNotepad && <Notepad />}
    </div>
  );
};

export default GameScreen;
