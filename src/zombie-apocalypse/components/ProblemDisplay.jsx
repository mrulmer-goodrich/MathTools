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
        <span className="za-problem-number">
          Problem {problemNumber} of {totalProblems}
        </span>
        {problem.subtitle && (
          <span className="za-problem-subtitle">
            {problem.subtitle}
          </span>
        )}
      </div>

      <div className="za-question-text">
        {problem.question}
      </div>

      {problem.context && (
        <div className="za-problem-context">
          {problem.context}
        </div>
      )}

      {isMultipleChoice ? (
        <div className="za-choices-grid">
          {Array.isArray(problem.choices) && problem.choices.map((choice, index) => (
            <button
              key={index}
              className={
                'za-choice-btn' + (userAnswer === choice ? ' za-choice-btn--selected' : '')
              }
              type="button"
              onClick={() => {
                // For multiple-choice, set the answer to the literal choice string,
                // then immediately submit using the shared onSubmit handler.
                onAnswerChange(choice);
                // Small timeout to ensure state updates before checkAnswer runs.
                setTimeout(() => {
                  onSubmit();
                }, 0);
              }}
            >
              {String(choice).toUpperCase()}
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
            type="button"
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
