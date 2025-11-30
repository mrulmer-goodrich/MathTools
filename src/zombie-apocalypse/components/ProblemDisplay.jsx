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
    <div className="za-problem-display">
      <div className="za-problem-number">
        Problem {problemNumber} of {totalProblems}
      </div>

      <div className="za-problem-text">
        {problem.question}
      </div>

      {isMultipleChoice ? (
        <div className="za-choice-buttons">
          {problem.choices.map((choice, index) => (
            <button
              key={index}
              className={`za-choice-btn ${userAnswer === choice ? 'selected' : ''}`}
              onClick={() => {
                onAnswerChange(choice);
                setTimeout(() => onSubmit(), 100);
              }}
            >
              {choice.toUpperCase()}
            </button>
          ))}
        </div>
      ) : (
        <div className="za-answer-section">
          <input
            type="text"
            className="za-answer-input"
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Enter your answer..."
            autoFocus
          />
          <button 
            className="za-submit-btn"
            onClick={onSubmit}
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
