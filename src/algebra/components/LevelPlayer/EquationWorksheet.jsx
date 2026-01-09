// EquationWorksheet.jsx - Aligned equation solver with continuous vertical line
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

  // Strip leading + for display (keep - signs)
  const stripLeadingPlus = (term) => {
    const str = String(term).trim();
    if (str.startsWith('+')) {
      return str.substring(1);
    }
    return str;
  };

  // Strip leading + for display (keep - signs)
  const stripLeadingPlus = (term) => {
    const str = String(term).trim();
    if (str.startsWith('+')) {
      return str.substring(1);
    }
    return str;
  };

  // Normalize for comparison (strip leading + from both)
  const normalizeForComparison = (term) => {
    return stripLeadingPlus(term);
  };

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

  // Handle "Draw a line" (Row 0)
  const handleDrawLine = () => {
    setShowVerticalLine(true);
    setCompletedRows(prev => [...prev, currentRow.id]);
    setTimeout(() => {
      setCurrentRowIndex(prev => prev + 1);
    }, 300);
  };

  // Handle bank chip click (fills sequentially)
  const handleBankChipClick = (chip) => {
    const rowId = currentRow.id;
    const current = selectedTerms[rowId] || [];
    const totalBlanks = (currentRow.leftBlanks || 0) + (currentRow.rightBlanks || 0);
    
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
        onWrongAnswer();
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
        const leftTerms = rowSelections.slice(0, leftBlanks).map(stripLeadingPlus);
        const rightTerms = rowSelections.slice(leftBlanks).map(stripLeadingPlus);
        return {
          left: leftTerms.join(' '),
          right: rightTerms.join(' ')
        };
      });
  };

  return (
    <div className="math-worksheet-container" style={{ position: 'relative' }}>
      {/* Continuous Vertical Line Overlay */}
      {showVerticalLine && (
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '80px',
          bottom: '200px',
          width: '4px',
          background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
          zIndex: 10,
          pointerEvents: 'none'
        }} />
      )}

      {/* Problem + Completed Rows Container */}
      <div className="worksheet-problem-display" style={{
        padding: '1.5rem',
        marginBottom: '1rem',
        position: 'relative'
      }}>
        {/* Original Problem */}
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: 700, 
          textAlign: 'center',
          marginBottom: getCompletedRowsDisplay().length > 0 ? '1rem' : '0'
        }}>
          {problem.displayProblem || problem.problem}
        </div>

        {/* Completed Rows (aligned by =) */}
        {getCompletedRowsDisplay().map((row, idx) => (
          <div 
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#059669',
              marginTop: '0.5rem',
              gap: '1rem'
            }}
          >
            <span style={{ textAlign: 'right', minWidth: '100px' }}>{row.left}</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>=</span>
            <span style={{ textAlign: 'left', minWidth: '100px' }}>{row.right}</span>
          </div>
        ))}
      </div>

      {/* Current Row Work Area */}
      <div className="worksheet-work-area">
        {rows.map((row, index) => {
          const isCompleted = completedRows.includes(row.id);
          const isActive = index === currentRowIndex;
          const isLocked = index > currentRowIndex;

          // Skip completed rows (they're in the problem container now)
          if (isCompleted && row.type !== 'single_choice') return null;

          return (
            <div 
              key={row.id}
              className={`worksheet-row ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
            >
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

              {/* DUAL-BOX ROW (active working row) */}
              {row.type === 'dual_box' && isActive && !isCompleted && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '1rem',
                  padding: '1rem 0',
                  position: 'relative'
                }}>
                  {/* Left blanks */}
                  {Array.from({ length: row.leftBlanks || 0 }).map((_, i) => {
                    const leftBlanks = row.leftBlanks || 0;
                    const term = currentSelections[i];
                    return (
                      <button
                        key={`left-${i}`}
                        className={`worksheet-blank ${term ? 'filled' : 'empty'}`}
                        onClick={() => term && handleBlankClick(i)}
                      >
                        {term ? stripLeadingPlus(term) : '___'}
                      </button>
                    );
                  })}
                  
                  {/* Equals sign (positioned for vertical line) */}
                  {showVerticalLine && (
                    <span style={{ 
                      fontSize: '1.75rem', 
                      fontWeight: 700, 
                      color: '#10B981',
                      position: 'relative',
                      zIndex: 20
                    }}>=</span>
                  )}
                  
                  {/* Right blanks */}
                  {Array.from({ length: row.rightBlanks || 0 }).map((_, i) => {
                    const leftBlanks = row.leftBlanks || 0;
                    const term = currentSelections[leftBlanks + i];
                    return (
                      <button
                        key={`right-${i}`}
                        className={`worksheet-blank ${term ? 'filled' : 'empty'}`}
                        onClick={() => term && handleBlankClick(leftBlanks + i)}
                      >
                        {term ? stripLeadingPlus(term) : '___'}
                      </button>
                    );
                  })}
                  
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
            </div>
          );
        })}
      </div>

      {/* Term Bank */}
      {!completedRows.includes(currentRow.id) && currentRow.bank && currentRow.bank.length > 0 && (
        <div className="worksheet-term-bank">
          <div className="term-bank-label">{currentRow.instruction || 'Select term to place:'}</div>
          <div className="term-bank-chips" style={{
            display: 'grid',
            gridTemplateColumns: currentRow.bank.length <= 8 ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)',
            gap: '0.5rem',
            justifyItems: 'center'
          }}>
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
                  {chip}
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
