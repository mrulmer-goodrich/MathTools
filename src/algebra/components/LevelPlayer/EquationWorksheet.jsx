// EquationWorksheet.jsx - Matches Level 13 style with vertical line separator
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

  // Get current selections for this row (flat array for unified bank)
  const currentSelections = selectedTerms[currentRow.id] || [];

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

  // Handle bank chip click (unified bank, fills sequentially)
  const handleBankChipClick = (chip) => {
    const rowId = currentRow.id;
    const current = selectedTerms[rowId] || [];
    const totalBlanks = (currentRow.leftBlanks || 0) + (currentRow.rightBlanks || 0);
    
    // Only add if we haven't filled all blanks yet
    if (current.length < totalBlanks) {
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

    // For dual-box rows, split selections into left and right
    if (currentRow.type === 'dual_box') {
      const leftBlanks = currentRow.leftBlanks || 0;
      const leftSelected = selected.slice(0, leftBlanks);
      const rightSelected = selected.slice(leftBlanks);
      
      const leftCorrect = 
        leftSelected.length === currentRow.expectedLeft.length &&
        leftSelected.every((term, idx) => String(term).trim() === String(currentRow.expectedLeft[idx]).trim());
      
      const rightCorrect = 
        rightSelected.length === currentRow.expectedRight.length &&
        rightSelected.every((term, idx) => String(term).trim() === String(currentRow.expectedRight[idx]).trim());
      
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
          [rowId]: []
        }));
      }
    }
  };

  // Check if current row is fully filled
  const isRowFilled = () => {
    if (currentRow.type === 'single_choice') {
      return true;
    }
    if (currentRow.type === 'dual_box') {
      const totalBlanks = (currentRow.leftBlanks || 0) + (currentRow.rightBlanks || 0);
      return currentSelections.length === totalBlanks;
    }
    return false;
  };

  return (
    <div className="math-worksheet-container">
      {/* Original Problem - Always visible at top */}
      <div className="worksheet-problem-display">
        {problem.displayProblem || problem.problem}
      </div>

      {/* Work Area - Shows all rows in sequence (LIKE LEVEL 13) */}
      <div className="worksheet-work-area">
        {rows.map((row, index) => {
          const isCompleted = completedRows.includes(row.id);
          const isActive = index === currentRowIndex;
          const isLocked = index > currentRowIndex;
          const rowSelections = selectedTerms[row.id] || [];

          // For dual-box, split selections
          const leftBlanks = row.leftBlanks || 0;
          const leftSelections = rowSelections.slice(0, leftBlanks);
          const rightSelections = rowSelections.slice(leftBlanks);

          return (
            <div 
              key={row.id}
              className={`worksheet-row ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
            >
              <div className="worksheet-row-content">
                {/* SINGLE CHOICE ROW (Draw a line) */}
                {row.type === 'single_choice' && isActive && !isCompleted && (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>
                      {row.instruction}
                    </div>
                    {row.choices.map((choice, idx) => (
                      <button
                        key={idx}
                        className="base-camp-tile-button"
                        onClick={handleDrawLine}
                        style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                )}

                {/* COMPLETED DUAL-BOX ROW */}
                {row.type === 'dual_box' && isCompleted && (
                  <div className="worksheet-row-expression" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <span>{leftSelections.map(t => cleanDisplay(t)).join(' ')}</span>
                    {showVerticalLine && <span style={{ 
                      borderLeft: '3px solid #10B981', 
                      height: '40px', 
                      display: 'inline-block',
                      margin: '0 0.5rem',
                      position: 'relative'
                    }}>
                      <span style={{ position: 'absolute', left: '-8px', top: '8px', fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>=</span>
                    </span>}
                    <span>{rightSelections.map(t => cleanDisplay(t)).join(' ')}</span>
                  </div>
                )}

                {/* ACTIVE DUAL-BOX ROW */}
                {row.type === 'dual_box' && isActive && !isCompleted && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* Left blanks */}
                    {Array.from({ length: leftBlanks }).map((_, i) => (
                      <button
                        key={`left-${i}`}
                        className={`worksheet-blank ${leftSelections[i] ? 'filled' : 'empty'}`}
                        onClick={() => leftSelections[i] && handleBlankClick(i)}
                      >
                        {leftSelections[i] ? cleanDisplay(leftSelections[i]) : '___'}
                      </button>
                    ))}
                    
                    {/* Vertical line separator */}
                    {showVerticalLine && (
                      <div style={{ 
                        borderLeft: '3px solid #10B981', 
                        height: '60px', 
                        position: 'relative',
                        margin: '0 0.5rem'
                      }}>
                        <span style={{ 
                          position: 'absolute', 
                          left: '-12px', 
                          top: '15px', 
                          fontSize: '1.75rem', 
                          fontWeight: 700, 
                          color: '#10B981' 
                        }}>=</span>
                      </div>
                    )}
                    
                    {/* Right blanks */}
                    {Array.from({ length: row.rightBlanks }).map((_, i) => (
                      <button
                        key={`right-${i}`}
                        className={`worksheet-blank ${rightSelections[i] ? 'filled' : 'empty'}`}
                        onClick={() => rightSelections[i] && handleBlankClick(leftBlanks + i)}
                      >
                        {rightSelections[i] ? cleanDisplay(rightSelections[i]) : '___'}
                      </button>
                    ))}
                    
                    {/* Check Button */}
                    {isRowFilled() && (
                      <button 
                        className="worksheet-check-btn-inline"
                        onClick={handleCheckRow}
                      >
                        {isFinalRow ? '✓ Submit' : '✓ Check'}
                      </button>
                    )}
                  </div>
                )}

                {/* LOCKED DUAL-BOX ROW */}
                {row.type === 'dual_box' && isLocked && (
                  <div className="worksheet-row-locked" style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                    {Array.from({ length: leftBlanks }).map((_, i) => (
                      <span key={`left-${i}`} className="locked-blank">___</span>
                    ))}
                    {showVerticalLine && <span style={{ color: '#D1D5DB', fontSize: '1.5rem' }}>|</span>}
                    {Array.from({ length: row.rightBlanks }).map((_, i) => (
                      <span key={`right-${i}`} className="locked-blank">___</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* UNIFIED Term Bank (LIKE LEVEL 13) */}
      {!completedRows.includes(currentRow.id) && currentRow.bank && currentRow.bank.length > 0 && (
        <div className="worksheet-term-bank">
          <div className="term-bank-label">{currentRow.instruction || 'Select term to place:'}</div>
          <div className="term-bank-chips">
            {currentRow.bank.map((chip, index) => {
              const isSelected = currentSelections.includes(chip);
              const totalBlanks = (currentRow.leftBlanks || 0) + (currentRow.rightBlanks || 0);
              
              return (
                <button
                  key={index}
                  className={`term-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleBankChipClick(chip)}
                  disabled={currentSelections.length >= totalBlanks}
                >
                  {cleanDisplay(chip)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquationWorksheet;
