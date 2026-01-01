// ============================================
// GLOBAL NaN PROTECTION
// ============================================

export const validateAndFilterChoices = (choices, correctAnswer) => {
  const validChoices = choices.filter(choice => {
    if (choice === null || choice === undefined) return false;
    const str = String(choice);
    if (str.includes('NaN') || str.includes('undefined') || str.includes('null')) {
      console.error('Invalid choice detected:', choice);
      return false;
    }
    return true;
  });
  
  if (!validChoices.includes(correctAnswer)) {
    validChoices.unshift(correctAnswer);
  }
  
  return [...new Set(validChoices)];
};

// ============================================
// ANTI-REPEAT SYSTEM (Levels 1-8 only)
// ============================================

const problemHistory = {
  // Format: { '1-1-easy': [sig1, sig2, ...], '1-2-hard': [...] }
};

const MAX_HISTORY = 20;
const MAX_RETRIES = 8;

export const clearProblemHistory = () => {
  Object.keys(problemHistory).forEach(key => delete problemHistory[key]);
};

const generateSignature = (levelId, difficulty, params) => {
  return JSON.stringify({ levelId, difficulty, ...params });
};

const isRecentDuplicate = (levelId, difficulty, signature) => {
  const key = `${levelId}-${difficulty}`;
  if (!problemHistory[key]) return false;
  return problemHistory[key].includes(signature);
};

const recordProblem = (levelId, difficulty, signature) => {
  const key = `${levelId}-${difficulty}`;
  if (!problemHistory[key]) problemHistory[key] = [];
  problemHistory[key].push(signature);
  if (problemHistory[key].length > MAX_HISTORY) {
    problemHistory[key].shift();
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDecimal = () => randomFrom([0.5, 0.25, 0.75, 1.5, 2.5, 0.2, 0.4, 0.6, 0.8]);

// Variable pools
const EASY_VARIABLE = 'x';
const HARD_VARIABLES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];

const getVariable = (difficulty) => {
  return difficulty === 'easy' ? EASY_VARIABLE : randomFrom(HARD_VARIABLES);
};

// ============================================
// CANONICALIZATION SYSTEM
// ============================================

// Canonical form: ax + b (never ax + -b, always ax - b)
// Coefficient 1 and -1 are hidden: x not 1x, -x not -1x
const canonicalizeExpression = (coefficient, variable, constant) => {
  // Handle coefficient display
  let varPart;
  if (coefficient === 0) {
    varPart = '';
  } else if (coefficient === 1) {
    varPart = variable;
  } else if (coefficient === -1) {
    varPart = `-${variable}`;
  } else {
    varPart = `${coefficient}${variable}`;
  }
  
  // Handle constant
  if (coefficient === 0 && constant === 0) {
    return '0';
  } else if (coefficient === 0) {
    return String(constant);
  } else if (constant === 0) {
    return varPart;
  } else if (constant > 0) {
    return `${varPart} + ${constant}`;
  } else {
    return `${varPart} - ${Math.abs(constant)}`;
  }
};

// Check if two expressions are equivalent
const areEquivalent = (expr1, expr2) => {
  return expr1 === expr2;
};

// Remove duplicates by equivalence
const uniqueChoices = (choices) => {
  const seen = new Set();
  return choices.filter(choice => {
    if (seen.has(choice)) return false;
    seen.add(choice);
    return true;
  });
};

// Helper to format expressions consistently (used by Levels 9+)
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
// LEVEL 1-1: ADDITION (REBUILT)
// ============================================

export const generateAdditionProblem = (difficulty) => {
  const levelId = '1-1';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    // Sign patterns: posNeg, negPos, negNeg (NO posPos per spec)
    const signPatterns = ['posNeg', 'negPos', 'negNeg'];
    const skeleton = randomFrom(signPatterns);
    
    let num1, num2, answer;
    
    if (skeleton === 'posNeg') {
      num1 = randomInt(1, 20);
      num2 = -randomInt(1, 20);
    } else if (skeleton === 'negPos') {
      num1 = -randomInt(1, 20);
      num2 = randomInt(1, 20);
    } else { // negNeg
      num1 = -randomInt(1, 20);
      num2 = -randomInt(1, 20);
    }
    
    answer = num1 + num2;
    
    const signature = generateSignature(levelId, difficulty, { skeleton, num1, num2 });
    if (!isRecentDuplicate(levelId, difficulty, signature)) {
      recordProblem(levelId, difficulty, signature);
      
      const problem = `${num1} + ${num2 >= 0 ? num2 : `(${num2})`}`;
      
      // Misconception-based distractors
      const misconceptions = [
        answer,                              // Correct
        -answer,                            // Wrong sign on result
        Math.abs(num1) + Math.abs(num2),    // Added absolute values (ignored signs)
        -(Math.abs(num1) + Math.abs(num2)), // Added absolute values then negated
        Math.abs(num1 - num2),              // Subtracted instead of added
      ];
      
      const choices = ensureFourChoices(misconceptions, answer);
      
      return {
        problem: problem,
        displayProblem: `${problem} = ?`,
        answer: answer,
        choices: choices,
        explanation: {
          originalProblem: problem,
          steps: [
            { description: `Problem: ${problem}`, work: `` },
            { description: num2 >= 0 ? `Start at ${num1}, move ${num2} right` : `Start at ${num1}, move ${Math.abs(num2)} left`, work: `Result: ${answer}` }
          ],
          rule: num1 >= 0 && num2 >= 0 ? "Adding positives: add normally" : 
                num1 < 0 && num2 < 0 ? "Adding negatives: add and keep negative sign" :
                "Different signs: subtract and take sign of larger magnitude",
          finalAnswer: answer
        }
      };
    }
  }
  
  // If we hit max retries, generate one more without checking
  const signPatterns = ['posNeg', 'negPos', 'negNeg'];
  const skeleton = randomFrom(signPatterns);
  let num1, num2;
  if (skeleton === 'posNeg') {
    num1 = randomInt(1, 20);
    num2 = -randomInt(1, 20);
  } else if (skeleton === 'negPos') {
    num1 = -randomInt(1, 20);
    num2 = randomInt(1, 20);
  } else {
    num1 = -randomInt(1, 20);
    num2 = -randomInt(1, 20);
  }
  const answer = num1 + num2;
  const problem = `${num1} + ${num2 >= 0 ? num2 : `(${num2})`}`;
  const misconceptions = [answer, -answer, Math.abs(num1) + Math.abs(num2), -(Math.abs(num1) + Math.abs(num2))];
  const choices = ensureFourChoices(misconceptions, answer);
  return {
    problem, displayProblem: `${problem} = ?`, answer, choices,
    explanation: { originalProblem: problem, steps: [{ description: `Problem: ${problem}`, work: `` }], rule: "Integer addition", finalAnswer: answer }
  };
};

// ============================================
// LEVEL 1-2: SUBTRACTION (REBUILT)
// ============================================

export const generateSubtractionProblem = (difficulty) => {
  const levelId = '1-2';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const signPatterns = ['posNeg', 'negPos', 'negNeg'];
    const skeleton = randomFrom(signPatterns);
    
    let num1, num2, answer;
    
    if (skeleton === 'posNeg') {
      num1 = randomInt(1, 20);
      num2 = -randomInt(1, 20);
    } else if (skeleton === 'negPos') {
      num1 = -randomInt(1, 20);
      num2 = randomInt(1, 20);
    } else {
      num1 = -randomInt(1, 20);
      num2 = -randomInt(1, 20);
    }
    
    answer = num1 - num2;
    
    const signature = generateSignature(levelId, difficulty, { skeleton, num1, num2 });
    if (!isRecentDuplicate(levelId, difficulty, signature)) {
      recordProblem(levelId, difficulty, signature);
      
      const problem = `${num1} - ${num2 >= 0 ? num2 : `(${num2})`}`;
      const isSubtractingNegative = num2 < 0;
      
      const misconceptions = [answer, -answer, num1 + num2, num2 - num1, Math.abs(num1) - Math.abs(num2)];
      const choices = ensureFourChoices(misconceptions, answer);
      
      return {
        problem, displayProblem: `${problem} = ?`, answer, choices,
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
    }
  }
  
  const signPatterns = ['posNeg', 'negPos', 'negNeg'];
  const skeleton = randomFrom(signPatterns);
  let num1, num2;
  if (skeleton === 'posNeg') { num1 = randomInt(1, 20); num2 = -randomInt(1, 20); }
  else if (skeleton === 'negPos') { num1 = -randomInt(1, 20); num2 = randomInt(1, 20); }
  else { num1 = -randomInt(1, 20); num2 = -randomInt(1, 20); }
  const answer = num1 - num2;
  const problem = `${num1} - ${num2 >= 0 ? num2 : `(${num2})`}`;
  const choices = ensureFourChoices([answer, -answer, num1 + num2, num2 - num1], answer);
  return { problem, displayProblem: `${problem} = ?`, answer, choices, explanation: { originalProblem: problem, steps: [], rule: "Subtraction", finalAnswer: answer }};
};

// ============================================
// LEVEL 1-3: MULTIPLICATION (REBUILT)
// ============================================

export const generateMultiplicationProblem = (difficulty) => {
  const levelId = '1-3';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const signPatterns = ['posNeg', 'negPos', 'negNeg'];
    const skeleton = randomFrom(signPatterns);
    
    let num1, num2, answer;
    
    if (skeleton === 'posNeg') {
      num1 = randomInt(1, 12);
      num2 = -randomInt(1, 12);
    } else if (skeleton === 'negPos') {
      num1 = -randomInt(1, 12);
      num2 = randomInt(1, 12);
    } else {
      num1 = -randomInt(1, 12);
      num2 = -randomInt(1, 12);
    }
    
    answer = num1 * num2;
    
    const signature = generateSignature(levelId, difficulty, { skeleton, num1, num2 });
    if (!isRecentDuplicate(levelId, difficulty, signature)) {
      recordProblem(levelId, difficulty, signature);
      
      const problem = `${num1} × ${num2}`;
      const misconceptions = [answer, -answer, Math.abs(num1) * Math.abs(num2), num1 + num2, Math.abs(num1 * num2) * -1];
      const choices = ensureFourChoices(misconceptions, answer);
      
      return {
        problem, displayProblem: `${problem} = ?`, answer, choices,
        explanation: {
          originalProblem: problem,
          steps: [
            { description: `Problem: ${problem}`, work: `` },
            { description: `Multiply absolute values: ${Math.abs(num1)} × ${Math.abs(num2)} = ${Math.abs(answer)}`, work: `` },
            { description: skeleton === 'negNeg' ? "Negative × Negative = Positive" : "Positive × Negative = Negative", work: `Result: ${answer}` }
          ],
          rule: skeleton === 'negNeg' ? "Neg × Neg = Pos" : "Pos × Neg = Neg",
          finalAnswer: answer
        }
      };
    }
  }
  
  const signPatterns = ['posNeg', 'negPos', 'negNeg'];
  const skeleton = randomFrom(signPatterns);
  let num1, num2;
  if (skeleton === 'posNeg') { num1 = randomInt(1, 12); num2 = -randomInt(1, 12); }
  else if (skeleton === 'negPos') { num1 = -randomInt(1, 12); num2 = randomInt(1, 12); }
  else { num1 = -randomInt(1, 12); num2 = -randomInt(1, 12); }
  const answer = num1 * num2;
  const problem = `${num1} × ${num2}`;
  const choices = ensureFourChoices([answer, -answer, Math.abs(num1) * Math.abs(num2), num1 + num2], answer);
  return { problem, displayProblem: `${problem} = ?`, answer, choices, explanation: { originalProblem: problem, steps: [], rule: "Multiplication", finalAnswer: answer }};
};

