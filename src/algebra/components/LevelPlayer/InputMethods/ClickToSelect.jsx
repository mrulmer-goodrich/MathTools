// ClickToSelect.jsx - UPDATED: Safety check added, all functionality preserved
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

  // REGULAR MULTIPLE CHOICE MODE (for Row 2 or regular problems)
  return (
    <div className="click-to-select-container">
      <div className="answer-choices">
        {validChoices.map((choice, index) => {
          const displayChoice = formatAnswerChoice(choice);
          
          return (
            <button
              key={index}
              className={`answer-choice ${localSelected === choice || selectedAnswer === choice ? 'selected' : ''}`}
              onClick={() => handleClick(choice)}
              disabled={disabled}
            >
              {displayChoice}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ClickToSelect;
