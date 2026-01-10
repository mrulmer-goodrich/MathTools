// MathWorksheet.jsx - FINAL: No duplication of final answer, proper highlighting
// Location: src/algebra/components/LevelPlayer/MathWorksheet.jsx

import React, { useState, useEffect } from 'react';
import '../../styles/algebra.css';

const MathWorksheet = ({ 
  problem,
  onComplete,
  onWrongAnswer 
}) => {
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [completedRows, setCompletedRows] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState({});
  const [showFinalAnswer, setShowFinalAnswer] = useState(false);

  // Reset state when problem changes
  useEffect(() => {
    setCurrentRowIndex(0);
    setCompletedRows([]);
    setSelectedTerms({});
    setShowFinalAnswer(false);
  }, [problem]);

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

  // Format term with sign (for term bank display)
  const formatTermWithSign = (term) => {
    if (!term) return '___';
    const str = String(term).trim();
    
    // Already has sign
    if (str.startsWith('+') || str.startsWith('-')) {
      return str;
    }
    
    // Add + for positive terms
    return `+${str}`;
  };

  // Clean display helper - removes leading + for FIRST term only in completed rows
  const cleanDisplay = (term, isFirst = false) => {
    if (!term) return '___';
    const str = String(term);
    if (isFirst && str.startsWith('+')) {
      return str.substring(1).trim();
    }
    return str;
  };

  // Handle chip click for BANK rows (Row 1) - ALLOW REUSE
  const handleBankChipClick = (chip) => {
    const rowId = currentRow.id;
    const current = selectedTerms[rowId] || [];
    
    // Allow adding same term multiple times (up to blanks limit)
    if (current.length < currentRow.blanks) {
      setSelectedTerms(prev => ({
        ...prev,
        [rowId]: [...current, chip]
      }));
    }
  };

  // Handle choice click for CHOICE rows (Row 2)
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
      
      // If this is the final row, show answer briefly before success overlay
      if (isFinalRow) {
        setShowFinalAnswer(true);
        setTimeout(() => {
          onComplete();
        }, 1500); // 1.5 second pause
      } else {
        // Move to next row after brief pause
        setTimeout(() => {
          setCurrentRowIndex(prev => prev + 1);
        }, 300);
      }
    } else {
      // Wrong answer - pass problem data for rich feedback
      onWrongAnswer({
        userAnswer: selected.join(' '),
        correctAnswer: currentRow.expected.join(' '),
        originalProblem: problem.displayProblem || problem.problem,
        rowInstruction: currentRow.instruction || `Row ${currentRowIndex + 1}`,
        explanation: problem.explanation
      });
      
      // Clear selections for this row so student can try again
      setSelectedTerms(prev => ({
        ...prev,
        [rowId]: []
      }));
    }
  };

  // Build completed rows for display in problem container
  const getCompletedRowsDisplay = () => {
    return rows
      .filter(row => completedRows.includes(row.id))
      .map(row => {
        const rowSelections = selectedTerms[row.id] || [];
        return rowSelections.map((term, i) => cleanDisplay(term, i === 0)).join(' ');
      });
  };

  return (
    <div className="math-worksheet-container">
      {/* Problem Container - Original + Completed Rows */}
      <div className="worksheet-problem-display">
        {/* Original Problem */}
        <div className="worksheet-original-problem">
          {problem.displayProblem || problem.problem}
        </div>
        
        {/* Completed Rows - styled identically to problem */}
        {getCompletedRowsDisplay().map((rowText, idx) => (
          <div key={idx} className="worksheet-completed-row">
            {rowText}
          </div>
        ))}
        
        {/* Final Answer - HIGHLIGHTED IN PLACE (no duplication) */}
        {showFinalAnswer && isFinalRow && (
          <div className="worksheet-final-answer-highlight">
            {currentSelections.map((term, i) => cleanDisplay(term, i === 0)).join(' ')}
          </div>
        )}
      </div>

      {/* Work Area - Current active row */}
      {!showFinalAnswer && (
        <div className="worksheet-work-area">
          {rows.map((row, index) => {
            const isCompleted = completedRows.includes(row.id);
            const isActive = index === currentRowIndex;
            const isLocked = index > currentRowIndex;
            const rowSelections = selectedTerms[row.id] || [];

            // Don't render completed or locked rows (they're in problem container or not shown yet)
            if (isCompleted || isLocked) return null;

            return (
              <div 
                key={row.id}
                className="worksheet-row active"
              >
                <div className="worksheet-row-content">
                  {/* ACTIVE ROW - Show blanks to fill */}
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Term Bank OR Choices - Only show for active row if not completed */}
      {!completedRows.includes(currentRow.id) && !showFinalAnswer && (
        <>
          {/* TERM BANK (for rows with bank property) */}
          {currentRow.bank && currentRow.bank.length > 0 && (
            <div className="worksheet-term-bank">
              <div className="term-bank-label">Select terms to place:</div>
              <div className="term-bank-chips">
                {currentRow.bank.map((chip, index) => {
                  // Count how many times this chip has been selected
                  const timesUsed = currentSelections.filter(t => t === chip).length;
                  
                  return (
                    <button
                      key={index}
                      className={`term-chip ${timesUsed > 0 ? 'used' : ''}`}
                      onClick={() => handleBankChipClick(chip)}
                      disabled={currentSelections.length >= currentRow.blanks}
                    >
                      {formatTermWithSign(chip)}
                      {timesUsed > 0 && <span className="use-badge">{timesUsed}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CHOICES (for rows with choices property - Row 2) */}
          {currentRow.choices && currentRow.choices.length > 0 && (
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
                      {formatTermWithSign(choice)}
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
