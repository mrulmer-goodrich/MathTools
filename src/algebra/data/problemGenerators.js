// Problem generators for all level types

// Utility: Get random integer in range
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Utility: Get random from array
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Utility: Get random decimal
const getRandomDecimal = () => randomFrom([0.5, 0.25, 0.75, 1.5, 2.5, 0.2, 0.4, 0.6, 0.8]);

// ============================================
// LEVEL 1-1: Addition Supplies
// ============================================

export const generateAdditionProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const type = randomFrom(['posPos', 'posNeg', 'negPos', 'negNeg', 'zero']);

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

    const distractors = new Set();
    distractors.add(-answer);
    distractors.add(Math.abs(num1) + Math.abs(num2));
    distractors.add(-(Math.abs(num1) + Math.abs(num2)));
    
    const choices = [answer];
    for (let distractor of distractors) {
      if (distractor !== answer && !choices.includes(distractor)) {
        choices.push(distractor);
      }
    }
    
    while (choices.length < 4) {
      const randomDistractor = answer + randomInt(-10, 10);
      if (!choices.includes(randomDistractor) && randomDistractor !== 0) {
        choices.push(randomDistractor);
      }
    }

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
    const num1 = randomDecimal();
    const num2 = Math.random() < 0.5 ? randomDecimal() : -randomDecimal();
    const answer = Math.round((num1 + num2) * 100) / 100;

    const choices = [
      answer,
      -answer,
      Math.round((Math.abs(num1) + Math.abs(num2)) * 100) / 100,
      Math.round((-(Math.abs(num1) + Math.abs(num2))) * 100) / 100
    ];
    
    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${num1} + ${num2 >= 0 ? num2 : `(${num2})`}`,
      displayProblem: `${num1} + ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
      answer: answer,
      choices: [...new Set(choices)].slice(0, 4),
      explanation: generateAdditionExplanation(num1, num2, answer)
    };
  }
};

const generateAdditionExplanation = (num1, num2, answer) => {
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
          ? `Start at ${num1}, move ${num2} spaces to the RIGHT`
          : `Start at ${num1}, move ${Math.abs(num2)} spaces to the LEFT`,
        work: `You land at ${answer}`
      }
    ],
    rule: rule,
    finalAnswer: answer
  };
};

// ============================================
// LEVEL 1-2: Subtraction Supplies
// ============================================

export const generateSubtractionProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const type = randomFrom(['posPos', 'posNeg', 'negPos', 'negNeg', 'zero']);

    let num1, num2, answer;

    switch (type) {
      case 'posPos':
        num1 = randomInt(1, 20);
        num2 = randomInt(1, 20);
        answer = num1 - num2;
        break;
      case 'posNeg':
        num1 = randomInt(1, 20);
        num2 = -randomInt(1, 20);
        answer = num1 - num2; // This becomes addition
        break;
      case 'negPos':
        num1 = -randomInt(1, 20);
        num2 = randomInt(1, 20);
        answer = num1 - num2;
        break;
      case 'negNeg':
        num1 = -randomInt(1, 20);
        num2 = -randomInt(1, 20);
        answer = num1 - num2;
        break;
      case 'zero':
        num1 = randomInt(-20, 20);
        num2 = Math.random() < 0.5 ? 0 : randomInt(-20, 20);
        answer = num1 - num2;
        break;
    }

    const distractors = new Set();
    distractors.add(-answer);
    distractors.add(num1 + num2); // Common mistake: added instead of subtracted
    distractors.add(num2 - num1); // Subtracted backwards
    
    const choices = [answer];
    for (let distractor of distractors) {
      if (distractor !== answer && !choices.includes(distractor)) {
        choices.push(distractor);
      }
    }
    
    while (choices.length < 4) {
      const randomDistractor = answer + randomInt(-10, 10);
      if (!choices.includes(randomDistractor)) {
        choices.push(randomDistractor);
      }
    }

    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${num1} - ${num2 >= 0 ? num2 : `(${num2})`}`,
      displayProblem: `${num1} - ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
      answer: answer,
      choices: choices.slice(0, 4),
      explanation: generateSubtractionExplanation(num1, num2, answer)
    };
  } else {
    const num1 = randomDecimal();
    const num2 = Math.random() < 0.5 ? randomDecimal() : -randomDecimal();
    const answer = Math.round((num1 - num2) * 100) / 100;

    const choices = [
      answer,
      -answer,
      Math.round((num1 + num2) * 100) / 100,
      Math.round((num2 - num1) * 100) / 100
    ];
    
    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${num1} - ${num2 >= 0 ? num2 : `(${num2})`}`,
      displayProblem: `${num1} - ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
      answer: answer,
      choices: [...new Set(choices)].slice(0, 4),
      explanation: generateSubtractionExplanation(num1, num2, answer)
    };
  }
};

