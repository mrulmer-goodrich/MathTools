// ScaffoldedProblem.jsx v4.2 - FIXED with proper CSS, unlocked final answer
import React, { useState, useEffect, useRef } from 'react';

const ScaffoldedProblem = ({ 
  problem, 
  currentLevel,
  onComplete,
  onWrongAnswer 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepAnswers, setStepAnswers] = useState({});
  const [stepErrors, setStepErrors] = useState({});
  const [userInput, setUserInput] = useState('');
  const [finalAnswer, setFinalAnswer] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentStep]);

  useEffect(() => {
    setCurrentStep(1);
    setStepAnswers({});
    setStepErrors({});
    setUserInput('');
    setFinalAnswer('');
  }, [problem]);

  if (!problem || !problem.scaffoldSteps) {
    return null;
  }

  const steps = problem.scaffoldSteps;
  const stepKeys = Object.keys(steps);
  const totalSteps = stepKeys.length;
  const currentStepKey = stepKeys[currentStep - 1];
  const currentStepData = steps[currentStepKey];
  const isFinalStep = currentStep === totalSteps;

  // Check answer function
  const checkAnswer = (answer, correctAnswer) => {
    const userAns = answer.trim().toLowerCase();
    const correctAns = String(correctAnswer).toLowerCase();
    
    if (userAns === correctAns) return true;
    
    const userNum = parseFloat(userAns);
    const correctNum = parseFloat(correctAns);
    if (!isNaN(userNum) && !isNaN(correctNum)) {
      return Math.abs(userNum - correctNum) < 0.02;
    }
    
    return false;
  };

  // Handle final answer submission (can skip steps)
  const handleFinalSubmit = () => {
    if (!finalAnswer.trim()) return;
    
    if (checkAnswer(finalAnswer, problem.correctAnswer)) {
      onComplete();
    } else {
      onWrongAnswer();
    }
  };

  // Handle step submission
  const handleSubmitStep = () => {
    if (!userInput.trim()) return;

    if (checkAnswer(userInput, currentStepData.answer)) {
      setStepAnswers({
        ...stepAnswers,
        [currentStepKey]: userInput
      });
      setStepErrors({
        ...stepErrors,
        [currentStepKey]: null
      });
      setUserInput('');

      if (isFinalStep) {
        // If they complete all steps, submit final answer
        if (checkAnswer(userInput, problem.correctAnswer)) {
          onComplete();
        } else {
          onWrongAnswer();
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      setStepErrors({
        ...stepErrors,
        [currentStepKey]: `Not quite! Expected: ${currentStepData.answer}`
      });
      onWrongAnswer();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userInput.trim()) {
      handleSubmitStep();
    }
  };

  const handleFinalKeyPress = (e) => {
    if (e.key === 'Enter' && finalAnswer.trim()) {
      handleFinalSubmit();
    }
  };

  return (
    <div className="za-scaffolded-container">
      <div className="za-scaffold-main-question">
        {problem.question}
      </div>

      <div className="za-scaffold-steps-container">
        {stepKeys.map((key, index) => {
          const step = steps[key];
          const stepNum = index + 1;
          const isCurrentStep = stepNum === currentStep;
          const isCompletedStep = stepAnswers[key] !== undefined;
          const isLockedStep = stepNum > currentStep;

          return (
            <div 
              key={key}
              className={`za-scaffold-step ${
                isCurrentStep ? 'active' : ''
              } ${
                isCompletedStep ? 'completed' : ''
              } ${
                isLockedStep ? 'locked' : ''
              }`}
            >
              <div className="za-scaffold-step-label">
                Step {stepNum} of {totalSteps}
              </div>
              
              <div className="za-scaffold-step-question">
                {step.question}
              </div>
              
              {isCompletedStep && (
                <div className="za-scaffold-step-completed">
                  ✓ Your answer: {stepAnswers[key]}
                </div>
              )}

              {isCurrentStep && !isCompletedStep && (
                <div>
                  {step.choices ? (
                    <div className="za-scaffold-choices">
                      {step.choices.map((choice, i) => (
                        <button
                          key={i}
                          className="za-scaffold-choice-btn"
                          onClick={() => {
                            if (checkAnswer(choice, step.answer)) {
                              setStepAnswers({ ...stepAnswers, [key]: choice });
                              setStepErrors({ ...stepErrors, [key]: null });
                              if (!isFinalStep) {
                                setCurrentStep(currentStep + 1);
                              }
                            } else {
                              setStepErrors({ ...stepErrors, [key]: `Try again!` });
                              onWrongAnswer();
                            }
                          }}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={inputRef}
                        type="text"
                        className="za-scaffold-step-input"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter your answer..."
                      />
                      <button
                        className="za-scaffold-step-button"
                        onClick={handleSubmitStep}
                        disabled={!userInput.trim()}
                      >
                        {isFinalStep ? 'Submit Answer' : 'Next Step'}
                      </button>
                    </div>
                  )}

                  {stepErrors[key] && (
                    <div className="za-scaffold-step-error">
                      {stepErrors[key]}
                    </div>
                  )}

                  {step.hint && (
                    <div className="za-scaffold-hint">
                      💡 {step.hint}
                    </div>
                  )}
                </div>
              )}

              {isLockedStep && (
                <div style={{ 
                  color: '#888', 
                  fontStyle: 'italic',
                  fontSize: '14px'
                }}>
                  Complete Step {currentStep} first
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* UNLOCKED FINAL ANSWER - Can skip steps */}
      <div className="za-scaffold-final-answer">
        <div className="za-scaffold-final-label">
          Final Answer (You can skip steps!)
        </div>
        <input
          type="text"
          className="za-scaffold-final-input"
          value={finalAnswer}
          onChange={(e) => setFinalAnswer(e.target.value)}
          onKeyPress={handleFinalKeyPress}
          placeholder="Enter final answer here..."
        />
        <button
          className="za-scaffold-final-button"
          onClick={handleFinalSubmit}
          disabled={!finalAnswer.trim()}
        >
          Submit Final Answer
        </button>
      </div>
    </div>
  );
};

export default ScaffoldedProblem;
