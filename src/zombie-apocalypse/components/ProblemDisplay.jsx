import React from 'react';

const ProblemDisplay = ({ 
  problem, 
  problemNumber, 
  totalProblems,
  userAnswer, 
  onAnswerChange, 
  onSubmit,
  onKeyPress 
}) => {
  if (!problem) return null;

  const isMultipleChoice = problem.type === 'multiple-choice';

  return (
    <div className="za-problem-container">
      <div className="za-problem-header">
        Problem {problemNumber} of {totalProblems}
      </div>

      <div className="za-problem-text">
        {problem.question}
      </div>

      {isMultipleChoice ? (
        <div className="za-choice-buttons">
          {Array.isArray(problem.choices) && problem.choices.map((choice, index) => (
            <button
              key={index}
              type="button"
              className={`za-choice-btn ${userAnswer === choice ? 'selected' : ''}`}
              onClick={() => {
                onAnswerChange(choice);
                onSubmit(choice);
              }}
            >
              {String(choice).toUpperCase()}
            </button>
          ))}
        </div>
      ) : (
        <div className="za-answer-section">
          <input
            key={problemNumber}
            className="za-answer-input"
            type="text"
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Enter your answer..."
          />
          <button 
            className="za-submit-btn"
            type="button"
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
