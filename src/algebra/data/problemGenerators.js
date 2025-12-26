// Problem generators for Levels 1-8 - ALL FIXES APPLIED

// ============================================
// UTILITY FUNCTIONS
// ============================================

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDecimal = () => randomFrom([0.5, 0.25, 0.75, 1.5, 2.5, 0.2, 0.4, 0.6, 0.8]);

// Helper to format expressions consistently (NO duplicates like -2x+-6)
const formatAnswer = (coefficient, variable, constant) => {
  const varPart = coefficient === -1 ? `-${variable}` : 
                  coefficient === 1 ? variable :
                  `${coefficient}${variable}`;
  
  if (constant >= 0) {
    return `${varPart} + ${constant}`;
  } else {
    return `${varPart} - ${Math.abs(constant)}`;
  }
};

// Helper to ensure exactly 4 unique choices
const ensureFourChoices = (choices, answer) => {
  const uniqueChoices = [...new Set(choices)];
  let attempts = 0;
  while (uniqueChoices.length < 4 && attempts < 20) {
    const offset = randomInt(1, 10);
    const filler = Math.random() < 0.5 ? answer + offset : answer - offset;
    if (!uniqueChoices.includes(filler)) {
      uniqueChoices.push(filler);
    }
    attempts++;
  }
  return uniqueChoices.slice(0, 4).sort(() => Math.random() - 0.5);
};

// ============================================
// LEVEL 1-1: ADDITION
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

    const problem = `${num1} + ${num2 >= 0 ? num2 : `(${num2})`}`;
    
    const choices = [
      answer,
      -answer,
      Math.abs(num1) + Math.abs(num2),
      -(Math.abs(num1) + Math.abs(num2))
    ];
    
    const finalChoices = ensureFourChoices(choices, answer);

    return {
      problem: problem,
      displayProblem: `${problem} = ?`,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Problem: ${problem}`, work: `` },
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
    const problem = `${num1} + ${num2 >= 0 ? num2 : `(${num2})`}`;

    const choices = [
      answer,
      -answer,
      Math.round((Math.abs(num1) + Math.abs(num2)) * 100) / 100,
      Math.round((-(Math.abs(num1) + Math.abs(num2))) * 100) / 100
    ];
    
    const finalChoices = ensureFourChoices(choices, answer);

    return {
      problem: problem,
      displayProblem: `${problem} = ?`,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [{ description: `${problem} = ${answer}`, work: `` }],
        rule: "Same rules apply with decimals",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-2: SUBTRACTION
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

    const problem = `${num1} - ${num2 >= 0 ? num2 : `(${num2})`}`;
    const isSubtractingNegative = num2 < 0;
    
    const choices = [
      answer,
      -answer,
      num1 + num2,
      num2 - num1
    ];
    
    const finalChoices = ensureFourChoices(choices, answer);

    return {
      problem: problem,
      displayProblem: `${problem} = ?`,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Problem: ${problem}`, work: `` },
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
    const problem = `${num1} - ${num2 >= 0 ? num2 : `(${num2})`}`;

    const choices = [answer, -answer, Math.round((num1 + num2) * 100) / 100, Math.round((num2 - num1) * 100) / 100];
    const finalChoices = ensureFourChoices(choices, answer);

    return {
      problem: problem,
      displayProblem: `${problem} = ?`,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [{ description: `${problem} = ${answer}`, work: `` }],
        rule: "Same rules with decimals",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-3: MULTIPLICATION
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
    const problem = `${num1} × ${num2 >= 0 ? num2 : `(${num2})`}`;

    const choices = [answer, -answer, Math.abs(num1) * Math.abs(num2), -(Math.abs(num1) * Math.abs(num2))];
    const finalChoices = ensureFourChoices(choices, answer);

    return {
      problem: problem,
      displayProblem: `${problem} = ?`,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
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
    const problem = `${num1} × ${num2 >= 0 ? num2 : `(${num2})`}`;

    const choices = [answer, -answer, Math.round((Math.abs(num1) * Math.abs(num2)) * 100) / 100, 0];
    const finalChoices = ensureFourChoices(choices, answer);

    return {
      problem: problem,
      displayProblem: `${problem} = ?`,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [{ description: `${problem} = ${answer}`, work: `` }],
        rule: "Same sign rules apply",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-4: DIVISION
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
    const problem = `${num1} ÷ ${num2 >= 0 ? num2 : `(${num2})`}`;

    const choices = [answer, -answer, Math.abs(answer), num1];
    const finalChoices = ensureFourChoices(choices, answer);

    return {
      problem: problem,
      displayProblem: `${problem} = ?`,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
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
    const problem = `${num1} ÷ ${num2 >= 0 ? num2 : `(${num2})`}`;

    const choices = [answer, -answer, Math.abs(answer), 1];
    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: `${problem} = ?`,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [{ description: `${problem} = ${answer}`, work: `` }],
        rule: "Same sign rules apply",
        finalAnswer: answer
      }
    };
  }
};

// This continues from PART 1 - combine both files into one problemGenerators.js

// ============================================
// LEVEL 1-5: BASIC DISTRIBUTION
// ============================================

