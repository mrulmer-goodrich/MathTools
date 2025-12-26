import React from 'react';

const ProblemDisplay = ({ problem }) => {
  return (
    <div className="problem-display">
      <div className="problem-container">
        <div className="problem-label">Solve:</div>
        <div className="problem-text">
          {problem.displayProblem}
        </div>
      </div>
    </div>
  );
};

export default ProblemDisplay;
