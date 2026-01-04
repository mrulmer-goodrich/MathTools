// MathWorksheet.jsx - REVISED: Proper Row 2 choices handling, better layout
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
  const [selectedTerms, setSelectedTerms] = useState({});

  // SAFETY: Validate problem structure
  if (!problem.staged || !problem.staged.rows) {
    console.error('MathWorksheet: Invalid staged structure', problem);
    return <div className="error">Problem structure invalid</div>;
  }

  const rows = problem.staged.rows;
  const currentRow = rows[currentRowIndex];
  const isFinalRow = currentRowIndex === rows.length - 1;

  // Get current selections for this row
  const currentSelections = selectedTerms[currentRow.id] || [];

  // Determine if current row uses term bank or choices
  const hasBank = currentRow.bank && currentRow.bank.length > 0;
  const hasChoices = currentRow.choices && currentRow.choices.length > 0;

  // Clean display helper - removes leading + for first term
  const cleanDisplay = (term, isFirst = false) => {
    if (!term) return '___';
    const str = String(term);
    if (isFirst && str.startsWith('+')) {
      return str.substring(1).trim();
    }
    return str;
  };

  // Handle chip click - add term to current row (for bank rows)
  const handleBankChipClick = (chip) => {
    const rowId = currentRow.id;
    const current = selectedTerms[rowId] || [];
    
    // Only add if we haven't filled all blanks yet
    if (current.length < currentRow.blanks) {
      setSelectedTerms(prev => ({
        ...prev,
        [rowId]: [...current, chip]
      }));
    }
  };

  // Handle choice click - select answer for current row (for choice rows)
  const handleChoiceClick = (choice) => {
    const rowId = currentRow.id;
    setSelectedTerms(prev => ({
      ...prev,
      [rowId]: [choice]  // Store as array for consistency
    }));
  };

  // Handle blank click - remove term from that position
  const handleBlankClick = (index) => {
    const rowId = currentRow.id;
    const current = selectedTerms[rowId] || [];
    
    setSelectedTerms(prev => ({
      ...prev,
      [rowId]: current.filter((_, i) => i !== index)
    }));
  };

  // Check if current row is correct
  const handleCheckRow = () => {
    const rowId = currentRow.id;
    const selected = selectedTerms[rowId] || [];

    // Validate as SET (order doesn't matter for distributed terms)
    const selectedSet = new Set(selected.map(t => String(t).trim()));
    const expectedSet = new Set(currentRow.expected.map(t => String(t).trim()));
    
    const isCorrect = 
      selectedSet.size === expectedSet.size &&
      selected.length === currentRow.expected.length &&
      [...selectedSet].every(term => expectedSet.has(term));

    if (isCorrect) {
      // Mark row as completed
      setCompletedRows(prev => [...prev, rowId]);
      
      // If this is the final row, level complete
      if (isFinalRow) {
        onComplete();
      } else {
        // Move to next row
        setCurrentRowIndex(prev => prev + 1);
      }
    } else {
      // Wrong answer - trigger feedback modal
      onWrongAnswer();
      // Clear selections for this row so student can try again
      setSelectedTerms(prev => ({
        ...prev,
        [rowId]: []
      }));
    }
  };

  return (
    <div className="math-worksheet-container">
      {/* Original Problem - Always visible at top */}
      <div className="worksheet-problem-display">
        {problem.displayProblem || problem.problem}
      </div>

      {/* Work Area - Shows all rows in sequence */}
      <div className="worksheet-work-area">
        {rows.map((row, index) => {
          const isCompleted = completedRows.includes(row.id);
          const isActive = index === currentRowIndex;
          const isLocked = index > currentRowIndex;
          const rowSelections = selectedTerms[row.id] || [];
          const rowHasBank = row.bank && row.bank.length > 0;
          const rowHasChoices = row.choices && row.choices.length > 0;

          return (
            <div 
              key={row.id}
              className={`worksheet-row ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
            >
              <div className="worksheet-row-content">
                {/* COMPLETED ROW - Show the locked-in answer */}
                {isCompleted && (
                  <div className="worksheet-row-answer">
                    {rowSelections.map((term, i) => (
                      <span key={i} className="completed-term">
                        {cleanDisplay(term, i === 0)}
                      </span>
                    ))}
                  </div>
                )}

                {/* ACTIVE ROW - Show blanks to fill */}
                {isActive && !isCompleted && (
                  <>
                    <div className="worksheet-row-blanks">
                      {Array.from({ length: row.blanks }).map((_, i) => (
                        <button
                          key={i}
                          className={`worksheet-blank ${rowSelections[i] ? 'filled' : 'empty'}`}
                          onClick={() => rowSelections[i] && handleBlankClick(i)}
                        >
                          {rowSelections[i] ? cleanDisplay(rowSelections[i], i === 0) : '___'}
                        </button>
                      ))}
                    </div>
                    
                    {/* Check Button - Inline with blanks */}
                    {rowSelections.length === row.blanks && (
                      <button 
                        className="worksheet-check-btn-inline"
                        onClick={handleCheckRow}
                      >
                        {isFinalRow ? '✓ Submit' : '✓ Check'}
                      </button>
                    )}
                  </>
                )}

                {/* LOCKED ROW - Show empty blanks (future rows) */}
                {isLocked && (
                  <div className="worksheet-row-locked">
                    {Array.from({ length: row.blanks }).map((_, i) => (
                      <span key={i} className="locked-blank">___</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Term Bank OR Choices - Only show for active row */}
      {!completedRows.includes(currentRow.id) && (
        <>
          {/* TERM BANK (Row 1 style) */}
          {hasBank && (
            <div className="worksheet-term-bank">
              <div className="term-bank-label">Available Terms:</div>
              <div className="term-bank-chips">
                {currentRow.bank.map((chip, index) => {
                  const isSelected = currentSelections.includes(chip);
                  
                  return (
                    <button
                      key={index}
                      className={`term-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleBankChipClick(chip)}
                      disabled={currentSelections.length >= currentRow.blanks}
                    >
                      {cleanDisplay(chip)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CHOICES (Row 2 style) */}
          {hasChoices && !hasBank && (
            <div className="worksheet-choices">
              <div className="term-bank-label">Select Final Answer:</div>
              <div className="term-bank-chips">
                {currentRow.choices.map((choice, index) => {
                  const isSelected = currentSelections.includes(choice);
                  
                  return (
                    <button
                      key={index}
                      className={`term-chip choice-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleChoiceClick(choice)}
                    >
                      {cleanDisplay(choice)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MathWorksheet;
