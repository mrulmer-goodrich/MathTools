import React, { useState } from 'react';

const ClickToSelect = ({ choices, onSubmit, disabled, selectedAnswer }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (choice) => {
    if (disabled) return;
    setSelected(choice);
  };

  const handleSubmit = () => {
    if (selected !== null && !disabled) {
      onSubmit(selected);
    }
  };

  return (
    <div className="click-to-select">
      <div className="choices-grid">
        {choices.map((choice, index) => (
          <button
            key={index}
            className={`choice-button ${selected === choice ? 'selected' : ''} ${
              disabled && selectedAnswer === choice ? 'disabled-selected' : ''
            }`}
            onClick={() => handleSelect(choice)}
            disabled={disabled}
          >
            {choice}
          </button>
        ))}
      </div>
      
      <button 
        className="btn-submit-answer"
        onClick={handleSubmit}
        disabled={selected === null || disabled}
      >
        Submit Answer
      </button>
    </div>
  );
};

export default ClickToSelect;
