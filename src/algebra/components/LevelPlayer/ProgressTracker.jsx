// ProgressTracker.jsx - FIXED: Dots now render and fill correctly
// Location: src/algebra/components/ProgressTracker.jsx

import React from 'react';

const ProgressTracker = ({ current, required }) => {
  return (
    <div className="progress-tracker">
      <div className="progress-label">
        Correct in a Row: {current} / {required}
      </div>
      <div className="progress-dots">
        {Array.from({ length: required }).map((_, index) => (
          <div 
            key={index}
            className={`progress-dot ${index < current ? 'filled' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;
