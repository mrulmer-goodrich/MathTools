import React from 'react';

const FeedbackPanel = ({ 
  isCorrect, 
  explanation, 
  onContinue, 
  correctAnswer, 
  selectedAnswer 
}) => {
  if (isCorrect) {
    return (
      <div className="feedback-panel correct">
        <div className="feedback-header">
          <span className="feedback-icon">✅</span>
          <h3>Correct!</h3>
        </div>
        <p>Great work! You got it right.</p>
        <button className="btn-continue" onClick={onContinue}>
          Continue →
        </button>
      </div>
    );
  }

  return (
    <div className="feedback-panel incorrect">
      <div className="feedback-header">
        <span className="feedback-icon">❌</span>
        <h3>Not quite!</h3>
      </div>

      <div className="feedback-content">
        {explanation.steps && explanation.steps.length > 0 && (
          <div className="explanation-steps">
            {explanation.steps.map((step, index) => (
              <div key={index} className="explanation-step">
                <p className="step-description">{step.description}</p>
                {step.work && (
                  <pre className="step-work">{step.work}</pre>
                )}
              </div>
            ))}
          </div>
        )}

        {explanation.rule && (
          <div className="rule-box">
            <strong>RULE:</strong> {explanation.rule}
          </div>
        )}

        <div className="correct-answer-display">
          <p>The correct answer is: <strong>{correctAnswer}</strong></p>
          {selectedAnswer !== null && (
            <p className="selected-answer">You selected: {selectedAnswer}</p>
          )}
        </div>
      </div>

      <button className="btn-try-again" onClick={onContinue}>
        Try Another Problem
      </button>
    </div>
  );
};

export default FeedbackPanel;