export const generateBasicDistributionProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const outside = randomInt(2, 8);
    const term2 = randomInt(1, 10);
    
    const distributed1Coef = outside;
    const distributed2 = outside * term2;
    const answer = formatAnswer(distributed1Coef, 'x', distributed2);
    const problem = `${outside}(x + ${term2})`;

    const choices = [
      answer,
      `${outside}x + ${term2}`,
      `x + ${distributed2}`,
      formatAnswer(distributed1Coef, 'x', -distributed2)
    ];

    const finalChoices = ensureFourChoices(choices, answer);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
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
    const outside = randomDecimal();
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    const term2 = randomInt(2, 12);
    
    const distributed2 = Math.round(outside * term2 * 100) / 100;
    const answer = `${outside}${variable} + ${distributed2}`;
    const problem = `${outside}(${variable} + ${term2})`;

    const choices = [
      answer,
      `${outside}${variable} + ${term2}`,
      `${variable} + ${distributed2}`,
      `${outside}${variable} - ${distributed2}`
    ];

    const finalChoices = ensureFourChoices(choices, answer);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Distribute ${outside} to both terms`, work: `` },
          { description: `Result: ${answer}`, work: `` }
        ],
        rule: "Distribute to ALL terms",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-6: DISTRIBUTION WITH SUBTRACTION
// ============================================

export const generateDistributionSubtractionProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const outside = randomInt(2, 8);
    const term2 = randomInt(1, 10);
    
    const distributed1Coef = outside;
    const distributed2 = -(outside * term2);
    const answer = formatAnswer(distributed1Coef, 'x', distributed2);
    const problem = `${outside}(x - ${term2})`;

    const choices = [
      answer,
      formatAnswer(distributed1Coef, 'x', -distributed2),
      `${outside}x - ${term2}`,
      `x - ${Math.abs(distributed2)}`
    ];

    const finalChoices = ensureFourChoices(choices, answer);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Distribute ${outside} to BOTH terms`, work: `` },
          { description: `${outside} × x = ${outside}x`, work: `` },
          { description: `${outside} × (-${term2}) = ${distributed2}`, work: `` },
          { description: `Keep the subtraction sign!`, work: `${answer}` }
        ],
        rule: "When distributing with subtraction, multiply by the NEGATIVE number",
        finalAnswer: answer
      }
    };
  } else {
    const outside = randomDecimal();
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    const term2 = randomInt(2, 12);
    
    const distributed2 = -Math.round(outside * term2 * 100) / 100;
    const answer = `${outside}${variable} - ${Math.abs(distributed2)}`;
    const problem = `${outside}(${variable} - ${term2})`;

    const choices = [
      answer,
      `${outside}${variable} + ${Math.abs(distributed2)}`,
      `${outside}${variable} - ${term2}`,
      `${variable} - ${Math.abs(distributed2)}`
    ];

    const finalChoices = ensureFourChoices(choices, answer);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Distribute ${outside}`, work: `${answer}` }
        ],
        rule: "Maintain the subtraction sign",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-7: DARK FOREST (Negative Outside)
// ============================================

export const generateNegativeOutsideProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const outside = -randomInt(2, 8);
    const term2 = randomInt(1, 10);
    
    const distributed1Coef = outside;
    const distributed2 = outside * term2;
    const answer = formatAnswer(distributed1Coef, 'x', distributed2);
    const problem = `${outside}(x + ${term2})`;

    const choices = [
      answer,
      formatAnswer(distributed1Coef, 'x', -distributed2),
      formatAnswer(-distributed1Coef, 'x', distributed2),
      `${distributed1Coef}x + ${distributed2}`
    ];

    const finalChoices = ensureFourChoices(choices, answer);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
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
    const outside = -randomDecimal();
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    const term2 = randomInt(2, 12);
    
    const distributed2 = Math.round(outside * term2 * 100) / 100;
    const answer = `${outside}${variable} - ${Math.abs(distributed2)}`;
    const problem = `${outside}(${variable} + ${term2})`;

    const choices = [
      answer,
      `${outside}${variable} + ${Math.abs(distributed2)}`,
      `${Math.abs(outside)}${variable} - ${Math.abs(distributed2)}`,
      `${outside}${variable} + ${distributed2}`
    ];

    const finalChoices = ensureFourChoices(choices, answer);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Distribute ${outside}`, work: `${answer}` }
        ],
        rule: "Negative outside makes all terms negative",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-8: MIXED TERRAIN (Negative Inside)
// ============================================

export const generateNegativeInsideProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const outside = -randomInt(2, 8);
    const term2 = randomInt(1, 10);
    
    const distributed1Coef = outside;
    const distributed2 = -(outside * term2); // Negative × Negative = Positive!
    const answer = formatAnswer(distributed1Coef, 'x', distributed2);
    const problem = `${outside}(x - ${term2})`;

    const choices = [
      answer,
      formatAnswer(distributed1Coef, 'x', -distributed2),
      formatAnswer(-distributed1Coef, 'x', distributed2),
      `${distributed1Coef}x - ${Math.abs(distributed2)}`
    ];

    const finalChoices = ensureFourChoices(choices, answer);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
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
    const outside = -randomDecimal();
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    const term2 = randomInt(2, 12);
    
    const distributed2 = -(Math.round(outside * term2 * 100) / 100);
    const answer = `${outside}${variable} + ${distributed2}`;
    const problem = `${outside}(${variable} - ${term2})`;

    const choices = [
      answer,
      `${outside}${variable} - ${distributed2}`,
      `${Math.abs(outside)}${variable} + ${distributed2}`,
      `${outside}${variable} - ${Math.abs(distributed2)}`
    ];

    const finalChoices = ensureFourChoices(choices, answer);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Distribute ${outside}`, work: `` },
          { description: `Negative × Negative = Positive`, work: `${answer}` }
        ],
        rule: "Double negative = positive",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// EXPORTS
// ============================================

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
