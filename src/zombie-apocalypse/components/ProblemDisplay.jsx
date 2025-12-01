// ProblemDisplay.jsx
// VERSION: 4.1 EMERGENCY FIX
// ADDED: Level 7 scaffolding support

import React, { useEffect, useRef, useState } from 'react';

const ProblemDisplay = ({ 
  problem, 
  problemNumber, 
  totalProblems,
  userAnswer, 
  onAnswerChange, 
  onSubmit,
  onKeyPress,
  currentLevel
}) => {
  const inputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepAnswers, setStepAnswers] = useState({});

  // Auto-focus input when problem changes
  useEffect(() => {
    if (inputRef.current && problem && problem.type !== 'multiple-choice') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [problemNumber, problem]);

  // Reset scaffolding when problem changes
  useEffect(() => {
    setCurrentStep(0);
    setStepAnswers({});
  }, [problemNumber]);

  if (!problem) return null;

  const isMultipleChoice = problem.type === 'multiple-choice';
  const hasScaffolding = problem.showWork && currentLevel === 7;

  // Level 7 Scaffolding Steps
  const scaffoldingSteps = hasScaffolding ? [
    {
      label: "Step 1: Calculate population after first wave decrease",
      question: `Starting population: ${problem.showWork.initialPop.toLocaleString()}. After ${problem.showWork.decrease}% decrease, how many survivors?`,
      answer: problem.showWork.afterDecrease.toString(),
      hint: "Multiply by (1 - percent/100)"
    },
    {
      label: "Step 2: Calculate final population after growth",
      question: `Population after first wave: ${problem.showWork.afterDecrease.toLocaleString()}. After ${problem.showWork.increase}% increase, what's the final population?`,
      answer: problem.showWork.finalPopulation.toString(),
      hint: "Multiply by (1 + percent/100)"
    },
    {
      label: "Step 3: Calculate total money with interest",
      question: `Starting money: $${problem.showWork.moneyPool.toLocaleString()}. With ${problem.showWork.interestRate}% simple interest for ${problem.showWork.years} years, what's the total?`,
      answer: problem.showWork.totalMoney,
      hint: "Total = Principal + (Principal × rate × time)"
    },
    {
      label: "Step 4: Calculate money per person",
      question: `Total money: $${problem.showWork.totalMoney}. Final population: ${problem.showWork.finalPopulation.toLocaleString()}. How much per person?`,
      answer: problem.showWork.perPerson,
      hint: "Divide total money by population"
    }
  ] : [];

  const handleScaffoldingSubmit = () => {
    const currentStepData = scaffoldingSteps[currentStep];
    const userVal = parseFloat(userAnswer);
    const correctVal = parseFloat(currentStepData.answer);

    if (Math.abs(userVal - correctVal) < 0.5) {
      // Correct step answer
      setStepAnswers({
        ...stepAnswers,
        [currentStep]: userAnswer
      });

      if (currentStep < scaffoldingSteps.length - 1) {
        // Move to next step
        setCurrentStep(currentStep + 1);
        onAnswerChange('');
      } else {
        // All steps complete - submit final answer
        onSubmit();
      }
    } else {
      // Wrong answer - show hint
      alert(`Not quite. Hint: ${currentStepData.hint}`);
    }
  };

  return (
    <div className="za-problem-container">
      <div className="za-problem-header">
        Problem {problemNumber} of {totalProblems}
      </div>

      <div className="za-problem-text">
        {problem.question}
      </div>

      {/* Level 7 Scaffolding Display */}
      {hasScaffolding && (
        <div className="za-scaffolding-container">
          <div className="za-scaffolding-title">📊 Break it down step-by-step:</div>
          
          {scaffoldingSteps.map((step, idx) => (
            <div 
              key={idx}
              className={`za-scaffold-step ${
                idx < currentStep ? 'completed' : 
                idx === currentStep ? 'active' : 
                'locked'
              }`}
            >
              <div className="za-step-label">{step.label}</div>
              
              {idx < currentStep && (
                <div className="za-step-completed">
                  ✓ Answer: {stepAnswers[idx]}
                </div>
              )}
              
              {idx === currentStep && (
                <div className="za-step-active">
                  <div className="za-step-question">{step.question}</div>
                  <input
                    ref={inputRef}
                    className="za-answer-input"
                    type="text"
                    value={userAnswer}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleScaffoldingSubmit();
                    }}
                    placeholder="Enter your answer..."
                  />
                  <button 
                    className="za-submit-btn"
                    type="button"
                    onClick={handleScaffoldingSubmit}
                    disabled={!userAnswer.trim()}
                  >
                    {idx < scaffoldingSteps.length - 1 ? 'Next Step →' : 'Submit Final Answer'}
                  </button>
                </div>
              )}
              
              {idx > currentStep && (
                <div className="za-step-locked">🔒 Complete previous steps first</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Regular Problem Display (Not Level 7) */}
      {!hasScaffolding && (
        <>
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
                ref={inputRef}
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
        </>
      )}
    </div>
  );
};

export default ProblemDisplay;
