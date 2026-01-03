// MathWorksheet.jsx - Handles staged workflow for levels 13+
// Location: src/algebra/components/LevelPlayer/MathWorksheet.jsx

import React, { useState } from 'react';
import StepRow from './StepRow';
import '../../styles/algebra.css';

const MathWorksheet = ({ 
  problem,
  onComplete,
  onWrongAnswer 
}) => {
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [completedRows, setCompletedRows] = useState([]);
  const [rowAnswers, setRowAnswers] = useState({});

  if (!problem.staged || !problem.staged.rows) {
    return <div className="error">Problem structure invalid</div>;
  }

  const rows = problem.staged.rows;
  const currentRow = rows[currentRowIndex];
  const isFinalRow = currentRowIndex === rows.length - 1;

  const handleRowComplete = (rowId, answer) => {
    // Store the answer
    setRowAnswers(prev => ({
      ...prev,
      [rowId]: answer
    }));

    // Mark row as completed
    setCompletedRows(prev => [...prev, rowId]);

    // Check if this was the final row
    if (isFinalRow) {
      // Final row - check if answer is correct
      const isCorrect = answer === problem.answer;
      
      if (isCorrect) {
        onComplete();
      } else {
        onWrongAnswer();
      }
    } else {
      // Move to next row
      setCurrentRowIndex(prev => prev + 1);
    }
  };

  return (
    <div className="math-worksheet">
      <div className="problem-header">
        <h3>Solve:</h3>
        <div className="original-problem">{problem.displayProblem}</div>
      </div>

      <div className="worksheet-rows">
        {rows.map((row, index) => {
          const isCompleted = completedRows.includes(row.id);
          const isActive = index === currentRowIndex;
          const isLocked = index > currentRowIndex;

          return (
            <StepRow
              key={row.id}
              row={row}
              isActive={isActive}
              isCompleted={isCompleted}
              isLocked={isLocked}
              answer={rowAnswers[row.id]}
              onComplete={(answer) => handleRowComplete(row.id, answer)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MathWorksheet;
