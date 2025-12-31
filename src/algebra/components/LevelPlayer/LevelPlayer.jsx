// LevelPlayer.jsx - COMPLETE FIX
// Location: src/algebra/components/LevelPlayer.jsx

import React, { useState, useEffect } from 'react';
import ProblemDisplay from './ProblemDisplay';
import ClickToSelect from './InputMethods/ClickToSelect';
import FeedbackModal from './FeedbackModal';
import SuccessOverlay from './SuccessOverlay';
import ProgressTracker from './ProgressTracker';
import levels from '../../data/levelData';
import { problemGenerators } from '../../data/problemGenerators';
import { storyline } from '../../data/levelData';

const LevelPlayer = ({ 
  levelId, 
  difficulty, 
  playMode,
  stats,
  setStats,
  onLevelComplete,
  onReturnToMenu,
  onLevelChange
}) => {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [levelComplete, setLevelComplete] = useState(false);
  const [showStoryIntro, setShowStoryIntro] = useState(true);

  const level = levels[levelId];
  const levelStory = storyline.levels[levelId];

  useEffect(() => {
    setShowStoryIntro(true);
    setCorrectStreak(0);
    setLevelComplete(false);
    setTimeout(() => {
      setShowStoryIntro(false);
      generateNewProblem();
    }, 3000); // Show story for 3 seconds
  }, [levelId]);

  useEffect(() => {
    if (onLevelChange) {
      onLevelChange(levelId);
    }
  }, [levelId, onLevelChange]);

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
      }, 2000);
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
    
    // Get next level
    const currentNum = parseInt(levelId.split('-')[1]);
    if (currentNum < 37) {
      const nextLevelId = `1-${currentNum + 1}`;
      if (onLevelChange) {
        onLevelChange(nextLevelId);
      }
    } else {
      onReturnToMenu();
    }
  };

  // Story intro screen
  if (showStoryIntro && levelStory) {
    return (
      <div className="story-intro-screen">
        <div className="story-intro-content">
          <h2>{level.name}</h2>
          <p className="story-intro-text">{levelStory.intro}</p>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return <div className="loading">Generating problem...</div>;
  }

  if (levelComplete) {
    return (
      <div className="level-complete">
        <div className="completion-container">
          <div className="completion-icon">🎉</div>
          <h2>Level Complete!</h2>
          <h3>{level.name}</h3>
          
          {level.badge && (
            <div className="badge-earned">
              <p><strong>Badge Earned!</strong></p>
              <div className="badge-display">{level.badge}</div>
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
            {parseInt(levelId.split('-')[1]) < 37 ? 'Next Level →' : 'Complete! 🎉'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="level-player">
      <div className="level-header">
        <button className="back-to-menu-button" onClick={onReturnToMenu}>
          ← Back to Menu
        </button>
        <h2>{level.name}</h2>
        <ProgressTracker 
          current={correctStreak} 
          required={level.problemsRequired} 
        />
      </div>

      <ProblemDisplay problem={currentProblem} />

      {level.inputMethod === 'clickToSelect' && (
        <ClickToSelect
          choices={currentProblem.choices}
          onSubmit={handleAnswerSubmit}
          disabled={showFeedback || showSuccess}
          selectedAnswer={selectedAnswer}
        />
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
