// MathWorksheet.jsx - FIXED: Answer shows ONCE only (no duplication)
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

  useEffect(() => {
    setCurrentRowIndex(0);
    setCompletedRows([]);
    setSelectedTerms({});
    setShowFinalAnswer(false);
  }, [problem]);

  if (!problem.staged || !problem.staged.rows) {
    console.error('MathWorksheet: Invalid staged structure', problem);
    return <div className="error">Problem structure invalid</div>;
  }

  const rows = problem.staged.rows;
  const currentRow = rows[currentRowIndex];
  const isFinalRow = currentRowIndex === rows.length - 1;
  const currentSelections = selectedTerms[currentRow.id] || [];

  const formatTermWithSign = (term) => {
    if (!term) return '___';
    const str = String(term).trim();
    if (str.startsWith('+') || str.startsWith('-')) {
      return str;
    }
    return `+${str}`;
  };

  const cleanDisplay = (term, isFirst = false) => {
    if (!term) return '___';
    const str = String(term);
    if (isFirst && str.startsWith('+')) {
      return str.substring(1).trim();
    }
    return str;
  };

  const handleBankChipClick = (chip) => {
    const rowId = currentRow.id;
    const current = selectedTerms[rowId] || [];
    
    if (current.length < currentRow.blanks) {
      setSelectedTerms(prev => ({
        ...prev,
        [rowId]: [...current, chip]
      }));
    }
  };

  const handleChoiceClick = (choice) => {
    const rowId = currentRow.id;
    setSelectedTerms(prev => ({
      ...prev,
      [rowId]: [choice]
    }));
  };

  const handleBlankClick = (index) => {
    const rowId = currentRow.id;
    const current = selectedTerms[rowId] || [];
    
    setSelectedTerms(prev => ({
      ...prev,
      [rowId]: current.filter((_, i) => i !== index)
    }));
  };

  const handleCheckRow = () => {
    const rowId = currentRow.id;
    const selected = selectedTerms[rowId] || [];

    const selectedSet = new Set(selected.map(t => String(t).trim()));
    const expectedSet = new Set(currentRow.expected.map(t => String(t).trim()));
    
    const isCorrect = 
      selectedSet.size === expectedSet.size &&
      selected.length === currentRow.expected.length &&
      [...selectedSet].every(term => expectedSet.has(term));

    if (isCorrect) {
      setCompletedRows(prev => [...prev, rowId]);
      
      if (isFinalRow) {
        setShowFinalAnswer(true);
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        setTimeout(() => {
          setCurrentRowIndex(prev => prev + 1);
        }, 300);
      }
    } else {
      onWrongAnswer({
        userAnswer: selected.join(' '),
        correctAnswer: currentRow.expected.join(' '),
        originalProblem: problem.displayProblem || problem.problem,
        rowInstruction: currentRow.instruction || `Row ${currentRowIndex + 1}`,
        explanation: problem.explanation
      });
      
      setSelectedTerms(prev => ({
        ...prev,
        [rowId]: []
      }));
    }
  };

  // Build completed rows - EXCLUDE FINAL ROW if showing final answer
  const getCompletedRowsDisplay = () => {
    return rows
      .filter((row, idx) => {
        // Include if completed
        if (!completedRows.includes(row.id)) return false;
        
        // EXCLUDE final row if we're showing final answer separately
        if (showFinalAnswer && idx === rows.length - 1) return false;
        
        return true;
      })
      .map(row => {
        const rowSelections = selectedTerms[row.id] || [];
        return rowSelections.map((term, i) => cleanDisplay(term, i === 0)).join(' ');
      });
  };

  return (
    <div className="math-worksheet-container">
      {/* Problem Container */}
      <div className="worksheet-problem-display">
        {/* Original Problem */}
        <div className="worksheet-original-problem">
          {problem.displayProblem || problem.problem}
        </div>
        
        {/* Completed Rows (excludes final if showing separately) */}
        {getCompletedRowsDisplay().map((rowText, idx) => (
          <div key={idx} className="worksheet-completed-row">
            {rowText}
          </div>
        ))}
        
        {/* Final Answer - ONLY SHOWS ONCE, HIGHLIGHTED */}
        {showFinalAnswer && isFinalRow && (
          <div className="worksheet-final-answer-highlight">
            {currentSelections.map((term, i) => cleanDisplay(term, i === 0)).join(' ')}
          </div>
        )}
      </div>

      {/* Work Area */}
      {!showFinalAnswer && (
        <div className="worksheet-work-area">
          {rows.map((row, index) => {
            const isCompleted = completedRows.includes(row.id);
            const isActive = index === currentRowIndex;
            const isLocked = index > currentRowIndex;
            const rowSelections = selectedTerms[row.id] || [];

            if (isCompleted || isLocked) return null;

            return (
              <div 
                key={row.id}
                className="worksheet-row active"
              >
                <div className="worksheet-row-content">
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

      {/* Term Bank / Choices */}
      {!completedRows.includes(currentRow.id) && !showFinalAnswer && (
        <>
          {currentRow.bank && currentRow.bank.length > 0 && (
            <div className="worksheet-term-bank">
              <div className="term-bank-label">Select terms to place:</div>
              <div className="term-bank-chips">
                {currentRow.bank.map((chip, index) => {
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
