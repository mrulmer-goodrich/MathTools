// Problem generators for Levels 1-8

// Utility functions
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDecimal = () => randomFrom([0.5, 0.25, 0.75, 1.5, 2.5, 0.2, 0.4, 0.6, 0.8]);
const getRandomFraction = () => randomFrom(['1/2', '1/3', '1/4', '2/3', '3/4', '1/5', '2/5', '3/5', '4/5']);

// Convert fraction string to decimal for calculations
const fractionToDecimal = (frac) => {
  const [num, den] = frac.split('/').map(Number);
  return num / den;
};

// Format fraction for display
const formatFraction = (frac) => {
  const [num, den] = frac.split('/');
  return `(${num}/${den})`;
};

// ============================================
// LEVEL 1-1: Addition
// ============================================

export const generateAdditionProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const type = randomFrom(['posPos', 'posNeg', 'negPos', 'negNeg']);
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
    }

    const distractors = new Set([
      -answer,
      Math.abs(num1) + Math.abs(num2),
      -(Math.abs(num1) + Math.abs(num2))
    ]);
    
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
      explanation: {
        steps: [
          { description: `Problem: ${num1} + ${num2 >= 0 ? num2 : `(${num2})`}`, work: `` },
          { description: num2 >= 0 ? `Start at ${num1}, move ${num2} right` : `Start at ${num1}, move ${Math.abs(num2)} left`, work: `Result: ${answer}` }
        ],
        rule: num1 >= 0 && num2 >= 0 ? "Adding positives: add normally" : "Different signs: subtract smaller from larger, use sign of larger",
        finalAnswer: answer
      }
    };
  } else {
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
      explanation: {
        steps: [
          { description: `Problem: ${num1} + ${num2 >= 0 ? num2 : `(${num2})`}`, work: `` },
          { description: `Calculate: ${answer}`, work: `` }
        ],
        rule: "Same rules apply with decimals",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-2: Subtraction
// ============================================

export const generateSubtractionProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const type = randomFrom(['posPos', 'posNeg', 'negPos', 'negNeg']);
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
        answer = num1 - num2;
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
    }

    const distractors = new Set([
      -answer,
      num1 + num2,
      num2 - num1
    ]);
    
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

    const isSubtractingNegative = num2 < 0;

    return {
      problem: `${num1} - ${num2 >= 0 ? num2 : `(${num2})`}`,
      displayProblem: `${num1} - ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
      answer: answer,
      choices: choices.slice(0, 4),
      explanation: {
        steps: [
          { description: `Problem: ${num1} - ${num2 >= 0 ? num2 : `(${num2})`}`, work: `` },
          ...(isSubtractingNegative ? [{ description: "Subtracting negative = adding positive", work: `${num1} - (${num2}) = ${num1} + ${-num2}` }] : []),
          { description: "Calculate", work: `Result: ${answer}` }
        ],
        rule: isSubtractingNegative ? "Subtracting a negative = adding a positive" : "Subtract normally",
        finalAnswer: answer
      }
    };
  } else {
    const num1 = randomDecimal();
    const num2 = Math.random() < 0.5 ? randomDecimal() : -randomDecimal();
    const answer = Math.round((num1 - num2) * 100) / 100;

    const choices = [answer, -answer, Math.round((num1 + num2) * 100) / 100, Math.round((num2 - num1) * 100) / 100];
    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${num1} - ${num2 >= 0 ? num2 : `(${num2})`}`,
      displayProblem: `${num1} - ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
      answer: answer,
      choices: [...new Set(choices)].slice(0, 4),
      explanation: {
        steps: [{ description: `${num1} - ${num2 >= 0 ? num2 : `(${num2})`} = ${answer}`, work: `` }],
        rule: "Same rules with decimals",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-3: Multiplication
// ============================================

export const generateMultiplicationProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const type = randomFrom(['posPos', 'posNeg', 'negPos', 'negNeg']);
    let num1, num2, answer;

    switch (type) {
      case 'posPos':
        num1 = randomInt(2, 12);
        num2 = randomInt(2, 12);
        break;
      case 'posNeg':
        num1 = randomInt(2, 12);
        num2 = -randomInt(2, 12);
        break;
      case 'negPos':
        num1 = -randomInt(2, 12);
        num2 = randomInt(2, 12);
        break;
      case 'negNeg':
        num1 = -randomInt(2, 12);
        num2 = -randomInt(2, 12);
        break;
    }
    
    answer = num1 * num2;

    const choices = [answer, -answer, Math.abs(num1) * Math.abs(num2), -(Math.abs(num1) * Math.abs(num2))];
    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${num1} × ${num2 >= 0 ? num2 : `(${num2})`}`,
      displayProblem: `${num1} × ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
      answer: answer,
      choices: [...new Set(choices)].slice(0, 4),
      explanation: {
        steps: [
          { description: `Multiply absolute values: ${Math.abs(num1)} × ${Math.abs(num2)} = ${Math.abs(answer)}`, work: `` },
          { description: `Apply sign rule`, work: `Result: ${answer}` }
        ],
        rule: "Same signs → Positive; Different signs → Negative",
        finalAnswer: answer
      }
    };
  } else {
    const num1 = Math.random() < 0.5 ? randomDecimal() : randomInt(2, 12);
    const num2 = Math.random() < 0.5 ? -randomDecimal() : -randomInt(2, 12);
    const answer = Math.round((num1 * num2) * 100) / 100;

    const choices = [answer, -answer, Math.round((Math.abs(num1) * Math.abs(num2)) * 100) / 100, 0];
    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${num1} × ${num2 >= 0 ? num2 : `(${num2})`}`,
      displayProblem: `${num1} × ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
      answer: answer,
      choices: [...new Set(choices)].slice(0, 4),
      explanation: {
        steps: [{ description: `${num1} × ${num2 >= 0 ? num2 : `(${num2})`} = ${answer}`, work: `` }],
        rule: "Same sign rules apply",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-4: Division
// ============================================

export const generateDivisionProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const type = randomFrom(['posPos', 'posNeg', 'negPos', 'negNeg']);
    let num2, answer;

    switch (type) {
      case 'posPos':
        num2 = randomInt(2, 12);
        answer = randomInt(2, 12);
        break;
      case 'posNeg':
        num2 = -randomInt(2, 12);
        answer = randomInt(2, 12);
        break;
      case 'negPos':
        num2 = randomInt(2, 12);
        answer = -randomInt(2, 12);
        break;
      case 'negNeg':
        num2 = -randomInt(2, 12);
        answer = -randomInt(2, 12);
        break;
    }
    
    const num1 = num2 * answer;

    const choices = [answer, -answer, Math.abs(answer), num1];
    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${num1} ÷ ${num2 >= 0 ? num2 : `(${num2})`}`,
      displayProblem: `${num1} ÷ ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
      answer: answer,
      choices: [...new Set(choices)].slice(0, 4),
      explanation: {
        steps: [
          { description: `Divide absolute values: ${Math.abs(num1)} ÷ ${Math.abs(num2)} = ${Math.abs(answer)}`, work: `` },
          { description: `Apply sign rule`, work: `Result: ${answer}` }
        ],
        rule: "Same signs → Positive; Different signs → Negative",
        finalAnswer: answer
      }
    };
  } else {
    const num2 = Math.random() < 0.5 ? randomInt(2, 10) : -randomInt(2, 10);
    const answer = Math.random() < 0.5 ? randomDecimal() : randomInt(2, 10);
    const num1 = Math.round((num2 * answer) * 100) / 100;

    const choices = [answer, -answer, Math.abs(answer), 1];
    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${num1} ÷ ${num2 >= 0 ? num2 : `(${num2})`}`,
      displayProblem: `${num1} ÷ ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
      answer: answer,
      choices: [...new Set(choices)].slice(0, 4).map(n => Math.round(n * 100) / 100),
      explanation: {
        steps: [{ description: `${num1} ÷ ${num2 >= 0 ? num2 : `(${num2})`} = ${answer}`, work: `` }],
        rule: "Same sign rules apply",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-5: Clear Path (Basic Distribution)
// ============================================

export const generateBasicDistributionProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const outside = randomInt(2, 8);
    const term1 = 'x';
    const term2 = randomInt(1, 10);
    
    const distributed1 = `${outside}x`;
    const distributed2 = outside * term2;
    const answer = `${distributed1} + ${distributed2}`;

    // Distractors
    const choices = [
      answer,
      `${outside}x + ${term2}`, // Forgot to distribute to constant
      `x + ${distributed2}`, // Forgot to distribute to variable
      `${distributed1} - ${distributed2}` // Wrong sign
    ];

    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${outside}(x + ${term2})`,
      displayProblem: `${outside}(x + ${term2})`,
      answer: answer,
      choices: choices,
      explanation: {
        steps: [
          { description: `Distribute ${outside} to BOTH terms inside`, work: `` },
          { description: `${outside} × x = ${outside}x`, work: `` },
          { description: `${outside} × ${term2} = ${distributed2}`, work: `` },
          { description: `Combine with +`, work: `${answer}` }
        ],
        rule: "DISTRIBUTIVE PROPERTY: Multiply the outside number by EVERY term inside the parentheses",
        finalAnswer: answer
      }
    };
  } else {
    // Not Easy: fractions or decimals
    const useFraction = Math.random() < 0.5;
    
    if (useFraction) {
      const frac = getRandomFraction();
      const fracDecimal = fractionToDecimal(frac);
      const variable = randomFrom(['x', 'y', 'n', 'm']);
      const term2 = randomInt(2, 12);
      
      const distributed2 = fracDecimal * term2;
      const answer = `${formatFraction(frac)}${variable} + ${distributed2}`;

      const choices = [
        answer,
        `${formatFraction(frac)}${variable} + ${term2}`,
        `${variable} + ${distributed2}`,
        `${formatFraction(frac)}${variable} - ${distributed2}`
      ];

      choices.sort(() => Math.random() - 0.5);

      return {
        problem: `${formatFraction(frac)}(${variable} + ${term2})`,
        displayProblem: `${formatFraction(frac)}(${variable} + ${term2})`,
        answer: answer,
        choices: choices,
        explanation: {
          steps: [
            { description: `Distribute ${formatFraction(frac)} to both terms`, work: `` },
            { description: `${formatFraction(frac)} × ${variable} = ${formatFraction(frac)}${variable}`, work: `` },
            { description: `${formatFraction(frac)} × ${term2} = ${distributed2}`, work: `` },
            { description: `Result`, work: `${answer}` }
          ],
          rule: "Distribute to ALL terms inside parentheses",
          finalAnswer: answer
        }
      };
    } else {
      const decimal = randomDecimal();
      const variable = randomFrom(['x', 'y', 'n', 'm']);
      const term2 = randomInt(2, 12);
      
      const distributed2 = Math.round(decimal * term2 * 100) / 100;
      const answer = `${decimal}${variable} + ${distributed2}`;

      const choices = [
        answer,
        `${decimal}${variable} + ${term2}`,
        `${variable} + ${distributed2}`,
        `${decimal}${variable} - ${distributed2}`
      ];

      choices.sort(() => Math.random() - 0.5);

      return {
        problem: `${decimal}(${variable} + ${term2})`,
        displayProblem: `${decimal}(${variable} + ${term2})`,
        answer: answer,
        choices: choices,
        explanation: {
          steps: [
            { description: `Distribute ${decimal} to both terms`, work: `` },
            { description: `${decimal} × ${variable} = ${decimal}${variable}`, work: `` },
            { description: `${decimal} × ${term2} = ${distributed2}`, work: `` },
            { description: `Result`, work: `${answer}` }
          ],
          rule: "Distribute to ALL terms",
          finalAnswer: answer
        }
      };
    }
  }
};

