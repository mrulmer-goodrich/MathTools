// GameScreen.jsx
// VERSION: 3.1.0
// Last Updated: November 30, 2024
// Changes: Story subtitles, better sound effects, guided notes for all levels

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
  formatTime,
  onDevJumpToLevel
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

  // BETTER SOUND EFFECTS
  const playDeathScream = () => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a descending scream effect
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Descending frequencies for scream effect
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
    
    // Create crowd cheer with multiple oscillators
    const oscillators = [];
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    
    // Create 5 oscillators for crowd effect
    for (let i = 0; i < 5; i++) {
      const osc = audioContext.createOscillator();
      osc.connect(gainNode);
      osc.frequency.value = 400 + (i * 200) + (Math.random() * 100);
      oscillators.push(osc);
    }
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2);
    
    oscillators.forEach(osc => {
      osc.start();
      osc.stop(audioContext.currentTime + 1.2);
    });
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

  // Timer effect with tick sound
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

  useEffect(() => {
    console.log('Problem index changed to:', currentProblemIndex);
    setUserAnswer('');
  }, [currentProblemIndex]);

  // Level 1 time limit check
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

  // Generate dynamic guided notes based on level and problem
  const getGuidedNotes = (problem, userAns, correctAns) => {
    if (!problem) return null;

    switch(currentLevel) {
      case 1:
        // Extract percent from question
        const percentMatch = problem.question.match(/Convert (\d+\.?\d*)%/);
        const percent = percentMatch ? percentMatch[1] : '25';
        return {
          title: "💡 Converting Percents to Decimals:",
          visual: (
            <>
              <span className="za-percent-num">{percent}%</span>
              <span className="za-arrow">→</span>
              <span className="za-decimal-movement">
                <span className="za-move-left">0.</span>
                <span className="za-moved">{percent.replace('.', '')}</span>
              </span>
            </>
          ),
          note: "Move the decimal point 2 places to the LEFT",
          examples: "8% = 0.08  |  50% = 0.50  |  125% = 1.25"
        };

      case 2:
        // Detect keyword
        const questionLower = problem.question.toLowerCase();
        let keyword = '';
        let explanation = '';
        
        if (questionLower.includes('discount') || questionLower.includes('off') || questionLower.includes('sale')) {
          keyword = 'DISCOUNT/SALE';
          explanation = 'Discounts and sales DECREASE the price. You pay LESS.';
        } else if (questionLower.includes('tax')) {
          keyword = 'TAX';
          explanation = 'Tax INCREASES what you pay. You pay MORE.';
        } else if (questionLower.includes('markup') || questionLower.includes('marked up')) {
          keyword = 'MARKUP';
          explanation = 'Markup INCREASES the price. You pay MORE.';
        } else if (questionLower.includes('commission')) {
          keyword = 'COMMISSION';
          explanation = 'Commission INCREASES your earnings. You make MORE.';
        } else if (questionLower.includes('tip')) {
          keyword = 'TIP';
          explanation = 'Tips INCREASE what you pay. You pay MORE.';
        } else if (questionLower.includes('interest')) {
          keyword = 'INTEREST';
          explanation = 'Interest INCREASES what you owe. You pay MORE.';
        } else if (questionLower.includes('decrease')) {
          keyword = 'DECREASE';
          explanation = 'Decrease means going DOWN. The amount gets SMALLER.';
        } else if (questionLower.includes('increase') || questionLower.includes('grow')) {
          keyword = 'INCREASE';
          explanation = 'Increase means going UP. The amount gets LARGER.';
        }

        return {
          title: `💡 Understanding: ${keyword}`,
          explanation: explanation,
          note: "Ask yourself: Does this make the number go UP or DOWN?"
        };

      case 3:
      case 4:
      case 5:
      case 6:
        return {
          title: "💡 Working Through the Problem:",
          steps: [
            "1. Identify what you're looking for (the UNKNOWN)",
            "2. List what you know (the GIVEN information)",
            "3. Determine the operation needed",
            "4. Calculate carefully",
            "5. Check if your answer makes sense"
          ],
          note: "Use your calculator and notepad to organize your work!"
        };

      case 7:
        return null; // Special handling for Level 7

      default:
        return null;
    }
  };

  const checkAnswer = (overrideAnswer) => {
    if (!currentProblem) return;
    
    const answerToCheck = overrideAnswer !== undefined && overrideAnswer !== null 
      ? String(overrideAnswer) 
      : userAnswer;

    const userAns = answerToCheck.trim().toLowerCase();
    const correctAns = String(currentProblem.correctAnswer).toLowerCase();
    
    console.log('╔══ ANSWER CHECK ══╗');
    console.log('Level:', currentLevel);
    console.log('User answer:', `"${userAns}"`);
    console.log('Correct answer:', `"${correctAns}"`);
    
    // LEVEL 7 SPECIAL VALIDATION
    if (currentLevel === 7 && currentProblem.showWork) {
      const userNum = parseFloat(userAns);
      const afterDecrease = currentProblem.showWork.initialPop * (1 - currentProblem.showWork.decrease / 100);
      const afterIncrease = afterDecrease * (1 + currentProblem.showWork.increase / 100);
      
      if (!isNaN(userNum)) {
        const wrongPerPerson = (parseFloat(currentProblem.showWork.totalMoney.replace(/,/g, '')) / afterIncrease);
        if (Math.abs(userNum - wrongPerPerson) < 0.02) {
          setWrongAnswerFeedback({
            userAnswer: answerToCheck,
            correctAnswer: currentProblem.correctAnswer,
            question: currentProblem.question,
            specialMessage: "⚠️ WAIT! You can't have a partial person! If there's only part of someone left, the zombies got them and they're turning. You CAN'T count them as a survivor! Always round DOWN when calculating people."
          });
          playDeathScream();
          onWrongAnswer();
          console.log('╚═════════════════╝');
          return;
        }
      }
    }
    
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
    
    console.log('Final result:', isCorrect ? 'CORRECT ✓' : 'WRONG ✗');
    console.log('╚═════════════════╝');
    
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
      // Generate guided notes for wrong answer
      const guidedNotes = getGuidedNotes(currentProblem, userAns, correctAns);
      
      setWrongAnswerFeedback({
        userAnswer: answerToCheck,
        correctAnswer: currentProblem.correctAnswer,
        question: currentProblem.question,
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
      1: "Show the other factions you can convert percents to decimals. If you can't, you won't survive!",
      2: "Prove to the Traders that you understand how discounts, taxes, and markups affect prices. Your life depends on it.",
      3: "The Scavengers are watching. Calculate precise amounts or join the fallen factions.",
      4: "Multi-step thinking separates survivors from casualties. The Fortress fell because they couldn't handle complexity.",
      5: "The Engineers thought they were the smartest. Prove them wrong by mastering advanced calculations.",
      6: "Only The Elites stand between you and victory. Work backwards to survive forwards.",
      7: "Final challenge. One mistake and you're both dead. Calculate perfectly or become zombies."
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

  return (
    <div className="za-game-screen">
      {/* Top Bar */}
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

      {/* Wrong Answer Feedback with Guided Notes */}
      {wrongAnswerFeedback && (
        <div className="za-wrong-feedback">
          {wrongAnswerFeedback.specialMessage ? (
            <>
              <div className="za-wrong-title za-level7-warning">⚠️ POPULATION ERROR!</div>
              <div className="za-wrong-special">{wrongAnswerFeedback.specialMessage}</div>
              <div className="za-wrong-yours">You answered: {wrongAnswerFeedback.userAnswer}</div>
              <div className="za-wrong-correct">Correct answer: {wrongAnswerFeedback.correctAnswer}</div>
            </>
          ) : (
            <>
              <div className="za-wrong-title">Not quite!</div>
              <div className="za-wrong-yours">You answered: {wrongAnswerFeedback.userAnswer}</div>
              <div className="za-wrong-correct">Correct answer: {wrongAnswerFeedback.correctAnswer}</div>
              
              {wrongAnswerFeedback.guidedNotes && (
                <div className="za-decimal-helper">
                  <div className="za-helper-title">{wrongAnswerFeedback.guidedNotes.title}</div>
                  
                  {wrongAnswerFeedback.guidedNotes.visual && (
                    <div className="za-helper-visual">
                      {wrongAnswerFeedback.guidedNotes.visual}
                    </div>
                  )}
                  
                  {wrongAnswerFeedback.guidedNotes.explanation && (
                    <div className="za-helper-explanation">
                      {wrongAnswerFeedback.guidedNotes.explanation}
                    </div>
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
            </>
          )}
          
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
