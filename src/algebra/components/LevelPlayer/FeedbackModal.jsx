// FeedbackModal.jsx - COMPREHENSIVE FIX: Visual steps + staged mode support
// Location: src/algebra/components/FeedbackModal.jsx

import React from 'react';
import StackedEquation from '../StackedEquation';
import '../../styles/algebra.css';

const FeedbackModal = ({ explanation, onContinue, correctAnswer, selectedAnswer }) => {
  // SAFETY: Handle explanation as object or string
  const getExplanationContent = () => {
    if (!explanation) {
      return {
        rule: 'Review the problem and try again.',
        hasSteps: false,
        steps: null,
        originalProblem: null
      };
    }
    
    // If explanation is a string, return it as rule
    if (typeof explanation === 'string') {
      return {
        rule: explanation,
        hasSteps: false,
        steps: null,
        originalProblem: null
      };
    }

    // FIX #6: Extract original problem from explanation object
    if (typeof explanation === 'object') {
      // Check if it's the enhanced object from EquationWorksheet
      if (explanation.originalProblem) {
        return {
          rule: explanation.rowInstruction || 'Check your work and try again.',
          hasSteps: false,
          steps: null,
          originalProblem: explanation.originalProblem,
          userAnswer: explanation.userAnswer,
          correctAnswer: explanation.correctAnswer
        };
      }
      
      // Standard explanation object
      const rule = explanation.rule || 'Check your work and try again.';
      const steps = explanation.steps && Array.isArray(explanation.steps) && explanation.steps.length > 0
        ? explanation.steps
        : null;
      const originalProblem = explanation.originalProblem || null;
      
      return {
        rule,
        hasSteps: !!steps,
        steps,
        originalProblem
      };
    }
    
    return {
      rule: 'Check your work and try again.',
      hasSteps: false,
      steps: null,
      originalProblem: null
    };
  };

  const { rule, hasSteps, steps, originalProblem, userAnswer, correctAnswer: correctFromExplanation } = getExplanationContent();

  // Use correctAnswer from props, or from explanation object
  const displayCorrectAnswer = correctAnswer || correctFromExplanation;
  const displayUserAnswer = selectedAnswer || userAnswer;

  // Determine if we should show answer comparison
  const showAnswerComparison = displayCorrectAnswer !== null;
  const showSelectedAnswer = displayUserAnswer !== null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '0.875rem',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '3px solid #EF4444'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#DC2626',
            fontFamily: 'Poppins, sans-serif',
            marginBottom: '0rem',
            marginTop: '0.25rem'
          }}>
            Not Quite!
          </h2>
        </div>

        {/* FIX #6: Original Problem Display */}
        {originalProblem && (
          <div style={{
            background: '#F3F4F6',
            border: '2px solid #9CA3AF',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#374151',
              marginBottom: '0.25rem',
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Original Problem
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1F2937',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {originalProblem}
            </div>
          </div>
        )}

        {/* Answer Comparison - ENHANCED for staged mode */}
        {showAnswerComparison && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: showSelectedAnswer ? 'repeat(2, 1fr)' : '1fr',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            {showSelectedAnswer && (
              <div style={{
                background: '#FEE2E2',
                border: '2px solid #EF4444',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#991B1B',
                  marginBottom: '0.25rem',
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Your Answer
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#DC2626',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {displayUserAnswer}
                </div>
              </div>
            )}

            <div style={{
              background: '#D1FAE5',
              border: '2px solid #10B981',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              textAlign: 'center',
              gridColumn: showSelectedAnswer ? 'auto' : '1 / -1'
            }}>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#065F46',
                marginBottom: '0.25rem',
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Correct Answer
              </div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#059669',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {displayCorrectAnswer}
              </div>
            </div>
          </div>
        )}

        {/* Rule Section - Always show the intro rule */}
        <div style={{
          background: '#FFFBEB',
          border: '2px solid #F59E0B',
          borderRadius: '0.75rem',
          padding: '0.75rem',
          marginBottom: hasSteps ? '0.75rem' : '0.75rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '1.125rem' }}>📖</span>
            <span style={{
              fontWeight: 700,
              color: '#92400E',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Key Rule
            </span>
          </div>
          <div style={{
            color: '#78350F',
            lineHeight: 1.5,
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.925rem',
            whiteSpace: 'pre-wrap'
          }}>
            {rule}
          </div>
        </div>

        {/* Steps Section - Visual rendering if available */}
        {hasSteps && (
          <div style={{
            background: '#F3F4F6',
            border: '2px solid #9CA3AF',
            borderRadius: '0.75rem',
            padding: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '1.125rem' }}>🔢</span>
              <span style={{
                fontWeight: 700,
                color: '#374151',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Step-by-Step Solution
              </span>
            </div>
            <StackedEquation steps={steps} />
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="base-camp-tile-button"
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          Try Again →
        </button>
      </div>
    </div>
  );
};

export default FeedbackModal;
