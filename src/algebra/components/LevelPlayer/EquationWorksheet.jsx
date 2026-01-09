// EquationWorksheet.jsx - COMPLETE FIXED VERSION
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

  // Get current selections for this row (flat array)
  const currentSelections = selectedTerms[currentRow.id] || [];

  // Strip leading + for DISPLAY in completed rows and final answer (NOT in operation rows)
  const stripLeadingPlusForDisplay = (term) => {
    const str = String(term).trim();
    // Only strip + if it's a simple term (not an operation like "+5" in "add 5 to both sides")
    if (str.startsWith('+') && !str.includes('×') && !str.includes('÷')) {
      return str.substring(1);
    }
    return str;
  };

  // Normalize for comparison (strip leading + from both)
  const normalizeForComparison = (term) => {
    const str = String(term).trim();
    if (str.startsWith('+')) {
      return str.substring(1);
    }
    return str;
  };

  // FIX #5: Force plus signs in term bank for single positive terms (DISPLAY ONLY)
  const formatTermBankDisplay = (term) => {
    const str = String(term).trim();
    
    // Already has a sign or is compound expression - leave as-is
    if (str.startsWith('+') || str.startsWith('-')) return str;
    if (str.includes(' ')) return str; // Compound like "x + 4"
    if (str.includes('×') || str.includes('÷')) return str; // Operation
    
    // Single term without sign - add plus FOR DISPLAY ONLY
    return `+${str}`;
  };

  // Parse problem into left side and right side
  const parseProblem = (problemStr) => {
    const parts = problemStr.split('=');
    if (parts.length !== 2) return { left: problemStr, right: '' };
    return {
      left: parts[0].trim(),
      right: parts[1].trim()
    };
  };

  const problemParts = parseProblem(problem.displayProblem || problem.problem);

  // Handle "Draw a line" (Row 0)
  const handleDrawLine = () => {
    setShowVerticalLine(true);
    setCompletedRows(prev => [...prev, currentRow.id]);
    setTimeout(() => {
      setCurrentRowIndex(prev => prev + 1);
    }, 300);
  };

  // Handle bank chip click (fills sequentially)
  // FIX #2: Store ORIGINAL chip value (validation will normalize)
  const handleBankChipClick = (chip) => {
    const rowId = currentRow.id;
    const current = selectedTerms[rowId] || [];
    const totalBlanks = (currentRow.leftBlanks || 0) + (currentRow.rightBlanks || 0);
    
    // Store ORIGINAL chip value (not the display-formatted one)
    if (current.length < totalBlanks) {
      setSelectedTerms(prev => ({
        ...prev,
        [rowId]: [...current, chip]
      }));
    }
  };

  // Handle blank click - remove term
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

    if (currentRow.type === 'dual_box') {
      const leftBlanks = currentRow.leftBlanks || 0;
      const leftSelected = selected.slice(0, leftBlanks).map(normalizeForComparison);
      const rightSelected = selected.slice(leftBlanks).map(normalizeForComparison);
      
      const leftExpected = currentRow.expectedLeft.map(normalizeForComparison);
      const rightExpected = currentRow.expectedRight.map(normalizeForComparison);
      
      const leftCorrect = 
        leftSelected.length === leftExpected.length &&
        leftSelected.every((term, idx) => term === leftExpected[idx]);
      
      const rightCorrect = 
        rightSelected.length === rightExpected.length &&
        rightSelected.every((term, idx) => term === rightExpected[idx]);
      
      if (leftCorrect && rightCorrect) {
        setCompletedRows(prev => [...prev, rowId]);
        
        setTimeout(() => {
          if (isFinalRow) {
            onComplete();
          } else {
            setCurrentRowIndex(prev => prev + 1);
          }
        }, 300);
      } else {
        // FIX #3: Enhanced feedback with user's answer
        const userAnswer = {
          left: leftSelected.join(' '),
          right: rightSelected.join(' ')
        };
        const correctAnswer = {
          left: leftExpected.join(' '),
          right: rightExpected.join(' ')
        };
        
        // Call onWrongAnswer with enhanced data
        onWrongAnswer({
          userAnswer: `${userAnswer.left} = ${userAnswer.right}`,
          correctAnswer: `${correctAnswer.left} = ${correctAnswer.right}`,
          originalProblem: problem.displayProblem || problem.problem,
          rowInstruction: currentRow.instruction
        });
        
        setSelectedTerms(prev => ({
          ...prev,
          [rowId]: []
        }));
      }
    }
  };

  // Check if row is filled
  const isRowFilled = () => {
    if (currentRow.type === 'single_choice') return true;
    if (currentRow.type === 'dual_box') {
      const totalBlanks = (currentRow.leftBlanks || 0) + (currentRow.rightBlanks || 0);
      return currentSelections.length === totalBlanks;
    }
    return false;
  };

  // Build completed rows display data
  const getCompletedRowsDisplay = () => {
    return rows
      .filter((row, idx) => idx > 0 && completedRows.includes(row.id))
      .map(row => {
        const rowSelections = selectedTerms[row.id] || [];
        const leftBlanks = row.leftBlanks || 0;
        const leftTerms = rowSelections.slice(0, leftBlanks);
        const rightTerms = rowSelections.slice(leftBlanks);
        
        // Determine if this is an operation row (Row 1) or solution row (Row 2)
        const isOperationRow = row.id.includes('row1');
        
        return {
          left: leftTerms.map(t => isOperationRow ? t : stripLeadingPlusForDisplay(t)).join(' '),
          right: rightTerms.map(t => isOperationRow ? t : stripLeadingPlusForDisplay(t)).join(' '),
          alignHint: row.alignHint, // FIX #4: Alignment hints ready
          isOperationRow
        };
      });
  };

  return (
    <div className="equation-mode-container">
      {/* FIX #2: Wrapper for line + equation rows (excludes term bank) */}
      <div className="equation-content-wrapper">
        {/* FIX #1: Vertical line - lighter gray, thinner */}
        {showVerticalLine && (
          <div className="equation-vertical-line" />
        )}

        {/* Problem + Completed Rows Container - 3-COLUMN LAYOUT */}
        <div className="equation-problem-container">
          {/* Original Problem - 3 columns */}
          <div className="equation-row-3col">
            <div className="equation-left-side">{problemParts.left}</div>
            <div className="equation-equals-col">=</div>
            <div className="equation-right-side">{problemParts.right}</div>
          </div>

          {/* Completed Rows - same 3-column layout, BLACK font */}
          {getCompletedRowsDisplay().map((row, idx) => (
            <div 
              key={idx} 
              className={`equation-row-3col equation-completed-row ${row.alignHint ? 'has-alignment' : ''}`}
            >
              <div className="equation-left-side">{row.left}</div>
              <div className="equation-equals-col">=</div>
              <div className="equation-right-side">{row.right}</div>
            </div>
          ))}
        </div>

        {/* Current Row Work Area */}
        <div className="equation-work-area">
          {rows.map((row, index) => {
            const isCompleted = completedRows.includes(row.id);
            const isActive = index === currentRowIndex;
            const isLocked = index > currentRowIndex;

            // FIX #3: Don't render empty locked rows
            if (isLocked) return null;

            // Skip completed rows (they're in problem container)
            if (isCompleted && row.type !== 'single_choice') return null;

            return (
              <div 
                key={row.id}
                className={`equation-work-row ${isActive ? 'active' : ''}`}
              >
                {/* SINGLE CHOICE ROW (Draw a line) - FIX #1: Compact styling */}
                {row.type === 'single_choice' && isActive && !isCompleted && (
                  <div className="equation-single-choice-compact">
                    <div className="equation-instruction">{row.instruction}</div>
                    {row.choices.map((choice, idx) => (
                      <button
                        key={idx}
                        className="equation-draw-line-btn"
                        onClick={handleDrawLine}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                )}

                {/* DUAL-BOX ROW (active working row) - FIX #4: 4-column grid */}
                {row.type === 'dual_box' && isActive && !isCompleted && (
                  <div className="equation-row-4col">
                    {/* Left side blanks */}
                    <div className="equation-left-side">
                      {Array.from({ length: row.leftBlanks || 0 }).map((_, i) => {
                        const term = currentSelections[i];
                        const isOperationRow = row.id.includes('row1');
                        return (
                          <button
                            key={`left-${i}`}
                            className={`equation-blank ${term ? 'filled' : 'empty'}`}
                            onClick={() => term && handleBlankClick(i)}
                          >
                            {term ? (isOperationRow ? term : stripLeadingPlusForDisplay(term)) : '___'}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Equals sign column */}
                    <div className="equation-equals-col">=</div>
                    
                    {/* Right side blanks */}
                    <div className="equation-right-side">
                      {Array.from({ length: row.rightBlanks || 0 }).map((_, i) => {
                        const leftBlanks = row.leftBlanks || 0;
                        const term = currentSelections[leftBlanks + i];
                        const isOperationRow = row.id.includes('row1');
                        return (
                          <button
                            key={`right-${i}`}
                            className={`equation-blank ${term ? 'filled' : 'empty'}`}
                            onClick={() => term && handleBlankClick(leftBlanks + i)}
                          >
                            {term ? (isOperationRow ? term : stripLeadingPlusForDisplay(term)) : '___'}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* FIX #4: Check Button in 4th column */}
                    <div className="equation-check-col">
                      {isRowFilled() && (
                        <button 
                          className="equation-check-btn"
                          onClick={handleCheckRow}
                        >
                          {isFinalRow ? '✓ Submit' : '✓ Check'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FIX #2: Term Bank OUTSIDE wrapper (line won't go through it) */}
      {/* FIX #5: All signs displayed via formatTermBankDisplay */}
      {!completedRows.includes(currentRow.id) && currentRow.bank && currentRow.bank.length > 0 && (
        <div className="equation-term-bank">
          <div className="term-bank-label">{currentRow.instruction || 'Select term to place:'}</div>
          <div className="term-bank-grid">
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
                  {formatTermBankDisplay(chip)}
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
