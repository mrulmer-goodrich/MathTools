// ProblemDisplay.jsx v4.2 - FIXED decimal positions
import React, { useRef, useEffect } from 'react';

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

  const capitalizeFirstLetter = (text) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const extractPercent = (question) => {
    const match = question.match(/(\d+(?:\.\d+)?)%/);
    return match ? match[1] : '25';
  };

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

      {/* Help Menu Popup - Level 1 FIXED DECIMALS */}
      {wrongAnswerFeedback && currentLevel === 1 && (
        <div className="za-help-overlay" onClick={onDismissHelp}>
          <div className="za-help-popup" onClick={(e) => e.stopPropagation()}>
            <div className="za-help-title">Converting Percents to Decimals:</div>
            
            <div className="za-help-example">
              {extractPercent(problem.question)}
              <span className="za-blink-decimal">.</span>
              % → 
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

      {/* Help Menu Popup - Levels 2+ */}
      {wrongAnswerFeedback && currentLevel > 1 && (
        <div className="za-help-overlay" onClick={onDismissHelp}>
          <div className="za-help-popup" onClick={(e) => e.stopPropagation()}>
            <div className="za-help-title">Not Quite!</div>
            
            {wrongAnswerFeedback.guidedNotes && (
              <div className="za-guided-notes">
                <div className="za-guided-title">{wrongAnswerFeedback.guidedNotes.title}</div>
                
                {wrongAnswerFeedback.guidedNotes.visual && (
                  <div className="za-guided-visual">{wrongAnswerFeedback.guidedNotes.visual}</div>
                )}
                
                {wrongAnswerFeedback.guidedNotes.explanation && (
                  <div className="za-guided-explanation">{wrongAnswerFeedback.guidedNotes.explanation}</div>
                )}
                
                {wrongAnswerFeedback.guidedNotes.steps && (
                  <div className="za-guided-steps">
                    {wrongAnswerFeedback.guidedNotes.steps.map((step, idx) => (
                      <div key={idx} className="za-guided-step">{step}</div>
                    ))}
                  </div>
                )}
                
                {wrongAnswerFeedback.guidedNotes.note && (
                  <div className="za-guided-note">{wrongAnswerFeedback.guidedNotes.note}</div>
                )}
                
                {wrongAnswerFeedback.guidedNotes.examples && (
                  <div className="za-guided-examples">{wrongAnswerFeedback.guidedNotes.examples}</div>
                )}
              </div>
            )}
            
            {!wrongAnswerFeedback.guidedNotes && wrongAnswerFeedback.hint && (
              <div style={{
                color: '#FFF',
                fontSize: '16px',
                textAlign: 'center',
                margin: '20px 0',
                lineHeight: '1.6'
              }}>
                {wrongAnswerFeedback.hint}
              </div>
            )}
            
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
