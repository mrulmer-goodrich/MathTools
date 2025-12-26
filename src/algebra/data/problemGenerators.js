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

// PHASE 4: COMBINING LIKE TERMS (Levels 9-12)
// Add these functions to your problemGenerators.js file

// ============================================
// LEVEL 1-9: GATHER SUPPLIES (Basic Like Terms)
// ============================================

export const generateBasicLikeTermsProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const coef1 = randomInt(2, 8);
    const coef2 = randomInt(2, 8);
    const combined = coef1 + coef2;
    
    const answer = `${combined}x`;
    const problem = `${coef1}x + ${coef2}x`;

    const choices = [
      answer,
      `${coef1 + coef2}x²`, // Common error: added exponent
      `${coef1}x + ${coef2}x`, // Didn't combine
      `${coef1 * coef2}x` // Multiplied instead of added
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
          { description: `Problem: ${problem}`, work: `` },
          { description: `These are LIKE TERMS (same variable, same exponent)`, work: `` },
          { description: `Add the coefficients: ${coef1} + ${coef2} = ${combined}`, work: `` },
          { description: `Keep the variable`, work: `${answer}` }
        ],
        rule: "LIKE TERMS: Same variable with same exponent. Add/subtract the coefficients, keep the variable.",
        finalAnswer: answer
      }
    };
  } else {
    const coef1 = randomDecimal();
    const coef2 = randomDecimal();
    const combined = Math.round((coef1 + coef2) * 100) / 100;
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const answer = `${combined}${variable}`;
    const problem = `${coef1}${variable} + ${coef2}${variable}`;

    const choices = [
      answer,
      `${coef1}${variable} + ${coef2}${variable}`,
      `${Math.round((coef1 * coef2) * 100) / 100}${variable}`,
      `${combined}${variable}²`
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
          { description: `Like terms: add coefficients`, work: `${coef1} + ${coef2} = ${combined}` },
          { description: `Result`, work: `${answer}` }
        ],
        rule: "Add coefficients, keep variable",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-10: COUNT INVENTORY (Unlike Terms)
// ============================================

export const generateUnlikeTermsProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const coefX = randomInt(2, 8);
    const constant = randomInt(1, 10);
    
    const answer = `${coefX}x + ${constant}`;
    const problem = `${coefX}x + ${constant}`;

    const choices = [
      answer,
      `${coefX + constant}x`, // Tried to combine unlike terms
      `${coefX}x${constant}`, // Multiplied
      `${coefX + constant}` // Lost variable
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
          { description: `Problem: ${problem}`, work: `` },
          { description: `${coefX}x and ${constant} are NOT like terms`, work: `` },
          { description: `One has a variable (x), one doesn't`, work: `` },
          { description: `CANNOT combine - leave as is`, work: `${answer}` }
        ],
        rule: "UNLIKE TERMS: Different variables OR one has variable and one doesn't. CANNOT be combined!",
        finalAnswer: answer
      }
    };
  } else {
    const coefX = randomDecimal();
    const coefY = randomDecimal();
    const varX = randomFrom(['x', 'a', 'n']);
    const varY = randomFrom(['y', 'b', 'm']);
    
    const answer = `${coefX}${varX} + ${coefY}${varY}`;
    const problem = `${coefX}${varX} + ${coefY}${varY}`;

    const choices = [
      answer,
      `${Math.round((coefX + coefY) * 100) / 100}${varX}`,
      `${Math.round((coefX + coefY) * 100) / 100}${varX}${varY}`,
      `${coefX}${varX}${coefY}${varY}`
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
          { description: `Different variables: ${varX} and ${varY}`, work: `` },
          { description: `Cannot combine`, work: `${answer}` }
        ],
        rule: "Different variables = unlike terms",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-11: SORT SUPPLIES (Multiple Like Terms)
// ============================================

export const generateMultipleLikeTermsProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const coef1 = randomInt(2, 6);
    const coef2 = randomInt(2, 6);
    const coef3 = randomInt(1, 5);
    
    const xTerms = coef1 + coef2;
    const constant = coef3;
    
    const answer = `${xTerms}x + ${constant}`;
    const problem = `${coef1}x + ${coef2}x + ${constant}`;

    const choices = [
      answer,
      `${coef1 + coef2 + coef3}x`, // Combined all
      `${coef1}x + ${coef2 + coef3}`, // Combined wrong terms
      `${xTerms}x${constant}` // Concatenated
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
          { description: `Problem: ${problem}`, work: `` },
          { description: `Identify like terms: ${coef1}x and ${coef2}x are LIKE`, work: `` },
          { description: `${constant} is UNLIKE (no variable)`, work: `` },
          { description: `Combine like terms: ${coef1}x + ${coef2}x = ${xTerms}x`, work: `` },
          { description: `Keep unlike term separate`, work: `${answer}` }
        ],
        rule: "Only combine LIKE terms. Leave unlike terms separate.",
        finalAnswer: answer
      }
    };
  } else {
    const coefX1 = randomInt(2, 6);
    const coefX2 = randomInt(2, 6);
    const coefY = randomDecimal();
    const constant = randomInt(1, 10);
    
    const xTerms = coefX1 + coefX2;
    
    const answer = `${xTerms}x + ${coefY}y + ${constant}`;
    const problem = `${coefX1}x + ${coefX2}x + ${coefY}y + ${constant}`;

    const choices = [
      answer,
      `${xTerms + coefY + constant}xy`,
      `${xTerms}x + ${coefY + constant}y`,
      `${coefX1 + coefX2 + constant}x + ${coefY}y`
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
          { description: `Combine x terms: ${coefX1}x + ${coefX2}x = ${xTerms}x`, work: `` },
          { description: `y term stays: ${coefY}y`, work: `` },
          { description: `Constant stays: ${constant}`, work: `` },
          { description: `Result`, work: `${answer}` }
        ],
        rule: "Combine all like terms separately",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-12: PACK IT UP (Subtraction of Like Terms)
// ============================================

export const generateSubtractLikeTermsProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const coef1 = randomInt(5, 12);
    const coef2 = randomInt(2, coef1 - 1);
    const combined = coef1 - coef2;
    
    const answer = `${combined}x`;
    const problem = `${coef1}x - ${coef2}x`;

    const choices = [
      answer,
      `${coef1 + coef2}x`, // Added instead of subtracted
      `${coef1}x - ${coef2}x`, // Didn't combine
      `-${combined}x` // Wrong sign
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
          { description: `Problem: ${problem}`, work: `` },
          { description: `Like terms with subtraction`, work: `` },
          { description: `Subtract coefficients: ${coef1} - ${coef2} = ${combined}`, work: `` },
          { description: `Keep the variable`, work: `${answer}` }
        ],
        rule: "Subtracting like terms: subtract coefficients, keep variable",
        finalAnswer: answer
      }
    };
  } else {
    const coef1 = randomInt(5, 12);
    const coef2 = randomInt(2, coef1 - 1);
    const coef3 = randomInt(1, 5);
    const combined = coef1 - coef2;
    
    const answer = `${combined}x - ${coef3}`;
    const problem = `${coef1}x - ${coef2}x - ${coef3}`;

    const choices = [
      answer,
      `${combined}x + ${coef3}`,
      `${coef1 - coef2 - coef3}x`,
      `${combined - coef3}x`
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
          { description: `Combine x terms: ${coef1}x - ${coef2}x = ${combined}x`, work: `` },
          { description: `Constant stays separate: -${coef3}`, work: `` },
          { description: `Result`, work: `${answer}` }
        ],
        rule: "Combine like terms, keep unlike terms separate",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// PHASE 5: SIMPLIFYING EXPRESSIONS (Levels 13-16)
// Copy these 4 functions and paste them BEFORE the EXPORTS section
// ============================================

// ============================================
// LEVEL 1-13: MOUNTAIN BASE (Distribute then Combine)
// ============================================

export const generateDistributeCombineProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const outside = randomInt(2, 5);
    const insideTerm = randomInt(1, 6);
    const standaloneTerm = randomInt(2, 8);
    
    // Problem: 3(x + 2) + 5x
    const distributedCoef = outside;
    const distributedConstant = outside * insideTerm;
    const totalXCoef = distributedCoef + standaloneTerm;
    
    const answer = `${totalXCoef}x + ${distributedConstant}`;
    const problem = `${outside}(x + ${insideTerm}) + ${standaloneTerm}x`;

    const choices = [
      answer,
      `${distributedCoef}x + ${distributedConstant + standaloneTerm}`, // Combined wrong terms
      `${totalXCoef}x + ${insideTerm}`, // Forgot to distribute constant
      `${outside + standaloneTerm}x + ${distributedConstant}` // Didn't distribute first
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
          { description: `Problem: ${problem}`, work: `` },
          { description: `STEP 1: Distribute ${outside} first`, work: `${outside}(x + ${insideTerm}) = ${distributedCoef}x + ${distributedConstant}` },
          { description: `STEP 2: Rewrite the expression`, work: `${distributedCoef}x + ${distributedConstant} + ${standaloneTerm}x` },
          { description: `STEP 3: Combine like terms (x terms)`, work: `${distributedCoef}x + ${standaloneTerm}x = ${totalXCoef}x` },
          { description: `STEP 4: Keep constant separate`, work: `${answer}` }
        ],
        rule: "ORDER OF OPERATIONS: Distribute FIRST, then combine like terms",
        finalAnswer: answer
      }
    };
  } else {
    const outside = randomDecimal();
    const insideTerm = randomInt(2, 8);
    const standaloneTerm = randomInt(2, 8);
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const distributedCoef = outside;
    const distributedConstant = Math.round(outside * insideTerm * 100) / 100;
    const totalCoef = Math.round((distributedCoef + standaloneTerm) * 100) / 100;
    
    const answer = `${totalCoef}${variable} + ${distributedConstant}`;
    const problem = `${outside}(${variable} + ${insideTerm}) + ${standaloneTerm}${variable}`;

    const choices = [
      answer,
      `${distributedCoef}${variable} + ${Math.round((distributedConstant + standaloneTerm) * 100) / 100}`,
      `${totalCoef}${variable} + ${insideTerm}`,
      `${Math.round((outside + standaloneTerm) * 100) / 100}${variable} + ${distributedConstant}`
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
          { description: `Distribute first: ${outside}(${variable} + ${insideTerm}) = ${distributedCoef}${variable} + ${distributedConstant}`, work: `` },
          { description: `Combine like terms: ${distributedCoef}${variable} + ${standaloneTerm}${variable} = ${totalCoef}${variable}`, work: `` },
          { description: `Result`, work: `${answer}` }
        ],
        rule: "Distribute, then combine",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-14: STEEP CLIMB (Distribute with Subtraction)
// ============================================

export const generateDistributeSubtractProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const outside = randomInt(2, 5);
    const insideTerm = randomInt(1, 6);
    const standaloneTerm = randomInt(2, 8);
    
    // Problem: 4(x - 3) + 5x
    const distributedCoef = outside;
    const distributedConstant = -(outside * insideTerm);
    const totalXCoef = distributedCoef + standaloneTerm;
    
    const answer = formatAnswer(totalXCoef, 'x', distributedConstant);
    const problem = `${outside}(x - ${insideTerm}) + ${standaloneTerm}x`;

    const choices = [
      answer,
      `${totalXCoef}x + ${Math.abs(distributedConstant)}`, // Wrong sign
      `${totalXCoef}x - ${insideTerm}`, // Didn't distribute
      `${distributedCoef}x - ${Math.abs(distributedConstant) + standaloneTerm}` // Combined wrong
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
          { description: `Problem: ${problem}`, work: `` },
          { description: `STEP 1: Distribute ${outside}`, work: `${outside}(x - ${insideTerm}) = ${distributedCoef}x - ${Math.abs(distributedConstant)}` },
          { description: `STEP 2: Rewrite`, work: `${distributedCoef}x - ${Math.abs(distributedConstant)} + ${standaloneTerm}x` },
          { description: `STEP 3: Combine x terms`, work: `${distributedCoef}x + ${standaloneTerm}x = ${totalXCoef}x` },
          { description: `STEP 4: Final answer`, work: `${answer}` }
        ],
        rule: "Watch the signs when distributing with subtraction!",
        finalAnswer: answer
      }
    };
  } else {
    const outside = randomDecimal();
    const insideTerm = randomInt(2, 8);
    const standaloneTerm = randomInt(2, 8);
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const distributedCoef = outside;
    const distributedConstant = -Math.round(outside * insideTerm * 100) / 100;
    const totalCoef = Math.round((distributedCoef + standaloneTerm) * 100) / 100;
    
    const answer = `${totalCoef}${variable} - ${Math.abs(distributedConstant)}`;
    const problem = `${outside}(${variable} - ${insideTerm}) + ${standaloneTerm}${variable}`;

    const choices = [
      answer,
      `${totalCoef}${variable} + ${Math.abs(distributedConstant)}`,
      `${distributedCoef}${variable} - ${insideTerm}`,
      `${totalCoef}${variable} - ${insideTerm}`
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
          { description: `Distribute: ${outside}(${variable} - ${insideTerm}) = ${distributedCoef}${variable} - ${Math.abs(distributedConstant)}`, work: `` },
          { description: `Combine: ${distributedCoef}${variable} + ${standaloneTerm}${variable} = ${totalCoef}${variable}`, work: `` },
          { description: `Result`, work: `${answer}` }
        ],
        rule: "Careful with subtraction signs",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-15: ROCKY LEDGE (Negative Outside)
// ============================================

export const generateNegativeDistributeCombineProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const outside = -randomInt(2, 5);
    const insideTerm = randomInt(1, 6);
    const standaloneTerm = randomInt(2, 8);
    
    // Problem: -3(x + 2) + 5x
    const distributedCoef = outside;
    const distributedConstant = outside * insideTerm;
    const totalXCoef = distributedCoef + standaloneTerm;
    
    const answer = formatAnswer(totalXCoef, 'x', distributedConstant);
    const problem = `${outside}(x + ${insideTerm}) + ${standaloneTerm}x`;

    const choices = [
      answer,
      formatAnswer(totalXCoef, 'x', -distributedConstant), // Wrong sign on constant
      formatAnswer(-distributedCoef + standaloneTerm, 'x', distributedConstant), // Didn't distribute negative
      `${totalXCoef}x + ${insideTerm}` // Forgot to distribute to constant
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
          { description: `Problem: ${problem}`, work: `` },
          { description: `STEP 1: Distribute ${outside} to BOTH terms`, work: `${outside}(x + ${insideTerm}) = ${distributedCoef}x + ${distributedConstant}` },
          { description: `STEP 2: Rewrite`, work: `${distributedCoef}x + ${distributedConstant} + ${standaloneTerm}x` },
          { description: `STEP 3: Combine x terms`, work: `${distributedCoef}x + ${standaloneTerm}x = ${totalXCoef}x` },
          { description: `STEP 4: Final answer`, work: `${answer}` }
        ],
        rule: "NEGATIVE outside makes BOTH terms negative!",
        finalAnswer: answer
      }
    };
  } else {
    const outside = -randomDecimal();
    const insideTerm = randomInt(2, 8);
    const standaloneTerm = randomInt(2, 8);
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const distributedCoef = outside;
    const distributedConstant = Math.round(outside * insideTerm * 100) / 100;
    const totalCoef = Math.round((distributedCoef + standaloneTerm) * 100) / 100;
    
    const answer = `${totalCoef}${variable} - ${Math.abs(distributedConstant)}`;
    const problem = `${outside}(${variable} + ${insideTerm}) + ${standaloneTerm}${variable}`;

    const choices = [
      answer,
      `${totalCoef}${variable} + ${Math.abs(distributedConstant)}`,
      `${Math.round((Math.abs(distributedCoef) + standaloneTerm) * 100) / 100}${variable} - ${Math.abs(distributedConstant)}`,
      `${totalCoef}${variable} + ${insideTerm}`
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
          { description: `Distribute negative: ${outside}(${variable} + ${insideTerm}) = ${distributedCoef}${variable} - ${Math.abs(distributedConstant)}`, work: `` },
          { description: `Combine: ${distributedCoef}${variable} + ${standaloneTerm}${variable} = ${totalCoef}${variable}`, work: `` },
          { description: `Result`, work: `${answer}` }
        ],
        rule: "Negative distributes to all terms",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-16: SUMMIT (Complex Simplification)
// ============================================

export const generateComplexSimplifyProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const outside = randomInt(2, 4);
    const insideTerm = randomInt(1, 5);
    const standaloneTerm = randomInt(2, 6);
    const constant = randomInt(1, 8);
    
    // Problem: 2(x + 3) + 4x - 5
    const distributedCoef = outside;
    const distributedConstant = outside * insideTerm;
    const totalXCoef = distributedCoef + standaloneTerm;
    const totalConstant = distributedConstant - constant;
    
    const answer = formatAnswer(totalXCoef, 'x', totalConstant);
    const problem = `${outside}(x + ${insideTerm}) + ${standaloneTerm}x - ${constant}`;

    const choices = [
      answer,
      `${totalXCoef}x + ${distributedConstant} - ${constant}`, // Didn't combine constants
      `${totalXCoef}x + ${distributedConstant + constant}`, // Added instead of subtract
      formatAnswer(totalXCoef, 'x', distributedConstant) // Forgot the -constant
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
          { description: `Problem: ${problem}`, work: `` },
          { description: `STEP 1: Distribute`, work: `${outside}(x + ${insideTerm}) = ${distributedCoef}x + ${distributedConstant}` },
          { description: `STEP 2: Rewrite`, work: `${distributedCoef}x + ${distributedConstant} + ${standaloneTerm}x - ${constant}` },
          { description: `STEP 3: Combine x terms`, work: `${distributedCoef}x + ${standaloneTerm}x = ${totalXCoef}x` },
          { description: `STEP 4: Combine constants`, work: `${distributedConstant} - ${constant} = ${totalConstant}` },
          { description: `STEP 5: Final answer`, work: `${answer}` }
        ],
        rule: "Distribute → Combine like x terms → Combine constants",
        finalAnswer: answer
      }
    };
  } else {
    const outside = randomInt(2, 4);
    const insideTerm = randomInt(2, 6);
    const standaloneTerm = randomInt(2, 6);
    const constant1 = randomInt(1, 8);
    const constant2 = randomInt(1, 8);
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const distributedCoef = outside;
    const distributedConstant = outside * insideTerm;
    const totalCoef = distributedCoef + standaloneTerm;
    const totalConstant = distributedConstant + constant1 - constant2;
    
    const answer = formatAnswer(totalCoef, variable, totalConstant);
    const problem = `${outside}(${variable} + ${insideTerm}) + ${standaloneTerm}${variable} + ${constant1} - ${constant2}`;

    const choices = [
      answer,
      `${totalCoef}${variable} + ${distributedConstant} + ${constant1} - ${constant2}`,
      formatAnswer(totalCoef, variable, distributedConstant + constant1 + constant2),
      formatAnswer(totalCoef, variable, distributedConstant)
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
          { description: `Distribute: ${outside}(${variable} + ${insideTerm}) = ${distributedCoef}${variable} + ${distributedConstant}`, work: `` },
          { description: `Combine ${variable} terms: ${distributedCoef}${variable} + ${standaloneTerm}${variable} = ${totalCoef}${variable}`, work: `` },
          { description: `Combine constants: ${distributedConstant} + ${constant1} - ${constant2} = ${totalConstant}`, work: `` },
          { description: `Result`, work: `${answer}` }
        ],
        rule: "Distribute, combine all like terms",
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
  '1-9': generateBasicLikeTermsProblem,
  '1-10': generateUnlikeTermsProblem,
  '1-11': generateMultipleLikeTermsProblem,
  '1-12': generateSubtractLikeTermsProblem,
  '1-13': generateDistributeCombineProblem,
  '1-14': generateDistributeSubtractProblem,
  '1-15': generateNegativeDistributeCombineProblem,
  '1-16': generateComplexSimplifyProblem,
};

export default problemGenerators;
