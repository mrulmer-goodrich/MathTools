import React from 'react';

const ProblemDisplay = ({ 
  problem, 
  problemNumber, 
  setType,
  questionPrompt,
  userAnswer, 
  onAnswerChange, 
  onSubmit 
}) => {
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  // Render based on problem type
  if (setType === 'multiple-choice') {
    return (
      <div className="problem-container">
        
        {questionPrompt && <div className="question-prompt">{questionPrompt}</div>}
        
        <div className="image-comparison">
          <div className="image-column">
            <img 
              src={problem.originalImage} 
              alt="Original shape"
              className="problem-image"
            />
          </div>
          
          <div className="image-column">
            <img 
              src={problem.copyImage} 
              alt="Copy shape"
              className="problem-image"
            />
          </div>
        </div>
        
        <div className="answer-section">
          <div className="multiple-choice">
            {problem.choices.map((choice, idx) => (
              <button
                key={idx}
                className={`choice-button ${userAnswer === choice ? 'selected' : ''}`}
                onClick={() => onAnswerChange(choice)}
              >
                {String.fromCharCode(65 + idx)}) {choice}
              </button>
            ))}
          </div>
          
          <button 
            className="submit-button"
            onClick={onSubmit}
            disabled={!userAnswer}
          >
            CRACK CODE
          </button>
        </div>
      </div>
    );
  }
  
  if (setType === 'conceptual') {
  return (
    <div className="problem-container">
      {questionPrompt && <div className="question-prompt">{questionPrompt}</div>}

      <div className="conceptual-question">
        <p className="question-text">{problem.question}</p>
      </div>

      <div className="answer-section">
        {Array.isArray(problem.choices) && problem.choices.length > 0 ? (
          <div className="multiple-choice">
            {problem.choices.map((choice, idx) => (
              <button
                key={idx}
                className={`choice-button ${userAnswer === choice ? 'selected' : ''}`}
                onClick={() => onAnswerChange(choice)}
              >
                {String.fromCharCode(65 + idx)}) {choice}
              </button>
            ))}
          </div>
        ) : (
          <div className="input-group">
            <input
              type="text"
              className="answer-input"
              value={userAnswer}
              onChange={(e) => onAnswerChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your answer."
              autoFocus
            />
            {problem.unit && <span className="unit-label">{problem.unit}</span>}
          </div>
        )}

        <button
          className="submit-button"
          onClick={onSubmit}
          disabled={!userAnswer}
        >
          CRACK CODE
        </button>
      </div>
    </div>
  );
  }

  // text-input type (sets 2-5)
  return (
    <div className="problem-container">
      
      {questionPrompt && <div className="question-prompt">{questionPrompt}</div>}
      
      <div className="image-comparison">
        <div className="image-column">
          <img 
            src={problem.originalImage} 
            alt="Original shape"
            className="problem-image"
          />
        </div>
        
        <div className="image-column">
          <img 
            src={problem.copyImage} 
            alt="Copy shape"
            className="problem-image"
          />
        </div>
      </div>
      
      <div className="answer-section">
        <div className="input-group">
          <input
            type="text"
            className="answer-input"
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your answer..."
            autoFocus
          />
          {problem.unit && <span className="unit-label">{problem.unit}</span>}
        </div>
        
        <button 
          className="submit-button"
          onClick={onSubmit}
          disabled={!userAnswer}
        >
          CRACK CODE
        </button>
      </div>
    </div>
  );
};

export default ProblemDisplay;
