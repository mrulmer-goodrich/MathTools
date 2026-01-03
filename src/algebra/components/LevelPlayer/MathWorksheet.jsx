// MathWorksheet.jsx - COMPLETE REDESIGN
// Matches levels 1-12 style, single container, chips on right
// Location: src/algebra/components/LevelPlayer/MathWorksheet.jsx

import React, { useState } from 'react';
import '../../styles/algebra.css';

const MathWorksheet = ({ 
  problem,
  onComplete,
  onWrongAnswer 
}) => {
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [completedRows, setCompletedRows] = useState([]);
  const [rowAnswers, setRowAnswers] = useState({});
  const [selectedTerms, setSelectedTerms] = useState({});

  if (!problem.staged || !problem.staged.rows) {
    return <div className="error">Problem structure invalid</div>;
  }

  const rows = problem.staged.rows;
  const currentRow = rows[currentRowIndex];
  const isFinalRow = currentRowIndex === rows.length - 1;

  // Get all available chips from current row
  const availableChips = currentRow.bank || [];
  const isBankRow = availableChips.length > 0;
  const isChoiceRow = currentRow.choices && currentRow.choices.length > 0;

  const handleChipClick = (chip) => {
    const rowId = currentRow.id;
    const current = selectedTerms[rowId] || [];
    
    if (current.length < currentRow.blanks) {
      setSelectedTerms(prev => ({
        ...prev,
        [rowId]: [...current, chip]
      }));
    }
  };

  const handleBlankClick = (rowId, index) => {
    const current = selectedTerms[rowId] || [];
    setSelectedTerms(prev => ({
      ...prev,
      [rowId]: current.filter((_, i) => i !== index)
    }));
  };

  const handleCheckStep = () => {
    const rowId = currentRow.id;
    const current = selectedTerms[rowId] || [];

    if (isBankRow) {
      // Validate as SET
      const selectedSet = new Set(current);
      const expectedSet = new Set(currentRow.expected);
      
      const isCorrect = 
        selectedSet.size === expectedSet.size &&
        current.length === currentRow.expected.length &&
        [...selectedSet].every(term => expectedSet.has(term));

      if (isCorrect) {
        setRowAnswers(prev => ({ ...prev, [rowId]: current }));
        setCompletedRows(prev => [...prev, rowId]);
        
        if (isFinalRow) {
          onComplete();
        } else {
          setCurrentRowIndex(prev => prev + 1);
        }
      } else {
        alert('Not quite! Check your work.');
        setSelectedTerms(prev => ({ ...prev, [rowId]: [] }));
      }
    }
  };

  const handleChoiceClick = (choice) => {
    const isCorrect = choice === problem.answer;
    
    if (isCorrect) {
      onComplete();
    } else {
      onWrongAnswer();
    }
  };

  // Clean display: remove leading + sign
  const cleanDisplay = (term) => {
    if (typeof term === 'string' && term.startsWith('+') && term.length > 1) {
      return term.substring(1);
    }
    return term;
  };

  // Count chip usage across all rows
  const getChipUsageCount = (chip) => {
    let count = 0;
    Object.values(selectedTerms).forEach(terms => {
      count += terms.filter(t => t === chip).length;
    });
    return count;
  };

  return (
    <div className="staged-problem-container">
      {/* LEFT: Problem and Work Area */}
      <div className="staged-left-panel">
        {/* Problem Display */}
        <div className="staged-problem-display">
          {problem.displayProblem || problem.problem}
        </div>

        {/* Work Area - All Rows */}
        <div className="staged-work-area">
          {rows.map((row, index) => {
            const isCompleted = completedRows.includes(row.id);
            const isActive = index === currentRowIndex;
            const isLocked = index > currentRowIndex;
            const rowTerms = selectedTerms[row.id] || [];
            const rowAnswer = rowAnswers[row.id];

            return (
              <div 
                key={row.id}
                className={`staged-row ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
              >
                {/* Completed Row */}
                {isCompleted && !isChoiceRow && (
                  <div className="staged-row-completed">
                    {rowAnswer.map((term, i) => (
                      <span key={i} className="staged-term-display">
                        {i === 0 ? cleanDisplay(term) : term}
                      </span>
                    ))}
                  </div>
                )}

                {/* Active Bank Row */}
                {isActive && isBankRow && !isCompleted && (
                  <div className="staged-row-active">
                    <div className="staged-blanks">
                      {Array.from({ length: row.blanks }).map((_, i) => (
                        <div 
                          key={i}
                          className="staged-blank"
                          onClick={() => handleBlankClick(row.id, i)}
                        >
                          {rowTerms[i] ? (i === 0 ? cleanDisplay(rowTerms[i]) : rowTerms[i]) : '___'}
                        </div>
                      ))}
                    </div>
                    
                    {rowTerms.length === row.blanks && (
                      <button 
                        className="staged-check-btn"
                        onClick={handleCheckStep}
                      >
                        Check
                      </button>
                    )}
                  </div>
                )}

                {/* Active Choice Row */}
                {isActive && isChoiceRow && !isCompleted && (
                  <div className="staged-choices">
                    {row.choices.map((choice, i) => (
                      <button
                        key={i}
                        className="staged-choice-btn"
                        onClick={() => handleChoiceClick(choice)}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                )}

                {/* Locked Row */}
                {isLocked && (
                  <div className="staged-row-locked">
                    {Array.from({ length: row.blanks }).map((_, i) => (
                      <div key={i} className="staged-blank-locked">___</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Chips Panel */}
      {isBankRow && !completedRows.includes(currentRow.id) && (
        <div className="staged-right-panel">
          <div className="staged-chips-label">Available Terms:</div>
          <div className="staged-chips-container">
            {availableChips.map((chip, index) => {
              const useCount = getChipUsageCount(chip);
              
              return (
                <button
                  key={index}
                  className={`staged-chip ${useCount > 0 ? 'used' : ''}`}
                  onClick={() => handleChipClick(chip)}
                >
                  {cleanDisplay(chip)}
                  {useCount > 0 && <span className="staged-chip-badge">{useCount}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MathWorksheet;
