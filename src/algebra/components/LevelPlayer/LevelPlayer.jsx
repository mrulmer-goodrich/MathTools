import React, { useState, useEffect } from 'react';
import ProblemDisplay from './ProblemDisplay';
import ClickToSelect from './InputMethods/ClickToSelect';
import FeedbackPanel from './FeedbackPanel';
import ProgressTracker from './ProgressTracker';
import levels, { storyline } from '../../data/levelData';
import { problemGenerators } from '../../data/problemGenerators';

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
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showLevelIntro, setShowLevelIntro] = useState(true);
  const [levelComplete, setLevelComplete] = useState(false);

  const level = levels[levelId];

  useEffect(() => {
    generateNewProblem();
  }, [levelId]);

  const generateNewProblem = () => {
    const generator = problemGenerators[levelId];
    if (generator) {
      const problem = generator(difficulty);
      setCurrentProblem(problem);
      setShowFeedback(false);
      setSelectedAnswer(null);
    } else {
      console.error(`No generator found for level ${levelId}`);
    }
  };

  const handleAnswerSubmit = (answer) => {
    setSelectedAnswer(answer);
    const correct = answer === currentProblem.answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Update stats
    setStats(prev => ({
      ...prev,
      problemsAttempted: prev.problemsAttempted + 1,
      problemsCorrect: correct ? prev.problemsCorrect + 1 : prev.problemsCorrect,
      currentStreak: correct ? prev.currentStreak + 1 : 0
    }));

    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      
      // Check if level complete
      if (newStreak >= level.problemsRequired) {
        setLevelComplete(true);
      }
    } else {
      setCorrectStreak(0);
    }
  };

  const handleContinue = () => {
    if (levelComplete) {
      // Award badges if applicable
      const badge = level.badge || level.moduleBadge;
      onLevelComplete(levelId, badge);
      
      if (level.moduleBadge || level.finalModule) {
        // Show module completion screen
        // For now, return to menu
        onReturnToMenu();
      } else {
        // Move to next level (if in play mode)
        // For now, just return to menu
        onReturnToMenu();
      }
    } else {
      // Generate next problem
      generateNewProblem();
    }
  };

  if (showLevelIntro && storyline.levels[levelId]) {
    return (
      <div className="level-intro">
        <div className="intro-container">
          <div className="level-header">
            <h2>Level {level.number}: {level.name}</h2>
            <p className="skill-description">{level.skill}</p>
          </div>
          
          <div className="story-snippet">
            <p className="story-text">{storyline.levels[levelId].intro}</p>
          </div>

          <div className="level-requirements">
            <p>Master this skill by solving <strong>{level.problemsRequired} problems in a row</strong></p>
          </div>

          <button 
            className="btn-start-level"
            onClick={() => setShowLevelIntro(false)}
          >
            Start Challenge →
          </button>
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
          <h3>{level.name} Mastered</h3>
          
          {level.badge && (
            <div className="badge-earned">
              <p>Badge Earned:</p>
              <div className="badge-display">🏆 {level.badge}</div>
            </div>
          )}

          {level.moduleBadge && (
            <div className="module-badge-earned">
              <p>MODULE COMPLETE!</p>
              <div className="module-badge-display">
                ⭐ {level.moduleBadge} ⭐
              </div>
              {storyline.modules[level.module]?.completion && (
                <div className="completion-story">
                  <p>{storyline.modules[level.module].completion}</p>
                </div>
              )}
            </div>
          )}

          <div className="completion-stats">
            <p>Problems Solved: {level.problemsRequired}</p>
            <p>Streak: {correctStreak}</p>
          </div>

          <button 
            className="btn-continue-expedition"
            onClick={handleContinue}
          >
            {level.moduleBadge ? 'Continue Expedition' : 'Next Challenge'} →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="level-player">
      <div className="level-header">
        <h2>{level.name}</h2>
        <ProgressTracker 
          current={correctStreak} 
          required={level.problemsRequired} 
        />
      </div>

      <ProblemDisplay problem={currentProblem} />

      {/* Render appropriate input method based on level */}
      {level.inputMethod === 'clickToSelect' && (
        <ClickToSelect
          choices={currentProblem.choices}
          onSubmit={handleAnswerSubmit}
          disabled={showFeedback}
          selectedAnswer={selectedAnswer}
        />
      )}

      {/* Other input methods will be added here */}

      {showFeedback && (
        <FeedbackPanel
          isCorrect={isCorrect}
          explanation={currentProblem.explanation}
          onContinue={handleContinue}
          correctAnswer={currentProblem.answer}
          selectedAnswer={selectedAnswer}
        />
      )}

      <div className="level-actions">
        <button className="btn-exit" onClick={onReturnToMenu}>
          Exit Level
        </button>
      </div>
    </div>
  );
};

export default LevelPlayer;
