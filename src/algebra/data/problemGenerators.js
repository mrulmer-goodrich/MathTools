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
};

export default problemGenerators;
