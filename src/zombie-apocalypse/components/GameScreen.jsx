// GameScreen.jsx  
// Version: 3.4.0
// Last Updated: November 30, 2024 - 11:59 PM
// Changes: Added scaffolding for Levels 4-7

import React, { useState, useEffect } from 'react';
import FactionTracker from './FactionTracker';
import Calculator from './Calculator';
import ProblemDisplay from './ProblemDisplay';
import ScaffoldedProblem from './ScaffoldedProblem';
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
  formatTime,
  onDevJumpToLevel
}) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [problemBank, setProblemBank] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [problemsCorrect, setProblemsCorrect] = useState(0);
  const [showCalculator, setShowCalculator] = useState(currentLevel >= 3);
  const [wrongAnswerFeedback, setWrongAnswerFeedback] = useState(null);

  const levelConfig = {
    1: { total: 7, required: 6, timeLimit: 120, useScaffolding: false },
    2: { total: 7, required: 6, useScaffolding: false },
    3: { total: 6, required: 5, useScaffolding: false },
    4: { total: 5, required: 4, useScaffolding: true },
    5: { total: 4, required: 3, useScaffolding: true },
    6: { total: 3, required: 2, useScaffolding: false },
    7: { total: 1, required: 1, useScaffolding: true }
  };

  const config = levelConfig[currentLevel];

  const playDeathScream = () => {
    if (!soundEnabled) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.8);
    oscillator2.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.8);
    
    gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
    
    oscillator1.start();
    oscillator2.start();
    oscillator1.stop(audioContext.currentTime + 0.8);
    oscillator2.stop(audioContext.currentTime + 0.8);
  };

  const playCrowdCheer = () => {
    if (!soundEnabled) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillators = [];
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      osc.connect(gainNode);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const startTime = audioContext.currentTime + (i * 0.15);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
      oscillators.push(osc);
    });
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0);
  };

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

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - levelStartTime) / 1000);
      setCurrentTime(elapsed);
      if (currentLevel === 1 && elapsed < 120) {
        playTickSound();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [levelStartTime, currentLevel, soundEnabled]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    generateProblems();
    setCurrentProblemIndex(0);
    setProblemsCorrect(0);
    setUserAnswer('');
    setShowCalculator(currentLevel >= 3);
    setWrongAnswerFeedback(null);
  }, [currentLevel]);

  useEffect(() => {
    setUserAnswer('');
  }, [currentProblemIndex]);

  useEffect(() => {
    if (currentLevel === 1 && currentTime >= 120 && problemsCorrect < 6) {
      onWrongAnswer();
      onWrongAnswer();
    }
  }, [currentTime, currentLevel, problemsCorrect]);

  const generateProblems = () => {
    let problems = [];
    
    switch(currentLevel) {
      case 1:
        const allLevel1 = generateLevel1Bank();
        problems = [...allLevel1].sort(() => Math.random() - 0.5).slice(0, 7);
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

  const getGuidedNotes = (problem, userAns, correctAns) => {
    if (!problem) return null;

    switch(currentLevel) {
      case 1:
        const percentMatch = problem.question.match(/Convert (\d+\.?\d*)%/);
        const percent = percentMatch ? percentMatch[1] : '25';
        const decimalAnswer = (parseFloat(percent) / 100).toString();
        const percentParts = percent.split('.');
        const percentWhole = percentParts[0];
        const percentDecimal = percentParts[1] || '';
        
        return {
          title: "💡 Converting Percents to Decimals:",
          visual: (
            <>
              <div className="za-decimal-conversion">
                <span className="za-percent-visual">
                  {percentWhole}
                  <span className="za-decimal-point-blink">.</span>
                  {percentDecimal}%
                </span>
                <span className="za-arrow-visual">→</span>
                <span className="za-arrow-visual">→</span>
                <span className="za-decimal-result">
                  <span className="za-decimal-leading">0</span>
                  <span className="za-decimal-point-blink">.</span>
                  <span className="za-decimal-digits">{decimalAnswer.replace('0.', '')}</span>
                </span>
              </div>
            </>
          ),
          note: "Move the decimal point 2 places to the LEFT (shown by arrows)",
          examples: "Examples: 8% = 0.08  |  50% = 0.50  |  125% = 1.25"
        };

      case 2:
        const questionLower = problem.question.toLowerCase();
        let keyword = '';
        let explanation = '';
        
        if (questionLower.includes('discount') || questionLower.includes('off')) {
          keyword = 'DISCOUNT';
          explanation = 'Discounts DECREASE the price. You pay LESS.';
        } else if (questionLower.includes('tax')) {
          keyword = 'TAX';
          explanation = 'Tax INCREASES what you pay. You pay MORE.';
        } else if (questionLower.includes('markup')) {
          keyword = 'MARKUP';
          explanation = 'Markup INCREASES the price. You pay MORE.';
        } else if (questionLower.includes('tip')) {
          keyword = 'TIP';
          explanation = 'Tips INCREASE what you pay. You pay MORE.';
        } else if (questionLower.includes('interest')) {
          keyword = 'INTEREST';
          explanation = 'Interest INCREASES what you owe. You pay MORE.';
        }

        return {
          title: `💡 Understanding: ${keyword}`,
          explanation: explanation,
          note: "Does this make the number go UP or DOWN?"
        };

      case 3:
      case 4:
      case 5:
      case 6:
        return {
          title: "💡 Problem-Solving Steps:",
          steps: [
            "1. Identify what you're looking for",
            "2. List what you know",
            "3. Determine the operation",
            "4. Calculate carefully",
            "5. Check if answer makes sense"
          ]
        };

      default:
        return null;
    }
  };

  const handleScaffoldComplete = () => {
    onCorrectAnswer();
    const newCorrect = problemsCorrect + 1;
    setProblemsCorrect(newCorrect);
    setWrongAnswerFeedback(null);
    
    if (newCorrect >= config.required) {
      playCrowdCheer();
      onLevelComplete();
    } else if (currentProblemIndex < config.total - 1) {
      setCurrentProblemIndex(prev => prev + 1);
    }
  };

  const checkAnswer = (overrideAnswer) => {
    if (!currentProblem) return;
    
    // Use override if provided (from multiple choice click), otherwise use userAnswer state
    const answerToCheck = overrideAnswer !== undefined ? overrideAnswer : userAnswer;
    const userAns = answerToCheck.trim().toLowerCase();
    const correctAns = String(currentProblem.correctAnswer).toLowerCase();
    
    console.log('Checking answer:', userAns, 'vs', correctAns);
    
    let isCorrect = false;
    
    if (currentProblem.type === 'multiple-choice') {
      isCorrect = userAns === correctAns;
    } else {
      if (userAns === correctAns) {
        isCorrect = true;
      } else {
        const userNum = parseFloat(userAns);
        const correctNum = parseFloat(correctAns);
        if (!isNaN(userNum) && !isNaN(correctNum)) {
          isCorrect = Math.abs(userNum - correctNum) < 0.02;
        }
      }
    }
    
    if (isCorrect) {
      onCorrectAnswer();
      const newCorrect = problemsCorrect + 1;
      setProblemsCorrect(newCorrect);
      setWrongAnswerFeedback(null);
      
      if (newCorrect >= config.required) {
        playCrowdCheer();
        onLevelComplete();
      } else if (currentProblemIndex < config.total - 1) {
        setCurrentProblemIndex(prev => prev + 1);
      }
    } else {
      const guidedNotes = getGuidedNotes(currentProblem, userAns, correctAns);
      
      setWrongAnswerFeedback({
        userAnswer: answerToCheck,
        correctAnswer: currentProblem.correctAnswer,
        guidedNotes: guidedNotes
      });
      
      playDeathScream();
      onWrongAnswer();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userAnswer.trim()) {
      checkAnswer();
    }
  };

  const getLevelTitle = () => {
    const titles = {
      1: "LEVEL 1: The Outbreak",
      2: "LEVEL 2: Survival of the Fittest",
      3: "LEVEL 3: The Reckoning",
      4: "LEVEL 4: Breaking Point",
      5: "LEVEL 5: The Fall",
      6: "LEVEL 6: Endgame",
      7: "LEVEL 7: Victory or Death"
    };
    return titles[currentLevel];
  };

  const getLevelStory = () => {
    const stories = {
      1: "Convert percents to decimals. Your survival depends on it!",
      2: "Prove you understand how prices change. Calculate or die.",
      3: "Calculate precise amounts. The Scavengers are watching.",
      4: "Calculate final prices. Multi-step thinking separates survivors from casualties.",
      5: "Master two-step calculations. Complexity killed The Engineers.",
      6: "Work backwards to survive forwards. Only The Elites remain.",
      7: "Final challenge. One mistake and you're both dead."
    };
    return stories[currentLevel];
  };

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

  const useScaffolding = config.useScaffolding && currentProblem.scaffoldSteps;

  return (
    <div className="za-game-screen">
      <div className="za-top-bar">
        <div className="za-level-info">
          <h2 className="za-level-title">{getLevelTitle()}</h2>
          <div className="za-level-story">{getLevelStory()}</div>
        </div>

        <div className="za-game-stats">
          <div className="za-timer">
            <span className="za-timer-icon">⏱️</span>
            <span className={`za-timer-text ${currentLevel === 1 && currentTime >= 90 ? 'za-timer-warning' : ''}`}>
              {getDisplayTime()}
            </span>
          </div>

          <div className="za-hearts">
            {[1, 2].map(i => (
              <span key={i} className={`za-heart ${i <= hearts ? 'active' : 'lost'}`}>
                {i <= hearts ? '❤️' : '🖤'}
              </span>
            ))}
          </div>

          <button className="za-sound-toggle" onClick={onToggleSound}>
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      <FactionTracker currentLevel={currentLevel} />

      <div className="za-main-game">
        <div className="za-progress-section">
          <div className="za-progress-text">
            Progress: {problemsCorrect} / {config.required} correct
          </div>
          <div className="za-progress-bar">
            <div className="za-progress-fill" style={{ width: `${(problemsCorrect / config.required) * 100}%` }} />
          </div>
        </div>

        {useScaffolding ? (
          <ScaffoldedProblem
            problem={currentProblem}
            currentLevel={currentLevel}
            onComplete={handleScaffoldComplete}
            onWrongAnswer={() => {
              playDeathScream();
              onWrongAnswer();
            }}
          />
        ) : (
          <ProblemDisplay
            problem={currentProblem}
            problemNumber={currentProblemIndex + 1}
            totalProblems={config.total}
            userAnswer={userAnswer}
            onAnswerChange={setUserAnswer}
            onSubmit={checkAnswer}
            onKeyPress={handleKeyPress}
          />
        )}
      </div>

      {wrongAnswerFeedback && !useScaffolding && (
        <div className="za-wrong-feedback">
          <div className="za-wrong-title">Not quite!</div>
          <div className="za-wrong-yours">You answered: {wrongAnswerFeedback.userAnswer}</div>
          <div className="za-wrong-correct">Correct answer: {wrongAnswerFeedback.correctAnswer}</div>
          
          {wrongAnswerFeedback.guidedNotes && (
            <div className="za-decimal-helper">
              <div className="za-helper-title">{wrongAnswerFeedback.guidedNotes.title}</div>
              
              {wrongAnswerFeedback.guidedNotes.visual && (
                <div className="za-helper-visual">{wrongAnswerFeedback.guidedNotes.visual}</div>
              )}
              
              {wrongAnswerFeedback.guidedNotes.explanation && (
                <div className="za-helper-explanation">{wrongAnswerFeedback.guidedNotes.explanation}</div>
              )}
              
              {wrongAnswerFeedback.guidedNotes.steps && (
                <div className="za-helper-steps">
                  {wrongAnswerFeedback.guidedNotes.steps.map((step, idx) => (
                    <div key={idx} className="za-helper-step">{step}</div>
                  ))}
                </div>
              )}
              
              {wrongAnswerFeedback.guidedNotes.note && (
                <div className="za-helper-note">{wrongAnswerFeedback.guidedNotes.note}</div>
              )}
              
              {wrongAnswerFeedback.guidedNotes.examples && (
                <div className="za-helper-examples">{wrongAnswerFeedback.guidedNotes.examples}</div>
              )}
            </div>
          )}
          
          <button className="za-btn-primary za-got-it-btn" onClick={() => setWrongAnswerFeedback(null)}>
            I get it now!
          </button>
        </div>
      )}

      {showCalculator && <Calculator />}
    </div>
  );
};

export default GameScreen;
