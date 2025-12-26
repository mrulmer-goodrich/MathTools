import React from 'react';
import '../../styles/algebra.css';

const StackedEquation = ({ steps }) => {
  return (
    <div className="stacked-equations-container">
      {steps.map((step, index) => (
        <div key={index} className="equation-step">
          {step.description && (
            <div className="step-description">{step.description}</div>
          )}
          {step.work && (
            <pre className="step-work">{step.work}</pre>
          )}
        </div>
      ))}
    </div>
  );
};

const FeedbackModal = ({ isCorrect, explanation, onContinue }) => {
  if (!explanation) return null;

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal-content">
        <div className="feedback-header">
          {isCorrect ? (
            <h2 className="feedback-correct">✓ Correct!</h2>
          ) : (
            <h2 className="feedback-incorrect">✗ Not Quite!</h2>
          )}
        </div>

        {!isCorrect && (
          <div className="feedback-body">
            {explanation.originalProblem && (
              <div className="original-problem">
                <div className="original-problem-label">Original Problem:</div>
                <div className="original-problem-text">{explanation.originalProblem}</div>
              </div>
            )}

            {explanation.steps && explanation.steps.length > 0 && (
              <StackedEquation steps={explanation.steps} />
            )}

            {explanation.rule && (
              <div className="rule-box">
                <div className="rule-label">📐 RULE:</div>
                <div className="rule-text">{explanation.rule}</div>
              </div>
            )}

            {explanation.finalAnswer && (
              <div className="final-answer">
                <strong>Answer:</strong> {explanation.finalAnswer}
              </div>
            )}
          </div>
        )}

        {/* FIXED: Proper footer for button */}
        <div className="feedback-modal-footer">
          <button className="continue-button" onClick={onContinue}>
            {isCorrect ? 'Continue' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
