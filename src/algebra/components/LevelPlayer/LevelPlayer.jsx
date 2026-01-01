import React, { useState, useEffect } from 'react';
import ProblemDisplay from './ProblemDisplay';
import ClickToSelect from './InputMethods/ClickToSelect';
import FeedbackModal from './FeedbackModal';
import SuccessOverlay from './SuccessOverlay';
import ProgressTracker from './ProgressTracker';
import levels from '../../data/levelData';
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [levelComplete, setLevelComplete] = useState(false);
  
  // NEW: State for staged workflow
  const [currentRow, setCurrentRow] = useState(0);
  const [row1Answers, setRow1Answers] = useState([]);
  const [row2Answer, setRow2Answer] = useState(null);

  const level = levels[levelId];

  // Helper function to determine region based on level number
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
      
      // Reset staged workflow state
      setCurrentRow(0);
      setRow1Answers([]);
      setRow2Answer(null);
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

  // NEW: Handle staged row submissions
  const handleStagedRowSubmit = (answer) => {
    const staged = currentProblem.staged;
    const currentRowData = staged.rows[currentRow];
    
    if (currentRow === 0) {
      // Row 1: collecting terms
      const newAnswers = [...row1Answers, answer];
      setRow1Answers(newAnswers);
      
      // Check if row 1 is complete
      if (newAnswers.length >= currentRowData.blanks) {
        // Validate row 1
        const allCorrect = newAnswers.every((ans, idx) => 
          ans === currentRowData.expected[idx]
        );
        
        if (allCorrect) {
          // Move to row 2
          setCurrentRow(1);
        } else {
          // Row 1 incorrect - show feedback
          setIsCorrect(false);
          setShowFeedback(true);
          setCorrectStreak(0);
          setStats(prev => ({
            ...prev,
            problemsAttempted: prev.problemsAttempted + 1,
            currentStreak: 0
          }));
        }
      }
    } else {
      // Row 2: final answer
      setRow2Answer(answer);
      handleFinalAnswer(answer);
    }
  };

  // Regular answer submit (for non-staged problems)
  const handleAnswerSubmit = (answer) => {
    // Check if this is a staged problem
    if (currentProblem.staged) {
      handleStagedRowSubmit(answer);
      return;
    }
    
    // Regular single-step problem
    handleFinalAnswer(answer);
  };

  const handleFinalAnswer = (answer) => {
    setSelectedAnswer(answer);
    const correct = answer === currentProblem.answer;
    setIsCorrect(correct);

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
      
      // Show success overlay for 2 seconds
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        
        // Check if level complete
        if (newStreak >= level.problemsRequired) {
          setLevelComplete(true);
        } else {
          // Auto-generate next problem
          generateNewProblem();
        }
      }, 2000);
    } else {
      // Show wrong answer modal
      setCorrectStreak(0);
      setShowFeedback(true);
    }
  };

  const handleContinueFromFeedback = () => {
    setShowFeedback(false);
    generateNewProblem();
  };

  const handleContinueFromComplete = () => {
    // Award badges if applicable
    const badge = level.badge || level.moduleBadge;
    onLevelComplete(levelId, badge);
    
    if (level.moduleBadge || level.finalModule) {
      // Return to menu for module completion
      onReturnToMenu();
    } else {
      // Would advance to next level in full implementation
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

  // Determine what to render based on staged or regular problem
  const isStaged = currentProblem.staged && currentProblem.staged.rows;
  const currentRowData = isStaged ? currentProblem.staged.rows[currentRow] : null;

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

      <ProblemDisplay problem={currentProblem} />

      {/* STAGED WORKFLOW - Two rows */}
      {isStaged && (
        <div className="staged-workflow">
          {/* Row 1: Distribute */}
          <div className={`staged-row ${currentRow === 0 ? 'active' : currentRow > 0 ? 'completed' : 'locked'}`}>
            <div className="row-prompt">{currentProblem.staged.rows[0].prompt}</div>
            <div className="row-workspace">
              {currentRow === 0 && (
                <ClickToSelect
                  choices={currentProblem.staged.rows[0].bank}
                  onSubmit={handleAnswerSubmit}
                  disabled={showFeedback || showSuccess}
                  isTermBank={true}
                  blanksNeeded={currentProblem.staged.rows[0].blanks}
                  selectedTerms={row1Answers}
                />
              )}
              {currentRow > 0 && (
                <div className="completed-row">
                  {row1Answers.map((term, idx) => (
                    <span key={idx} className="completed-term">{term}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Combine */}
          {currentRow >= 1 && (
            <div className={`staged-row ${currentRow === 1 ? 'active' : 'locked'}`}>
              <div className="row-prompt">{currentProblem.staged.rows[1].prompt}</div>
              <div className="row-workspace">
                <ClickToSelect
                  choices={currentProblem.staged.rows[1].choices}
                  onSubmit={handleAnswerSubmit}
                  disabled={showFeedback || showSuccess}
                  isTermBank={false}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* REGULAR WORKFLOW - Single multiple choice */}
      {!isStaged && level.inputMethod === 'clickToSelect' && (
        <ClickToSelect
          choices={currentProblem.choices}
          onSubmit={handleAnswerSubmit}
          disabled={showFeedback || showSuccess}
          selectedAnswer={selectedAnswer}
        />
      )}

      {/* Success Overlay */}
      {showSuccess && (
        <SuccessOverlay message={getSuccessMessage()} />
      )}

      {/* Wrong Answer Modal */}
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