// ============================================
// LEVEL 1-4: DIVISION (REBUILT)
// ============================================

export const generateDivisionProblem = (difficulty) => {
  const levelId = '1-4';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const signPatterns = ['posNeg', 'negPos', 'negNeg'];
    const skeleton = randomFrom(signPatterns);
    
    let dividend, divisor, answer;
    
    if (skeleton === 'posNeg') {
      divisor = -randomInt(1, 12);
      answer = randomInt(1, 12);
      dividend = answer * divisor;
    } else if (skeleton === 'negPos') {
      divisor = randomInt(1, 12);
      answer = -randomInt(1, 12);
      dividend = answer * divisor;
    } else {
      divisor = -randomInt(1, 12);
      answer = randomInt(1, 12);
      dividend = answer * divisor;
    }
    
    const signature = generateSignature(levelId, difficulty, { skeleton, dividend, divisor });
    if (!isRecentDuplicate(levelId, difficulty, signature)) {
      recordProblem(levelId, difficulty, signature);
      
      const problem = `${dividend} ÷ ${divisor >= 0 ? divisor : `(${divisor})`}`;
      const misconceptions = [answer, -answer, Math.abs(dividend) / Math.abs(divisor), divisor, Math.floor(dividend / divisor)];
      const choices = ensureFourChoices(misconceptions, answer);
      
      return {
        problem, displayProblem: `${problem} = ?`, answer, choices,
        explanation: {
          originalProblem: problem,
          steps: [
            { description: `Problem: ${problem}`, work: `` },
            { description: `Divide absolute values: ${Math.abs(dividend)} ÷ ${Math.abs(divisor)} = ${Math.abs(answer)}`, work: `` },
            { description: skeleton === 'negNeg' ? "Negative ÷ Negative = Positive" : "Positive ÷ Negative = Negative", work: `Result: ${answer}` }
          ],
          rule: skeleton === 'negNeg' ? "Neg ÷ Neg = Pos" : "Pos ÷ Neg = Neg",
          finalAnswer: answer
        }
      };
    }
  }
  
  const signPatterns = ['posNeg', 'negPos', 'negNeg'];
  const skeleton = randomFrom(signPatterns);
  let dividend, divisor, answer;
  if (skeleton === 'posNeg') { divisor = -randomInt(1, 12); answer = randomInt(1, 12); dividend = answer * divisor; }
  else if (skeleton === 'negPos') { divisor = randomInt(1, 12); answer = -randomInt(1, 12); dividend = answer * divisor; }
  else { divisor = -randomInt(1, 12); answer = randomInt(1, 12); dividend = answer * divisor; }
  const problem = `${dividend} ÷ ${divisor >= 0 ? divisor : `(${divisor})`}`;
  const choices = ensureFourChoices([answer, -answer, Math.abs(dividend) / Math.abs(divisor), divisor], answer);
  return { problem, displayProblem: `${problem} = ?`, answer, choices, explanation: { originalProblem: problem, steps: [], rule: "Division", finalAnswer: answer }};
};


// ============================================
// LEVEL 1-5: BASIC DISTRIBUTION (REBUILT)
// ============================================

export const generateBasicDistributionProblem = (difficulty) => {
  const levelId = '1-5';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const variable = getVariable(difficulty);
    const maxCoef = difficulty === 'easy' ? 3 : 12;
    
    const skeletons = difficulty === 'easy' 
      ? ['a(bx + c)', 'a(cx + b)']
      : ['a(bx + c)', 'a(cx + b)', 'a(b + cx)', 'a(c + bx)'];
    
    const skeleton = randomFrom(skeletons);
    const outside = randomInt(2, 12);
    const varCoef = randomInt(1, maxCoef);
    const constant = randomInt(1, 12);
    
    let problem, answerCoef, answerConst;
    
    if (skeleton === 'a(bx + c)') {
      problem = `${outside}(${varCoef === 1 ? '' : varCoef}${variable} + ${constant})`;
      answerCoef = outside * varCoef;
      answerConst = outside * constant;
    } else if (skeleton === 'a(cx + b)') {
      problem = `${outside}(${constant} + ${varCoef === 1 ? '' : varCoef}${variable})`;
      answerCoef = outside * varCoef;
      answerConst = outside * constant;
    } else if (skeleton === 'a(b + cx)') {
      problem = `${outside}(${constant} + ${varCoef === 1 ? '' : varCoef}${variable})`;
      answerCoef = outside * varCoef;
      answerConst = outside * constant;
    } else {
      problem = `${outside}(${constant} + ${varCoef === 1 ? '' : varCoef}${variable})`;
      answerCoef = outside * varCoef;
      answerConst = outside * constant;
    }
    
    const signature = generateSignature(levelId, difficulty, { skeleton, outside, varCoef, constant, variable });
    if (!isRecentDuplicate(levelId, difficulty, signature)) {
      recordProblem(levelId, difficulty, signature);
      
      const answer = canonicalizeExpression(answerCoef, variable, answerConst);
      const misconceptions = [
        answer,
        canonicalizeExpression(varCoef, variable, outside * constant),
        canonicalizeExpression(outside * varCoef, variable, constant),
        canonicalizeExpression(outside + varCoef, variable, outside + constant),
        canonicalizeExpression(answerCoef, variable, constant),
      ];
      const choices = ensureFourChoices(misconceptions, answer);
      
      return {
        problem, displayProblem: `Simplify: ${problem}`, answer, choices,
        explanation: {
          originalProblem: problem,
          steps: [
            { description: `Problem: ${problem}`, work: `` },
            { description: `Distribute ${outside} to each term`, work: `${outside} × ${varCoef === 1 ? '' : varCoef}${variable} = ${answerCoef === 1 ? '' : answerCoef}${variable}` },
            { description: ``, work: `${outside} × ${constant} = ${answerConst}` },
            { description: `Combine`, work: answer }
          ],
          rule: "Distribute: multiply outside number by EACH term inside",
          finalAnswer: answer
        }
      };
    }
  }
  
  const variable = getVariable(difficulty);
  const outside = randomInt(2, 12);
  const varCoef = randomInt(1, difficulty === 'easy' ? 3 : 12);
  const constant = randomInt(1, 12);
  const answerCoef = outside * varCoef;
  const answerConst = outside * constant;
  const answer = canonicalizeExpression(answerCoef, variable, answerConst);
  const problem = `${outside}(${varCoef === 1 ? '' : varCoef}${variable} + ${constant})`;
  const choices = ensureFourChoices([answer, canonicalizeExpression(varCoef, variable, outside * constant), canonicalizeExpression(outside * varCoef, variable, constant)], answer);
  return { problem, displayProblem: `Simplify: ${problem}`, answer, choices, explanation: { originalProblem: problem, steps: [], rule: "Distribution", finalAnswer: answer }};
};

// ============================================
// LEVEL 1-6: DISTRIBUTION WITH SUBTRACTION (REBUILT)
// ============================================

export const generateDistributionSubtractionProblem = (difficulty) => {
  const levelId = '1-6';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const variable = getVariable(difficulty);
    const maxCoef = difficulty === 'easy' ? 3 : 12;
    const skeletons = difficulty === 'easy' ? ['a(bx - c)', 'a(c - bx)'] : ['a(bx - c)', 'a(c - bx)', 'a(bx - c)', 'a(c - bx)'];
    const skeleton = randomFrom(skeletons);
    const outside = randomInt(2, 12);
    const varCoef = randomInt(1, maxCoef);
    const constant = randomInt(1, 12);
    
    let problem, answerCoef, answerConst;
    
    if (skeleton === 'a(bx - c)') {
      problem = `${outside}(${varCoef === 1 ? '' : varCoef}${variable} - ${constant})`;
      answerCoef = outside * varCoef;
      answerConst = -(outside * constant);
    } else {
      problem = `${outside}(${constant} - ${varCoef === 1 ? '' : varCoef}${variable})`;
      answerCoef = -(outside * varCoef);
      answerConst = outside * constant;
    }
    
    const signature = generateSignature(levelId, difficulty, { skeleton, outside, varCoef, constant, variable });
    if (!isRecentDuplicate(levelId, difficulty, signature)) {
      recordProblem(levelId, difficulty, signature);
      
      const answer = canonicalizeExpression(answerCoef, variable, answerConst);
      const misconceptions = [
        answer,
        canonicalizeExpression(answerCoef, variable, Math.abs(answerConst)),
        canonicalizeExpression(Math.abs(answerCoef), variable, answerConst),
        canonicalizeExpression(outside * varCoef, variable, outside * constant),
        canonicalizeExpression(varCoef, variable, -(outside * constant)),
      ];
      const choices = ensureFourChoices(misconceptions, answer);
      
      return {
        problem, displayProblem: `Simplify: ${problem}`, answer, choices,
        explanation: {
          originalProblem: problem,
          steps: [
            { description: `Problem: ${problem}`, work: `` },
            { description: `Distribute ${outside}`, work: skeleton === 'a(bx - c)' ? `${answerCoef === 1 ? '' : answerCoef === -1 ? '-' : answerCoef}${variable} and ${answerConst}` : `${answerConst} and ${answerCoef === 1 ? '' : answerCoef === -1 ? '-' : answerCoef}${variable}` },
            { description: `Result`, work: answer }
          ],
          rule: "Distribute and watch your signs!",
          finalAnswer: answer
        }
      };
    }
  }
  
  const variable = getVariable(difficulty);
  const outside = randomInt(2, 12);
  const varCoef = randomInt(1, difficulty === 'easy' ? 3 : 12);
  const constant = randomInt(1, 12);
  const answerCoef = outside * varCoef;
  const answerConst = -(outside * constant);
  const answer = canonicalizeExpression(answerCoef, variable, answerConst);
  const problem = `${outside}(${varCoef === 1 ? '' : varCoef}${variable} - ${constant})`;
  const choices = ensureFourChoices([answer, canonicalizeExpression(answerCoef, variable, Math.abs(answerConst))], answer);
  return { problem, displayProblem: `Simplify: ${problem}`, answer, choices, explanation: { originalProblem: problem, steps: [], rule: "Distribution with subtraction", finalAnswer: answer }};
};

// ============================================
// LEVEL 1-7: NEGATIVE OUTSIDE (REBUILT)
// ============================================

