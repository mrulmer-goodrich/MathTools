// ProblemDisplay.jsx v4.1 - COMPLETE REWRITE
// All fixes: Help popup, blinking decimals, unlocked final answer, capitalization, no emojis
import React, { useRef, useEffect, useState } from 'react';

const ProblemDisplay = ({
  problem,
  problemNumber,
  totalProblems,
  userAnswer,
  onAnswerChange,
  onSubmit,
  onKeyPress,
  wrongAnswerFeedback,
  onDismissHelp,
  currentLevel
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && problem.type !== 'multiple-choice') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [problem]);

  if (!problem) return null;

  // Helper: Capitalize first letter of problem text
  const capitalizeFirstLetter = (text) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Helper: Extract percent value from question for help menu
  const extractPercent = (question) => {
    const match = question.match(/(\d+(?:\.\d+)?)%/);
    return match ? match[1] : '25';
  };

  // Handle multiple choice clicks
  const handleChoiceClick = (choice) => {
    onAnswerChange(choice);
    setTimeout(() => {
      onSubmit(choice);
    }, 50);
  };

  return (
    <>
      <div className="za-problem-display">
        <div className="za-problem-header">
          <span className="za-problem-counter" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
            Problem {problemNumber} of {totalProblems}
          </span>
        </div>

        <div className="za-problem-question">
          {capitalizeFirstLetter(problem.question)}
        </div>

        {problem.type === 'multiple-choice' ? (
          <div className="za-choices-container">
            {problem.choices.map((choice, index) => (
              <button
                key={index}
                className={`za-choice-button ${userAnswer === choice ? 'selected' : ''}`}
                onClick={() => handleChoiceClick(choice)}
              >
                {choice.toUpperCase()}
              </button>
            ))}
          </div>
        ) : (
          <div className="za-answer-section">
            <input
              ref={inputRef}
              type="text"
              className="za-answer-input"
              value={userAnswer}
              onChange={(e) => onAnswerChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Enter your answer..."
            />
            <button
              className="za-submit-button"
              onClick={() => onSubmit()}
              disabled={!userAnswer.trim()}
            >
              Submit Answer
            </button>
          </div>
        )}
      </div>

      {/* Help Menu Popup - Level 1 */}
      {wrongAnswerFeedback && currentLevel === 1 && (
        <div className="za-help-overlay" onClick={onDismissHelp}>
          <div className="za-help-popup" onClick={(e) => e.stopPropagation()}>
            <div className="za-help-title">Converting Percents to Decimals:</div>
            
            <div className="za-help-example">
              {extractPercent(problem.question)}% → 
              <span className="za-blink-decimal">.</span>
              <span className="za-blink-decimal">.</span> → 
              <span className="za-help-answer">{wrongAnswerFeedback.correctAnswer}</span>
            </div>
            
            <div className="za-help-instruction">
              Move the decimal TWO places to the LEFT
            </div>
            
            <div className="za-help-examples">
              Examples: 8% = 0.08  |  50% = 0.50  |  125% = 1.25
            </div>
            
            <button 
              onClick={onDismissHelp}
              className="za-help-dismiss-btn"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Help Menu Popup - Levels 2+ (Generic) */}
      {wrongAnswerFeedback && currentLevel > 1 && (
        <div className="za-help-overlay" onClick={onDismissHelp}>
          <div className="za-help-popup" onClick={(e) => e.stopPropagation()}>
            <div className="za-help-title">Incorrect Answer</div>
            
            <div style={{
              color: '#FFF',
              fontSize: '16px',
              textAlign: 'center',
              margin: '20px 0',
              lineHeight: '1.6'
            }}>
              {wrongAnswerFeedback.hint || 'Check your calculation and try again.'}
            </div>
            
            {wrongAnswerFeedback.correctAnswer && (
              <div style={{
                color: '#4CAF50',
                fontSize: '24px',
                fontWeight: 'bold',
                textAlign: 'center',
                margin: '20px 0',
                fontFamily: 'Courier New, monospace'
              }}>
                Correct answer: {wrongAnswerFeedback.correctAnswer}
              </div>
            )}
            
            <button 
              onClick={onDismissHelp}
              className="za-help-dismiss-btn"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProblemDisplay;
