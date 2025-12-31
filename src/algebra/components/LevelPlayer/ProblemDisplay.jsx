// ProblemDisplay.jsx - UPDATED with proper formatting
// Location: src/algebra/components/LevelPlayer/ProblemDisplay.jsx

import React from 'react';
import { formatMultiplication } from '../../utils/formatUtils';
import '../../styles/algebra.css';

const ProblemDisplay = ({ problem }) => {
  if (!problem) return null;

  // Format the problem text to use proper notation
  const formattedProblem = formatMultiplication(problem.problem);

  return (
    <div className="problem-display">
      <h3>Solve:</h3>
      <div className="problem-text">
        {formattedProblem}
      </div>
    </div>
  );
};

export default ProblemDisplay;