export const generateNegativeOutsideProblem = (difficulty) => {
  const levelId = '1-7';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const variable = getVariable(difficulty);
    const maxCoef = difficulty === 'easy' ? 3 : 12;
    const skeletons = difficulty === 'easy'
      ? ['-a(bx + c)', '-a(bx - c)']
      : ['-a(bx + c)', '-a(bx - c)', '-a(c + bx)', '-a(c - bx)', '-a(bx + c)', '-a(c - bx)'];
    const skeleton = randomFrom(skeletons);
    const outside = -randomInt(2, 12);
    const varCoef = randomInt(1, maxCoef);
    const constant = randomInt(1, 12);
    
    let problem, answerCoef, answerConst;
    
    if (skeleton === '-a(bx + c)') {
      problem = `${outside}(${varCoef === 1 ? '' : varCoef}${variable} + ${constant})`;
      answerCoef = outside * varCoef;
      answerConst = outside * constant;
    } else if (skeleton === '-a(bx - c)') {
      problem = `${outside}(${varCoef === 1 ? '' : varCoef}${variable} - ${constant})`;
      answerCoef = outside * varCoef;
      answerConst = -(outside * constant);
    } else if (skeleton === '-a(c + bx)') {
      problem = `${outside}(${constant} + ${varCoef === 1 ? '' : varCoef}${variable})`;
      answerCoef = outside * varCoef;
      answerConst = outside * constant;
    } else {
      problem = `${outside}(${constant} - ${varCoef === 1 ? '' : varCoef}${variable})`;
      answerCoef = -(outside * varCoef);
      answerConst = outside * constant;
    }
    
    const signature = generateSignature(levelId, difficulty, { skeleton, outside, varCoef, constant, variable });
    if (!isRecentDuplicate(levelId, difficulty, signature)) {
      recordProblem(levelId, difficulty, signature);
      
      const answer = canonicalizeExpression(answerCoef, variable, answerConst);
      const misconceptions = [
        answer,
        canonicalizeExpression(-answerCoef, variable, answerConst),
        canonicalizeExpression(answerCoef, variable, -answerConst),
        canonicalizeExpression(-answerCoef, variable, -answerConst),
        canonicalizeExpression(Math.abs(answerCoef), variable, Math.abs(answerConst)),
      ];
      const choices = ensureFourChoices(misconceptions, answer);
      
      return {
        problem, displayProblem: `Simplify: ${problem}`, answer, choices,
        explanation: {
          originalProblem: problem,
          steps: [
            { description: `Problem: ${problem}`, work: `` },
            { description: `Distribute ${outside} to BOTH terms`, work: `Watch the signs!` },
            { description: `Result`, work: answer }
          ],
          rule: "Negative outside: distribute the negative to EVERY term",
          finalAnswer: answer
        }
      };
    }
  }
  
  const variable = getVariable(difficulty);
  const outside = -randomInt(2, 12);
  const varCoef = randomInt(1, difficulty === 'easy' ? 3 : 12);
  const constant = randomInt(1, 12);
  const answerCoef = outside * varCoef;
  const answerConst = outside * constant;
  const answer = canonicalizeExpression(answerCoef, variable, answerConst);
  const problem = `${outside}(${varCoef === 1 ? '' : varCoef}${variable} + ${constant})`;
  const choices = ensureFourChoices([answer, canonicalizeExpression(-answerCoef, variable, answerConst)], answer);
  return { problem, displayProblem: `Simplify: ${problem}`, answer, choices, explanation: { originalProblem: problem, steps: [], rule: "Negative distribution", finalAnswer: answer }};
};

// ============================================
// LEVEL 1-8: COMPLEX DISTRIBUTION (REBUILT - MUST BE HIGHLY VARIED)
// ============================================

export const generateNegativeInsideProblem = (difficulty) => {
  const levelId = '1-8';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const variable = getVariable(difficulty);
    const maxCoef = difficulty === 'easy' ? 3 : 12;
    
    // MANY skeletons for Level 8
    const skeletons = difficulty === 'easy'
      ? ['-(x + c)', '-(bx + c)', 'a(-x + c)', '-a(bx - c)']
      : ['-(x + c)', '-(x - c)', '-(bx + c)', '-(bx - c)', '-(c + bx)', '-(c - bx)', 'a(-x + c)', 'a(-x - c)', 'a(c - bx)', '-a(-x + c)', '-a(-x - c)', '-a(bx - c)', 'a(-bx + c)', 'a(-bx - c)'];
    
    const skeleton = randomFrom(skeletons);
    let outside, varCoef, constant, problem, answerCoef, answerConst;
    
    if (skeleton === '-(x + c)') {
      outside = -1; varCoef = 1; constant = randomInt(1, 12);
      problem = `-(${variable} + ${constant})`;
      answerCoef = -1; answerConst = -constant;
    } else if (skeleton === '-(x - c)') {
      outside = -1; varCoef = 1; constant = randomInt(1, 12);
      problem = `-(${variable} - ${constant})`;
      answerCoef = -1; answerConst = constant;
    } else if (skeleton === '-(bx + c)') {
      outside = -1; varCoef = randomInt(2, maxCoef); constant = randomInt(1, 12);
      problem = `-(${varCoef}${variable} + ${constant})`;
      answerCoef = -varCoef; answerConst = -constant;
    } else if (skeleton === '-(bx - c)') {
      outside = -1; varCoef = randomInt(2, maxCoef); constant = randomInt(1, 12);
      problem = `-(${varCoef}${variable} - ${constant})`;
      answerCoef = -varCoef; answerConst = constant;
    } else if (skeleton === '-(c + bx)') {
      outside = -1; varCoef = randomInt(2, maxCoef); constant = randomInt(1, 12);
      problem = `-(${constant} + ${varCoef}${variable})`;
      answerCoef = -varCoef; answerConst = -constant;
    } else if (skeleton === '-(c - bx)') {
      outside = -1; varCoef = randomInt(2, maxCoef); constant = randomInt(1, 12);
      problem = `-(${constant} - ${varCoef}${variable})`;
      answerCoef = varCoef; answerConst = -constant;
    } else if (skeleton === 'a(-x + c)') {
      outside = randomInt(2, 12); varCoef = -1; constant = randomInt(1, 12);
      problem = `${outside}(-${variable} + ${constant})`;
      answerCoef = -outside; answerConst = outside * constant;
    } else if (skeleton === 'a(-x - c)') {
      outside = randomInt(2, 12); varCoef = -1; constant = randomInt(1, 12);
      problem = `${outside}(-${variable} - ${constant})`;
      answerCoef = -outside; answerConst = -outside * constant;
    } else if (skeleton === 'a(c - bx)') {
      outside = randomInt(2, 12); varCoef = randomInt(2, maxCoef); constant = randomInt(1, 12);
      problem = `${outside}(${constant} - ${varCoef}${variable})`;
      answerCoef = -outside * varCoef; answerConst = outside * constant;
    } else if (skeleton === '-a(-x + c)') {
      outside = -randomInt(2, 12); varCoef = -1; constant = randomInt(1, 12);
      problem = `${outside}(-${variable} + ${constant})`;
      answerCoef = -outside; answerConst = outside * constant;
    } else if (skeleton === '-a(-x - c)') {
      outside = -randomInt(2, 12); varCoef = -1; constant = randomInt(1, 12);
      problem = `${outside}(-${variable} - ${constant})`;
      answerCoef = -outside; answerConst = -outside * constant;
    } else if (skeleton === '-a(bx - c)') {
      outside = -randomInt(2, 12); varCoef = randomInt(2, maxCoef); constant = randomInt(1, 12);
      problem = `${outside}(${varCoef}${variable} - ${constant})`;
      answerCoef = outside * varCoef; answerConst = -outside * constant;
    } else if (skeleton === 'a(-bx + c)') {
      outside = randomInt(2, 12); varCoef = -randomInt(2, maxCoef); constant = randomInt(1, 12);
      problem = `${outside}(${varCoef}${variable} + ${constant})`;
      answerCoef = outside * varCoef; answerConst = outside * constant;
    } else {
      outside = randomInt(2, 12); varCoef = -randomInt(2, maxCoef); constant = randomInt(1, 12);
      problem = `${outside}(${varCoef}${variable} - ${constant})`;
      answerCoef = outside * varCoef; answerConst = -outside * constant;
    }
    
    const signature = generateSignature(levelId, difficulty, { skeleton, outside, varCoef, constant, variable });
    if (!isRecentDuplicate(levelId, difficulty, signature)) {
      recordProblem(levelId, difficulty, signature);
      
      const answer = canonicalizeExpression(answerCoef, variable, answerConst);
      const misconceptions = [
        answer,
        canonicalizeExpression(-answerCoef, variable, answerConst),
        canonicalizeExpression(answerCoef, variable, -answerConst),
        canonicalizeExpression(-answerCoef, variable, -answerConst),
        canonicalizeExpression(Math.abs(answerCoef), variable, Math.abs(answerConst)),
        canonicalizeExpression(answerCoef, variable, 0),
        canonicalizeExpression(0, variable, answerConst),
      ];
      const choices = ensureFourChoices(misconceptions, answer);
      
      return {
        problem, displayProblem: `Simplify: ${problem}`, answer, choices,
        explanation: {
          originalProblem: problem,
          steps: [
            { description: `Problem: ${problem}`, work: `` },
            { description: `Distribute carefully - watch ALL signs`, work: `` },
            { description: `Result`, work: answer }
          ],
          rule: "Complex distribution: track every negative carefully!",
          finalAnswer: answer
        }
      };
    }
  }
  
  const variable = getVariable(difficulty);
  const outside = -1;
  const varCoef = 1;
  const constant = randomInt(1, 12);
  const answerCoef = -1;
  const answerConst = -constant;
  const answer = canonicalizeExpression(answerCoef, variable, answerConst);
  const problem = `-(${variable} + ${constant})`;
  const choices = ensureFourChoices([answer, canonicalizeExpression(1, variable, constant), canonicalizeExpression(-1, variable, constant)], answer);
  return { problem, displayProblem: `Simplify: ${problem}`, answer, choices, explanation: { originalProblem: problem, steps: [], rule: "Complex distribution", finalAnswer: answer }};
};

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
// PHASE 6: ONE-STEP EQUATIONS (Levels 17-20)
// Copy these 4 functions and paste them BEFORE the EXPORTS section
// ============================================

// ============================================
// LEVEL 1-17: RIVER CROSSING (Addition Equations)
// ============================================

