// EquationWorksheet.jsx - Equation solver with vertical line and dual-box layout
// Location: src/algebra/components/LevelPlayer/EquationWorksheet.jsx

import React, { useState, useEffect } from 'react';
import '../../styles/algebra.css';

const EquationWorksheet = ({ 
  problem,
  onComplete,
  onWrongAnswer 
}) => {
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [completedRows, setCompletedRows] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState({});
  const [showVerticalLine, setShowVerticalLine] = useState(false);

  // Reset state when problem changes
  useEffect(() => {
    setCurrentRowIndex(0);
    setCompletedRows([]);
    setSelectedTerms({});
    setShowVerticalLine(false);
  }, [problem]);

  // SAFETY: Validate problem structure
  if (!problem.staged || !problem.staged.rows) {
    console.error('EquationWorksheet: Invalid staged structure', problem);
    return <div className="error">Problem structure invalid</div>;
  }

  const rows = problem.staged.rows;
  const currentRow = rows[currentRowIndex];
  const isFinalRow = currentRowIndex === rows.length - 1;

  // Get current selections for this row
  const currentSelections = selectedTerms[currentRow.id] || { left: [], right: [] };

  // Clean display helper
  const cleanDisplay = (term) => {
    if (!term) return '___';
    return String(term);
  };

  // Handle "Draw a line" (Row 0)
  const handleDrawLine = () => {
    setShowVerticalLine(true);
    setCompletedRows(prev => [...prev, currentRow.id]);
    setTimeout(() => {
      setCurrentRowIndex(prev => prev + 1);
    }, 300);
  };

  // Handle bank chip click for dual-box rows
  const handleBankChipClick = (chip, side) => {
    const rowId = currentRow.id;
    const current = selectedTerms[rowId] || { left: [], right: [] };
    const maxBlanks = side === 'left' ? currentRow.leftBlanks : currentRow.rightBlanks;
    
    // Only add if we haven't filled all blanks yet
    if (current[side].length < maxBlanks) {
      setSelectedTerms(prev => ({
        ...prev,
        [rowId]: {
          ...current,
          [side]: [...current[side], chip]
        }
      }));
    }
  };

  // Handle blank click - remove term from that position
  const handleBlankClick = (index, side) => {
    const rowId = currentRow.id;
    const current = selectedTerms[rowId] || { left: [], right: [] };
    
    setSelectedTerms(prev => ({
      ...prev,
      [rowId]: {
        ...current,
        [side]: current[side].filter((_, i) => i !== index)
      }
    }));
  };

  // Check if current row is correct
  const handleCheckRow = () => {
    const rowId = currentRow.id;
    const selected = selectedTerms[rowId] || { left: [], right: [] };

    // For dual-box rows, check both sides
    if (currentRow.type === 'dual_box') {
      const leftCorrect = 
        selected.left.length === currentRow.expectedLeft.length &&
        selected.left.every((term, idx) => String(term).trim() === String(currentRow.expectedLeft[idx]).trim());
      
      const rightCorrect = 
        selected.right.length === currentRow.expectedRight.length &&
        selected.right.every((term, idx) => String(term).trim() === String(currentRow.expectedRight[idx]).trim());
      
      if (leftCorrect && rightCorrect) {
        // Mark row as completed
        setCompletedRows(prev => [...prev, rowId]);
        
        setTimeout(() => {
          if (isFinalRow) {
            onComplete();
          } else {
            setCurrentRowIndex(prev => prev + 1);
          }
        }, 300);
      } else {
        // Wrong answer
        onWrongAnswer();
        setSelectedTerms(prev => ({
          ...prev,
          [rowId]: { left: [], right: [] }
        }));
      }
    }
  };

  // Check if current row is fully filled
  const isRowFilled = () => {
    if (currentRow.type === 'single_choice') {
      return true; // Always ready for single choice
    }
    if (currentRow.type === 'dual_box') {
      return (
        currentSelections.left.length === currentRow.leftBlanks &&
        currentSelections.right.length === currentRow.rightBlanks
      );
    }
    return false;
  };

  return (
    <div className="equation-worksheet-container">
      {/* Original Problem - Always visible at top */}
      <div className="worksheet-problem-display">
        {problem.displayProblem || problem.problem}
      </div>

      {/* Work Area - Shows all rows in sequence */}
      <div className="equation-work-area">
        {rows.map((row, index) => {
          const isCompleted = completedRows.includes(row.id);
          const isActive = index === currentRowIndex;
          const isLocked = index > currentRowIndex;
          const rowSelections = selectedTerms[row.id] || { left: [], right: [] };

          return (
            <div 
              key={row.id}
              className={`equation-row ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
            >
              {/* Row Instruction */}
              {isActive && !isCompleted && row.instruction && (
                <div className="equation-instruction">{row.instruction}</div>
              )}

              {/* SINGLE CHOICE ROW (Draw a line) */}
              {row.type === 'single_choice' && isActive && !isCompleted && (
                <div className="equation-single-choice">
                  {row.choices.map((choice, idx) => (
                    <button
                      key={idx}
                      className="equation-choice-btn"
                      onClick={handleDrawLine}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              )}

              {/* DUAL BOX ROW (with vertical line) */}
              {row.type === 'dual_box' && (
                <div className="equation-dual-box-row">
                  {/* LEFT SIDE */}
                  <div className="equation-side left-side">
                    {isCompleted ? (
                      <div className="equation-result">
                        {rowSelections.left.map(term => cleanDisplay(term)).join(' ')}
                      </div>
                    ) : isActive ? (
                      <div className="equation-blanks">
                        {Array.from({ length: row.leftBlanks }).map((_, i) => (
                          <button
                            key={i}
                            className={`equation-blank ${rowSelections.left[i] ? 'filled' : 'empty'}`}
                            onClick={() => rowSelections.left[i] && handleBlankClick(i, 'left')}
                          >
                            {rowSelections.left[i] ? cleanDisplay(rowSelections.left[i]) : '___'}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="equation-locked">
                        {Array.from({ length: row.leftBlanks }).map((_, i) => (
                          <span key={i} className="locked-blank">___</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* VERTICAL LINE (=) */}
                  {showVerticalLine && (
                    <div className="equation-vertical-line">=</div>
                  )}

                  {/* RIGHT SIDE */}
                  <div className="equation-side right-side">
                    {isCompleted ? (
                      <div className="equation-result">
                        {rowSelections.right.map(term => cleanDisplay(term)).join(' ')}
                      </div>
                    ) : isActive ? (
                      <div className="equation-blanks">
                        {Array.from({ length: row.rightBlanks }).map((_, i) => (
                          <button
                            key={i}
                            className={`equation-blank ${rowSelections.right[i] ? 'filled' : 'empty'}`}
                            onClick={() => rowSelections.right[i] && handleBlankClick(i, 'right')}
                          >
                            {rowSelections.right[i] ? cleanDisplay(rowSelections.right[i]) : '___'}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="equation-locked">
                        {Array.from({ length: row.rightBlanks }).map((_, i) => (
                          <span key={i} className="locked-blank">___</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Check Button - Inline with row */}
                  {isActive && !isCompleted && isRowFilled() && (
                    <button 
                      className="equation-check-btn"
                      onClick={handleCheckRow}
                    >
                      {isFinalRow ? '✓ Submit' : '✓ Check'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Term Bank - Only show for active row if not completed */}
      {!completedRows.includes(currentRow.id) && currentRow.bank && currentRow.bank.length > 0 && (
        <div className="equation-term-bank">
          <div className="term-bank-label">Select terms:</div>
          <div className="term-bank-chips-dual">
            <div className="bank-section">
              <div className="bank-section-label">For Left Side:</div>
              <div className="term-bank-chips">
                {currentRow.bank.map((chip, index) => {
                  const isSelectedLeft = currentSelections.left.includes(chip);
                  
                  return (
                    <button
                      key={`left-${index}`}
                      className={`term-chip ${isSelectedLeft ? 'selected' : ''}`}
                      onClick={() => handleBankChipClick(chip, 'left')}
                      disabled={currentSelections.left.length >= currentRow.leftBlanks && !isSelectedLeft}
                    >
                      {cleanDisplay(chip)}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="bank-section">
              <div className="bank-section-label">For Right Side:</div>
              <div className="term-bank-chips">
                {currentRow.bank.map((chip, index) => {
                  const isSelectedRight = currentSelections.right.includes(chip);
                  
                  return (
                    <button
                      key={`right-${index}`}
                      className={`term-chip ${isSelectedRight ? 'selected' : ''}`}
                      onClick={() => handleBankChipClick(chip, 'right')}
                      disabled={currentSelections.right.length >= currentRow.rightBlanks && !isSelectedRight}
                    >
                      {cleanDisplay(chip)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquationWorksheet;
