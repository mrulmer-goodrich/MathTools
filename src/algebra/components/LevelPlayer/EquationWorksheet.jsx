// EquationWorksheet.jsx - QA EXPERT STRUCTURAL FIXES 
// version 8 from chatgpt was used to replace v9
// All rows use same 3-column grid, check button absolutely positioned
// Location: src/algebra/components/LevelPlayer/EquationWorksheet.jsx

import React, { useState, useEffect, useRef } from 'react';
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
  const [showFinalAnswer, setShowFinalAnswer] = useState(false);

  // Refs used to compute a single, continuous vertical divider that spans
  // the problem history + the active work row.
  const stageRef = useRef(null);
  const problemContainerRef = useRef(null);
  const workAreaRef = useRef(null);
  const wrapperRef = useRef(null);
  const scrollRef = useRef(null);
  const activeEqualsRef = useRef(null);

  useEffect(() => {
    setCurrentRowIndex(0);
    setCompletedRows([]);
    setSelectedTerms({});
    setShowVerticalLine(false);
    setShowFinalAnswer(false);
  }, [problem]);

  if (!problem.staged || !problem.staged.rows) {
    console.error('EquationWorksheet: Invalid staged structure', problem);
    return <div className="error">Problem structure invalid</div>;
  }

  const rows = problem.staged.rows;
  const currentRow = rows[currentRowIndex];
  const isFinalRow = currentRowIndex === rows.length - 1;
  const currentSelections = selectedTerms[currentRow.id] || [];

  const stripLeadingPlusForDisplay = (term) => {
    const str = String(term).trim();
    if (str.startsWith('+') && !str.includes('×') && !str.includes('÷')) {
      return str.substring(1);
    }
    return str;
  };

  const normalizeForComparison = (term) => {
    const str = String(term).trim();
    if (str.startsWith('+')) {
      return str.substring(1);
    }
    return str;
  };

  const formatTermBankDisplay = (term) => {
    const str = String(term).trim();
    if (str.startsWith('+') || str.startsWith('-')) return str;
    if (str.includes(' ')) return str;
    if (str.includes('×') || str.includes('÷')) return str;
    return `+${str}`;
  };

  const parseProblem = (problemStr) => {
    const parts = problemStr.split('=');
    if (parts.length !== 2) return { left: problemStr, right: '' };
    return {
      left: parts[0].trim(),
      right: parts[1].trim()
    };
  };

  const problemParts = parseProblem(problem.displayProblem || problem.problem);

  const handleDrawLine = () => {
    setShowVerticalLine(true);
    setCompletedRows(prev => [...prev, currentRow.id]);
    setTimeout(() => {
      setCurrentRowIndex(prev => prev + 1);
    }, 300);
  };

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
        const userAnswer = {
          left: leftSelected.join(' '),
          right: rightSelected.join(' ')
        };
        const correctAnswer = {
          left: leftExpected.join(' '),
          right: rightExpected.join(' ')
        };
        
        onWrongAnswer({
          userAnswer: `${userAnswer.left} = ${userAnswer.right}`,
          correctAnswer: `${correctAnswer.left} = ${correctAnswer.right}`,
          originalProblem: problem.displayProblem || problem.problem,
          rowInstruction: currentRow.instruction,
          explanation: problem.explanation
        });
        
        setSelectedTerms(prev => ({
          ...prev,
          [rowId]: []
        }));
      }
    }
  };

  const isRowFilled = () => {
    if (currentRow.type === 'single_choice') return true;
    if (currentRow.type === 'dual_box') {
      const totalBlanks = (currentRow.leftBlanks || 0) + (currentRow.rightBlanks || 0);
      return currentSelections.length === totalBlanks;
    }
    return false;
  };

  const getCompletedRowsDisplay = () => {
    return rows
      .filter((row, idx) => {
        if (!completedRows.includes(row.id)) return false;
        if (showFinalAnswer && idx === rows.length - 1) return false;
        return idx > 0;
      })
      .map(row => {
        const rowSelections = selectedTerms[row.id] || [];
        const leftBlanks = row.leftBlanks || 0;
        const leftTerms = rowSelections.slice(0, leftBlanks);
        const rightTerms = rowSelections.slice(leftBlanks);
        
        const isOperationRow = row.id.includes('row1');
        
        return {
          left: leftTerms.map(t => isOperationRow ? t : stripLeadingPlusForDisplay(t)).join(' '),
          right: rightTerms.map(t => isOperationRow ? t : stripLeadingPlusForDisplay(t)).join(' '),
          isOperationRow
        };
      });
  };

  const organizeBankChips = (bank) => {
    if (!bank || bank.length === 0) return { row1: [], row2: [] };
    
    const additions = [];
    const subtractions = [];
    const multiplications = [];
    const divisions = [];
    const variables = [];
    const compounds = [];
    
    bank.forEach(chip => {
      const str = String(chip).trim();
      if (str.includes('×')) {
        multiplications.push(chip);
      } else if (str.includes('÷')) {
        divisions.push(chip);
      } else if (str.includes(' ') || str.includes('+') && str.length > 2) {
        compounds.push(chip);
      } else if (str === 'x' || str === '-x') {
        variables.push(chip);
      } else if (str.startsWith('+') || (!str.startsWith('-') && !isNaN(parseFloat(str)))) {
        additions.push(chip);
      } else {
        subtractions.push(chip);
      }
    });
    
    const organized = [
      ...additions.sort(),
      ...subtractions.sort(),
      ...multiplications.sort(),
      ...divisions.sort(),
      ...variables.sort(),
      ...compounds.sort()
    ];
    
    const half = Math.ceil(organized.length / 2);
    return {
      row1: organized.slice(0, half),
      row2: organized.slice(half)
    };
  };

  const bankDistribution = currentRow.bank ? organizeBankChips(currentRow.bank) : { row1: [], row2: [] };

  return (
    <div className="equation-mode-container">
      <div className="equation-content-wrapper-fixed" ref={wrapperRef}>
        
        <div className="equation-stage" ref={stageRef}>

          {/* Single continuous vertical divider spanning problem + active row */}
          {showVerticalLine && !showFinalAnswer && (
            <div
              className="equation-vertical-line-overlay"
              style={{ left: '50%', top: 0, height: '100%' }}
            />
          )}
          
        {/* SCROLLABLE CONTAINER - prevents UI push */}
          <div
            className="equation-problem-container-scrollable"
            ref={(el) => {
              scrollRef.current = el;
              problemContainerRef.current = el;
            }}
          >

          <div className="equation-row-3col">
            <div className="equation-left-side">{problemParts.left}</div>
            <div className="equation-equals-col-centered">=</div>
            <div className="equation-right-side">{problemParts.right}</div>
          </div>

	          {getCompletedRowsDisplay().map((row, idx) => (
            <div 
              key={idx} 
              className="equation-row-3col equation-completed-row"
            >
              <div className="equation-left-side">{row.left}</div>
	              <div className="equation-equals-col-centered">=</div>
              <div className="equation-right-side">{row.right}</div>
            </div>
          ))}
          
          {showFinalAnswer && isFinalRow && (
            <div className="equation-row-3col equation-final-answer-highlight">
              <div className="equation-left-side">
                {currentSelections.slice(0, currentRow.leftBlanks || 0)
                  .map(t => stripLeadingPlusForDisplay(t)).join(' ')}
              </div>
              <div className="equation-equals-col-centered">=</div>
              <div className="equation-right-side">
                {currentSelections.slice(currentRow.leftBlanks || 0)
                  .map(t => stripLeadingPlusForDisplay(t)).join(' ')}
              </div>
            </div>
          )}
        </div>

        {!showFinalAnswer && (
          <div className="equation-work-area" ref={workAreaRef}>
            {rows.map((row, index) => {
              const isCompleted = completedRows.includes(row.id);
              const isActive = index === currentRowIndex;
              const isLocked = index > currentRowIndex;

              if (isLocked) return null;
              if (isCompleted && row.type !== 'single_choice') return null;

              return (
                <div 
                  key={row.id}
                  className={`equation-work-row ${isActive ? 'active' : ''}`}
                >
                  {row.type === 'single_choice' && isActive && !isCompleted && (
                    <div className="equation-single-choice-territory">
                      <div className="equation-instruction-territory">{row.instruction}</div>
                      {row.choices.map((choice, idx) => (
                        <button
                          key={idx}
                          className="equation-draw-line-btn-territory"
                          onClick={handleDrawLine}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Active row: use 4-column grid so the Check/Submit button never wraps */}
                  {row.type === 'dual_box' && isActive && !isCompleted && (
                    <div className="equation-row-4col equation-work-row-grid">
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
                      
                      <div className="equation-equals-col-centered" ref={activeEqualsRef}>=</div>
                      
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
                      
                      {isRowFilled() && (
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
        )}
        </div>
      </div>

      {!completedRows.includes(currentRow.id) && !showFinalAnswer && currentRow.bank && currentRow.bank.length > 0 && (

        <div className="equation-term-bank">
          <div className="term-bank-label-territory">{currentRow.instruction || 'Select term to place:'}</div>
          <div className="equation-term-bank-2rows">
            <div className="term-bank-row">
              {bankDistribution.row1.map((chip, index) => {
                const timesUsed = currentSelections.filter(t => t === chip).length;
                const totalBlanks = (currentRow.leftBlanks || 0) + (currentRow.rightBlanks || 0);
                
                return (
                  <button
                    key={`r1-${index}`}
                    className={`term-chip ${timesUsed > 0 ? 'used' : ''}`}
                    onClick={() => handleBankChipClick(chip)}
                    disabled={currentSelections.length >= totalBlanks}
                  >
                    {formatTermBankDisplay(chip)}
                    {timesUsed > 0 && <span className="use-badge">{timesUsed}</span>}
                  </button>
                );
              })}
            </div>
            <div className="term-bank-row">
              {bankDistribution.row2.map((chip, index) => {
                const timesUsed = currentSelections.filter(t => t === chip).length;
                const totalBlanks = (currentRow.leftBlanks || 0) + (currentRow.rightBlanks || 0);
                
                return (
                  <button
                    key={`r2-${index}`}
                    className={`term-chip ${timesUsed > 0 ? 'used' : ''}`}
                    onClick={() => handleBankChipClick(chip)}
                    disabled={currentSelections.length >= totalBlanks}
                  >
                    {formatTermBankDisplay(chip)}
                    {timesUsed > 0 && <span className="use-badge">{timesUsed}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquationWorksheet;