// ============================================
// LEVEL 1-6: Rocky Trail (Distribution with Subtraction)
// ============================================

export const generateDistributionSubtractionProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const outside = randomInt(2, 8);
    const term2 = randomInt(1, 10);
    
    const distributed1 = `${outside}x`;
    const distributed2 = outside * term2;
    const answer = `${distributed1} - ${distributed2}`;

    const choices = [
      answer,
      `${distributed1} + ${distributed2}`, // Wrong sign
      `${outside}x - ${term2}`, // Forgot to distribute to constant
      `x - ${distributed2}` // Forgot to distribute to variable
    ];

    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${outside}(x - ${term2})`,
      displayProblem: `${outside}(x - ${term2})`,
      answer: answer,
      choices: choices,
      explanation: {
        steps: [
          { description: `Distribute ${outside} to BOTH terms`, work: `` },
          { description: `${outside} × x = ${outside}x`, work: `` },
          { description: `${outside} × (-${term2}) = -${distributed2}`, work: `` },
          { description: `Keep the subtraction sign!`, work: `${answer}` }
        ],
        rule: "When distributing with subtraction, multiply by the NEGATIVE number",
        finalAnswer: answer
      }
    };
  } else {
    const useFraction = Math.random() < 0.5;
    
    if (useFraction) {
      const frac = getRandomFraction();
      const fracDecimal = fractionToDecimal(frac);
      const variable = randomFrom(['x', 'y', 'n', 'm']);
      const term2 = randomInt(2, 12);
      
      const distributed2 = Math.round(fracDecimal * term2 * 100) / 100;
      const answer = `${formatFraction(frac)}${variable} - ${distributed2}`;

      const choices = [
        answer,
        `${formatFraction(frac)}${variable} + ${distributed2}`,
        `${formatFraction(frac)}${variable} - ${term2}`,
        `${variable} - ${distributed2}`
      ];

      choices.sort(() => Math.random() - 0.5);

      return {
        problem: `${formatFraction(frac)}(${variable} - ${term2})`,
        displayProblem: `${formatFraction(frac)}(${variable} - ${term2})`,
        answer: answer,
        choices: choices,
        explanation: {
          steps: [
            { description: `Distribute ${formatFraction(frac)}`, work: `` },
            { description: `Result: ${answer}`, work: `` }
          ],
          rule: "Keep the subtraction!",
          finalAnswer: answer
        }
      };
    } else {
      const decimal = randomDecimal();
      const variable = randomFrom(['x', 'y', 'n', 'm']);
      const term2 = randomInt(2, 12);
      
      const distributed2 = Math.round(decimal * term2 * 100) / 100;
      const answer = `${decimal}${variable} - ${distributed2}`;

      const choices = [
        answer,
        `${decimal}${variable} + ${distributed2}`,
        `${decimal}${variable} - ${term2}`,
        `${variable} - ${distributed2}`
      ];

      choices.sort(() => Math.random() - 0.5);

      return {
        problem: `${decimal}(${variable} - ${term2})`,
        displayProblem: `${decimal}(${variable} - ${term2})`,
        answer: answer,
        choices: choices,
        explanation: {
          steps: [
            { description: `Distribute ${decimal}`, work: `${answer}` }
          ],
          rule: "Maintain the subtraction sign",
          finalAnswer: answer
        }
      };
    }
  }
};

// ============================================
// LEVEL 1-7: Dark Forest (Negative Outside)
// ============================================

export const generateNegativeOutsideProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const outside = -randomInt(2, 8);
    const term2 = randomInt(1, 10);
    
    const distributed1 = `${outside}x`;
    const distributed2 = outside * term2;
    const answer = `${distributed1} - ${Math.abs(distributed2)}`;

    const choices = [
      answer,
      `${distributed1} + ${Math.abs(distributed2)}`, // Wrong sign
      `${Math.abs(outside)}x - ${Math.abs(distributed2)}`, // Forgot negative on x term
      `${distributed1} + ${distributed2}` // Double negative confusion
    ];

    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${outside}(x + ${term2})`,
      displayProblem: `${outside}(x + ${term2})`,
      answer: answer,
      choices: choices,
      explanation: {
        steps: [
          { description: `Distribute ${outside} to BOTH terms`, work: `` },
          { description: `${outside} × x = ${outside}x`, work: `` },
          { description: `${outside} × ${term2} = ${distributed2}`, work: `` },
          { description: `NEGATIVE times POSITIVE = NEGATIVE`, work: `${answer}` }
        ],
        rule: "Negative × Positive = Negative. BOTH terms become negative!",
        finalAnswer: answer
      }
    };
  } else {
    const useFraction = Math.random() < 0.5;
    
    if (useFraction) {
      const frac = getRandomFraction();
      const fracDecimal = -fractionToDecimal(frac);
      const variable = randomFrom(['x', 'y', 'n', 'm']);
      const term2 = randomInt(2, 12);
      
      const distributed2 = Math.round(fracDecimal * term2 * 100) / 100;
      const answer = `-${formatFraction(frac)}${variable} - ${Math.abs(distributed2)}`;

      const choices = [
        answer,
        `-${formatFraction(frac)}${variable} + ${Math.abs(distributed2)}`,
        `${formatFraction(frac)}${variable} - ${Math.abs(distributed2)}`,
        `-${formatFraction(frac)}${variable} + ${distributed2}`
      ];

      choices.sort(() => Math.random() - 0.5);

      return {
        problem: `-${formatFraction(frac)}(${variable} + ${term2})`,
        displayProblem: `-${formatFraction(frac)}(${variable} + ${term2})`,
        answer: answer,
        choices: choices,
        explanation: {
          steps: [
            { description: `Distribute negative fraction`, work: `${answer}` }
          ],
          rule: "Negative distributes to ALL terms",
          finalAnswer: answer
        }
      };
    } else {
      const decimal = -randomDecimal();
      const variable = randomFrom(['x', 'y', 'n', 'm']);
      const term2 = randomInt(2, 12);
      
      const distributed2 = Math.round(decimal * term2 * 100) / 100;
      const answer = `${decimal}${variable} - ${Math.abs(distributed2)}`;

      const choices = [
        answer,
        `${decimal}${variable} + ${Math.abs(distributed2)}`,
        `${Math.abs(decimal)}${variable} - ${Math.abs(distributed2)}`,
        `${decimal}${variable} + ${distributed2}`
      ];

      choices.sort(() => Math.random() - 0.5);

      return {
        problem: `${decimal}(${variable} + ${term2})`,
        displayProblem: `${decimal}(${variable} + ${term2})`,
        answer: answer,
        choices: choices,
        explanation: {
          steps: [
            { description: `Distribute ${decimal}`, work: `${answer}` }
          ],
          rule: "Negative outside makes all terms negative",
          finalAnswer: answer
        }
      };
    }
  }
};

