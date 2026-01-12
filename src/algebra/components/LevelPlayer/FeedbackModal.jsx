// FeedbackModal.jsx - v14 FINAL: Fractions, minimal padding, no scroll
// Location: src/algebra/components/FeedbackModal.jsx

import React from 'react';
import StackedEquation from '../StackedEquation';
import FractionDisplay from './FractionDisplay';
import '../../styles/algebra.css';

const FeedbackModal = ({ 
  explanation, 
  onContinue, 
  correctAnswer, 
  selectedAnswer,
  problem
}) => {
  // SAFETY: Handle explanation as object or string
  const getExplanationContent = () => {
    if (!explanation) {
      return {
        rule: 'Review the problem and try again.',
        hasSteps: false,
        steps: null,
        originalProblem: problem?.problem || problem?.displayProblem || null
      };
    }
    
    // If explanation is a string, return it as rule
    if (typeof explanation === 'string') {
      return {
        rule: explanation,
        hasSteps: false,
        steps: null,
        originalProblem: problem?.problem || problem?.displayProblem || null
      };
    }
    
    // If explanation is an object, extract rule and steps
    const rule = explanation.rule || 'Check your work and try again.';
    const steps = explanation.steps && Array.isArray(explanation.steps) && explanation.steps.length > 0
      ? explanation.steps
      : null;
    const originalProblem = explanation.originalProblem || problem?.problem || problem?.displayProblem || null;
    
    return {
      rule,
      hasSteps: !!steps,
      steps,
      originalProblem
    };
  };

  const { rule, hasSteps, steps, originalProblem } = getExplanationContent();

  // Determine if we should show answer comparison
  const showAnswerComparison = correctAnswer !== null && correctAnswer !== undefined;
  const showSelectedAnswer = selectedAnswer !== null && selectedAnswer !== undefined;

  // FIXED v14: Helper to render answer with fractions
  const renderAnswerValue = (value) => {
    if (!value) return null;
    const strValue = String(value);
    
    // Check if value contains fraction notation
    if (strValue.includes('/')) {
      return <FractionDisplay expression={strValue} />;
    }
    
    return strValue;
  };

  // FIXED v14: Helper to render problem with fractions
  const renderProblemValue = (value) => {
    if (!value) return null;
    const strValue = String(value);
    
    // Check if value contains fraction notation
    if (strValue.includes('/')) {
      return <FractionDisplay expression={strValue} />;
    }
    
    return strValue;
  };

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal-content-compact">
        {/* Header - MINIMAL */}
        <div className="feedback-header-compact">
          <h2 className="feedback-title-compact">Not Quite!</h2>
        </div>

        {/* Original Problem - COMPACT with fractions */}
        {originalProblem && (
          <div className="feedback-section-compact feedback-original">
            <div className="feedback-section-label">ORIGINAL PROBLEM</div>
            <div className="feedback-section-value">
              {renderProblemValue(originalProblem)}
            </div>
          </div>
        )}

        {/* Answer Comparison - COMPACT GRID with fractions */}
        {showAnswerComparison && (
          <div className={`feedback-answers-grid ${showSelectedAnswer ? 'two-col' : 'one-col'}`}>
            {showSelectedAnswer && (
              <div className="feedback-answer-box feedback-wrong">
                <div className="feedback-answer-label">YOUR ANSWER</div>
                <div className="feedback-answer-value">
                  {renderAnswerValue(selectedAnswer)}
                </div>
              </div>
            )}

            <div className={`feedback-answer-box feedback-correct ${!showSelectedAnswer ? 'full-width' : ''}`}>
              <div className="feedback-answer-label">CORRECT ANSWER</div>
              <div className="feedback-answer-value">
                {renderAnswerValue(correctAnswer)}
              </div>
            </div>
          </div>
        )}

        {/* Rule Section - COMPACT */}
        <div className="feedback-section-compact feedback-rule">
          <div className="feedback-section-icon-label">
            <span>📖</span>
            <span>KEY RULE</span>
          </div>
          <div className="feedback-section-text">{rule}</div>
        </div>

        {/* Steps Section - COMPACT */}
        {hasSteps && (
          <div className="feedback-section-compact feedback-steps">
            <div className="feedback-section-icon-label">
              <span>🔢</span>
              <span>STEP-BY-STEP SOLUTION</span>
            </div>
            <StackedEquation steps={steps} />
          </div>
        )}

        {/* Continue Button - COMPACT */}
        <button
          onClick={onContinue}
          className="feedback-continue-btn-compact"
        >
          Try Again →
        </button>
      </div>
    </div>
  );
};

export default FeedbackModal;