const generateSubtractionExplanation = (num1, num2, answer) => {
  const isSubtractingNegative = num2 < 0;
  
  return {
    steps: [
      {
        description: `Problem: ${num1} - ${num2 >= 0 ? num2 : `(${num2})`}`,
        work: ``
      },
      ...(isSubtractingNegative ? [{
        description: "Recognize that subtracting a negative = adding a positive",
        work: `${num1} - (${num2}) = ${num1} + ${-num2}`
      }] : []),
      {
        description: isSubtractingNegative ? "Now add the numbers" : "Subtract the numbers",
        work: `${num1} ${isSubtractingNegative ? '+' : '-'} ${isSubtractingNegative ? -num2 : num2} = ${answer}`
      }
    ],
    rule: isSubtractingNegative 
      ? "Subtracting a negative number is the same as ADDING the positive version of that number. Think: 'Two negatives make a positive'"
      : "When subtracting, remember the order matters: first number minus second number.",
    finalAnswer: answer
  };
};

// ============================================
// LEVEL 1-3: Multiplication Supplies
// ============================================

export const generateMultiplicationProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const type = randomFrom(['posPos', 'posNeg', 'negPos', 'negNeg', 'byOne', 'byZero']);

    let num1, num2, answer;

    switch (type) {
      case 'posPos':
        num1 = randomInt(2, 12);
        num2 = randomInt(2, 12);
        answer = num1 * num2;
        break;
      case 'posNeg':
        num1 = randomInt(2, 12);
        num2 = -randomInt(2, 12);
        answer = num1 * num2;
        break;
      case 'negPos':
        num1 = -randomInt(2, 12);
        num2 = randomInt(2, 12);
        answer = num1 * num2;
        break;
      case 'negNeg':
        num1 = -randomInt(2, 12);
        num2 = -randomInt(2, 12);
        answer = num1 * num2;
        break;
      case 'byOne':
        num1 = randomInt(-20, 20);
        num2 = Math.random() < 0.5 ? 1 : -1;
        answer = num1 * num2;
        break;
      case 'byZero':
        num1 = randomInt(-20, 20);
        num2 = 0;
        answer = 0;
        break;
    }

    const distractors = new Set();
    distractors.add(-answer);
    distractors.add(Math.abs(num1) * Math.abs(num2)); // Forgot signs
    distractors.add(num1 + num2); // Added instead of multiplied
    
    const choices = [answer];
    for (let distractor of distractors) {
      if (distractor !== answer && !choices.includes(distractor)) {
        choices.push(distractor);
      }
    }
    
    while (choices.length < 4) {
      const randomDistractor = answer + randomInt(-20, 20);
      if (!choices.includes(randomDistractor)) {
        choices.push(randomDistractor);
      }
    }

    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${num1} × ${num2 >= 0 ? num2 : `(${num2})`}`,
      displayProblem: `${num1} × ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
      answer: answer,
      choices: choices.slice(0, 4),
      explanation: generateMultiplicationExplanation(num1, num2, answer)
    };
  } else {
    const num1 = Math.random() < 0.5 ? randomDecimal() : randomInt(2, 12);
    const num2 = Math.random() < 0.5 ? -randomDecimal() : -randomInt(2, 12);
    const answer = Math.round((num1 * num2) * 100) / 100;

    const choices = [
      answer,
      -answer,
      Math.round((Math.abs(num1) * Math.abs(num2)) * 100) / 100,
      Math.round((num1 + num2) * 100) / 100
    ];
    
    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${num1} × ${num2 >= 0 ? num2 : `(${num2})`}`,
      displayProblem: `${num1} × ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
      answer: answer,
      choices: [...new Set(choices)].slice(0, 4),
      explanation: generateMultiplicationExplanation(num1, num2, answer)
    };
  }
};

const generateMultiplicationExplanation = (num1, num2, answer) => {
  const sign1 = num1 >= 0 ? 'Positive' : 'Negative';
  const sign2 = num2 >= 0 ? 'Positive' : 'Negative';
  const resultSign = answer >= 0 ? 'Positive' : 'Negative';

  return {
    steps: [
      {
        description: `Problem: ${num1} × ${num2 >= 0 ? num2 : `(${num2})`}`,
        work: ``
      },
      {
        description: "Multiply the absolute values",
        work: `${Math.abs(num1)} × ${Math.abs(num2)} = ${Math.abs(answer)}`
      },
      {
        description: "Determine the sign",
        work: `${sign1} × ${sign2} = ${resultSign}\n\nResult: ${answer}`
      }
    ],
    rule: `SIGN RULES FOR MULTIPLICATION:\n• Positive × Positive = Positive\n• Positive × Negative = Negative\n• Negative × Positive = Negative\n• Negative × Negative = Positive\n\nRemember: Same signs → Positive, Different signs → Negative`,
    finalAnswer: answer
  };
};