// ============================================
// LEVEL 1-8: Mixed Terrain (Negative Inside)
// ============================================

export const generateNegativeInsideProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const outside = -randomInt(2, 8);
    const term2 = randomInt(1, 10);
    
    const distributed1 = `${outside}x`;
    const distributed2 = -(outside * term2); // Negative × Negative = Positive!
    const answer = `${distributed1} + ${distributed2}`;

    const choices = [
      answer,
      `${distributed1} - ${distributed2}`, // Forgot double negative
      `${Math.abs(outside)}x + ${distributed2}`, // Wrong sign on x
      `${distributed1} - ${Math.abs(distributed2)}` // Both negative
    ];

    choices.sort(() => Math.random() - 0.5);

    return {
      problem: `${outside}(x - ${term2})`,
      displayProblem: `${outside}(x - ${term2})`,
      answer: answer,
      choices: choices,
      explanation: {
        steps: [
          { description: `Distribute ${outside} to BOTH terms`, work: `` },
          { description: `${outside} × x = ${outside}x`, work: `` },
          { description: `${outside} × (-${term2}) = ${distributed2}`, work: `` },
          { description: `NEGATIVE × NEGATIVE = POSITIVE!`, work: `${answer}` }
        ],
        rule: "When distributing a NEGATIVE to a NEGATIVE, the result is POSITIVE!",
        finalAnswer: answer
      }
    };
  } else {
    const useFraction = Math.random() < 0.5;
    
    if (useFraction) {
      const frac = getRandomFraction();
      const fracDecimal = -fractionToDecimal(frac);
      const variable = randomFrom(['x', 'y', 'n', 'm']);
      const term2 = randomInt(2, 12);
      
      const distributed2 = Math.round(-(fracDecimal * term2) * 100) / 100;
      const answer = `-${formatFraction(frac)}${variable} + ${distributed2}`;

      const choices = [
        answer,
        `-${formatFraction(frac)}${variable} - ${distributed2}`,
        `${formatFraction(frac)}${variable} + ${distributed2}`,
        `-${formatFraction(frac)}${variable} - ${Math.abs(distributed2)}`
      ];

      choices.sort(() => Math.random() - 0.5);

      return {
        problem: `-${formatFraction(frac)}(${variable} - ${term2})`,
        displayProblem: `-${formatFraction(frac)}(${variable} - ${term2})`,
        answer: answer,
        choices: choices,
        explanation: {
          steps: [
            { description: `Distribute negative fraction to both terms`, work: `` },
            { description: `Negative × Negative = Positive for constant`, work: `${answer}` }
          ],
          rule: "Double negative makes positive!",
          finalAnswer: answer
        }
      };
    } else {
      const decimal = -randomDecimal();
      const variable = randomFrom(['x', 'y', 'n', 'm']);
      const term2 = randomInt(2, 12);
      
      const distributed2 = Math.round(-(decimal * term2) * 100) / 100;
      const answer = `${decimal}${variable} + ${distributed2}`;

      const choices = [
        answer,
        `${decimal}${variable} - ${distributed2}`,
        `${Math.abs(decimal)}${variable} + ${distributed2}`,
        `${decimal}${variable} - ${Math.abs(distributed2)}`
      ];

      choices.sort(() => Math.random() - 0.5);

      return {
        problem: `${decimal}(${variable} - ${term2})`,
        displayProblem: `${decimal}(${variable} - ${term2})`,
        answer: answer,
        choices: choices,
        explanation: {
          steps: [
            { description: `Distribute ${decimal}`, work: `` },
            { description: `Negative × Negative = Positive`, work: `${answer}` }
          ],
          rule: "Double negative = positive",
          finalAnswer: answer
        }
      };
    }
  }
};

// Export all generators
export const problemGenerators = {
  '1-1': generateAdditionProblem,
  '1-2': generateSubtractionProblem,
  '1-3': generateMultiplicationProblem,
  '1-4': generateDivisionProblem,
  '1-5': generateBasicDistributionProblem,
  '1-6': generateDistributionSubtractionProblem,
  '1-7': generateNegativeOutsideProblem,
  '1-8': generateNegativeInsideProblem,
};

export default problemGenerators;
