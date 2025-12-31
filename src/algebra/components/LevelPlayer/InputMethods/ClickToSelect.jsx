// ClickToSelect.jsx - UPDATED: Click = Instant Submit (No Button)
// Location: src/algebra/components/LevelPlayer/InputMethods/ClickToSelect.jsx

import React, { useState } from 'react';
import '../../../styles/algebra.css';

const ClickToSelect = ({ choices, onSubmit, disabled }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleClick = (choice) => {
    if (disabled) return;
    
    // Instant submit - no button needed!
    setSelectedAnswer(choice);
    onSubmit(choice);
  };

  return (
    <div className="click-to-select-container">
      <div className="answer-choices">
        {choices.map((choice, index) => (
          <button
            key={index}
            className={`answer-choice ${selectedAnswer === choice ? 'selected' : ''}`}
            onClick={() => handleClick(choice)}
            disabled={disabled}
          >
            {choice}
          </button>
        ))}
      </div>
      {/* NO SUBMIT BUTTON - clicking = submitting! */}
    </div>
  );
};

export default ClickToSelect;
