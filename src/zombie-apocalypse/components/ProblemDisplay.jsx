// ProblemDisplay.jsx
// Version: 3.4.0
// Last Updated: November 30, 2024 - 11:59 PM
// Changes: Handles both multiple-choice and free-response problems

import React, { useRef, useEffect } from 'react';

const ProblemDisplay = ({
  problem,
  problemNumber,
  totalProblems,
  userAnswer,
  onAnswerChange,
  onSubmit,
  onKeyPress
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && problem.type !== 'multiple-choice') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [problem]);

  if (!problem) return null;

  const handleChoiceClick = (choice) => {
    // For multiple choice, auto-submit on click
    onAnswerChange(choice);
    // Give React time to update state, then submit
    setTimeout(() => {
      onSubmit(choice); // Pass choice directly to override userAnswer
    }, 50);
  };

  return (
    <div className="za-problem-display">
      <div className="za-problem-header">
        <span className="za-problem-number">
          Problem {problemNumber} of {totalProblems}
        </span>
      </div>

      <div className="za-problem-question">
        {problem.question}
      </div>

      {problem.type === 'multiple-choice' ? (
        <div className="za-choices-container">
          {problem.choices.map((choice, index) => (
            <button
              key={index}
              className={`za-choice-button ${userAnswer === choice ? 'selected' : ''}`}
              onClick={() => handleChoiceClick(choice)}
            >
              {choice.toUpperCase()}
            </button>
          ))}
        </div>
      ) : (
        <div className="za-answer-section">
          <input
            ref={inputRef}
            type="text"
            className="za-answer-input"
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Enter your answer..."
          />
          <button
            className="za-submit-button"
            onClick={() => onSubmit()}
            disabled={!userAnswer.trim()}
          >
            Submit Answer
          </button>
        </div>
      )}
    </div>
  );
};

export default ProblemDisplay;
