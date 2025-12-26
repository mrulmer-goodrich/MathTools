import React from 'react';

const FeedbackModal = ({ 
  explanation, 
  onContinue, 
  correctAnswer, 
  selectedAnswer 
}) => {
  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal incorrect">
        <div className="feedback-header">
          <span className="feedback-icon">❌</span>
          <h3>Not Quite!</h3>
        </div>

        <div className="feedback-content">
          {explanation.originalProblem && (
            <div className="original-problem">
              <div className="original-problem-label">Original Problem:</div>
              <div className="original-problem-text">{explanation.originalProblem}</div>
            </div>
          )}

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

          <button className="btn-try-again" onClick={onContinue}>
            Try Another Problem →
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
