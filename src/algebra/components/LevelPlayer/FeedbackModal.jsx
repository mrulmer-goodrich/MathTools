// FeedbackModal.jsx - FIXED: Handle explanation object/string properly
// Location: src/algebra/components/FeedbackModal.jsx

import React from 'react';
import '../../styles/algebra.css';

const FeedbackModal = ({ explanation, onContinue, correctAnswer, selectedAnswer }) => {
  // SAFETY: Handle explanation as object or string
  const getExplanationText = () => {
    if (!explanation) return 'Review the problem and try again.';
    
    // If explanation is a string, return it
    if (typeof explanation === 'string') return explanation;
    
    // If explanation has steps (old format), extract text
    if (explanation.steps && Array.isArray(explanation.steps)) {
      return explanation.steps
        .map(step => step.description || step.work || '')
        .filter(Boolean)
        .join('\n');
    }
    
    // If explanation has a rule property
    if (explanation.rule) return explanation.rule;
    
    // Fallback
    return 'Check your work and try again.';
  };

  const explanationText = getExplanationText();

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
        padding: '2.5rem',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '3px solid #EF4444'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>❌</div>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#DC2626',
            fontFamily: 'Poppins, sans-serif',
            marginBottom: '0.5rem'
          }}>
            Not Quite!
          </h2>
        </div>

        {selectedAnswer !== null && correctAnswer !== null && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              background: '#FEE2E2',
              border: '2px solid #EF4444',
              borderRadius: '0.5rem',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#991B1B',
                marginBottom: '0.5rem',
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Your Answer
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#DC2626',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {selectedAnswer}
              </div>
            </div>

            <div style={{
              background: '#D1FAE5',
              border: '2px solid #10B981',
              borderRadius: '0.5rem',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#065F46',
                marginBottom: '0.5rem',
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Correct Answer
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#059669',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {correctAnswer}
              </div>
            </div>
          </div>
        )}

        <div style={{
          background: '#FFFBEB',
          border: '2px solid #F59E0B',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>📝</span>
            <span style={{
              fontWeight: 700,
              color: '#92400E',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Explanation
            </span>
          </div>
          <div style={{
            color: '#78350F',
            lineHeight: 1.7,
            fontFamily: 'Poppins, sans-serif',
            fontSize: '1rem',
            whiteSpace: 'pre-wrap'
          }}>
            {explanationText}
          </div>
        </div>

        <button
          onClick={onContinue}
          className="base-camp-tile-button"
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.125rem',
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
