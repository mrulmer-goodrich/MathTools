// ScaffoldedProblem.jsx
// Version: 3.4.0
// Last Updated: November 30, 2024 - 11:59 PM
// Changes: New component for scaffolded multi-step problems (Levels 4-7)

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
  const inputRef = useRef(null);

  // Auto-focus input
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentStep]);

  // Reset when problem changes
  useEffect(() => {
    setCurrentStep(1);
    setStepAnswers({});
    setStepErrors({});
    setUserInput('');
  }, [problem]);

  if (!problem || !problem.scaffoldSteps) {
    return null;
  }

  const steps = problem.scaffoldSteps;
  const stepKeys = Object.keys(steps);
  const totalSteps = stepKeys.length;
  const currentStepKey = stepKeys[currentStep - 1];
  const currentStepData = steps[currentStepKey];

  // Check if this is the final step
  const isFinalStep = currentStep === totalSteps;

  const handleSubmitStep = () => {
    if (!userInput.trim()) return;

    const userAns = userInput.trim().toLowerCase();
    const correctAns = String(currentStepData.answer).toLowerCase();

    console.log('Scaffolding step check:', userAns, 'vs', correctAns);

    // Check for numerical equivalence or exact match
    let isCorrect = false;
    
    if (currentStepData.choices) {
      // Multiple choice step
      isCorrect = userAns === correctAns;
    } else {
      // Free response - check exact or numerical
      if (userAns === correctAns) {
        isCorrect = true;
      } else {
        const userNum = parseFloat(userAns);
        const correctNum = parseFloat(correctAns);
        if (!isNaN(userNum) && !isNaN(correctNum)) {
          isCorrect = Math.abs(userNum - correctNum) < 0.02;
        }
      }
    }

    if (isCorrect) {
      // Save answer and move to next step
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
        // Problem complete!
        onComplete();
      } else {
        // Move to next step
        setCurrentStep(currentStep + 1);
      }
    } else {
      // Wrong answer
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

  return (
    <div className="za-scaffolded-problem">
      <div className="za-scaffold-header">
        <div className="za-scaffold-title">Multi-Step Problem</div>
        <div className="za-scaffold-progress">
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      <div className="za-scaffold-question">
        {problem.question}
      </div>

      <div className="za-scaffold-steps">
        {stepKeys.map((key, index) => {
          const step = steps[key];
          const stepNum = index + 1;
          const isCurrentStep = stepNum === currentStep;
          const isCompletedStep = stepNum < currentStep;
          const isPendingStep = stepNum > currentStep;

          return (
            <div 
              key={key}
              className={`za-scaffold-step ${
                isCurrentStep ? 'current' : ''
              } ${
                isCompletedStep ? 'completed' : ''
              } ${
                isPendingStep ? 'pending' : ''
              }`}
            >
              <div className="za-step-number">{stepNum}</div>
              <div className="za-step-content">
                <div className="za-step-question">{step.question}</div>
                
                {isCompletedStep && (
                  <div className="za-step-answer-display">
                    ✓ {stepAnswers[key]}
                  </div>
                )}

                {isCurrentStep && (
                  <div className="za-step-input-area">
                    {step.choices ? (
                      <div className="za-step-choices">
                        {step.choices.map((choice, i) => (
                          <button
                            key={i}
                            className={`za-choice-btn ${userInput === choice ? 'selected' : ''}`}
                            onClick={() => {
                              setUserInput(choice);
                              // Auto-submit for choices
                              setTimeout(() => {
                                const userAns = choice.toLowerCase();
                                const correctAns = String(step.answer).toLowerCase();
                                if (userAns === correctAns) {
                                  setStepAnswers({ ...stepAnswers, [key]: choice });
                                  setStepErrors({ ...stepErrors, [key]: null });
                                  setUserInput('');
                                  if (isFinalStep) {
                                    onComplete();
                                  } else {
                                    setCurrentStep(currentStep + 1);
                                  }
                                } else {
                                  setStepErrors({ ...stepErrors, [key]: `Not quite! Expected: ${step.answer}` });
                                  onWrongAnswer();
                                }
                              }, 100);
                            }}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="za-step-input-group">
                        <input
                          ref={inputRef}
                          type="text"
                          className="za-scaffold-input"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Enter your answer..."
                        />
                        <button
                          className="za-scaffold-submit-btn"
                          onClick={handleSubmitStep}
                          disabled={!userInput.trim()}
                        >
                          {isFinalStep ? 'Submit Final Answer' : 'Next Step →'}
                        </button>
                      </div>
                    )}

                    {stepErrors[key] && (
                      <div className="za-step-error">
                        {stepErrors[key]}
                      </div>
                    )}
                  </div>
                )}

                {isPendingStep && (
                  <div className="za-step-locked">
                    Complete previous steps first
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="za-scaffold-note">
        💡 You only need the final answer to succeed, but these steps help you get there!
      </div>
    </div>
  );
};

export default ScaffoldedProblem;
