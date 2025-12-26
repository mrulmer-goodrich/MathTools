// Problem generators for all level types

// Utility: Get random integer in range
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Utility: Get random from array
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Utility: Get random fraction
const getRandomFraction = () => randomFrom(['1/2', '1/3', '1/4', '1/5', '2/3', '3/4', '2/5', '3/5', '4/5']);

// Utility: Get random decimal
const getRandomDecimal = () => randomFrom([0.5, 0.25, 0.75, 1.5, 2.5, 0.2, 0.4, 0.6, 0.8]);

// Utility: Parse fraction to decimal
const fractionToDecimal = (frac) => {
  const [num, den] = frac.split('/').map(Number);
  return num / den;
};

// LEVEL 1-1: Addition Supplies (Integer Addition)
export const generateAdditionProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const type = randomFrom([
      'posPos', 'posNeg', 'negPos', 'negNeg', 'zero'
    ]);

    let num1, num2, answer;

    switch (type) {
      case 'posPos':
        num1 = randomInt(1, 20);
        num2 = randomInt(1, 20);
        answer = num1 + num2;
        break;
      case 'posNeg':
        num1 = randomInt(1, 20);
        num2 = -randomInt(1, 20);
        answer = num1 + num2;
        break;
      case 'negPos':
        num1 = -randomInt(1, 20);
        num2 = randomInt(1, 20);
        answer = num1 + num2;
        break;
      case 'negNeg':
        num1 = -randomInt(1, 20);
        num2 = -randomInt(1, 20);
        answer = num1 + num2;
        break;
      case 'zero':
        num1 = Math.random() < 0.5 ? 0 : randomInt(-20, 20);
        num2 = num1 === 0 ? randomInt(-20, 20) : 0;
        answer = num1 + num2;
        break;
    }

    // Generate distractors (wrong answers)
    const distractors = new Set();
    distractors.add(-answer); // Wrong sign
    distractors.add(Math.abs(num1) + Math.abs(num2)); // Added absolute values
    distractors.add(-(Math.abs(num1) + Math.abs(num2))); // Negative of abs sum
    
    // Make sure we don't have duplicate distractors or correct answer
    const choices = [answer];
    for (let distractor of distractors) {
      if (distractor !== answer && !choices.includes(distractor)) {
        choices.push(distractor);
      }
    }
    
    // Fill to 4 choices if needed
    while (choices.length < 4) {
      const randomDistractor = answer + randomInt(-10, 10);
      if (!choices.includes(randomDistractor) && randomDistractor !== 0) {
        choices.push(randomDistractor);
      }
    }

    // Shuffle choices
    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${num1} + ${num2 >= 0 ? num2 : `(${num2})`}`,
      displayProblem: `${num1} + ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
      answer: answer,
      choices: choices.slice(0, 4),
      explanation: generateAdditionExplanation(num1, num2, answer)
    };
  } else {
    // Not Easy mode - includes decimals
    const useDecimal = Math.random() < 0.5;
    
    if (useDecimal) {
      const num1 = randomDecimal();
      const num2 = Math.random() < 0.5 ? randomDecimal() : -randomDecimal();
      const answer = Math.round((num1 + num2) * 100) / 100;

      const choices = [
        answer,
        -answer,
        Math.abs(num1) + Math.abs(num2),
        -(Math.abs(num1) + Math.abs(num2))
      ].slice(0, 4);
      
      choices.sort(() => Math.random() - 0.5);

      return {
        problem: `${num1} + ${num2 >= 0 ? num2 : `(${num2})`}`,
        displayProblem: `${num1} + ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
        answer: answer,
        choices: choices,
        explanation: generateAdditionExplanation(num1, num2, answer)
      };
    } else {
      // Use fractions - convert to common denominator for answer
      // For simplicity, we'll use simpler fractions
      const num1 = randomFrom([0.5, 1.5, 2.5, -0.5, -1.5]);
      const num2 = randomFrom([0.25, 0.75, 1.25, -0.25, -0.75]);
      const answer = Math.round((num1 + num2) * 100) / 100;

      const choices = [answer, -answer, Math.abs(num1) + Math.abs(num2), answer + 1];
      choices.sort(() => Math.random() - 0.5);

      return {
        problem: `${num1} + ${num2 >= 0 ? num2 : `(${num2})`}`,
        displayProblem: `${num1} + ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
        answer: answer,
        choices: choices.slice(0, 4),
        explanation: generateAdditionExplanation(num1, num2, answer)
      };
    }
  }
};

const generateAdditionExplanation = (num1, num2, answer) => {
  const sign1 = num1 >= 0 ? 'positive' : 'negative';
  const sign2 = num2 >= 0 ? 'positive' : 'negative';
  
  let rule;
  if (num1 >= 0 && num2 >= 0) {
    rule = "When adding two positive numbers, add them normally.";
  } else if (num1 < 0 && num2 < 0) {
    rule = "When adding two negative numbers, add their absolute values and make the result negative.";
  } else {
    rule = "When adding numbers with different signs, subtract the smaller absolute value from the larger, and use the sign of the number with the larger absolute value.";
  }

  return {
    steps: [
      {
        description: `Problem: ${num1} + ${num2 >= 0 ? num2 : `(${num2})`}`,
        work: ``
      },
      {
        description: num2 >= 0 
          ? `Think of this on a number line: Start at ${num1}, move ${num2} spaces to the RIGHT`
          : `Think of this on a number line: Start at ${num1}, move ${Math.abs(num2)} spaces to the LEFT`,
        work: `You land at ${answer}`
      }
    ],
    rule: rule,
    finalAnswer: answer
  };
};

// Export all generators
export const problemGenerators = {
  '1-1': generateAdditionProblem,
  // More will be added as we build
};

export default problemGenerators;
