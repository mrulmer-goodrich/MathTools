// ClickToSelect.jsx - UPDATED: Format display + filter NaN
// Location: src/algebra/components/LevelPlayer/InputMethods/ClickToSelect.jsx

import React, { useState } from 'react';
import { formatAnswerChoice, validateChoices } from '../../../utils/formatUtils';
import '../../../styles/algebra.css';

const ClickToSelect = ({ choices, onSubmit, disabled }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Filter out NaN and invalid choices
  const validChoices = validateChoices(choices);
  
  // Warn if we filtered anything out
  if (validChoices.length < choices.length) {
    console.error('Invalid choices detected and filtered:', 
      choices.filter(c => !validChoices.includes(c)));
  }

  const handleClick = (choice) => {
    if (disabled) return;
    
    setSelectedAnswer(choice);
    onSubmit(choice);
  };

  return (
    <div className="click-to-select-container">
      <div className="answer-choices">
        {validChoices.map((choice, index) => {
          // Format the choice for display
          const displayChoice = formatAnswerChoice(choice);
          
          return (
            <button
              key={index}
              className={`answer-choice ${selectedAnswer === choice ? 'selected' : ''}`}
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
