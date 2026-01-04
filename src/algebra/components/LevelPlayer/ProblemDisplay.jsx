// ProblemDisplay.jsx - CORRECT: Uses problem.problem, no "SOLVE:" label
// Location: src/algebra/components/LevelPlayer/ProblemDisplay.jsx

import React from 'react';
import { formatProblemText } from '../../utils/formatUtils';
import '../../styles/algebra.css';

const ProblemDisplay = ({ problem }) => {
  // SAFETY: Don't render if problem is missing
  if (!problem || !problem.problem) {
    return (
      <div className="problem-container">
        <div className="problem-display">Loading...</div>
      </div>
    );
  }

  // Format the problem text (converts × to ·)
  const displayText = formatProblemText(problem.problem);

  return (
    <div className="problem-container">
      <div className="problem-display">{displayText}</div>
    </div>
  );
};

export default ProblemDisplay;
