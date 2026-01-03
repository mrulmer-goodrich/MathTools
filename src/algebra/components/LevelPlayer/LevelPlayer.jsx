// LevelPlayer.jsx - UPDATED to handle staged workflow
// Location: src/algebra/components/LevelPlayer.jsx

import React, { useState, useEffect } from 'react';
import ProblemDisplay from './ProblemDisplay';
import ClickToSelect from './InputMethods/ClickToSelect';
import MathWorksheet from './MathWorksheet';
import FeedbackModal from './FeedbackModal';
import SuccessOverlay from './SuccessOverlay';
import ProgressTracker from './ProgressTracker';
import levels from '../data/levelData';
import { problemGenerators } from '../data/problemGenerators';

const LevelPlayer = ({ 
  levelId, 
  difficulty, 
  playMode,
  stats,
  setStats,
  onLevelComplete,
  onReturnToMenu 
}) => {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [levelComplete, setLevelComplete] = useState(false);

  const level = levels[levelId];

  const getRegion = (levelId) => {
    const num = parseInt(levelId.split('-')[1]);
    if (num <= 16) return 'base-camp';
    if (num <= 31) return 'territory';
    return 'frontier';
  };

  useEffect(() => {
    generateNewProblem();
  }, [levelId]);

  const generateNewProblem = () => {
    const generator = problemGenerators[levelId];
    if (generator) {
      const problem = generator(difficulty);
      setCurrentProblem(problem);
      setShowFeedback(false);
      setShowSuccess(false);
      setSelectedAnswer(null);
    } else {
      console.error(`No generator found for level ${levelId}`);
    }
  };

  const getSuccessMessage = () => {
    const messages = [
      { icon: "🎯", text: "Perfect Shot!", sub: "You're navigating well!" },
      { icon: "⛰️", text: "Summit Reached!", sub: "Onward to the next peak!" },
      { icon: "🧭", text: "True North!", sub: "Your calculations are precise!" },
      { icon: "🏕️", text: "Camp Secured!", sub: "Another challenge conquered!" },
      { icon: "🗺️", text: "Territory Mapped!", sub: "The path is clear!" },
      { icon: "⭐", text: "Stellar Work!", sub: "Dr. Martinez would be proud!" },
      { icon: "🔥", text: "On Fire!", sub: "Keep blazing this trail!" },
      { icon: "💎", text: "Gem Found!", sub: "Mathematical excellence!" }
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleProblemComplete = () => {
    setStats(prev => ({
      ...prev,
      problemsAttempted: prev.problemsAttempted + 1,
      problemsCorrect: prev.problemsCorrect + 1,
      currentStreak: prev.currentStreak + 1
    }));

    const newStreak = correctStreak + 1;
    setCorrectStreak(newStreak);
    
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      
      if (newStreak >= level.problemsRequired) {
        setLevelComplete(true);
      } else {
        generateNewProblem();
      }
    }, 1000); // 1 second
  };

  const handleProblemWrong = () => {
    setStats(prev => ({
      ...prev,
      problemsAttempted: prev.problemsAttempted + 1,
      currentStreak: 0
    }));

    setCorrectStreak(0);
    setShowFeedback(true);
  };

  const handleAnswerSubmit = (answer) => {
    setSelectedAnswer(answer);
    const correct = answer === currentProblem.answer;
    setIsCorrect(correct);

    setStats(prev => ({
      ...prev,
      problemsAttempted: prev.problemsAttempted + 1,
      problemsCorrect: correct ? prev.problemsCorrect + 1 : prev.problemsCorrect,
      currentStreak: correct ? prev.currentStreak + 1 : 0
    }));

    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        
        if (newStreak >= level.problemsRequired) {
          setLevelComplete(true);
        } else {
          generateNewProblem();
        }
      }, 1000);
    } else {
      setCorrectStreak(0);
      setShowFeedback(true);
    }
  };

  const handleContinueFromFeedback = () => {
    setShowFeedback(false);
    generateNewProblem();
  };

  const handleContinueFromComplete = () => {
    const badge = level.badge || level.moduleBadge;
    onLevelComplete(levelId, badge);
    
    if (level.moduleBadge || level.finalModule) {
      onReturnToMenu();
    } else {
      onReturnToMenu();
    }
  };

  if (!currentProblem) {
    return <div className="loading">Generating problem...</div>;
  }

  if (levelComplete) {
    return (
      <div className="level-complete" data-region={getRegion(levelId)}>
        <div className="completion-container">
          <div className="completion-icon">🎉</div>
          <h2>Level Complete!</h2>
          <h3>{level.name}</h3>
          
          {level.badge && (
            <div className="badge-earned">
              <p><strong>Badge Earned!</strong></p>
              <div className="badge-display">🏆 {level.badge}</div>
            </div>
          )}

          <div className="completion-stats">
            <div>
              <strong>{level.problemsRequired}</strong>
              <div style={{fontSize: '0.85rem', color: '#666'}}>Problems Solved</div>
            </div>
            <div>
              <strong>{correctStreak}</strong>
              <div style={{fontSize: '0.85rem', color: '#666'}}>Final Streak</div>
            </div>
          </div>

          <button 
            className="btn-continue-expedition"
            onClick={handleContinueFromComplete}
          >
            {level.moduleBadge ? 'Continue Expedition' : 'Next Level'} →
          </button>
        </div>
      </div>
    );
  }

  // Check if this is a staged problem
  const isStaged = currentProblem.staged && currentProblem.staged.rows;

  return (
    <div className="level-player" data-region={getRegion(levelId)}>
      <div className="level-header">
        <button 
          className="back-to-menu-button"
          onClick={onReturnToMenu}
        >
          ← Return to Home
        </button>
        <h2>{level.name}</h2>
        <ProgressTracker 
          current={correctStreak} 
          required={level.problemsRequired} 
        />
      </div>

      {/* STAGED WORKFLOW (Levels 13+) */}
      {isStaged && (
        <MathWorksheet
          problem={currentProblem}
          onComplete={handleProblemComplete}
          onWrongAnswer={handleProblemWrong}
        />
      )}

      {/* REGULAR WORKFLOW (Levels 1-12) */}
      {!isStaged && (
        <>
          <ProblemDisplay problem={currentProblem} />
          {level.inputMethod === 'clickToSelect' && (
            <ClickToSelect
              choices={currentProblem.choices}
              onSubmit={handleAnswerSubmit}
              disabled={showFeedback || showSuccess}
              selectedAnswer={selectedAnswer}
            />
          )}
        </>
      )}

      {showSuccess && (
        <SuccessOverlay message={getSuccessMessage()} />
      )}

      {showFeedback && (
        <FeedbackModal
          explanation={currentProblem.explanation}
          onContinue={handleContinueFromFeedback}
          correctAnswer={currentProblem.answer}
          selectedAnswer={selectedAnswer}
        />
      )}
    </div>
  );
};

export default LevelPlayer;