export const generateAdditionEquationProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(1, 20);
    const addend = randomInt(1, 15);
    const sum = answer + addend;
    
    const problem = `x + ${addend} = ${sum}`;
    
    const choices = [
      answer,
      sum - addend - 1, // Off by one
      addend, // Used wrong number
      sum // Used sum as answer
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
          { description: `To solve for x, SUBTRACT ${addend} from both sides`, work: `x + ${addend} - ${addend} = ${sum} - ${addend}` },
          { description: `Simplify`, work: `x = ${answer}` },
          { description: `CHECK: ${answer} + ${addend} = ${sum} ✓`, work: `` }
        ],
        rule: "To undo ADDITION, use SUBTRACTION on both sides",
        finalAnswer: answer
      }
    };
  } else {
    const answer = randomDecimal();
    const addend = randomDecimal();
    const sum = Math.round((answer + addend) * 100) / 100;
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const problem = `${variable} + ${addend} = ${sum}`;
    
    const choices = [
      answer,
      Math.round((sum - addend - 0.25) * 100) / 100,
      addend,
      sum
    ];

    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Subtract ${addend} from both sides`, work: `${variable} = ${sum} - ${addend}` },
          { description: `Result`, work: `${variable} = ${answer}` }
        ],
        rule: "Undo addition with subtraction",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-18: BRIDGE REPAIRS (Subtraction Equations)
// ============================================

export const generateSubtractionEquationProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(10, 30);
    const subtrahend = randomInt(1, 15);
    const difference = answer - subtrahend;
    
    const problem = `x - ${subtrahend} = ${difference}`;
    
    const choices = [
      answer,
      difference + subtrahend - 1, // Off by one
      difference - subtrahend, // Subtracted instead of added
      subtrahend // Used wrong number
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
          { description: `To solve for x, ADD ${subtrahend} to both sides`, work: `x - ${subtrahend} + ${subtrahend} = ${difference} + ${subtrahend}` },
          { description: `Simplify`, work: `x = ${answer}` },
          { description: `CHECK: ${answer} - ${subtrahend} = ${difference} ✓`, work: `` }
        ],
        rule: "To undo SUBTRACTION, use ADDITION on both sides",
        finalAnswer: answer
      }
    };
  } else {
    const answer = Math.round((randomInt(10, 30) + randomDecimal()) * 100) / 100;
    const subtrahend = randomDecimal();
    const difference = Math.round((answer - subtrahend) * 100) / 100;
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const problem = `${variable} - ${subtrahend} = ${difference}`;
    
    const choices = [
      answer,
      Math.round((difference + subtrahend - 0.5) * 100) / 100,
      Math.round((difference - subtrahend) * 100) / 100,
      subtrahend
    ];

    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Add ${subtrahend} to both sides`, work: `${variable} = ${difference} + ${subtrahend}` },
          { description: `Result`, work: `${variable} = ${answer}` }
        ],
        rule: "Undo subtraction with addition",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-19: ROPE BRIDGE (Multiplication Equations)
// ============================================

export const generateMultiplicationEquationProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(2, 12);
    const coefficient = randomInt(2, 9);
    const product = answer * coefficient;
    
    const problem = `${coefficient}x = ${product}`;
    
    const choices = [
      answer,
      product - coefficient, // Subtracted instead
      product / coefficient - 1, // Off by one
      coefficient // Used coefficient
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
          { description: `To solve for x, DIVIDE both sides by ${coefficient}`, work: `${coefficient}x ÷ ${coefficient} = ${product} ÷ ${coefficient}` },
          { description: `Simplify`, work: `x = ${answer}` },
          { description: `CHECK: ${coefficient} × ${answer} = ${product} ✓`, work: `` }
        ],
        rule: "To undo MULTIPLICATION, use DIVISION on both sides",
        finalAnswer: answer
      }
    };
  } else {
    const answer = randomDecimal();
    const coefficient = randomInt(2, 9);
    const product = Math.round((answer * coefficient) * 100) / 100;
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const problem = `${coefficient}${variable} = ${product}`;
    
    const choices = [
      answer,
      Math.round((product / coefficient - 0.25) * 100) / 100,
      Math.round((product - coefficient) * 100) / 100,
      coefficient
    ];

    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Divide both sides by ${coefficient}`, work: `${variable} = ${product} ÷ ${coefficient}` },
          { description: `Result`, work: `${variable} = ${answer}` }
        ],
        rule: "Undo multiplication with division",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-20: CANYON JUMP (Division Equations)
// ============================================

export const generateDivisionEquationProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const divisor = randomInt(2, 8);
    const quotient = randomInt(2, 12);
    const answer = divisor * quotient;
    
    const problem = `x ÷ ${divisor} = ${quotient}`;
    
    const choices = [
      answer,
      quotient + divisor, // Added instead
      answer - 1, // Off by one
      quotient // Used quotient
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
          { description: `To solve for x, MULTIPLY both sides by ${divisor}`, work: `x ÷ ${divisor} × ${divisor} = ${quotient} × ${divisor}` },
          { description: `Simplify`, work: `x = ${answer}` },
          { description: `CHECK: ${answer} ÷ ${divisor} = ${quotient} ✓`, work: `` }
        ],
        rule: "To undo DIVISION, use MULTIPLICATION on both sides",
        finalAnswer: answer
      }
    };
  } else {
    const divisor = randomInt(2, 8);
    const quotient = randomDecimal();
    const answer = Math.round((divisor * quotient) * 100) / 100;
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const problem = `${variable} ÷ ${divisor} = ${quotient}`;
    
    const choices = [
      answer,
      Math.round((quotient * divisor - 0.5) * 100) / 100,
      Math.round((quotient + divisor) * 100) / 100,
      quotient
    ];

    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Multiply both sides by ${divisor}`, work: `${variable} = ${quotient} × ${divisor}` },
          { description: `Result`, work: `${variable} = ${answer}` }
        ],
        rule: "Undo division with multiplication",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// PHASES 7-9: FINAL 11 LEVELS (21-31)
// Copy these 11 functions and paste them BEFORE the EXPORTS section
// ============================================

// ============================================
// PHASE 7: TWO-STEP EQUATIONS (Levels 21-24)
// ============================================

// ============================================
// LEVEL 1-21: NARROW PATH (Two-Step: Multiply then Add)
// ============================================

export const generateTwoStepAddProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(2, 12);
    const coefficient = randomInt(2, 6);
    const constant = randomInt(1, 10);
    const result = coefficient * answer + constant;
    
    const problem = `${coefficient}x + ${constant} = ${result}`;
    
    const choices = [
      answer,
      result - constant, // Forgot to divide
      (result - constant) / coefficient - 1, // Off by one
      result / coefficient // Divided first (wrong order)
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
          { description: `STEP 1: Subtract ${constant} from both sides`, work: `${coefficient}x = ${result} - ${constant}` },
          { description: `Simplify`, work: `${coefficient}x = ${result - constant}` },
          { description: `STEP 2: Divide both sides by ${coefficient}`, work: `x = ${result - constant} ÷ ${coefficient}` },
          { description: `Simplify`, work: `x = ${answer}` },
          { description: `CHECK: ${coefficient}(${answer}) + ${constant} = ${result} ✓`, work: `` }
        ],
        rule: "TWO-STEP: Undo addition/subtraction FIRST, then undo multiplication/division",
        finalAnswer: answer
      }
    };
  } else {
    const answer = randomDecimal();
    const coefficient = randomInt(2, 6);
    const constant = randomInt(1, 10);
    const result = Math.round((coefficient * answer + constant) * 100) / 100;
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const problem = `${coefficient}${variable} + ${constant} = ${result}`;
    
    const choices = [
      answer,
      Math.round((result - constant) * 100) / 100,
      Math.round(((result - constant) / coefficient - 0.5) * 100) / 100,
      Math.round((result / coefficient) * 100) / 100
    ];

    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Subtract ${constant}: ${coefficient}${variable} = ${result - constant}`, work: `` },
          { description: `Divide by ${coefficient}: ${variable} = ${answer}`, work: `` }
        ],
        rule: "Undo addition first, then multiplication",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-22: CLIFF EDGE (Two-Step: Multiply then Subtract)
// ============================================

export const generateTwoStepSubtractProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(5, 15);
    const coefficient = randomInt(2, 6);
    const constant = randomInt(1, 10);
    const result = coefficient * answer - constant;
    
    const problem = `${coefficient}x - ${constant} = ${result}`;
    
    const choices = [
      answer,
      result + constant, // Forgot to divide
      (result + constant) / coefficient - 1, // Off by one
      result / coefficient // Wrong order
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
          { description: `STEP 1: Add ${constant} to both sides`, work: `${coefficient}x = ${result} + ${constant}` },
          { description: `Simplify`, work: `${coefficient}x = ${result + constant}` },
          { description: `STEP 2: Divide both sides by ${coefficient}`, work: `x = ${result + constant} ÷ ${coefficient}` },
          { description: `Simplify`, work: `x = ${answer}` },
          { description: `CHECK: ${coefficient}(${answer}) - ${constant} = ${result} ✓`, work: `` }
        ],
        rule: "Undo subtraction FIRST, then undo multiplication",
        finalAnswer: answer
      }
    };
  } else {
    const answer = randomDecimal();
    const coefficient = randomInt(2, 6);
    const constant = randomInt(1, 10);
    const result = Math.round((coefficient * answer - constant) * 100) / 100;
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const problem = `${coefficient}${variable} - ${constant} = ${result}`;
    
    const choices = [
      answer,
      Math.round((result + constant) * 100) / 100,
      Math.round(((result + constant) / coefficient - 0.5) * 100) / 100,
      Math.round((result / coefficient) * 100) / 100
    ];

    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Add ${constant}: ${coefficient}${variable} = ${result + constant}`, work: `` },
          { description: `Divide by ${coefficient}: ${variable} = ${answer}`, work: `` }
        ],
        rule: "Undo subtraction first, then multiplication",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-23: WATERFALL (Two-Step: Divide then Add)
// ============================================

export const generateTwoStepDivideAddProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const divisor = randomInt(2, 6);
    const constant = randomInt(1, 10);
    const quotient = randomInt(3, 10);
    const answer = divisor * (quotient - constant);
    
    const problem = `x ÷ ${divisor} + ${constant} = ${quotient}`;
    
    const choices = [
      answer,
      (quotient - constant) * divisor - divisor, // Off by one divisor
      quotient * divisor, // Didn't subtract constant
      divisor * (quotient + constant) // Added instead of subtracted
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
          { description: `STEP 1: Subtract ${constant} from both sides`, work: `x ÷ ${divisor} = ${quotient} - ${constant}` },
          { description: `Simplify`, work: `x ÷ ${divisor} = ${quotient - constant}` },
          { description: `STEP 2: Multiply both sides by ${divisor}`, work: `x = ${quotient - constant} × ${divisor}` },
          { description: `Simplify`, work: `x = ${answer}` },
          { description: `CHECK: ${answer} ÷ ${divisor} + ${constant} = ${quotient} ✓`, work: `` }
        ],
        rule: "Undo addition FIRST, then undo division",
        finalAnswer: answer
      }
    };
  } else {
    const divisor = randomInt(2, 6);
    const constant = randomDecimal();
    const quotient = randomInt(3, 10);
    const answer = Math.round((divisor * (quotient - constant)) * 100) / 100;
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const problem = `${variable} ÷ ${divisor} + ${constant} = ${quotient}`;
    
    const choices = [
      answer,
      Math.round(((quotient - constant) * divisor - 1) * 100) / 100,
      Math.round((quotient * divisor) * 100) / 100,
      Math.round((divisor * (quotient + constant)) * 100) / 100
    ];

    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Subtract ${constant}: ${variable} ÷ ${divisor} = ${quotient - constant}`, work: `` },
          { description: `Multiply by ${divisor}: ${variable} = ${answer}`, work: `` }
        ],
        rule: "Undo addition first, then division",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-24: FINAL DESCENT (Two-Step: Divide then Subtract)
// ============================================

export const generateTwoStepDivideSubtractProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const divisor = randomInt(2, 6);
    const constant = randomInt(1, 8);
    const quotient = randomInt(3, 10);
    const answer = divisor * (quotient + constant);
    
    const problem = `x ÷ ${divisor} - ${constant} = ${quotient}`;
    
    const choices = [
      answer,
      (quotient + constant) * divisor - divisor, // Off by divisor
      quotient * divisor, // Didn't add constant
      divisor * (quotient - constant) // Subtracted instead
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
          { description: `STEP 1: Add ${constant} to both sides`, work: `x ÷ ${divisor} = ${quotient} + ${constant}` },
          { description: `Simplify`, work: `x ÷ ${divisor} = ${quotient + constant}` },
          { description: `STEP 2: Multiply both sides by ${divisor}`, work: `x = ${quotient + constant} × ${divisor}` },
          { description: `Simplify`, work: `x = ${answer}` },
          { description: `CHECK: ${answer} ÷ ${divisor} - ${constant} = ${quotient} ✓`, work: `` }
        ],
        rule: "Undo subtraction FIRST, then undo division",
        finalAnswer: answer
      }
    };
  } else {
    const divisor = randomInt(2, 6);
    const constant = randomDecimal();
    const quotient = randomInt(3, 10);
    const answer = Math.round((divisor * (quotient + constant)) * 100) / 100;
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const problem = `${variable} ÷ ${divisor} - ${constant} = ${quotient}`;
    
    const choices = [
      answer,
      Math.round(((quotient + constant) * divisor - 1) * 100) / 100,
      Math.round((quotient * divisor) * 100) / 100,
      Math.round((divisor * (quotient - constant)) * 100) / 100
    ];

    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Add ${constant}: ${variable} ÷ ${divisor} = ${Math.round((quotient + constant) * 100) / 100}`, work: `` },
          { description: `Multiply by ${divisor}: ${variable} = ${answer}`, work: `` }
        ],
        rule: "Undo subtraction first, then division",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// PHASE 8: MULTI-STEP EQUATIONS (Levels 25-28)
// ============================================

// ============================================
// LEVEL 1-25: HIDDEN CAVE (Variables on Both Sides)
// ============================================

export const generateVariablesBothSidesProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(2, 10);
    const leftCoef = randomInt(3, 7);
    const rightCoef = randomInt(1, leftCoef - 1);
    const constant = randomInt(1, 10);
    
    // leftCoef * x = rightCoef * x + constant
    // Solve: (leftCoef - rightCoef) * x = constant
    const actualConstant = (leftCoef - rightCoef) * answer;
    
    const problem = `${leftCoef}x = ${rightCoef}x + ${actualConstant}`;
    
    const choices = [
      answer,
      actualConstant, // Used constant as answer
      answer + 1, // Off by one
      actualConstant / leftCoef // Wrong operation
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
          { description: `STEP 1: Subtract ${rightCoef}x from both sides`, work: `${leftCoef}x - ${rightCoef}x = ${actualConstant}` },
          { description: `Simplify`, work: `${leftCoef - rightCoef}x = ${actualConstant}` },
          { description: `STEP 2: Divide by ${leftCoef - rightCoef}`, work: `x = ${actualConstant} ÷ ${leftCoef - rightCoef}` },
          { description: `Simplify`, work: `x = ${answer}` },
          { description: `CHECK: ${leftCoef}(${answer}) = ${rightCoef}(${answer}) + ${actualConstant} ✓`, work: `` }
        ],
        rule: "Get all variables on one side, then solve",
        finalAnswer: answer
      }
    };
  } else {
    const answer = randomDecimal();
    const leftCoef = randomInt(3, 7);
    const rightCoef = randomInt(1, leftCoef - 1);
    const actualConstant = Math.round(((leftCoef - rightCoef) * answer) * 100) / 100;
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const problem = `${leftCoef}${variable} = ${rightCoef}${variable} + ${actualConstant}`;
    
    const choices = [
      answer,
      actualConstant,
      Math.round((answer + 0.5) * 100) / 100,
      Math.round((actualConstant / leftCoef) * 100) / 100
    ];

    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Subtract ${rightCoef}${variable}: ${leftCoef - rightCoef}${variable} = ${actualConstant}`, work: `` },
          { description: `Divide by ${leftCoef - rightCoef}: ${variable} = ${answer}`, work: `` }
        ],
        rule: "Collect variables on one side",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-26: ANCIENT RUINS (Distribute & Combine)
// ============================================

export const generateDistributeEquationProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(2, 8);
    const outside = randomInt(2, 4);
    const insideTerm = randomInt(1, 5);
    const result = outside * answer + outside * insideTerm;
    
    const problem = `${outside}(x + ${insideTerm}) = ${result}`;
    
    const choices = [
      answer,
      result / outside - insideTerm - 1, // Off by one
      result - insideTerm, // Didn't distribute
      result / outside // Forgot inside term
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
          { description: `STEP 1: Distribute ${outside}`, work: `${outside}x + ${outside * insideTerm} = ${result}` },
          { description: `STEP 2: Subtract ${outside * insideTerm}`, work: `${outside}x = ${result - outside * insideTerm}` },
          { description: `STEP 3: Divide by ${outside}`, work: `x = ${answer}` },
          { description: `CHECK: ${outside}(${answer} + ${insideTerm}) = ${result} ✓`, work: `` }
        ],
        rule: "Distribute first, then solve like normal",
        finalAnswer: answer
      }
    };
  } else {
    const answer = randomDecimal();
    const outside = randomInt(2, 4);
    const insideTerm = randomInt(1, 5);
    const result = Math.round((outside * answer + outside * insideTerm) * 100) / 100;
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const problem = `${outside}(${variable} + ${insideTerm}) = ${result}`;
    
    const choices = [
      answer,
      Math.round((result / outside - insideTerm - 0.5) * 100) / 100,
      Math.round((result - insideTerm) * 100) / 100,
      Math.round((result / outside) * 100) / 100
    ];

    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Distribute: ${outside}${variable} + ${outside * insideTerm} = ${result}`, work: `` },
          { description: `Subtract: ${outside}${variable} = ${result - outside * insideTerm}`, work: `` },
          { description: `Divide: ${variable} = ${answer}`, work: `` }
        ],
        rule: "Distribute, then solve",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-27: MAZE (Combine & Solve)
// ============================================

export const generateCombineSolveProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(2, 10);
    const coef1 = randomInt(2, 5);
    const coef2 = randomInt(1, 4);
    const constant = randomInt(1, 8);
    const result = (coef1 + coef2) * answer + constant;
    
    const problem = `${coef1}x + ${coef2}x + ${constant} = ${result}`;
    
    const choices = [
      answer,
      (result - constant) - 1, // Forgot to divide
      result / (coef1 + coef2), // Didn't subtract constant
      (result - constant) / coef1 // Used wrong coefficient
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
          { description: `STEP 1: Combine like terms`, work: `${coef1 + coef2}x + ${constant} = ${result}` },
          { description: `STEP 2: Subtract ${constant}`, work: `${coef1 + coef2}x = ${result - constant}` },
          { description: `STEP 3: Divide by ${coef1 + coef2}`, work: `x = ${answer}` },
          { description: `CHECK: ${coef1}(${answer}) + ${coef2}(${answer}) + ${constant} = ${result} ✓`, work: `` }
        ],
        rule: "Combine like terms FIRST, then solve",
        finalAnswer: answer
      }
    };
  } else {
    const answer = randomDecimal();
    const coef1 = randomInt(2, 5);
    const coef2 = randomInt(1, 4);
    const constant = randomInt(1, 8);
    const result = Math.round(((coef1 + coef2) * answer + constant) * 100) / 100;
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const problem = `${coef1}${variable} + ${coef2}${variable} + ${constant} = ${result}`;
    
    const choices = [
      answer,
      Math.round((result - constant - 1) * 100) / 100,
      Math.round((result / (coef1 + coef2)) * 100) / 100,
      Math.round(((result - constant) / coef1) * 100) / 100
    ];

    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Combine: ${coef1 + coef2}${variable} + ${constant} = ${result}`, work: `` },
          { description: `Subtract: ${coef1 + coef2}${variable} = ${result - constant}`, work: `` },
          { description: `Divide: ${variable} = ${answer}`, work: `` }
        ],
        rule: "Combine, then solve",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-28: PUZZLE CHAMBER (Complex Multi-Step)
// ============================================

export const generateComplexMultiStepProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(2, 8);
    const outside = randomInt(2, 3);
    const insideTerm = randomInt(1, 4);
    const addedCoef = randomInt(1, 3);
    const constant = randomInt(1, 6);
    
    // outside(x + insideTerm) + addedCoef*x - constant = result
    const distributedCoef = outside;
    const distributedConstant = outside * insideTerm;
    const totalCoef = distributedCoef + addedCoef;
    const leftSide = totalCoef * answer + distributedConstant - constant;
    const result = leftSide;
    
    const problem = `${outside}(x + ${insideTerm}) + ${addedCoef}x - ${constant} = ${result}`;
    
    const choices = [
      answer,
      answer + 1,
      result / totalCoef,
      (result + constant) / totalCoef
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
          { description: `STEP 1: Distribute ${outside}`, work: `${distributedCoef}x + ${distributedConstant} + ${addedCoef}x - ${constant} = ${result}` },
          { description: `STEP 2: Combine like terms`, work: `${totalCoef}x + ${distributedConstant - constant} = ${result}` },
          { description: `STEP 3: Subtract ${distributedConstant - constant}`, work: `${totalCoef}x = ${result - (distributedConstant - constant)}` },
          { description: `STEP 4: Divide by ${totalCoef}`, work: `x = ${answer}` }
        ],
        rule: "Distribute → Combine → Solve",
        finalAnswer: answer
      }
    };
  } else {
    const answer = randomDecimal();
    const outside = randomInt(2, 3);
    const insideTerm = randomInt(1, 4);
    const addedCoef = randomInt(1, 3);
    const constant = randomInt(1, 6);
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const distributedCoef = outside;
    const distributedConstant = outside * insideTerm;
    const totalCoef = distributedCoef + addedCoef;
    const result = Math.round((totalCoef * answer + distributedConstant - constant) * 100) / 100;
    
    const problem = `${outside}(${variable} + ${insideTerm}) + ${addedCoef}${variable} - ${constant} = ${result}`;
    
    const choices = [
      answer,
      Math.round((answer + 0.5) * 100) / 100,
      Math.round((result / totalCoef) * 100) / 100,
      Math.round(((result + constant) / totalCoef) * 100) / 100
    ];

    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Distribute → Combine → Solve`, work: `${variable} = ${answer}` }
        ],
        rule: "Multi-step: work systematically",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// PHASE 9: VAULT (Final Challenge - Levels 29-31)
// ============================================

// ============================================
// LEVEL 1-29: OUTER VAULT (Variables Both Sides + Constants)
// ============================================