// ============================================
// LEVEL 1-4: Division Supplies
// ============================================

export const generateDivisionProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const type = randomFrom(['posPos', 'posNeg', 'negPos', 'negNeg', 'byOne']);

    let num1, num2, answer;

    switch (type) {
      case 'posPos':
        num2 = randomInt(2, 12);
        answer = randomInt(2, 12);
        num1 = num2 * answer;
        break;
      case 'posNeg':
        num2 = -randomInt(2, 12);
        answer = randomInt(2, 12);
        num1 = num2 * answer;
        break;
      case 'negPos':
        num2 = randomInt(2, 12);
        answer = -randomInt(2, 12);
        num1 = num2 * answer;
        break;
      case 'negNeg':
        num2 = -randomInt(2, 12);
        answer = -randomInt(2, 12);
        num1 = num2 * answer;
        break;
      case 'byOne':
        num1 = randomInt(-50, 50);
        num2 = Math.random() < 0.5 ? 1 : -1;
        answer = num1 / num2;
        break;
    }

    const distractors = new Set();
    distractors.add(-answer);
    distractors.add(Math.abs(num1) / Math.abs(num2)); // Forgot signs
    distractors.add(num1 * num2); // Multiplied instead
    
    const choices = [answer];
    for (let distractor of distractors) {
      if (distractor !== answer && !choices.includes(distractor)) {
        choices.push(distractor);
      }
    }
    
    while (choices.length < 4) {
      const randomDistractor = answer + randomInt(-10, 10);
      if (!choices.includes(randomDistractor) && randomDistractor !== 0) {
        choices.push(randomDistractor);
      }
    }

    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${num1} ÷ ${num2 >= 0 ? num2 : `(${num2})`}`,
      displayProblem: `${num1} ÷ ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
      answer: answer,
      choices: choices.slice(0, 4),
      explanation: generateDivisionExplanation(num1, num2, answer)
    };
  } else {
    const num2 = Math.random() < 0.5 ? randomInt(2, 10) : -randomInt(2, 10);
    const answer = Math.random() < 0.5 ? randomDecimal() : randomInt(2, 10);
    const num1 = Math.round((num2 * answer) * 100) / 100;

    const choices = [
      answer,
      -answer,
      Math.round((Math.abs(num1) / Math.abs(num2)) * 100) / 100,
      Math.round((num1 * num2) * 100) / 100
    ];
    
    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${num1} ÷ ${num2 >= 0 ? num2 : `(${num2})`}`,
      displayProblem: `${num1} ÷ ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
      answer: answer,
      choices: [...new Set(choices)].slice(0, 4).map(n => Math.round(n * 100) / 100),
      explanation: generateDivisionExplanation(num1, num2, answer)
    };
  }
};

const generateDivisionExplanation = (num1, num2, answer) => {
  const sign1 = num1 >= 0 ? 'Positive' : 'Negative';
  const sign2 = num2 >= 0 ? 'Positive' : 'Negative';
  const resultSign = answer >= 0 ? 'Positive' : 'Negative';

  return {
    steps: [
      {
        description: `Problem: ${num1} ÷ ${num2 >= 0 ? num2 : `(${num2})`}`,
        work: ``
      },
      {
        description: "Divide the absolute values",
        work: `${Math.abs(num1)} ÷ ${Math.abs(num2)} = ${Math.abs(answer)}`
      },
      {
        description: "Determine the sign",
        work: `${sign1} ÷ ${sign2} = ${resultSign}\n\nResult: ${answer}`
      }
    ],
    rule: `SIGN RULES FOR DIVISION (same as multiplication):\n• Positive ÷ Positive = Positive\n• Positive ÷ Negative = Negative\n• Negative ÷ Positive = Negative\n• Negative ÷ Negative = Positive\n\nRemember: Same signs → Positive, Different signs → Negative`,
    finalAnswer: answer
  };
};

// Export all generators
export const problemGenerators = {
  '1-1': generateAdditionProblem,
  '1-2': generateSubtractionProblem,
  '1-3': generateMultiplicationProblem,
  '1-4': generateDivisionProblem,
  // More will be added as we build
};

export default problemGenerators;
