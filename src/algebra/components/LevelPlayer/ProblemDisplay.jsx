// ProblemDisplay.jsx - UPDATED: No "SOLVE:" label, clean display
// Location: src/algebra/components/LevelPlayer/ProblemDisplay.jsx

import React from 'react';
import { formatProblemText } from '../../utils/formatUtils';
import '../../styles/algebra.css';

const ProblemDisplay = ({ problem }) => {
  if (!problem || !problem.question) {
    return null;
  }

  const displayText = formatProblemText(problem.question);

  return (
    <div className="problem-container">
      <div className="problem-display">
        {displayText}
      </div>
    </div>
  );
};

export default ProblemDisplay;