export const generateVaultLevel1Problem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(3, 12);
    const leftCoef = randomInt(4, 8);
    const rightCoef = randomInt(1, leftCoef - 2);
    const leftConst = randomInt(1, 8);
    const rightConst = randomInt(1, 8);
    
    // leftCoef*x + leftConst = rightCoef*x + rightConst
    // (leftCoef - rightCoef)*x = rightConst - leftConst
    const constDiff = (leftCoef - rightCoef) * answer - leftConst + rightConst;
    
    const problem = `${leftCoef}x + ${leftConst} = ${rightCoef}x + ${leftConst + constDiff}`;
    
    const choices = [
      answer,
      constDiff,
      answer + 1,
      constDiff / (leftCoef - rightCoef)
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
          { description: `STEP 1: Subtract ${rightCoef}x from both sides`, work: `${leftCoef - rightCoef}x + ${leftConst} = ${leftConst + constDiff}` },
          { description: `STEP 2: Subtract ${leftConst} from both sides`, work: `${leftCoef - rightCoef}x = ${constDiff}` },
          { description: `STEP 3: Divide by ${leftCoef - rightCoef}`, work: `x = ${answer}` }
        ],
        rule: "Variables one side, constants other side, then solve",
        finalAnswer: answer
      }
    };
  } else {
    const answer = randomDecimal();
    const leftCoef = randomInt(4, 8);
    const rightCoef = randomInt(1, leftCoef - 2);
    const leftConst = randomInt(1, 8);
    const constDiff = Math.round(((leftCoef - rightCoef) * answer) * 100) / 100;
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const problem = `${leftCoef}${variable} + ${leftConst} = ${rightCoef}${variable} + ${leftConst + constDiff}`;
    
    const choices = [
      answer,
      Math.round(constDiff * 100) / 100,
      Math.round((answer + 0.5) * 100) / 100,
      Math.round((constDiff / (leftCoef - rightCoef)) * 100) / 100
    ];

    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Collect variables → Collect constants → Solve`, work: `${variable} = ${answer}` }
        ],
        rule: "Organize then solve",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-30: INNER VAULT (Distribute Both Sides)
// ============================================

export const generateVaultLevel2Problem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(2, 8);
    const leftOut = randomInt(2, 4);
    const leftIn = randomInt(1, 4);
    const rightOut = randomInt(1, 3);
    const rightIn = randomInt(1, 4);
    
    // leftOut(x + leftIn) = rightOut(x + rightIn)
    // leftOut*x + leftOut*leftIn = rightOut*x + rightOut*rightIn
    // (leftOut - rightOut)*x = rightOut*rightIn - leftOut*leftIn
    
    const leftDist = leftOut * answer + leftOut * leftIn;
    const rightDist = rightOut * answer + rightOut * rightIn;
    
    const problem = `${leftOut}(x + ${leftIn}) = ${rightOut}(x + ${Math.round((leftDist - rightDist) / rightOut + rightIn)})`;
    
    const choices = [
      answer,
      answer + 1,
      leftOut * leftIn,
      rightOut * rightIn
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
          { description: `STEP 1: Distribute both sides`, work: `${leftOut}x + ${leftOut * leftIn} = ...` },
          { description: `STEP 2: Get variables on one side`, work: `` },
          { description: `STEP 3: Solve for x`, work: `x = ${answer}` }
        ],
        rule: "Distribute both sides, then solve",
        finalAnswer: answer
      }
    };
  } else {
    const answer = randomDecimal();
    const leftOut = randomInt(2, 4);
    const leftIn = randomInt(1, 4);
    const rightOut = randomInt(1, 3);
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const leftDist = Math.round((leftOut * answer + leftOut * leftIn) * 100) / 100;
    const rightDist = Math.round((rightOut * answer) * 100) / 100;
    const rightIn = Math.round(((leftDist - rightDist) / rightOut) * 100) / 100;
    
    const problem = `${leftOut}(${variable} + ${leftIn}) = ${rightOut}(${variable} + ${rightIn})`;
    
    const choices = [
      answer,
      Math.round((answer + 0.5) * 100) / 100,
      Math.round((leftOut * leftIn) * 100) / 100,
      Math.round((rightOut * rightIn) * 100) / 100
    ];

    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Distribute both sides → Collect → Solve`, work: `${variable} = ${answer}` }
        ],
        rule: "Distribute everywhere first",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-31: THE VAULT (Ultimate Challenge)
// ============================================

export const generateVaultLevel3Problem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(2, 10);
    const leftOut = randomInt(2, 3);
    const leftIn1 = randomInt(1, 3);
    const middleCoef = randomInt(1, 3);
    const rightConst = randomInt(1, 5);
    
    // leftOut(x + leftIn1) + middleCoef*x - rightConst = result
    const leftDist = leftOut * answer + leftOut * leftIn1;
    const middle = middleCoef * answer;
    const result = leftDist + middle - rightConst;
    
    const problem = `${leftOut}(x + ${leftIn1}) + ${middleCoef}x - ${rightConst} = ${result}`;
    
    const choices = [
      answer,
      answer + 1,
      result / (leftOut + middleCoef),
      (result + rightConst) / leftOut
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
          { description: `🎉 FINAL CHALLENGE! 🎉`, work: `` },
          { description: `STEP 1: Distribute ${leftOut}`, work: `${leftOut}x + ${leftOut * leftIn1} + ${middleCoef}x - ${rightConst} = ${result}` },
          { description: `STEP 2: Combine like terms`, work: `${leftOut + middleCoef}x + ${leftOut * leftIn1 - rightConst} = ${result}` },
          { description: `STEP 3: Subtract ${leftOut * leftIn1 - rightConst}`, work: `${leftOut + middleCoef}x = ${result - (leftOut * leftIn1 - rightConst)}` },
          { description: `STEP 4: Divide by ${leftOut + middleCoef}`, work: `x = ${answer}` },
          { description: `🏆 VAULT UNLOCKED! 🏆`, work: `` }
        ],
        rule: "YOU DID IT! All skills combined to solve the ultimate puzzle!",
        finalAnswer: answer
      }
    };
  } else {
    const answer = randomDecimal();
    const leftOut = randomInt(2, 3);
    const leftIn1 = randomInt(1, 3);
    const middleCoef = randomInt(1, 3);
    const rightConst = randomInt(1, 5);
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const totalCoef = leftOut + middleCoef;
    const constTerm = leftOut * leftIn1 - rightConst;
    const result = Math.round((totalCoef * answer + constTerm) * 100) / 100;
    
    const problem = `${leftOut}(${variable} + ${leftIn1}) + ${middleCoef}${variable} - ${rightConst} = ${result}`;
    
    const choices = [
      answer,
      Math.round((answer + 0.5) * 100) / 100,
      Math.round((result / totalCoef) * 100) / 100,
      Math.round(((result + rightConst) / leftOut) * 100) / 100
    ];

    const finalChoices = ensureFourChoices(choices, answer).map(n => Math.round(n * 100) / 100);

    return {
      problem: problem,
      displayProblem: problem,
      answer: answer,
      choices: finalChoices,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `🎉 FINAL CHALLENGE! 🎉`, work: `` },
          { description: `Distribute → Combine → Solve`, work: `${variable} = ${answer}` },
          { description: `🏆 VAULT UNLOCKED! 🏆`, work: `` }
        ],
        rule: "CONGRATULATIONS! Algebra Expedition COMPLETE!",
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// MODULE 3: INEQUALITIES (Levels 32-37)
// Add these 6 functions to problemGenerators.js
// ============================================

// Helper function to generate number line SVG
const generateNumberLine = (value, type, isOpen) => {
  // type: 'greater', 'less', 'greaterEqual', 'lessEqual'
  const direction = (type === 'greater' || type === 'greaterEqual') ? 'right' : 'left';
  const circle = isOpen ? 'open' : 'closed';
  
  return {
    value: value,
    direction: direction,
    circleType: circle,
    svgData: `numberline-${value}-${direction}-${circle}` // Placeholder for actual SVG
  };
};

// ============================================
// LEVEL 1-32: BOUNDARY MARKERS (Speed Round - Match Inequality to Line)
// ============================================

