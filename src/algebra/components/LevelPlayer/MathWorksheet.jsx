// MathWorksheet.jsx - FIXED: Proper staged workflow for L13-16
// Two-stage process: Row 1 (distribute with term bank) → Row 2 (combine with term bank)
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

  // Clean display helper - removes leading + for first term
  const cleanDisplay = (term, isFirst = false) => {
    if (!term) return '___';
    const str = String(term);
    if (isFirst && str.startsWith('+')) {
      return str.substring(1).trim();
    }
    return str;
  };

  // Handle chip click - add term to current row
  const handleChipClick = (chip) => {
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

  // Count how many times a chip has been used across all completed rows
  const getChipUsageCount = (chip) => {
    let count = 0;
    Object.entries(selectedTerms).forEach(([rowId, terms]) => {
      // Only count if this row is completed (locked in)
      if (completedRows.includes(rowId)) {
        count += terms.filter(t => String(t).trim() === String(chip).trim()).length;
      }
    });
    // Also count in current active row
    if (currentSelections.filter(t => String(t).trim() === String(chip).trim()).length > 0) {
      count += currentSelections.filter(t => String(t).trim() === String(chip).trim()).length;
    }
    return count;
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

          return (
            <div 
              key={row.id}
              className={`worksheet-row ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
            >
              {/* Row Label (optional, can show prompt) */}
              {/* <div className="row-label">{row.prompt}</div> */}

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
          );
        })}
      </div>

      {/* Term Bank - Only show for active row if it has a bank */}
      {currentRow.bank && currentRow.bank.length > 0 && !completedRows.includes(currentRow.id) && (
        <div className="worksheet-term-bank">
          <div className="term-bank-label">Available Terms:</div>
          <div className="term-bank-chips">
            {currentRow.bank.map((chip, index) => {
              const usageCount = getChipUsageCount(chip);
              const isInCurrentRow = currentSelections.includes(chip);
              
              return (
                <button
                  key={index}
                  className={`term-chip ${isInCurrentRow ? 'selected' : ''} ${usageCount > 0 ? 'used' : ''}`}
                  onClick={() => handleChipClick(chip)}
                  disabled={currentSelections.length >= currentRow.blanks}
                >
                  {cleanDisplay(chip)}
                  {usageCount > 0 && <span className="chip-badge">{usageCount}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Check Button - Show when all blanks filled */}
      {!completedRows.includes(currentRow.id) && currentSelections.length === currentRow.blanks && (
        <div className="worksheet-check-container">
          <button 
            className="worksheet-check-btn"
            onClick={handleCheckRow}
          >
            {isFinalRow ? 'Submit Answer' : 'Check & Continue →'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MathWorksheet;
