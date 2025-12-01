// GameScreen.jsx
// VERSION: 4.1 - BUGFIX: Dynamic help menu for Level 1
// FIXED: Shows actual percent value instead of hardcoded 25%

import React, { useState, useEffect } from 'react';
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
    window.scrollTo({ top: 0, behavior: 'instant' });
    generateProblems();
    setCurrentProblemIndex(0);
    setProblemsCorrect(0);
    setUserAnswer('');
    setShowCalculator(currentLevel >= 3);
    setShowNotepad(currentLevel >= 4);
    setWrongAnswerFeedback(null);
  }, [currentLevel]);

  // Clear input when problem index changes
  useEffect(() => {
    setUserAnswer('');
    setWrongAnswerFeedback(null);
  }, [currentProblemIndex]);

  // Generate problem bank based on level
  const generateProblems = () => {
    const generators = {
      1: generateLevel1Bank,
      2: () => Array.from({ length: 7 }, () => generateLevel2Problem(playerData)),
      3: () => Array.from({ length: 6 }, () => generateLevel3Problem(playerData)),
      4: () => Array.from({ length: 5 }, () => generateLevel4Problem(playerData)),
      5: () => Array.from({ length: 4 }, () => generateLevel5Problem(playerData)),
      6: () => Array.from({ length: 3 }, () => generateLevel6Problem(playerData)),
      7: () => [generateLevel7Problem(playerData)]
    };

    const problems = generators[currentLevel]();
    setProblemBank(problems);
  };

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return;

    const currentProblem = problemBank[currentProblemIndex];
    const userVal = parseFloat(userAnswer);
    const correctVal = parseFloat(currentProblem.answer);

    const isCorrect = Math.abs(userVal - correctVal) < 0.01;

    if (isCorrect) {
      // Correct answer
      onCorrectAnswer(currentTime);
      const newCorrect = problemsCorrect + 1;
      setProblemsCorrect(newCorrect);
      setWrongAnswerFeedback(null);

      if (newCorrect >= config.required) {
        onLevelComplete(currentTime);
      } else if (currentProblemIndex < problemBank.length - 1) {
        setCurrentProblemIndex(currentProblemIndex + 1);
      } else {
        onLevelComplete(currentTime);
      }
    } else {
      // Wrong answer - store full problem data for help menu
      if (currentLevel === 1) {
        setWrongAnswerFeedback({
          userAnswer: userAnswer,
          correctAnswer: currentProblem.answer,
          question: currentProblem.question
        });
      }
      
      onWrongAnswer();

      if (hearts === 0) {
        return;
      }

      if (currentProblemIndex < problemBank.length - 1) {
        setTimeout(() => {
          setCurrentProblemIndex(currentProblemIndex + 1);
          setWrongAnswerFeedback(null);
        }, 4000); // Give 4 seconds to read help
      } else {
        onLevelComplete(currentTime);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
  };

  // Extract percent value from question for dynamic help menu
  const getPercentFromQuestion = (question) => {
    if (!question) return '25'; // fallback
    
    // Extract number before the % symbol
    const match = question.match(/([\d.]+)%/);
    if (match && match[1]) {
      return match[1];
    }
    return '25'; // fallback
  };

  // Get decimal with proper formatting for help menu
  const getDecimalForHelp = (percentStr) => {
    const num = parseFloat(percentStr);
    const decimal = num / 100;
    
    // Format nicely: remove trailing zeros but keep at least 2 decimal places for small numbers
    if (decimal < 0.1) {
      return decimal.toFixed(2);
    } else if (decimal >= 1) {
      return decimal.toString();
    } else {
      return decimal.toFixed(2).replace(/\.?0+$/, '');
    }
  };

  if (problemBank.length === 0) {
    return <div>Loading problems...</div>;
  }

  const currentProblem = problemBank[currentProblemIndex];
  const remainingTime = config.timeLimit ? config.timeLimit - currentTime : null;

  // Get level title
  const getLevelTitle = () => {
    const titles = {
      1: 'The Outbreak',
      2: 'The Escape',
      3: 'The Trade',
      4: 'The Siege',
      5: 'The Vault',
      6: 'The Alliance',
      7: 'The Final Stand'
    };
    return titles[currentLevel] || `Level ${currentLevel}`;
  };

  return (
    <div className="za-game-screen">
      {/* Header */}
      <div className="za-game-header">
        <div className="za-level-indicator">
          LEVEL {currentLevel}: {getLevelTitle()}
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* Hearts */}
          <div className="za-hearts-display">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className={`za-heart ${i >= hearts ? 'lost' : ''}`}
              />
            ))}
          </div>

          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

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
          onSubmit={handleSubmitAnswer}
          onKeyPress={handleKeyPress}
        />

        {/* Timer */}
        {remainingTime !== null && (
          <div className="za-timer">
            <div className="za-timer-label">Time Remaining</div>
            <div 
              className={`za-timer-value ${
                remainingTime <= 10 ? 'critical' : 
                remainingTime <= 30 ? 'warning' : ''
              }`}
            >
              {formatTime(remainingTime)}
            </div>
          </div>
        )}

        {/* Wrong Answer Feedback (Level 1 only) - FIXED WITH DYNAMIC PERCENT */}
        {wrongAnswerFeedback && currentLevel === 1 && (
          <div className="za-wrong-feedback">
            <div className="za-wrong-title">Not quite!</div>
            <div className="za-wrong-yours">You answered: {wrongAnswerFeedback.userAnswer}</div>
            <div className="za-wrong-correct">Correct answer: {wrongAnswerFeedback.correctAnswer}</div>
            
            <div className="za-decimal-helper">
              <div className="za-helper-title">Converting Percents to Decimals:</div>
              <div className="za-helper-visual">
                <span className="za-percent-num">{getPercentFromQuestion(wrongAnswerFeedback.question)}%</span>
                <span className="za-arrow">→</span>
                <span className="za-decimal-result">
                  {wrongAnswerFeedback.correctAnswer}
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
        {showCalculator && (
          <Calculator
            onNumberClick={(num) => setUserAnswer(prev => prev + num)}
            onOperatorClick={(op) => setUserAnswer(prev => prev + op)}
            onClear={() => setUserAnswer('')}
            onBackspace={() => setUserAnswer(prev => prev.slice(0, -1))}
            display={userAnswer}
          />
        )}

        {/* Notepad (Level 4+) */}
        {showNotepad && <Notepad />}
      </div>
    </div>
  );
};

export default GameScreen;
