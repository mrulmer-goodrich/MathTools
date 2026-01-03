// StepRow.jsx - Individual row in staged workflow
// Location: src/algebra/components/LevelPlayer/StepRow.jsx

import React, { useState, useEffect } from 'react';
import TermBank from './TermBank';
import '../../styles/algebra.css';

const StepRow = ({ 
  row, 
  isActive, 
  isCompleted, 
  isLocked,
  answer,
  onComplete 
}) => {
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);

  const isBankRow = row.bank && row.bank.length > 0;
  const isChoiceRow = row.choices && row.choices.length > 0;
  const allBlanksFilled = selectedTerms.length === row.blanks;

  const handleTermClick = (term) => {
    if (!isActive || isCompleted) return;

    // Add term to selected (reusable - can be used multiple times)
    if (selectedTerms.length < row.blanks) {
      setSelectedTerms(prev => [...prev, term]);
    }
  };

  const handleBlankClick = (index) => {
    if (!isActive || isCompleted) return;

    // Remove term at this index
    setSelectedTerms(prev => prev.filter((_, i) => i !== index));
  };

  const handleChoiceClick = (choice) => {
    if (!isActive || isCompleted) return;
    
    setSelectedChoice(choice);
  };

  const handleCheckStep = () => {
    if (!isActive || isCompleted) return;

    if (isBankRow) {
      // Validate as SET (any order)
      const selectedSet = new Set(selectedTerms);
      const expectedSet = new Set(row.expected);
      
      const isCorrect = 
        selectedSet.size === expectedSet.size &&
        selectedTerms.length === row.expected.length &&
        [...selectedSet].every(term => expectedSet.has(term));

      if (isCorrect) {
        onComplete(selectedTerms);
      } else {
        // Reset and show error
        alert('Not quite! Check your work.');
        setSelectedTerms([]);
      }
    } else if (isChoiceRow) {
      // Validate exact match
      if (selectedChoice) {
        onComplete(selectedChoice);
      }
    }
  };

  // Auto-submit for choice rows
  useEffect(() => {
    if (isChoiceRow && selectedChoice && isActive && !isCompleted) {
      onComplete(selectedChoice);
    }
  }, [selectedChoice]);

  return (
    <div className={`step-row ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}>
      {row.prompt && <div className="row-prompt">{row.prompt}</div>}

      <div className="row-workspace">
        {/* Completed State */}
        {isCompleted && (
          <div className="completed-answer">
            {Array.isArray(answer) ? answer.join(' ') : answer}
          </div>
        )}

        {/* Active State - Bank Row */}
        {isActive && !isCompleted && isBankRow && (
          <>
            <div className="blanks-container">
              {Array.from({ length: row.blanks }).map((_, index) => (
                <div 
                  key={index}
                  className="blank"
                  onClick={() => handleBlankClick(index)}
                >
                  {selectedTerms[index] || '___'}
                </div>
              ))}
            </div>

            <TermBank
              terms={row.bank}
              selectedTerms={selectedTerms}
              onTermClick={handleTermClick}
              disabled={!isActive || isCompleted}
            />

            {allBlanksFilled && (
              <button 
                className="check-step-button"
                onClick={handleCheckStep}
              >
                Check Step
              </button>
            )}
          </>
        )}

        {/* Active State - Choice Row */}
        {isActive && !isCompleted && isChoiceRow && (
          <div className="choice-container">
            {row.choices.map((choice, index) => (
              <button
                key={index}
                className={`choice-button ${selectedChoice === choice ? 'selected' : ''}`}
                onClick={() => handleChoiceClick(choice)}
              >
                {choice}
              </button>
            ))}
          </div>
        )}

        {/* Locked State */}
        {isLocked && (
          <div className="locked-message">Complete previous steps first</div>
        )}
      </div>
    </div>
  );
};

export default StepRow;
