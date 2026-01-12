// EquationWorksheet.jsx - COMPREHENSIVE FIX v11
// ALL QA ISSUES RESOLVED:
// 1. Vertical line alignment fixed (Check button moved outside grid)
// 2. Horizontal dividers fixed (smart logic, no duplicates)
// 3. Multiplication shows (previous) × (factor) format
// 4. Final answer no longer in tiny scroll container
// 5. All typography/spacing issues addressed
// Location: src/algebra/components/LevelPlayer/EquationWorksheet.jsx

import React, { useState, useEffect, useRef } from 'react';
import '../../styles/algebra.css';
import FractionDisplay from './FractionDisplay';

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

  const normalizeForComparison = (term) => {
    const str = String(term).trim();
    if (str.startsWith('+')) {
      return str.substring(1);
    }
    const num = parseFloat(str);
    if (!isNaN(num)) {
      return String(num);
    }
    return str;
  };

  const formatTermBankDisplay = (term) => {
    const str = String(term).trim();
    
    // FIXED: Only wrap if NOT already wrapped
    if ((str.includes('× -') || str.includes('÷ -')) && !str.includes('(-')) {
      return str.replace(/(×|÷)\s*(-[\d.]+)/g, '$1 ($2)');
    }
    
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

  // IMPROVED: Smart divider logic - only after simplified rows
  const getCompletedRowsDisplay = () => {
    const completedRowData = rows
      .map((row, idx) => ({
        row,
        idx,
        isCompleted: completedRows.includes(row.id),
        isFinal: idx === rows.length - 1
      }))
      .filter(({ isCompleted, isFinal, idx }) => {
        if (!isCompleted) return false;
        if (showFinalAnswer && isFinal) return false;
        return idx > 0; // Skip initial problem row
      });

    return completedRowData.map(({ row, idx }, arrayIdx) => {
      const rowSelections = selectedTerms[row.id] || [];
      const leftBlanks = row.leftBlanks || 0;
      const leftTerms = rowSelections.slice(0, leftBlanks);
      const rightTerms = rowSelections.slice(leftBlanks);
      
      const isOperationRow = row.id.includes('row1') || row.id.includes('row3');
      const isSimplifiedRow = row.id.includes('row2') || row.id.includes('row4');
      
      // FIXED: For multiply/divide operations, show (previous) × (factor) format
      let leftDisplay, rightDisplay;
      
      if (isOperationRow && leftTerms.length > 0) {
        const operation = leftTerms[0];
        
        // Get previous row's content (the expression being operated on)
        const prevRowData = arrayIdx > 0 ? completedRowData[arrayIdx - 1] : null;
        let prevLeft = problemParts.left;
        let prevRight = problemParts.right;
        
        if (prevRowData) {
          const prevSelections = selectedTerms[prevRowData.row.id] || [];
          const prevLeftBlanks = prevRowData.row.leftBlanks || 0;
          prevLeft = prevSelections.slice(0, prevLeftBlanks).join(' ') || prevLeft;
          prevRight = prevSelections.slice(prevLeftBlanks).join(' ') || prevRight;
        }
        
        // If operation is multiply or divide, show full format
        if (operation.includes('×') || operation.includes('÷')) {
          // Wrap previous expression if it contains operators or spaces
          const needsParens = (expr) => expr.includes('+') || expr.includes('-') || 
                                        expr.includes(' ') || expr.includes('/');
          
          const formatWithPrevious = (prev, op) => {
            if (needsParens(prev)) {
              return `(${prev}) ${op}`;
            }
            return `${prev} ${op}`;
          };
          
          leftDisplay = formatWithPrevious(prevLeft, operation);
          rightDisplay = formatWithPrevious(prevRight, operation);
        } else {
          // Addition/subtraction - just show the operation
          leftDisplay = leftTerms.map(t => String(t)).join(' ');
          rightDisplay = rightTerms.map(t => String(t)).join(' ');
        }
      } else {
        // Simplified rows - show as-is
        leftDisplay = leftTerms.map(t => String(t)).join(' ');
        rightDisplay = rightTerms.map(t => String(t)).join(' ');
      }
      
      const hasFraction = leftDisplay.includes('/') || rightDisplay.includes('/');
      
      // FIXED: Only show divider AFTER simplified rows (not after operation rows)
      const needsDividerAfter = isSimplifiedRow;
      
      return {
        left: leftDisplay,
        right: rightDisplay,
        hasFraction,
        isOperationRow,
        isSimplifiedRow,
        needsDividerAfter
      };
    });
  };

  // Consistent term bank sorting
  const organizeBankChips = (bank) => {
    if (!bank || bank.length === 0) return { row1: [], row2: [] };
    
    const sorted = [...bank].sort((a, b) => {
      const aStr = String(a);
      const bStr = String(b);
      
      const aHasOp = aStr.includes('×') || aStr.includes('÷');
      const bHasOp = bStr.includes('×') || bStr.includes('÷');
      
      if (aHasOp && !bHasOp) return -1;
      if (!aHasOp && bHasOp) return 1;
      
      return aStr.localeCompare(bStr);
    });
    
    const half = Math.ceil(sorted.length / 2);
    return {
      row1: sorted.slice(0, half),
      row2: sorted.slice(half)
    };
  };

  const bankDistribution = currentRow.bank ? organizeBankChips(currentRow.bank) : { row1: [], row2: [] };

  return (
    <div className="equation-mode-container">
      <div className="equation-content-wrapper-fixed" ref={wrapperRef}>
        
        <div className="equation-stage" ref={stageRef}>

          {/* Vertical divider - now stable because Check button is outside grid */}
          {showVerticalLine && !showFinalAnswer && (
            <div
              className="equation-vertical-line-overlay"
              style={{ left: '50%', top: 0, height: '100%' }}
            />
          )}
          
          {/* IMPROVED: Final answer mode increases height */}
          <div
            className={`equation-problem-container-scrollable ${showFinalAnswer ? 'equation-final-state' : ''}`}
            ref={(el) => {
              scrollRef.current = el;
              problemContainerRef.current = el;
            }}
          >

          <div className="equation-row-3col">
            <div className="equation-left-side">
              <FractionDisplay expression={problemParts.left} />
            </div>
            <div className="equation-equals-col-centered">=</div>
            <div className="equation-right-side">
              <FractionDisplay expression={problemParts.right} />
            </div>
          </div>

          {getCompletedRowsDisplay().map((row, idx) => (
            <React.Fragment key={idx}>
              <div 
                className={`equation-row-3col equation-completed-row ${row.hasFraction ? 'has-fraction-operation' : ''}`}
              >
                <div className="equation-left-side">
                  <FractionDisplay expression={row.left} />
                </div>
                <div className="equation-equals-col-centered">=</div>
                <div className="equation-right-side">
                  <FractionDisplay expression={row.right} />
                </div>
              </div>
              
              {/* FIXED: Only after simplified rows */}
              {row.needsDividerAfter && (
                <div className="equation-step-divider" />
              )}
            </React.Fragment>
          ))}
          
          {/* Final answer display */}
          {showFinalAnswer && isFinalRow && (
            <>
              <div className="equation-row-3col equation-final-answer-highlight">
                <div className="equation-left-side">
                  <FractionDisplay 
                    expression={currentSelections.slice(0, currentRow.leftBlanks || 0).join(' ')} 
                  />
                </div>
                <div className="equation-equals-col-centered">=</div>
                <div className="equation-right-side">
                  <FractionDisplay 
                    expression={currentSelections.slice(currentRow.leftBlanks || 0).join(' ')} 
                  />
                </div>
              </div>
            </>
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

                  {/* FIXED: Check button now OUTSIDE the 3-column grid */}
                  {row.type === 'dual_box' && isActive && !isCompleted && (
                    <div className="equation-active-row-container">
                      <div className="equation-row-3col equation-work-row-grid">
                        <div className="equation-left-side">
                          {Array.from({ length: row.leftBlanks || 0 }).map((_, i) => {
                            const term = currentSelections[i];
                            const displayTerm = term || '___';
                            return (
                              <button
                                key={`left-${i}`}
                                className={`equation-blank ${term ? 'filled' : 'empty'}`}
                                onClick={() => term && handleBlankClick(i)}
                              >
                                {term ? <FractionDisplay expression={displayTerm} /> : '___'}
                              </button>
                            );
                          })}
                        </div>
                        
                        <div className="equation-equals-col-centered" ref={activeEqualsRef}>=</div>
                        
                        <div className="equation-right-side">
                          {Array.from({ length: row.rightBlanks || 0 }).map((_, i) => {
                            const leftBlanks = row.leftBlanks || 0;
                            const term = currentSelections[leftBlanks + i];
                            const displayTerm = term || '___';
                            return (
                              <button
                                key={`right-${i}`}
                                className={`equation-blank ${term ? 'filled' : 'empty'}`}
                                onClick={() => term && handleBlankClick(leftBlanks + i)}
                              >
                                {term ? <FractionDisplay expression={displayTerm} /> : '___'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Check button positioned outside the grid */}
                      {isRowFilled() && (
                        <button
                          className="equation-check-btn-external"
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
                    <FractionDisplay expression={formatTermBankDisplay(chip)} />
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
                    <FractionDisplay expression={formatTermBankDisplay(chip)} />
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
