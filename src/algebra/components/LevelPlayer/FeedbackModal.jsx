// FeedbackModal.jsx - FIXED: Compact, no large X, complete feedback for all modes
// Location: src/algebra/components/FeedbackModal.jsx

import React from 'react';
import StackedEquation from '../StackedEquation';
import '../../styles/algebra.css';

const FeedbackModal = ({ 
  explanation, 
  onContinue, 
  correctAnswer, 
  selectedAnswer,
  problem // NEW: Pass original problem for display
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
      padding: '1.5rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '1.25rem',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '3px solid #EF4444',
        fontFamily: 'Poppins, sans-serif'
      }}>
        {/* Header - COMPACT (no large X) */}
        <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#DC2626',
            fontFamily: 'Poppins, sans-serif',
            margin: 0
          }}>
            Not Quite!
          </h2>
        </div>

        {/* Original Problem - if available */}
        {originalProblem && (
          <div style={{
            background: '#F3F4F6',
            border: '2px solid #9CA3AF',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            marginBottom: '0.75rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.75rem',
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
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#1F2937',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {originalProblem}
            </div>
          </div>
        )}

        {/* Answer Comparison */}
        {showAnswerComparison && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: showSelectedAnswer ? 'repeat(2, 1fr)' : '1fr',
            gap: '0.5rem',
            marginBottom: '0.75rem'
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
                  {selectedAnswer}
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
                {correctAnswer}
              </div>
            </div>
          </div>
        )}

        {/* Rule Section */}
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
            <span style={{ fontSize: '1rem' }}>📖</span>
            <span style={{
              fontWeight: 700,
              color: '#92400E',
              fontSize: '0.75rem',
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
            fontSize: '0.95rem',
            whiteSpace: 'pre-wrap'
          }}>
            {rule}
          </div>
        </div>

        {/* Steps Section */}
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
              marginBottom: '0.75rem'
            }}>
              <span style={{ fontSize: '1rem' }}>🔢</span>
              <span style={{
                fontWeight: 700,
                color: '#374151',
                fontSize: '0.75rem',
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
            padding: '0.875rem',
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