export const generateBoundaryMarkersProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const value = randomInt(-10, 10);
    const inequalityType = randomFrom(['greater', 'less', 'greaterEqual', 'lessEqual']);
    
    let symbol, isOpen, direction;
    switch(inequalityType) {
      case 'greater':
        symbol = '>';
        isOpen = true;
        direction = 'right';
        break;
      case 'less':
        symbol = '<';
        isOpen = true;
        direction = 'left';
        break;
      case 'greaterEqual':
        symbol = '≥';
        isOpen = false;
        direction = 'right';
        break;
      case 'lessEqual':
        symbol = '≤';
        isOpen = false;
        direction = 'left';
        break;
    }
    
    const problem = `x ${symbol} ${value}`;
    const answer = generateNumberLine(value, inequalityType, isOpen);
    
    // Generate 3 wrong number lines
    const wrongChoices = [
      generateNumberLine(value, inequalityType === 'greater' ? 'less' : 'greater', isOpen), // Wrong direction
      generateNumberLine(value, inequalityType, !isOpen), // Wrong circle type
      generateNumberLine(value + 1, inequalityType, isOpen) // Wrong value
    ];
    
    const choices = [answer, ...wrongChoices].sort(() => Math.random() - 0.5);
    
    return {
      problem: problem,
      displayProblem: problem,
      answer: answer.svgData, // The correct SVG identifier
      choices: choices.map(c => c.svgData),
      inputType: 'numberLine', // NEW: tells UI to display number line options
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Problem: ${problem}`, work: `` },
          { description: `The symbol ${symbol} means ${symbol === '>' ? 'greater than' : symbol === '<' ? 'less than' : symbol === '≥' ? 'greater than or equal to' : 'less than or equal to'}`, work: `` },
          { description: `Circle type: ${isOpen ? 'OPEN (not including the value)' : 'CLOSED (including the value)'}`, work: `` },
          { description: `Arrow direction: ${direction === 'right' ? 'RIGHT (values getting larger)' : 'LEFT (values getting smaller)'}`, work: `` }
        ],
        rule: `> and < use OPEN circles. ≥ and ≤ use CLOSED circles. Arrow shows all values that make the inequality true.`,
        finalAnswer: `Number line: ${isOpen ? 'Open' : 'Closed'} circle at ${value}, arrow pointing ${direction}`
      }
    };
  } else {
    const value = randomDecimal();
    const inequalityType = randomFrom(['greater', 'less', 'greaterEqual', 'lessEqual']);
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    let symbol, isOpen, direction;
    switch(inequalityType) {
      case 'greater': symbol = '>'; isOpen = true; direction = 'right'; break;
      case 'less': symbol = '<'; isOpen = true; direction = 'left'; break;
      case 'greaterEqual': symbol = '≥'; isOpen = false; direction = 'right'; break;
      case 'lessEqual': symbol = '≤'; isOpen = false; direction = 'left'; break;
    }
    
    const problem = `${variable} ${symbol} ${value}`;
    const answer = generateNumberLine(value, inequalityType, isOpen);
    
    const wrongChoices = [
      generateNumberLine(value, inequalityType === 'greater' ? 'less' : 'greater', isOpen),
      generateNumberLine(value, inequalityType, !isOpen),
      generateNumberLine(Math.round((value + 0.5) * 100) / 100, inequalityType, isOpen)
    ];
    
    const choices = [answer, ...wrongChoices].sort(() => Math.random() - 0.5);
    
    return {
      problem: problem,
      displayProblem: problem,
      answer: answer.svgData,
      choices: choices.map(c => c.svgData),
      inputType: 'numberLine',
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `${symbol} → ${isOpen ? 'Open' : 'Closed'} circle, arrow ${direction}`, work: `` }
        ],
        rule: `Match symbol to circle type and direction`,
        finalAnswer: `${isOpen ? 'Open' : 'Closed'} circle at ${value}, arrow ${direction}`
      }
    };
  }
};

// ============================================
// LEVEL 1-33: BOUNDARY REVERSE (Speed Round - Match Line to Inequality)
// ============================================

export const generateBoundaryReverseProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const value = randomInt(-10, 10);
    const inequalityType = randomFrom(['greater', 'less', 'greaterEqual', 'lessEqual']);
    
    let symbol, isOpen, direction;
    switch(inequalityType) {
      case 'greater': symbol = '>'; isOpen = true; direction = 'right'; break;
      case 'less': symbol = '<'; isOpen = true; direction = 'left'; break;
      case 'greaterEqual': symbol = '≥'; isOpen = false; direction = 'right'; break;
      case 'lessEqual': symbol = '≤'; isOpen = false; direction = 'left'; break;
    }
    
    const numberLine = generateNumberLine(value, inequalityType, isOpen);
    const answer = `x ${symbol} ${value}`;
    
    // Wrong answers
    const wrongSymbol1 = symbol === '>' ? '<' : symbol === '<' ? '>' : symbol === '≥' ? '≤' : '≥';
    const wrongSymbol2 = symbol === '>' ? '≥' : symbol === '<' ? '≤' : symbol === '≥' ? '>' : '<';
    
    const choices = [
      answer,
      `x ${wrongSymbol1} ${value}`,
      `x ${wrongSymbol2} ${value}`,
      `x ${symbol} ${value + 1}`
    ];
    
    const finalChoices = ensureFourChoices(choices, answer);
    
    return {
      problem: `Number line: ${isOpen ? 'Open' : 'Closed'} circle at ${value}, arrow pointing ${direction}`,
      displayProblem: numberLine.svgData, // UI will show actual number line graphic
      answer: answer,
      choices: finalChoices,
      inputType: 'clickToSelect', // Normal click to select
      explanation: {
        originalProblem: `Number line shown`,
        steps: [
          { description: `Circle type: ${isOpen ? 'OPEN' : 'CLOSED'}`, work: `${isOpen ? '> or <' : '≥ or ≤'}` },
          { description: `Arrow direction: ${direction.toUpperCase()}`, work: `${direction === 'right' ? '> or ≥' : '< or ≤'}` },
          { description: `Combining these clues`, work: `Symbol is ${symbol}` },
          { description: `Value at circle: ${value}`, work: `` }
        ],
        rule: `Open circle = strict inequality (>, <). Closed circle = includes equal (≥, ≤). Arrow shows direction.`,
        finalAnswer: answer
      }
    };
  } else {
    const value = randomDecimal();
    const inequalityType = randomFrom(['greater', 'less', 'greaterEqual', 'lessEqual']);
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    let symbol, isOpen, direction;
    switch(inequalityType) {
      case 'greater': symbol = '>'; isOpen = true; direction = 'right'; break;
      case 'less': symbol = '<'; isOpen = true; direction = 'left'; break;
      case 'greaterEqual': symbol = '≥'; isOpen = false; direction = 'right'; break;
      case 'lessEqual': symbol = '≤'; isOpen = false; direction = 'left'; break;
    }
    
    const numberLine = generateNumberLine(value, inequalityType, isOpen);
    const answer = `${variable} ${symbol} ${value}`;
    
    const wrongSymbol1 = symbol === '>' ? '<' : symbol === '<' ? '>' : symbol === '≥' ? '≤' : '≥';
    const wrongSymbol2 = symbol === '>' ? '≥' : symbol === '<' ? '≤' : symbol === '≥' ? '>' : '<';
    
    const choices = [
      answer,
      `${variable} ${wrongSymbol1} ${value}`,
      `${variable} ${wrongSymbol2} ${value}`,
      `${variable} ${symbol} ${Math.round((value + 0.5) * 100) / 100}`
    ];
    
    const finalChoices = ensureFourChoices(choices, answer);
    
    return {
      problem: `Number line: ${isOpen ? 'Open' : 'Closed'} circle at ${value}, arrow ${direction}`,
      displayProblem: numberLine.svgData,
      answer: answer,
      choices: finalChoices,
      inputType: 'clickToSelect',
      explanation: {
        originalProblem: `Number line shown`,
        steps: [
          { description: `Circle + Arrow → ${symbol}`, work: `` }
        ],
        rule: `Read the number line correctly`,
        finalAnswer: answer
      }
    };
  }
};

// ============================================
// LEVEL 1-34: SECURE PERIMETER (Two-Step, No Flip)
// ============================================

export const generateSecurePerimeterProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(-10, 10);
    const coefficient = randomInt(2, 6);
    const constant = randomInt(1, 10);
    const symbol = randomFrom(['>', '<', '≥', '≤']);
    
    const leftSide = coefficient * answer + constant;
    const problem = `${coefficient}x + ${constant} ${symbol} ${leftSide}`;
    
    const isOpen = (symbol === '>' || symbol === '<');
    const direction = (symbol === '>' || symbol === '≥') ? 'right' : 'left';
    const numberLine = generateNumberLine(answer, symbol === '>' ? 'greater' : symbol === '<' ? 'less' : symbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen);
    
    const choices = [
      numberLine.svgData,
      generateNumberLine(answer, symbol === '>' ? 'less' : 'greater', isOpen).svgData,
      generateNumberLine(answer, symbol === '>' ? 'greater' : symbol === '<' ? 'less' : symbol === '≥' ? 'greaterEqual' : 'lessEqual', !isOpen).svgData,
      generateNumberLine(answer + 1, symbol === '>' ? 'greater' : symbol === '<' ? 'less' : symbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen).svgData
    ];
    
    return {
      problem: problem,
      displayProblem: problem,
      answer: numberLine.svgData,
      choices: choices,
      inputType: 'numberLine',
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Problem: ${problem}`, work: `` },
          { description: `STEP 1: Subtract ${constant} from both sides`, work: `${coefficient}x ${symbol} ${leftSide - constant}` },
          { description: `STEP 2: Divide both sides by ${coefficient}`, work: `x ${symbol} ${answer}` },
          { description: `Note: Dividing by POSITIVE ${coefficient} does NOT flip the sign!`, work: `` },
          { description: `Graph: ${isOpen ? 'Open' : 'Closed'} circle at ${answer}, arrow ${direction}`, work: `` }
        ],
        rule: `When dividing by a POSITIVE number, the inequality sign stays the SAME.`,
        finalAnswer: `x ${symbol} ${answer}`
      }
    };
  } else {
    const answer = randomDecimal();
    const coefficient = randomInt(2, 6);
    const constant = randomInt(1, 10);
    const symbol = randomFrom(['>', '<', '≥', '≤']);
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const leftSide = Math.round((coefficient * answer + constant) * 100) / 100;
    const problem = `${coefficient}${variable} + ${constant} ${symbol} ${leftSide}`;
    
    const isOpen = (symbol === '>' || symbol === '<');
    const direction = (symbol === '>' || symbol === '≥') ? 'right' : 'left';
    const numberLine = generateNumberLine(answer, symbol === '>' ? 'greater' : symbol === '<' ? 'less' : symbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen);
    
    const choices = [
      numberLine.svgData,
      generateNumberLine(answer, symbol === '>' ? 'less' : 'greater', isOpen).svgData,
      generateNumberLine(answer, symbol === '>' ? 'greater' : symbol === '<' ? 'less' : symbol === '≥' ? 'greaterEqual' : 'lessEqual', !isOpen).svgData,
      generateNumberLine(Math.round((answer + 0.5) * 100) / 100, symbol === '>' ? 'greater' : symbol === '<' ? 'less' : symbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen).svgData
    ];
    
    return {
      problem: problem,
      displayProblem: problem,
      answer: numberLine.svgData,
      choices: choices,
      inputType: 'numberLine',
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Solve like equation, sign stays same`, work: `${variable} ${symbol} ${answer}` }
        ],
        rule: `Positive operations = no flip`,
        finalAnswer: `${variable} ${symbol} ${answer}`
      }
    };
  }
};

// ============================================
// LEVEL 1-35: SHIFTING BOUNDARIES (Sign Flip - Divide by Negative)
// ============================================

export const generateShiftingBoundariesProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(-10, 10);
    const coefficient = -randomInt(2, 6);
    const symbol = randomFrom(['>', '<', '≥', '≤']);
    
    const rightSide = coefficient * answer;
    const problem = `${coefficient}x ${symbol} ${rightSide}`;
    
    // FLIP the symbol when dividing by negative!
    const flippedSymbol = symbol === '>' ? '<' : symbol === '<' ? '>' : symbol === '≥' ? '≤' : '≥';
    
    const isOpen = (flippedSymbol === '>' || flippedSymbol === '<');
    const direction = (flippedSymbol === '>' || flippedSymbol === '≥') ? 'right' : 'left';
    const numberLine = generateNumberLine(answer, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen);
    
    const choices = [
      numberLine.svgData,
      // Wrong: didn't flip
      generateNumberLine(answer, symbol === '>' ? 'greater' : symbol === '<' ? 'less' : symbol === '≥' ? 'greaterEqual' : 'lessEqual', symbol === '>' || symbol === '<').svgData,
      // Wrong: wrong circle type
      generateNumberLine(answer, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', !isOpen).svgData,
      // Wrong: wrong value
      generateNumberLine(answer + 1, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen).svgData
    ];
    
    return {
      problem: problem,
      displayProblem: problem,
      answer: numberLine.svgData,
      choices: choices,
      inputType: 'numberLine',
      showFlipWarning: true, // NEW: triggers warning popup in UI
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Problem: ${problem}`, work: `` },
          { description: `⚠️ CRITICAL: Dividing by NEGATIVE ${coefficient}`, work: `` },
          { description: `Divide both sides by ${coefficient}`, work: `x ${symbol} ${rightSide / coefficient}` },
          { description: `⚠️ FLIP THE SIGN when dividing by negative!`, work: `x ${flippedSymbol} ${answer}` },
          { description: `Graph: ${isOpen ? 'Open' : 'Closed'} circle at ${answer}, arrow ${direction}`, work: `` }
        ],
        rule: `CRITICAL RULE: When multiplying or dividing by a NEGATIVE number, you MUST flip the inequality sign!`,
        finalAnswer: `x ${flippedSymbol} ${answer}`
      }
    };
  } else {
    const answer = randomDecimal();
    const coefficient = -randomInt(2, 6);
    const symbol = randomFrom(['>', '<', '≥', '≤']);
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const rightSide = Math.round((coefficient * answer) * 100) / 100;
    const problem = `${coefficient}${variable} ${symbol} ${rightSide}`;
    
    const flippedSymbol = symbol === '>' ? '<' : symbol === '<' ? '>' : symbol === '≥' ? '≤' : '≥';
    const isOpen = (flippedSymbol === '>' || flippedSymbol === '<');
    const numberLine = generateNumberLine(answer, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen);
    
    const choices = [
      numberLine.svgData,
      generateNumberLine(answer, symbol === '>' ? 'greater' : symbol === '<' ? 'less' : symbol === '≥' ? 'greaterEqual' : 'lessEqual', symbol === '>' || symbol === '<').svgData,
      generateNumberLine(answer, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', !isOpen).svgData,
      generateNumberLine(Math.round((answer + 0.5) * 100) / 100, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen).svgData
    ];
    
    return {
      problem: problem,
      displayProblem: problem,
      answer: numberLine.svgData,
      choices: choices,
      inputType: 'numberLine',
      showFlipWarning: true,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `⚠️ Negative division → FLIP!`, work: `${variable} ${flippedSymbol} ${answer}` }
        ],
        rule: `Divide by negative = flip sign`,
        finalAnswer: `${variable} ${flippedSymbol} ${answer}`
      }
    };
  }
};

