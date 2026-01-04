// ProblemDisplay.jsx - Safe rendering
import React from 'react';
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

  return (
    <div className="problem-container">
      <div className="problem-label">Solve:</div>
      <div className="problem-display">{problem.problem}</div>
    </div>
  );
};

export default ProblemDisplay;
