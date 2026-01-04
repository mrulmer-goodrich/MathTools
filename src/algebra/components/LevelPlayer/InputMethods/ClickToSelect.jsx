// ClickToSelect.jsx - FIXED: Larger buttons, better sizing
// Location: src/algebra/components/LevelPlayer/InputMethods/ClickToSelect.jsx

import React, { useState } from 'react';
import { formatAnswerChoice, validateChoices } from '../../../utils/formatUtils';
import '../../../styles/algebra.css';

const ClickToSelect = ({ 
  choices, 
  onSubmit, 
  disabled,
  selectedAnswer,
  isTermBank = false,
  blanksNeeded = 1,
  selectedTerms = []
}) => {
  const [localSelected, setLocalSelected] = useState(selectedAnswer || null);

  // SAFETY CHECK: Don't render if no choices
  if (!choices || choices.length === 0) {
    return null;
  }

  // Filter out NaN and invalid choices
  const validChoices = validateChoices(choices);
  
  // Warn if we filtered anything out
  if (validChoices.length < choices.length) {
    console.error('Invalid choices detected and filtered:', 
      choices.filter(c => !validChoices.includes(c)));
  }

  // SAFETY CHECK: If all choices were invalid, don't render
  if (validChoices.length === 0) {
    console.error('No valid choices available');
    return null;
  }

  const handleClick = (choice) => {
    if (disabled) return;
    
    if (isTermBank) {
      // Term bank mode: just submit the choice immediately
      onSubmit(choice);
    } else {
      // Regular multiple choice mode
      setLocalSelected(choice);
      onSubmit(choice);
    }
  };

  // TERM BANK MODE (for Row 1 - distributing)
  if (isTermBank) {
    return (
      <div className="term-bank-container">
        <div className="selected-terms-area">
          <div className="term-blanks">
            {Array.from({ length: blanksNeeded }).map((_, idx) => (
              <div key={idx} className="term-blank">
                {selectedTerms[idx] ? (
                  <span className="selected-term">{formatAnswerChoice(selectedTerms[idx])}</span>
                ) : (
                  <span className="blank-placeholder">___</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="term-bank">
          <div className="bank-label">Available Terms:</div>
          <div className="term-chips">
            {validChoices.map((choice, index) => {
              const isUsed = selectedTerms.includes(choice);
              const displayChoice = formatAnswerChoice(choice);
              
              return (
                <button
                  key={index}
                  className={`term-chip ${isUsed ? 'used' : ''}`}
                  onClick={() => handleClick(choice)}
                  disabled={disabled || isUsed}
                >
                  {displayChoice}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // REGULAR MULTIPLE CHOICE MODE
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1.25rem',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '0 1rem'
    }}>
      {validChoices.map((choice, index) => {
        const displayChoice = formatAnswerChoice(choice);
        const isSelected = localSelected === choice || selectedAnswer === choice;
        
        return (
          <button
            key={index}
            className={`answer-choice ${isSelected ? 'selected' : ''}`}
            onClick={() => handleClick(choice)}
            disabled={disabled}
            style={{
              background: isSelected 
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'white',
              color: isSelected ? 'white' : '#1F2937',
              border: `4px solid ${isSelected ? '#047857' : '#D1D5DB'}`,
              borderRadius: '1rem',
              padding: '1.75rem 1.5rem',
              fontSize: '1.5rem',
              fontWeight: 700,
              fontFamily: 'Poppins, sans-serif',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isSelected 
                ? '0 8px 20px rgba(16, 185, 129, 0.4)'
                : '0 4px 6px rgba(0, 0, 0, 0.1)',
              minHeight: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              transform: isSelected ? 'scale(1.03)' : 'scale(1)',
              opacity: disabled ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!disabled && !isSelected) {
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.25)';
                e.target.style.borderColor = '#10B981';
                e.target.style.background = 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && !isSelected) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.background = 'white';
              }
            }}
          >
            {displayChoice}
          </button>
        );
      })}
    </div>
  );
};

export default ClickToSelect;