// ============================================
// LEVEL 1-36: TWISTED PATHS (Multi-Step with Flip)
// ============================================

export const generateTwistedPathsProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(-10, 10);
    const coefficient = -randomInt(2, 5);
    const constant = randomInt(1, 10);
    const symbol = randomFrom(['>', '<', '≥', '≤']);
    
    const rightSide = coefficient * answer + constant;
    const problem = `${coefficient}x + ${constant} ${symbol} ${rightSide}`;
    
    const flippedSymbol = symbol === '>' ? '<' : symbol === '<' ? '>' : symbol === '≥' ? '≤' : '≥';
    const isOpen = (flippedSymbol === '>' || flippedSymbol === '<');
    const numberLine = generateNumberLine(answer, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen);
    
    const choices = [
      numberLine.svgData,
      generateNumberLine(answer, symbol === '>' ? 'greater' : symbol === '<' ? 'less' : symbol === '≥' ? 'greaterEqual' : 'lessEqual', symbol === '>' || symbol === '<').svgData,
      generateNumberLine(answer, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', !isOpen).svgData,
      generateNumberLine(answer - 1, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen).svgData
    ];
    
    return {
      problem: problem,
      displayProblem: problem,
      answer: numberLine.svgData,
      choices: choices,
      inputType: 'numberLine',
      showFlipWarning: true,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Problem: ${problem}`, work: `` },
          { description: `STEP 1: Subtract ${constant} from both sides`, work: `${coefficient}x ${symbol} ${rightSide - constant}` },
          { description: `STEP 2: Divide both sides by ${coefficient}`, work: `x ${symbol} ${(rightSide - constant) / coefficient}` },
          { description: `⚠️ FLIP because dividing by negative!`, work: `x ${flippedSymbol} ${answer}` },
          { description: `Graph the solution`, work: `` }
        ],
        rule: `Two-step: (1) Undo addition/subtraction, (2) Undo multiplication/division, (3) FLIP if dividing by negative!`,
        finalAnswer: `x ${flippedSymbol} ${answer}`
      }
    };
  } else {
    const answer = randomDecimal();
    const coefficient = -randomInt(2, 5);
    const constant = randomInt(1, 10);
    const symbol = randomFrom(['>', '<', '≥', '≤']);
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const rightSide = Math.round((coefficient * answer + constant) * 100) / 100;
    const problem = `${coefficient}${variable} + ${constant} ${symbol} ${rightSide}`;
    
    const flippedSymbol = symbol === '>' ? '<' : symbol === '<' ? '>' : symbol === '≥' ? '≤' : '≥';
    const isOpen = (flippedSymbol === '>' || flippedSymbol === '<');
    const numberLine = generateNumberLine(answer, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen);
    
    const choices = [
      numberLine.svgData,
      generateNumberLine(answer, symbol === '>' ? 'greater' : symbol === '<' ? 'less' : symbol === '≥' ? 'greaterEqual' : 'lessEqual', symbol === '>' || symbol === '<').svgData,
      generateNumberLine(answer, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', !isOpen).svgData,
      generateNumberLine(Math.round((answer - 0.5) * 100) / 100, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen).svgData
    ];
    
    return {
      problem: problem,
      displayProblem: problem,
      answer: numberLine.svgData,
      choices: choices,
      inputType: 'numberLine',
      showFlipWarning: true,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `Two-step with flip`, work: `${variable} ${flippedSymbol} ${answer}` }
        ],
        rule: `Multi-step with negative = flip`,
        finalAnswer: `${variable} ${flippedSymbol} ${answer}`
      }
    };
  }
};

// ============================================
// LEVEL 1-37: FINAL FRONTIER (Complex with Distribution + Flip)
// ============================================

export const generateFinalFrontierProblem = (difficulty) => {
  if (difficulty === 'easy') {
    const answer = randomInt(-8, 8);
    const outside = -randomInt(2, 4);
    const inside = randomInt(1, 4);
    const addConstant = randomInt(1, 6);
    const symbol = randomFrom(['>', '<', '≥', '≤']);
    
    // -2(x - 3) + 4 < result
    // -2x + 6 + 4 < result
    // -2x + 10 < result
    // -2x < result - 10
    // x > (result - 10) / -2  (FLIP!)
    
    const distributed = outside * answer + outside * (-inside) + addConstant;
    const problem = `${outside}(x - ${inside}) + ${addConstant} ${symbol} ${distributed}`;
    
    const flippedSymbol = symbol === '>' ? '<' : symbol === '<' ? '>' : symbol === '≥' ? '≤' : '≥';
    const isOpen = (flippedSymbol === '>' || flippedSymbol === '<');
    const numberLine = generateNumberLine(answer, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen);
    
    const choices = [
      numberLine.svgData,
      generateNumberLine(answer, symbol === '>' ? 'greater' : symbol === '<' ? 'less' : symbol === '≥' ? 'greaterEqual' : 'lessEqual', symbol === '>' || symbol === '<').svgData,
      generateNumberLine(answer, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', !isOpen).svgData,
      generateNumberLine(answer + 1, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen).svgData
    ];
    
    return {
      problem: problem,
      displayProblem: problem,
      answer: numberLine.svgData,
      choices: choices,
      inputType: 'numberLine',
      showFlipWarning: true,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `🎉 FINAL FRONTIER! 🎉`, work: `` },
          { description: `STEP 1: Distribute ${outside}`, work: `${outside}x + ${outside * (-inside)} + ${addConstant} ${symbol} ${distributed}` },
          { description: `STEP 2: Combine constants`, work: `${outside}x + ${outside * (-inside) + addConstant} ${symbol} ${distributed}` },
          { description: `STEP 3: Subtract ${outside * (-inside) + addConstant}`, work: `${outside}x ${symbol} ${distributed - (outside * (-inside) + addConstant)}` },
          { description: `STEP 4: Divide by ${outside}`, work: `x ${symbol} ${(distributed - (outside * (-inside) + addConstant)) / outside}` },
          { description: `⚠️ FLIP because dividing by negative!`, work: `x ${flippedSymbol} ${answer}` },
          { description: `🏆 FRONTIER EXPLORED! 🏆`, work: `` }
        ],
        rule: `MASTER LEVEL: Distribute → Combine → Solve → FLIP if negative! You conquered the mathematical frontier!`,
        finalAnswer: `x ${flippedSymbol} ${answer}`
      }
    };
  } else {
    const answer = randomDecimal();
    const outside = -randomInt(2, 4);
    const inside = randomInt(1, 4);
    const addConstant = randomInt(1, 6);
    const symbol = randomFrom(['>', '<', '≥', '≤']);
    const variable = randomFrom(['x', 'y', 'n', 'm']);
    
    const distributed = Math.round((outside * answer + outside * (-inside) + addConstant) * 100) / 100;
    const problem = `${outside}(${variable} - ${inside}) + ${addConstant} ${symbol} ${distributed}`;
    
    const flippedSymbol = symbol === '>' ? '<' : symbol === '<' ? '>' : symbol === '≥' ? '≤' : '≥';
    const isOpen = (flippedSymbol === '>' || flippedSymbol === '<');
    const numberLine = generateNumberLine(answer, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen);
    
    const choices = [
      numberLine.svgData,
      generateNumberLine(answer, symbol === '>' ? 'greater' : symbol === '<' ? 'less' : symbol === '≥' ? 'greaterEqual' : 'lessEqual', symbol === '>' || symbol === '<').svgData,
      generateNumberLine(answer, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', !isOpen).svgData,
      generateNumberLine(Math.round((answer + 0.5) * 100) / 100, flippedSymbol === '>' ? 'greater' : flippedSymbol === '<' ? 'less' : flippedSymbol === '≥' ? 'greaterEqual' : 'lessEqual', isOpen).svgData
    ];
    
    return {
      problem: problem,
      displayProblem: problem,
      answer: numberLine.svgData,
      choices: choices,
      inputType: 'numberLine',
      showFlipWarning: true,
      explanation: {
        originalProblem: problem,
        steps: [
          { description: `🎉 FINAL FRONTIER! 🎉`, work: `` },
          { description: `Distribute → Combine → Solve → FLIP!`, work: `${variable} ${flippedSymbol} ${answer}` },
          { description: `🏆 EXPEDITION COMPLETE! 🏆`, work: `` }
        ],
        rule: `CONGRATULATIONS! You've mastered all algebra skills!`,
        finalAnswer: `${variable} ${flippedSymbol} ${answer}`
      }
    };
  }
};



// ============================================
// EXPORTS
// ============================================

export const problemGenerators = {
  // Module 1: Base Camp (Levels 1-16)
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
  
  // Module 2: Territory (Levels 17-31)
  '1-17': generateAdditionEquationProblem,
  '1-18': generateSubtractionEquationProblem,
  '1-19': generateMultiplicationEquationProblem,
  '1-20': generateDivisionEquationProblem,
  '1-21': generateTwoStepAddProblem,
  '1-22': generateTwoStepSubtractProblem,
  '1-23': generateTwoStepDivideAddProblem,
  '1-24': generateTwoStepDivideSubtractProblem,
  '1-25': generateVariablesBothSidesProblem,
  '1-26': generateDistributeEquationProblem,
  '1-27': generateCombineSolveProblem,
  '1-28': generateComplexMultiStepProblem,
  '1-29': generateVaultLevel1Problem,
  '1-30': generateVaultLevel2Problem,
  '1-31': generateVaultLevel3Problem,
  
  // Module 3: The Frontier - Inequalities (Levels 32-37)
  '1-32': generateBoundaryMarkersProblem,
  '1-33': generateBoundaryReverseProblem,
  '1-34': generateSecurePerimeterProblem,
  '1-35': generateShiftingBoundariesProblem,
  '1-36': generateTwistedPathsProblem,
  '1-37': generateFinalFrontierProblem,
};

export default problemGenerators;
