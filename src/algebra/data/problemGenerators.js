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

// GLOBAL RULE: Hide coefficient 1 and -1 everywhere
const formatCoefficient = (coefficient, variable) => {
  if (coefficient === 0) return '';
  if (coefficient === 1) return variable;
  if (coefficient === -1) return `-${variable}`;
  return `${coefficient}${variable}`;
};

// Format expressions preserving ORIGINAL TERM ORDER
// If problem was a(b + x), answer is ab + ax (NOT ax + ab)
// constantFirst = true means constant came first in original problem
const canonicalizeExpression = (coefficient, variable, constant, constantFirst = false) => {
  // Handle coefficient display
  let varPart = formatCoefficient(coefficient, variable);
  
  // Handle constant
  if (coefficient === 0 && constant === 0) {
    return '0';
  } else if (coefficient === 0) {
    return String(constant);
  } else if (constant === 0) {
    return varPart;
  } else if (constantFirst) {
    // Constant came first: return "c ± ax" format
    if (coefficient > 0) {
      return `${constant} + ${varPart}`;
    } else if (coefficient < 0) {
      return `${constant} - ${varPart.replace('-', '')}`;
    } else {
      return String(constant);
    }
  } else {
    // Variable came first: return "ax ± c" format
    if (constant > 0) {
      return `${varPart} + ${constant}`;
    } else {
      return `${varPart} - ${Math.abs(constant)}`;
    }
  }
};

// ENHANCED: Parse expression into components for algebraic equivalence
const parseExpression = (expr) => {
  if (!expr || typeof expr !== 'string') return null;
  
  const trimmed = expr.trim();
  
  // Try to parse format: "ax + b" or "b + ax" or just "ax" or just "b"
  // Handle: x, -x, 2x, -2x, x + 3, 2x - 5, 5 + 2x, etc.
  
  // Match patterns like: (coef)(var) + (const) or (const) + (coef)(var)
  const patterns = [
    /^([+-]?\d*\.?\d*)\s*([a-z])\s*([+-])\s*(\d+\.?\d*)$/i,  // ax ± c
    /^(\d+\.?\d*)\s*([+-])\s*([+-]?\d*\.?\d*)\s*([a-z])$/i,   // c ± ax
    /^([+-]?\d*\.?\d*)\s*([a-z])$/i,                          // ax only
    /^(\d+\.?\d*)$/,                                           // constant only
  ];
  
  // Try pattern 1: ax ± c
  let match = trimmed.match(patterns[0]);
  if (match) {
    const coef = match[1] === '' ? 1 : match[1] === '-' ? -1 : parseFloat(match[1]);
    const variable = match[2];
    const sign = match[3];
    const constant = sign === '+' ? parseFloat(match[4]) : -parseFloat(match[4]);
    return { coefficient: coef, variable, constant };
  }
  
  // Try pattern 2: c ± ax
  match = trimmed.match(patterns[1]);
  if (match) {
    const constant = parseFloat(match[1]);
    const sign = match[2];
    const coef = match[3] === '' ? 1 : match[3] === '-' ? -1 : parseFloat(match[3]);
    const variable = match[4];
    const actualCoef = sign === '+' ? coef : -coef;
    return { coefficient: actualCoef, variable, constant };
  }
  
  // Try pattern 3: ax only
  match = trimmed.match(patterns[2]);
  if (match) {
    const coef = match[1] === '' ? 1 : match[1] === '-' ? -1 : parseFloat(match[1]);
    const variable = match[2];
    return { coefficient: coef, variable, constant: 0 };
  }
  
  // Try pattern 4: constant only
  match = trimmed.match(patterns[3]);
  if (match) {
    return { coefficient: 0, variable: '', constant: parseFloat(match[1]) };
  }
  
  return null;
};

// Check if two expressions are algebraically equivalent (not just string equal)
const areEquivalent = (expr1, expr2) => {
  // String equality first (fastest check)
  if (expr1 === expr2) return true;
  
  // Parse both expressions
  const parsed1 = parseExpression(expr1);
  const parsed2 = parseExpression(expr2);
  
  // If either couldn't parse, fall back to string comparison
  if (!parsed1 || !parsed2) return expr1 === expr2;
  
  // Check algebraic equivalence
  // Must have same coefficient, same variable, same constant
  return (
    Math.abs(parsed1.coefficient - parsed2.coefficient) < 0.0001 &&
    parsed1.variable === parsed2.variable &&
    Math.abs(parsed1.constant - parsed2.constant) < 0.0001
  );
};

// Remove duplicates by equivalence (ENHANCED to catch rearrangements)
const uniqueChoices = (choices) => {
  const unique = [];
  for (const choice of choices) {
    // Check if this choice is equivalent to any already in unique array
    const isDuplicate = unique.some(existing => areEquivalent(choice, existing));
    if (!isDuplicate) {
      unique.push(choice);
    }
  }
  return unique;
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
// problemGenerators.js - COMPREHENSIVE FIX for ensureFourChoices
// Location: Replace lines 221-233

// Helper: Create canonical form for comparison
const canonicalForm = (expr) => {
  if (!expr) return '';
  
  // Parse the expression
  const parsed = parseExpression(String(expr));
  
  // If parsing failed, use normalized string
  if (!parsed) {
    return String(expr)
      .replace(/\s+/g, '')  // Remove all whitespace
      .replace(/\+\-/g, '-')  // Normalize +- to -
      .replace(/^\+/, '');     // Remove leading +
  }
  
  // Create canonical string from parsed form
  const { coefficient, variable, constant } = parsed;
  
  // Build canonical form: always "ax+b" format (never "b+ax")
  let canonical = '';
  
  // Variable term (if exists)
  if (coefficient !== 0 && variable) {
    if (coefficient === 1) {
      canonical = variable;
    } else if (coefficient === -1) {
      canonical = '-' + variable;
    } else {
      canonical = coefficient + variable;
    }
  }
  
  // Constant term (if exists)
  if (constant !== 0) {
    if (canonical) {
      // We have a variable term, add constant
      canonical += (constant > 0 ? '+' + constant : constant);
    } else {
      // Only constant, no variable
      canonical = String(constant);
    }
  }
  
  // Edge case: if both are 0
  if (!canonical) {
    canonical = '0';
  }
  
  return canonical;
};

// Helper: Validate that a distractor is actually incorrect
const isActuallyWrong = (distractor, correctAnswer) => {
  const distractorCanonical = canonicalForm(distractor);
  const correctCanonical = canonicalForm(correctAnswer);
  
  // Must be different in canonical form
  return distractorCanonical !== correctCanonical;
};

// Main function: Ensure exactly 4 unique, valid choices
const ensureFourChoices = (choices, answer) => {
  const MAX_ATTEMPTS = 20;
  const canonicalSet = new Set();
  const uniqueChoices = [];
  
  // Step 1: Add the correct answer first (guaranteed inclusion)
  const answerCanonical = canonicalForm(answer);
  canonicalSet.add(answerCanonical);
  uniqueChoices.push(answer);
  
  // Step 2: Process provided choices (distractors)
  for (const choice of choices) {
    if (uniqueChoices.length >= 4) break;
    
    const canonical = canonicalForm(choice);
    
    // Skip if duplicate OR if actually correct
    if (canonicalSet.has(canonical)) continue;
    if (!isActuallyWrong(choice, answer)) continue;
    
    canonicalSet.add(canonical);
    uniqueChoices.push(choice);
  }
  
  // Step 3: Generate additional distractors if needed
  let attempts = 0;
  const parsed = parseExpression(String(answer));
  
  while (uniqueChoices.length < 4 && attempts < MAX_ATTEMPTS) {
    let filler;
    
    if (parsed && parsed.variable) {
      // Generate algebraically plausible distractors
      const strategies = [
        // Strategy 1: Wrong coefficient
        () => {
          const wrongCoef = parsed.coefficient + randomFrom([-3, -2, -1, 1, 2, 3]);
          return formatAnswer(wrongCoef, parsed.variable, parsed.constant);
        },
        // Strategy 2: Wrong constant
        () => {
          const wrongConst = parsed.constant + randomFrom([-5, -3, -2, -1, 1, 2, 3, 5]);
          return formatAnswer(parsed.coefficient, parsed.variable, wrongConst);
        },
        // Strategy 3: Sign flip on coefficient
        () => {
          return formatAnswer(-parsed.coefficient, parsed.variable, parsed.constant);
        },
        // Strategy 4: Sign flip on constant
        () => {
          return formatAnswer(parsed.coefficient, parsed.variable, -parsed.constant);
        },
        // Strategy 5: Both wrong
        () => {
          const wrongCoef = parsed.coefficient + randomFrom([-2, -1, 1, 2]);
          const wrongConst = parsed.constant + randomFrom([-3, -1, 1, 3]);
          return formatAnswer(wrongCoef, parsed.variable, wrongConst);
        }
      ];
      
      // Pick random strategy
      const strategy = randomFrom(strategies);
      filler = strategy();
    } else {
      // For pure numbers, use simple offset
      const numAnswer = typeof answer === 'number' ? answer : parseFloat(answer);
      if (isNaN(numAnswer)) {
        // If we can't parse, just use a random number
        filler = randomInt(-20, 20);
      } else {
        const offset = randomFrom([-5, -3, -2, -1, 1, 2, 3, 5]);
        filler = numAnswer + offset;
      }
    }
    
    const fillerCanonical = canonicalForm(filler);
    
    // Validate: must be unique AND actually wrong
    if (!canonicalSet.has(fillerCanonical) && isActuallyWrong(filler, answer)) {
      canonicalSet.add(fillerCanonical);
      uniqueChoices.push(filler);
    }
    
    attempts++;
  }
  
  // Step 4: Fallback if we still don't have 4
  // Use pre-validated safe distractors
  const fallbackDistractors = [-99, -88, -77, 999, 888, 777];
  
  for (const fallback of fallbackDistractors) {
    if (uniqueChoices.length >= 4) break;
    
    const fallbackCanonical = canonicalForm(fallback);
    
    if (!canonicalSet.has(fallbackCanonical) && isActuallyWrong(fallback, answer)) {
      canonicalSet.add(fallbackCanonical);
      uniqueChoices.push(fallback);
    }
  }
  
  // Step 5: Absolute failsafe - ensure we have exactly 4
  // If we STILL don't have 4, pad with obviously wrong values
  while (uniqueChoices.length < 4) {
    const desperate = 9999 + uniqueChoices.length;
    uniqueChoices.push(desperate);
  }
  
  // Step 6: Shuffle (Fisher-Yates)
  const finalChoices = uniqueChoices.slice(0, 4);
  for (let i = finalChoices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [finalChoices[i], finalChoices[j]] = [finalChoices[j], finalChoices[i]];
  }
  
  return finalChoices;
};

// CRITICAL VALIDATION (for testing only - remove in production)
// After calling ensureFourChoices, validate the result:
const validateChoices = (choices, answer) => {
  if (choices.length !== 4) {
    console.error('ensureFourChoices: Did not return exactly 4 choices!', choices);
    return false;
  }
  
  const canonicals = choices.map(c => canonicalForm(c));
  const uniqueCanonicals = new Set(canonicals);
  
  if (uniqueCanonicals.size !== 4) {
    console.error('ensureFourChoices: Duplicate choices detected!', choices, canonicals);
    return false;
  }
  
  const answerCanonical = canonicalForm(answer);
  if (!canonicals.includes(answerCanonical)) {
    console.error('ensureFourChoices: Correct answer not in choices!', answer, choices);
    return false;
  }
  
  return true;
};

// ============================================
// FORMATTING HELPER FOR INTEGER OPERATIONS
// ============================================

/**
 * Format integer operations with proper parentheses for negative in second position
 * Examples: 8 × (-6), -5 ÷ (-3)
 */
const formatIntegerOperation = (num1, op, num2) => {
  if (num2 < 0 && (op === '×' || op === '÷')) {
    return `${num1} ${op} (${num2})`;
  }
  return `${num1} ${op} ${num2}`;
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
      
      // FIXED: Use formatIntegerOperation for proper parentheses
      const problem = formatIntegerOperation(num1, '×', num2);
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
          // FIXED: Enhanced rule
          rule: "Multiplying integers: Same signs = positive result. Different signs = negative result.",
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
  // FIXED: Use formatIntegerOperation for proper parentheses
  const problem = formatIntegerOperation(num1, '×', num2);
  const choices = ensureFourChoices([answer, -answer, Math.abs(num1) * Math.abs(num2), num1 + num2], answer);
  // FIXED: Enhanced rule
  return { problem, displayProblem: `${problem} = ?`, answer, choices, explanation: { originalProblem: problem, steps: [], rule: "Multiplying integers: Same signs = positive result. Different signs = negative result.", finalAnswer: answer }};
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
          // FIXED: Enhanced rule
          rule: "Dividing integers: Same signs = positive result. Different signs = negative result.",
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
  // FIXED: Enhanced rule
  return { problem, displayProblem: `${problem} = ?`, answer, choices, explanation: { originalProblem: problem, steps: [], rule: "Dividing integers: Same signs = positive result. Different signs = negative result.", finalAnswer: answer }};
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
      ? ['a(bx + c)', 'a(c + bx)']
      : ['a(bx + c)', 'a(c + bx)', 'a(bx + c)', 'a(c + bx)'];
    
    const skeleton = randomFrom(skeletons);
    const outside = randomInt(2, 12);
    const varCoef = randomInt(1, maxCoef);
    const constant = randomInt(1, 12);
    
    let problem, answerCoef, answerConst, constantFirst;
    
    if (skeleton === 'a(bx + c)') {
      // Variable first: a(2x + 3) → 6x + 9
      problem = `${outside}(${formatCoefficient(varCoef, variable)} + ${constant})`;
      answerCoef = outside * varCoef;
      answerConst = outside * constant;
      constantFirst = false;
    } else {
      // Constant first: a(3 + 2x) → 9 + 6x
      problem = `${outside}(${constant} + ${formatCoefficient(varCoef, variable)})`;
      answerCoef = outside * varCoef;
      answerConst = outside * constant;
      constantFirst = true;
    }
    
    const signature = generateSignature(levelId, difficulty, { skeleton, outside, varCoef, constant, variable });
    if (!isRecentDuplicate(levelId, difficulty, signature)) {
      recordProblem(levelId, difficulty, signature);
      
      const answer = canonicalizeExpression(answerCoef, variable, answerConst, constantFirst);
      const misconceptions = [
        answer,
        canonicalizeExpression(varCoef, variable, outside * constant, constantFirst),
        canonicalizeExpression(outside * varCoef, variable, constant, constantFirst),
        canonicalizeExpression(outside + varCoef, variable, outside + constant, constantFirst),
        canonicalizeExpression(answerCoef, variable, constant, constantFirst),
      ];
      const choices = ensureFourChoices(misconceptions, answer);
      
      return {
        problem, displayProblem: `Simplify: ${problem}`, answer, choices,
        explanation: {
          originalProblem: problem,
          steps: [
            { description: `Problem: ${problem}`, work: `` },
            { description: `Distribute ${outside} to each term`, work: `${outside} × ${formatCoefficient(varCoef, variable)} = ${formatCoefficient(answerCoef, variable)}` },
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
  const answer = canonicalizeExpression(answerCoef, variable, answerConst, false);
  const problem = `${outside}(${formatCoefficient(varCoef, variable)} + ${constant})`;
  const choices = ensureFourChoices([answer, canonicalizeExpression(varCoef, variable, outside * constant, false), canonicalizeExpression(outside * varCoef, variable, constant, false)], answer);
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
    
    let problem, answerCoef, answerConst, constantFirst;
    
    if (skeleton === 'a(bx - c)') {
      // Variable first: a(2x - 3) → 6x - 9
      problem = `${outside}(${formatCoefficient(varCoef, variable)} - ${constant})`;
      answerCoef = outside * varCoef;
      answerConst = -(outside * constant);
      constantFirst = false;
    } else {
      // Constant first: a(3 - 2x) → 9 - 6x
      problem = `${outside}(${constant} - ${formatCoefficient(varCoef, variable)})`;
      answerCoef = -(outside * varCoef);
      answerConst = outside * constant;
      constantFirst = true;
    }
    
    const signature = generateSignature(levelId, difficulty, { skeleton, outside, varCoef, constant, variable });
    if (!isRecentDuplicate(levelId, difficulty, signature)) {
      recordProblem(levelId, difficulty, signature);
      
      const answer = canonicalizeExpression(answerCoef, variable, answerConst, constantFirst);
      const misconceptions = [
        answer,
        canonicalizeExpression(answerCoef, variable, Math.abs(answerConst), constantFirst),
        canonicalizeExpression(Math.abs(answerCoef), variable, answerConst, constantFirst),
        canonicalizeExpression(outside * varCoef, variable, outside * constant, constantFirst),
        canonicalizeExpression(varCoef, variable, -(outside * constant), constantFirst),
      ];
      const choices = ensureFourChoices(misconceptions, answer);
      
      return {
        problem, displayProblem: `Simplify: ${problem}`, answer, choices,
        explanation: {
          originalProblem: problem,
          steps: [
            { description: `Problem: ${problem}`, work: `` },
            { description: `Distribute ${outside}`, work: `` },
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
  const answer = canonicalizeExpression(answerCoef, variable, answerConst, false);
  const problem = `${outside}(${formatCoefficient(varCoef, variable)} - ${constant})`;
  const choices = ensureFourChoices([answer, canonicalizeExpression(answerCoef, variable, Math.abs(answerConst), false)], answer);
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
    
    let problem, answerCoef, answerConst, constantFirst;
    
    if (skeleton === '-a(bx + c)') {
      // Variable first: -2(3x + 4) → -6x - 8
      problem = `${outside}(${formatCoefficient(varCoef, variable)} + ${constant})`;
      answerCoef = outside * varCoef;
      answerConst = outside * constant;
      constantFirst = false;
    } else if (skeleton === '-a(bx - c)') {
      // Variable first: -2(3x - 4) → -6x + 8
      problem = `${outside}(${formatCoefficient(varCoef, variable)} - ${constant})`;
      answerCoef = outside * varCoef;
      answerConst = -(outside * constant);
      constantFirst = false;
    } else if (skeleton === '-a(c + bx)') {
      // Constant first: -2(4 + 3x) → -8 - 6x
      problem = `${outside}(${constant} + ${formatCoefficient(varCoef, variable)})`;
      answerCoef = outside * varCoef;
      answerConst = outside * constant;
      constantFirst = true;
    } else {
      // Constant first: -2(4 - 3x) → -8 + 6x
      problem = `${outside}(${constant} - ${formatCoefficient(varCoef, variable)})`;
      answerCoef = -(outside * varCoef);
      answerConst = outside * constant;
      constantFirst = true;
    }
    
    const signature = generateSignature(levelId, difficulty, { skeleton, outside, varCoef, constant, variable });
    if (!isRecentDuplicate(levelId, difficulty, signature)) {
      recordProblem(levelId, difficulty, signature);
      
      const answer = canonicalizeExpression(answerCoef, variable, answerConst, constantFirst);
      const misconceptions = [
        answer,
        canonicalizeExpression(-answerCoef, variable, answerConst, constantFirst),
        canonicalizeExpression(answerCoef, variable, -answerConst, constantFirst),
        canonicalizeExpression(-answerCoef, variable, -answerConst, constantFirst),
        canonicalizeExpression(Math.abs(answerCoef), variable, Math.abs(answerConst), constantFirst),
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
  const answer = canonicalizeExpression(answerCoef, variable, answerConst, false);
  const problem = `${outside}(${formatCoefficient(varCoef, variable)} + ${constant})`;
  const choices = ensureFourChoices([answer, canonicalizeExpression(-answerCoef, variable, answerConst, false)], answer);
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
    
    const skeletons = difficulty === 'easy'
      ? ['-(x + c)', '-(bx + c)', 'a(-x + c)', '-a(bx - c)']
      : ['-(x + c)', '-(x - c)', '-(bx + c)', '-(bx - c)', '-(c + bx)', '-(c - bx)', 'a(-x + c)', 'a(-x - c)', 'a(c - bx)', '-a(-x + c)', '-a(-x - c)', '-a(bx - c)', 'a(-bx + c)', 'a(-bx - c)'];
    
    const skeleton = randomFrom(skeletons);
    let outside, varCoef, constant, problem, answerCoef, answerConst, constantFirst;
    
    // Determine constantFirst based on skeleton
    const constantFirstSkeletons = ['-(c + bx)', '-(c - bx)', 'a(c - bx)'];
    constantFirst = constantFirstSkeletons.includes(skeleton);
    
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
      problem = `-(${formatCoefficient(varCoef, variable)} + ${constant})`;
      answerCoef = -varCoef; answerConst = -constant;
    } else if (skeleton === '-(bx - c)') {
      outside = -1; varCoef = randomInt(2, maxCoef); constant = randomInt(1, 12);
      problem = `-(${formatCoefficient(varCoef, variable)} - ${constant})`;
      answerCoef = -varCoef; answerConst = constant;
    } else if (skeleton === '-(c + bx)') {
      outside = -1; varCoef = randomInt(2, maxCoef); constant = randomInt(1, 12);
      problem = `-(${constant} + ${formatCoefficient(varCoef, variable)})`;
      answerCoef = -varCoef; answerConst = -constant;
    } else if (skeleton === '-(c - bx)') {
      outside = -1; varCoef = randomInt(2, maxCoef); constant = randomInt(1, 12);
      problem = `-(${constant} - ${formatCoefficient(varCoef, variable)})`;
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
      problem = `${outside}(${constant} - ${formatCoefficient(varCoef, variable)})`;
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
      problem = `${outside}(${formatCoefficient(varCoef, variable)} - ${constant})`;
      answerCoef = outside * varCoef; answerConst = -outside * constant;
    } else if (skeleton === 'a(-bx + c)') {
      outside = randomInt(2, 12); varCoef = -randomInt(2, maxCoef); constant = randomInt(1, 12);
      problem = `${outside}(${formatCoefficient(varCoef, variable)} + ${constant})`;
      answerCoef = outside * varCoef; answerConst = outside * constant;
    } else {
      outside = randomInt(2, 12); varCoef = -randomInt(2, maxCoef); constant = randomInt(1, 12);
      problem = `${outside}(${formatCoefficient(varCoef, variable)} - ${constant})`;
      answerCoef = outside * varCoef; answerConst = -outside * constant;
    }
    
    const signature = generateSignature(levelId, difficulty, { skeleton, outside, varCoef, constant, variable });
    if (!isRecentDuplicate(levelId, difficulty, signature)) {
      recordProblem(levelId, difficulty, signature);
      
      const answer = canonicalizeExpression(answerCoef, variable, answerConst, constantFirst);
      const misconceptions = [
        answer,
        canonicalizeExpression(-answerCoef, variable, answerConst, constantFirst),
        canonicalizeExpression(answerCoef, variable, -answerConst, constantFirst),
        canonicalizeExpression(-answerCoef, variable, -answerConst, constantFirst),
        canonicalizeExpression(Math.abs(answerCoef), variable, Math.abs(answerConst), constantFirst),
        canonicalizeExpression(answerCoef, variable, 0, constantFirst),
        canonicalizeExpression(0, variable, answerConst, constantFirst),
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
  const answer = canonicalizeExpression(answerCoef, variable, answerConst, false);
  const problem = `-(${variable} + ${constant})`;
  const choices = ensureFourChoices([answer, canonicalizeExpression(1, variable, constant, false), canonicalizeExpression(-1, variable, constant, false)], answer);
  return { problem, displayProblem: `Simplify: ${problem}`, answer, choices, explanation: { originalProblem: problem, steps: [], rule: "Complex distribution", finalAnswer: answer }};
};

export const generateBasicLikeTermsProblem = (difficulty) => {
  const levelId = '1-9';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (difficulty === 'easy') {
      // Skeleton variety: ax + bx OR bx + ax
      const skeletons = ['ax + bx', 'bx + ax'];
      const skeleton = randomFrom(skeletons);
      
      const coef1 = randomInt(1, 20);
      const coef2 = randomInt(1, 20);
      const combined = coef1 + coef2;
      
      const problem = skeleton === 'ax + bx' 
        ? `${formatCoefficient(coef1, 'x')} + ${formatCoefficient(coef2, 'x')}`
        : `${formatCoefficient(coef2, 'x')} + ${formatCoefficient(coef1, 'x')}`;
      const answer = formatCoefficient(combined, 'x');

      const choices = [
        answer,
        `${coef1 + coef2}x²`, // Common error: added exponent
        problem, // Didn't combine
        formatCoefficient(coef1 * coef2, 'x') // Multiplied instead of added
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, coef1, coef2 });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
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
      }
    } else {
      // Hard mode: MIX of decimals and integers
      const useDecimal = Math.random() < 0.5; // 50% chance of decimals
      const coef1 = useDecimal ? randomDecimal() : randomInt(1, 20);
      const coef2 = useDecimal ? randomDecimal() : randomInt(1, 20);
      const combined = Math.round((coef1 + coef2) * 100) / 100;
      const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
      
      // Skeleton variety
      const skeletons = ['av + bv', 'bv + av'];
      const skeleton = randomFrom(skeletons);
      
      const problem = skeleton === 'av + bv'
        ? `${formatCoefficient(coef1, variable)} + ${formatCoefficient(coef2, variable)}`
        : `${formatCoefficient(coef2, variable)} + ${formatCoefficient(coef1, variable)}`;
      const answer = formatCoefficient(combined, variable);

      const choices = [
        answer,
        problem, // Didn't combine
        formatCoefficient(Math.round((coef1 * coef2) * 100) / 100, variable), // Multiplied
        `${combined}${variable}²` // Added exponent
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, coef1, coef2, variable });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
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
    }
  }
  
  // Fallback after max retries
  const coef1 = randomInt(1, 20);
  const coef2 = randomInt(1, 20);
  const combined = coef1 + coef2;
  const answer = formatCoefficient(combined, 'x');
  const problem = `${formatCoefficient(coef1, 'x')} + ${formatCoefficient(coef2, 'x')}`;
  const choices = ensureFourChoices([answer, `${coef1 + coef2}x²`, problem, formatCoefficient(coef1 * coef2, 'x')], answer);
  return {
    problem, displayProblem: problem, answer, choices,
    explanation: { originalProblem: problem, steps: [{ description: `Combine like terms`, work: answer }], rule: "Like terms", finalAnswer: answer }
  };
};

// ============================================
// LEVEL 1-10: COUNT INVENTORY (Unlike Terms)
// ============================================

export const generateUnlikeTermsProblem = (difficulty) => {
  const levelId = '1-10';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (difficulty === 'easy') {
      // Skeleton variety: ax + c OR c + ax (constant-first)
      const skeletons = ['ax + c', 'c + ax'];
      const skeleton = randomFrom(skeletons);
      
      const coefX = randomInt(1, 20);
      const constant = randomInt(1, 20);
      
      const problem = skeleton === 'ax + c'
        ? `${formatCoefficient(coefX, 'x')} + ${constant}`
        : `${constant} + ${formatCoefficient(coefX, 'x')}`;
      const answer = problem; // Cannot combine - leave as is

      const choices = [
        answer,
        formatCoefficient(coefX + constant, 'x'), // Tried to combine unlike terms
        `${formatCoefficient(coefX, 'x')} × ${constant}`, // Multiplied (readable form)
        `${coefX + constant}` // Lost variable
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, coefX, constant });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
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
              { description: `${formatCoefficient(coefX, 'x')} and ${constant} are NOT like terms`, work: `` },
              { description: `One has a variable (x), one doesn't`, work: `` },
              { description: `CANNOT combine - leave as is`, work: `${answer}` }
            ],
            rule: "UNLIKE TERMS: Different variables OR one has variable and one doesn't. CANNOT be combined!",
            finalAnswer: answer
          }
        };
      }
    } else {
      // Hard mode: MIX of decimals and integers
      const useDecimal = Math.random() < 0.5;
      const coefX = useDecimal ? randomDecimal() : randomInt(1, 20);
      const coefY = useDecimal ? randomDecimal() : randomInt(1, 20);
      const varX = randomFrom(['x', 'a', 'n']);
      const varY = randomFrom(['y', 'b', 'm']);
      
      // Skeleton variety
      const skeletons = ['xvar + yvar', 'yvar + xvar'];
      const skeleton = randomFrom(skeletons);
      
      const problem = skeleton === 'xvar + yvar'
        ? `${formatCoefficient(coefX, varX)} + ${formatCoefficient(coefY, varY)}`
        : `${formatCoefficient(coefY, varY)} + ${formatCoefficient(coefX, varX)}`;
      const answer = problem; // Cannot combine

      const choices = [
        answer,
        formatCoefficient(Math.round((coefX + coefY) * 100) / 100, varX), // Combined to one var
        `${Math.round((coefX + coefY) * 100) / 100}${varX}${varY}`, // Combined with both vars
        `${formatCoefficient(coefX, varX)} × ${formatCoefficient(coefY, varY)}` // Multiplied (readable)
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, coefX, coefY, varX, varY });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
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
    }
  }
  
  // Fallback
  const coefX = randomInt(1, 20);
  const constant = randomInt(1, 20);
  const answer = `${formatCoefficient(coefX, 'x')} + ${constant}`;
  const choices = ensureFourChoices([answer, formatCoefficient(coefX + constant, 'x'), `${coefX + constant}`], answer);
  return {
    problem: answer, displayProblem: answer, answer, choices,
    explanation: { originalProblem: answer, steps: [], rule: "Unlike terms", finalAnswer: answer }
  };
};

// ============================================
// LEVEL 1-11: SORT SUPPLIES (Multiple Like Terms)
// ============================================

export const generateMultipleLikeTermsProblem = (difficulty) => {
  const levelId = '1-11';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (difficulty === 'easy') {
      // Skeleton variety: different orderings of ax + bx + c
      const skeletons = ['ax + bx + c', 'c + ax + bx', 'ax + c + bx'];
      const skeleton = randomFrom(skeletons);
      
      const coef1 = randomInt(1, 20);
      const coef2 = randomInt(1, 20);
      const coef3 = randomInt(1, 20);
      
      const xTerms = coef1 + coef2;
      const constant = coef3;
      
      // Build problem based on skeleton (different orderings)
      let problem;
      if (skeleton === 'ax + bx + c') {
        problem = `${formatCoefficient(coef1, 'x')} + ${formatCoefficient(coef2, 'x')} + ${constant}`;
      } else if (skeleton === 'c + ax + bx') {
        problem = `${constant} + ${formatCoefficient(coef1, 'x')} + ${formatCoefficient(coef2, 'x')}`;
      } else {
        problem = `${formatCoefficient(coef1, 'x')} + ${constant} + ${formatCoefficient(coef2, 'x')}`;
      }
      
      // Answer always canonical: xTerms x + constant
      const answer = `${formatCoefficient(xTerms, 'x')} + ${constant}`;

      const choices = [
        answer,
        formatCoefficient(coef1 + coef2 + coef3, 'x'), // Combined all
        `${formatCoefficient(coef1, 'x')} + ${coef2 + coef3}`, // Combined wrong terms
        `${formatCoefficient(xTerms, 'x')} × ${constant}` // Multiplied (readable)
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, coef1, coef2, coef3 });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
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
              { description: `Identify like terms: ${formatCoefficient(coef1, 'x')} and ${formatCoefficient(coef2, 'x')} are LIKE`, work: `` },
              { description: `${constant} is UNLIKE (no variable)`, work: `` },
              { description: `Combine like terms: ${coef1} + ${coef2} = ${xTerms}`, work: `` },
              { description: `Keep unlike term separate`, work: `${answer}` }
            ],
            rule: "Only combine LIKE terms. Leave unlike terms separate.",
            finalAnswer: answer
          }
        };
      }
    } else {
      // Hard mode: MIX decimals and integers
      const useDecimalX = Math.random() < 0.5;
      const useDecimalY = Math.random() < 0.5;
      
      const coefX1 = useDecimalX ? randomDecimal() : randomInt(1, 20);
      const coefX2 = useDecimalX ? randomDecimal() : randomInt(1, 20);
      const coefY = useDecimalY ? randomDecimal() : randomInt(1, 20);
      const constant = randomInt(1, 20);
      
      const xTerms = Math.round((coefX1 + coefX2) * 100) / 100;
      
      // Skeleton variety: different orderings
      const skeletons = ['ax + bx + cy + d', 'd + ax + bx + cy', 'ax + cy + bx + d'];
      const skeleton = randomFrom(skeletons);
      
      let problem;
      if (skeleton === 'ax + bx + cy + d') {
        problem = `${formatCoefficient(coefX1, 'x')} + ${formatCoefficient(coefX2, 'x')} + ${formatCoefficient(coefY, 'y')} + ${constant}`;
      } else if (skeleton === 'd + ax + bx + cy') {
        problem = `${constant} + ${formatCoefficient(coefX1, 'x')} + ${formatCoefficient(coefX2, 'x')} + ${formatCoefficient(coefY, 'y')}`;
      } else {
        problem = `${formatCoefficient(coefX1, 'x')} + ${formatCoefficient(coefY, 'y')} + ${formatCoefficient(coefX2, 'x')} + ${constant}`;
      }
      
      // Answer always canonical: x terms, then y, then constant
      const answer = `${formatCoefficient(xTerms, 'x')} + ${formatCoefficient(coefY, 'y')} + ${constant}`;

      const choices = [
        answer,
        `${xTerms + coefY + constant}xy`, // Combined all into xy
        `${formatCoefficient(xTerms, 'x')} + ${coefY + constant}y`, // Combined y and constant
        `${formatCoefficient(Math.round((coefX1 + coefX2 + constant) * 100) / 100, 'x')} + ${formatCoefficient(coefY, 'y')}` // Combined x and constant
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, coefX1, coefX2, coefY, constant });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
        const finalChoices = ensureFourChoices(choices, answer);

        return {
          problem: problem,
          displayProblem: problem,
          answer: answer,
          choices: finalChoices,
          explanation: {
            originalProblem: problem,
            steps: [
              { description: `Combine x terms: ${coefX1} + ${coefX2} = ${xTerms}`, work: `` },
              { description: `y term stays: ${formatCoefficient(coefY, 'y')}`, work: `` },
              { description: `Constant stays: ${constant}`, work: `` },
              { description: `Result`, work: `${answer}` }
            ],
            rule: "Combine all like terms separately",
            finalAnswer: answer
          }
        };
      }
    }
  }
  
  // Fallback
  const coef1 = randomInt(1, 20);
  const coef2 = randomInt(1, 20);
  const constant = randomInt(1, 20);
  const xTerms = coef1 + coef2;
  const answer = `${formatCoefficient(xTerms, 'x')} + ${constant}`;
  const problem = `${formatCoefficient(coef1, 'x')} + ${formatCoefficient(coef2, 'x')} + ${constant}`;
  const choices = ensureFourChoices([answer, formatCoefficient(coef1 + coef2 + constant, 'x')], answer);
  return {
    problem, displayProblem: problem, answer, choices,
    explanation: { originalProblem: problem, steps: [], rule: "Combine like terms", finalAnswer: answer }
  };
};

// ============================================
// LEVEL 1-12: PACK IT UP (Subtraction of Like Terms)
// ============================================

export const generateSubtractLikeTermsProblem = (difficulty) => {
  const levelId = '1-12';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (difficulty === 'easy') {
      // Skeleton variety: ax - bx, bx - ax, ax + (-bx), (-bx) + ax
      const skeletons = ['ax - bx', 'bx - ax', 'ax + (-bx)'];
      const skeleton = randomFrom(skeletons);
      
      let coef1, coef2, combined, problem;
      
      if (skeleton === 'ax - bx') {
        coef1 = randomInt(2, 20);  // Ensure coef1 > coef2 for positive result
        coef2 = randomInt(1, coef1 - 1);
        combined = coef1 - coef2;
        problem = `${formatCoefficient(coef1, 'x')} - ${formatCoefficient(coef2, 'x')}`;
      } else if (skeleton === 'bx - ax') {
        coef1 = randomInt(2, 20);
        coef2 = randomInt(1, coef1 - 1);
        combined = coef2 - coef1;  // Negative result
        problem = `${formatCoefficient(coef2, 'x')} - ${formatCoefficient(coef1, 'x')}`;
      } else { // ax + (-bx)
        coef1 = randomInt(2, 20);
        coef2 = randomInt(1, coef1 - 1);
        combined = coef1 - coef2;
        problem = `${formatCoefficient(coef1, 'x')} + (${formatCoefficient(-coef2, 'x')})`;
      }
      
      const answer = formatCoefficient(combined, 'x');

      const choices = [
  answer,
  formatCoefficient(Math.abs(coef1) + Math.abs(coef2), 'x'), // Added instead of subtracted
  formatCoefficient(coef1, 'x'), // Didn't combine at all - just first term
  formatCoefficient(-combined, 'x') // Wrong sign
];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, coef1, coef2 });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
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
              { description: `Subtract coefficients: ${Math.abs(coef1)} - ${Math.abs(coef2)} = ${Math.abs(combined)}`, work: `` },
              { description: `Keep the variable and sign`, work: `${answer}` }
            ],
            rule: "Subtracting like terms: subtract coefficients, keep variable",
            finalAnswer: answer
          }
        };
      }
    } else {
      // Hard mode: MIX decimals, multiple skeletons, include subtraction with constants
      const useDecimal = Math.random() < 0.5;
      const skeletons = ['ax - bx - c', 'ax - bx + c', 'c + ax - bx', 'ax - c - bx'];
      const skeleton = randomFrom(skeletons);
      
      const coef1 = useDecimal ? randomDecimal() : randomInt(2, 20);
      const coef2 = useDecimal ? randomDecimal() : randomInt(1, Math.floor(coef1));
      const coef3 = randomInt(1, 20);
      const combined = Math.round((coef1 - coef2) * 100) / 100;
      
      let problem, answer;
      
      if (skeleton === 'ax - bx - c') {
        problem = `${formatCoefficient(coef1, 'x')} - ${formatCoefficient(coef2, 'x')} - ${coef3}`;
        answer = `${formatCoefficient(combined, 'x')} - ${coef3}`;
      } else if (skeleton === 'ax - bx + c') {
        problem = `${formatCoefficient(coef1, 'x')} - ${formatCoefficient(coef2, 'x')} + ${coef3}`;
        answer = `${formatCoefficient(combined, 'x')} + ${coef3}`;
      } else if (skeleton === 'c + ax - bx') {
        problem = `${coef3} + ${formatCoefficient(coef1, 'x')} - ${formatCoefficient(coef2, 'x')}`;
        answer = `${formatCoefficient(combined, 'x')} + ${coef3}`;  // Canonical: x terms first
      } else { // ax - c - bx
        problem = `${formatCoefficient(coef1, 'x')} - ${coef3} - ${formatCoefficient(coef2, 'x')}`;
        answer = `${formatCoefficient(combined, 'x')} - ${coef3}`;  // Canonical: x terms first
      }

      const choices = [
        answer,
        skeleton.includes('- c') 
          ? `${formatCoefficient(combined, 'x')} + ${coef3}` 
          : `${formatCoefficient(combined, 'x')} - ${coef3}`, // Wrong sign on constant
        formatCoefficient(Math.round((coef1 - coef2 - coef3) * 100) / 100, 'x'), // Combined all
        formatCoefficient(Math.round((combined + coef3) * 100) / 100, 'x') // Combined x and constant
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, coef1, coef2, coef3 });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
        const finalChoices = ensureFourChoices(choices, answer);

        return {
          problem: problem,
          displayProblem: problem,
          answer: answer,
          choices: finalChoices,
          explanation: {
            originalProblem: problem,
            steps: [
              { description: `Combine x terms: ${coef1} - ${coef2} = ${combined}`, work: `` },
              { description: `Constant stays separate`, work: `` },
              { description: `Result`, work: `${answer}` }
            ],
            rule: "Combine like terms, keep unlike terms separate",
            finalAnswer: answer
          }
        };
      }
    }
  }
  
  // Fallback
  const coef1 = randomInt(2, 20);
  const coef2 = randomInt(1, coef1 - 1);
  const combined = coef1 - coef2;
  const answer = formatCoefficient(combined, 'x');
  const problem = `${formatCoefficient(coef1, 'x')} - ${formatCoefficient(coef2, 'x')}`;
  const choices = ensureFourChoices([answer, formatCoefficient(coef1 + coef2, 'x'), formatCoefficient(-combined, 'x')], answer);
  return {
    problem, displayProblem: problem, answer, choices,
    explanation: { originalProblem: problem, steps: [], rule: "Subtract like terms", finalAnswer: answer }
  };
};

// ============================================
// STAGED WORKFLOW HELPERS (for Levels 13-16)
// ============================================

// Build Row 1 terms for distribute-then-combine workflow
// Returns terms in the order students should see them (distributed, not yet combined)
const buildRow1Terms = ({
  outside,
  variable,
  insideConst,
  insideOp = '+',
  standaloneCoef = 0,
  trailingConst = 0
}) => {
  const terms = [];
  
  // Distribute to variable term (coefficient assumed 1 inside parentheses for L13-16)
  const distVarCoef = outside * 1;
  terms.push(formatCoefficient(distVarCoef, variable));
  
  // Distribute to constant inside parentheses
  const distConst = insideOp === '-' ? outside * (-insideConst) : outside * insideConst;
  terms.push(String(distConst));
  
  // Standalone variable term after parentheses
  if (standaloneCoef !== 0) {
    terms.push(formatCoefficient(standaloneCoef, variable));
  }
  
  // Trailing constant
  if (trailingConst !== 0) {
    terms.push(String(trailingConst));
  }
  
  return terms;
};

// Build term bank with correct terms + misconception distractors
// IMPORTANT: No equivalents of correct terms (Option B from requirements)
const buildTermBank = ({ correctTerms, distractorTerms, padTo = 10 }) => {
  const bank = [];
  const seen = new Set();
  
  const add = (term) => {
    if (!term) return;
    const s = String(term).trim();
    if (!s) return;
    // Use enhanced equivalence to prevent duplicates
    const isDuplicate = bank.some(existing => areEquivalent(s, existing));
    if (isDuplicate) return;
    seen.add(s);
    bank.push(s);
  };
  
  // Add correct terms first
  correctTerms.forEach(add);
  
  // Add distractors
  (distractorTerms || []).forEach(add);
  
  // Pad with random integers (checking for equivalents)
  while (bank.length < padTo) {
    const v = randomInt(1, 60) * (Math.random() < 0.5 ? -1 : 1);
    add(formatWithSign(v));
  }
  
  return bank;
};

// Create two-row staged specification
const makeStagedSpec = ({ row1Terms, row2Answer, row1Bank, row2Choices }) => ({
  mode: 'distribute_then_combine',
  rows: [
    {
      id: 'row1_distribute',
      prompt: 'Distribute (expand) first.',
      blanks: row1Terms.length,
      expected: row1Terms,
      bank: row1Bank
    },
    {
      id: 'row2_combine',
      prompt: 'Now combine like terms to finish.',
      blanks: 1,
      expected: [row2Answer],
      choices: row2Choices
    }
  ]
});

// ============================================
// PHASE 5: SIMPLIFYING EXPRESSIONS (Levels 13-16)
// Copy these 4 functions and paste them BEFORE the EXPORTS section
// ============================================

// ============================================
// LEVEL 1-13: MOUNTAIN BASE (Distribute then Combine)
// ============================================

export const generateDistributeCombineProblem = (difficulty) => {
  const levelId = '1-13';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (difficulty === 'easy') {
      const skeletons = ['a(x+b)+cx', 'cx+a(x+b)', 'a(x+b)+cx'];
      const skeleton = randomFrom(skeletons);
      
      const outside = randomInt(2, 12);
      const insideTerm = randomInt(1, 12);
      const standaloneTerm = randomInt(1, 12);
      
      const distributedCoef = outside;
      const distributedConstant = outside * insideTerm;
      const totalXCoef = distributedCoef + standaloneTerm;
      
      let problem;
      if (skeleton === 'cx+a(x+b)') {
        problem = `${formatCoefficient(standaloneTerm, 'x')} + ${outside}(x + ${insideTerm})`;
      } else {
        problem = `${outside}(x + ${insideTerm}) + ${formatCoefficient(standaloneTerm, 'x')}`;
      }
      
      const answer = canonicalizeExpression(totalXCoef, 'x', distributedConstant, false);
      const misconceptions = [
        answer,
        canonicalizeExpression(distributedCoef, 'x', distributedConstant + standaloneTerm, false),
        canonicalizeExpression(totalXCoef, 'x', insideTerm, false),
        canonicalizeExpression(outside + standaloneTerm, 'x', distributedConstant, false)
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, outside, insideTerm, standaloneTerm });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
        const choices = ensureFourChoices(misconceptions, answer);
        const row1Terms = buildRow1Terms({ outside, variable: 'x', insideConst: insideTerm, insideOp: '+', standaloneCoef: standaloneTerm });
        const row1Bank = buildTermBank({
          correctTerms: row1Terms,
          distractorTerms: [formatCoefficient(outside, 'x'), String(insideTerm), formatCoefficient(standaloneTerm + outside, 'x'), String(distributedConstant + insideTerm)],
          padTo: 12
        });
        const staged = makeStagedSpec({ row1Terms, row2Answer: answer, row1Bank, row2Choices: choices });
        
        return {
          problem, displayProblem: problem, answer, choices, staged,
          explanation: {
            originalProblem: problem,
            steps: [
              { description: `Distribute ${outside}`, work: `${formatCoefficient(distributedCoef, 'x')} + ${distributedConstant}` },
              { description: `Combine like terms`, work: answer }
            ],
            rule: "Distribute → Combine",
            finalAnswer: answer
          }
        };
      }
    } else {
      const skeletons = ['a(v+b)+cv', 'cv+a(v+b)', 'a(v+b)+cv-d', 'a(v+b)-cv'];
      const skeleton = randomFrom(skeletons);
      
      const outside = randomInt(2, 12);
      const insideTerm = randomInt(1, 12);
      const standaloneMag = randomInt(1, 12);
      const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
      
      let standaloneCoef, problem, trailingConst = 0;
      if (skeleton === 'a(v+b)+cv-d') {
        standaloneCoef = standaloneMag;
        trailingConst = -randomInt(1, 12);
        problem = `${outside}(${variable} + ${insideTerm}) + ${formatCoefficient(standaloneCoef, variable)} - ${Math.abs(trailingConst)}`;
      } else if (skeleton === 'a(v+b)-cv') {
        standaloneCoef = -standaloneMag;
        problem = `${outside}(${variable} + ${insideTerm}) - ${formatCoefficient(standaloneMag, variable)}`;
      } else if (skeleton === 'cv+a(v+b)') {
        standaloneCoef = standaloneMag;
        problem = `${formatCoefficient(standaloneCoef, variable)} + ${outside}(${variable} + ${insideTerm})`;
      } else {
        standaloneCoef = standaloneMag;
        problem = `${outside}(${variable} + ${insideTerm}) + ${formatCoefficient(standaloneCoef, variable)}`;
      }
      
      const distributedCoef = outside;
      const distributedConstant = outside * insideTerm;
      const totalCoef = distributedCoef + standaloneCoef;
      const totalConstant = distributedConstant + trailingConst;
      
      const answer = totalConstant !== 0 ? canonicalizeExpression(totalCoef, variable, totalConstant, false) : formatCoefficient(totalCoef, variable);
      const misconceptions = [
        answer,
        totalConstant !== 0 ? canonicalizeExpression(distributedCoef, variable, totalConstant, false) : formatCoefficient(distributedCoef, variable),
        totalConstant !== 0 ? canonicalizeExpression(totalCoef, variable, insideTerm, false) : formatCoefficient(totalCoef, variable),
        totalConstant !== 0 ? canonicalizeExpression(outside + standaloneCoef, variable, distributedConstant, false) : formatCoefficient(outside + standaloneCoef, variable)
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, outside, insideTerm, standaloneMag, variable });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
        const choices = ensureFourChoices(misconceptions, answer);
        const row1Terms = buildRow1Terms({ outside, variable, insideConst: insideTerm, insideOp: '+', standaloneCoef, trailingConst });
        const row1Bank = buildTermBank({
          correctTerms: row1Terms,
          distractorTerms: [formatCoefficient(outside, variable), String(insideTerm), String(distributedConstant + (trailingConst || 0))],
          padTo: 14
        });
        const staged = makeStagedSpec({ row1Terms, row2Answer: answer, row1Bank, row2Choices: choices });
        
        return { problem, displayProblem: problem, answer, choices, staged, explanation: { originalProblem: problem, steps: [], rule: "Distribute → Combine", finalAnswer: answer } };
      }
    }
  }
  
  const outside = randomInt(2, 12), insideTerm = randomInt(1, 12), standaloneTerm = randomInt(1, 12);
  const answer = canonicalizeExpression(outside + standaloneTerm, 'x', outside * insideTerm, false);
  const problem = `${outside}(x + ${insideTerm}) + ${formatCoefficient(standaloneTerm, 'x')}`;
  const choices = ensureFourChoices([answer], answer);
  const row1Terms = buildRow1Terms({ outside, variable: 'x', insideConst: insideTerm, insideOp: '+', standaloneCoef: standaloneTerm });
  const row1Bank = buildTermBank({ correctTerms: row1Terms, distractorTerms: [], padTo: 10 });
  const staged = makeStagedSpec({ row1Terms, row2Answer: answer, row1Bank, row2Choices: choices });
  return { problem, displayProblem: problem, answer, choices, staged, explanation: { originalProblem: problem, steps: [], rule: "Distribute → Combine", finalAnswer: answer } };
};

// ============================================
// LEVEL 1-14: STEEP CLIMB (Distribute with Subtraction)
// ============================================

export const generateDistributeSubtractProblem = (difficulty) => {
  const levelId = '1-14';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (difficulty === 'easy') {
      const skeletons = ['a(x-b)+cx', 'a(x+b)-cx', 'cx+a(x-b)'];
      const skeleton = randomFrom(skeletons);
      
      const outside = randomInt(2, 12);
      const insideTerm = randomInt(1, 12);
      const standaloneTerm = randomInt(1, 12);
      
      let problem, insideOp, standaloneCoef;
      
      if (skeleton === 'a(x-b)+cx') {
        insideOp = '-';
        standaloneCoef = standaloneTerm;
        problem = `${outside}(x - ${insideTerm}) + ${formatCoefficient(standaloneTerm, 'x')}`;
      } else if (skeleton === 'a(x+b)-cx') {
        insideOp = '+';
        standaloneCoef = -standaloneTerm;
        problem = `${outside}(x + ${insideTerm}) - ${formatCoefficient(standaloneTerm, 'x')}`;
      } else {
        insideOp = '-';
        standaloneCoef = standaloneTerm;
        problem = `${formatCoefficient(standaloneTerm, 'x')} + ${outside}(x - ${insideTerm})`;
      }
      
      const distributedCoef = outside;
      const distributedConstant = insideOp === '-' ? -(outside * insideTerm) : (outside * insideTerm);
      const totalXCoef = distributedCoef + standaloneCoef;
      
      const answer = formatAnswer(totalXCoef, 'x', distributedConstant);
      const misconceptions = [
        answer,
        formatAnswer(totalXCoef, 'x', -distributedConstant),
        formatAnswer(totalXCoef, 'x', insideTerm),
        formatAnswer(distributedCoef, 'x', distributedConstant)
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, outside, insideTerm, standaloneTerm });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
        const choices = ensureFourChoices(misconceptions, answer);
        const row1Terms = buildRow1Terms({ outside, variable: 'x', insideConst: insideTerm, insideOp, standaloneCoef });
        const row1Bank = buildTermBank({
          correctTerms: row1Terms,
          distractorTerms: [formatCoefficient(outside, 'x'), String(insideTerm), String(-distributedConstant), formatCoefficient(totalXCoef, 'x')],
          padTo: 12
        });
        const staged = makeStagedSpec({ row1Terms, row2Answer: answer, row1Bank, row2Choices: choices });
        
        return {
          problem, displayProblem: problem, answer, choices, staged,
          explanation: {
            originalProblem: problem,
            steps: [
              { description: `Distribute ${outside}`, work: `` },
              { description: `Combine like terms`, work: answer }
            ],
            rule: "Watch signs when distributing with subtraction",
            finalAnswer: answer
          }
        };
      }
    } else {
      const skeletons = ['a(v-b)+cv', 'a(v+b)-cv', 'cv-a(v-b)', 'a(v-b)-cv'];
      const skeleton = randomFrom(skeletons);
      
      const outside = randomInt(2, 12);
      const insideTerm = randomInt(1, 12);
      const standaloneMag = randomInt(1, 12);
      const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
      
      let problem, insideOp, standaloneCoef;
      
      if (skeleton === 'a(v-b)+cv') {
        insideOp = '-';
        standaloneCoef = standaloneMag;
        problem = `${outside}(${variable} - ${insideTerm}) + ${formatCoefficient(standaloneMag, variable)}`;
      } else if (skeleton === 'a(v+b)-cv') {
        insideOp = '+';
        standaloneCoef = -standaloneMag;
        problem = `${outside}(${variable} + ${insideTerm}) - ${formatCoefficient(standaloneMag, variable)}`;
      } else if (skeleton === 'cv-a(v-b)') {
        insideOp = '-';
        standaloneCoef = standaloneMag;
        problem = `${formatCoefficient(standaloneMag, variable)} - ${outside}(${variable} - ${insideTerm})`;
      } else {
        insideOp = '-';
        standaloneCoef = -standaloneMag;
        problem = `${outside}(${variable} - ${insideTerm}) - ${formatCoefficient(standaloneMag, variable)}`;
      }
      
      const distributedCoef = outside;
      const distributedConstant = insideOp === '-' ? -(outside * insideTerm) : (outside * insideTerm);
      const totalCoef = distributedCoef + standaloneCoef;
      
      const answer = formatAnswer(totalCoef, variable, distributedConstant);
      const misconceptions = [
        answer,
        formatAnswer(totalCoef, variable, -distributedConstant),
        formatAnswer(distributedCoef, variable, distributedConstant),
        formatAnswer(totalCoef, variable, insideTerm)
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, outside, insideTerm, standaloneMag, variable });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
        const choices = ensureFourChoices(misconceptions, answer);
        const row1Terms = buildRow1Terms({ outside, variable, insideConst: insideTerm, insideOp, standaloneCoef });
        const row1Bank = buildTermBank({
          correctTerms: row1Terms,
          distractorTerms: [formatCoefficient(outside, variable), String(insideTerm), String(-distributedConstant)],
          padTo: 14
        });
        const staged = makeStagedSpec({ row1Terms, row2Answer: answer, row1Bank, row2Choices: choices });
        
        return { problem, displayProblem: problem, answer, choices, staged, explanation: { originalProblem: problem, steps: [], rule: "Distribute → Combine", finalAnswer: answer } };
      }
    }
  }
  
  const outside = randomInt(2, 12), insideTerm = randomInt(1, 12), standaloneTerm = randomInt(1, 12);
  const answer = formatAnswer(outside + standaloneTerm, 'x', -(outside * insideTerm));
  const problem = `${outside}(x - ${insideTerm}) + ${formatCoefficient(standaloneTerm, 'x')}`;
  const choices = ensureFourChoices([answer], answer);
  const row1Terms = buildRow1Terms({ outside, variable: 'x', insideConst: insideTerm, insideOp: '-', standaloneCoef: standaloneTerm });
  const row1Bank = buildTermBank({ correctTerms: row1Terms, distractorTerms: [], padTo: 10 });
  const staged = makeStagedSpec({ row1Terms, row2Answer: answer, row1Bank, row2Choices: choices });
  return { problem, displayProblem: problem, answer, choices, staged, explanation: { originalProblem: problem, steps: [], rule: "Distribute → Combine", finalAnswer: answer } };
};


// ============================================
// LEVEL 1-15: ROCKY LEDGE (Negative Outside)
// ============================================

export const generateNegativeDistributeCombineProblem = (difficulty) => {
  const levelId = '1-15';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (difficulty === 'easy') {
      const skeletons = ['-a(x+b)+cx', '-a(x-b)+cx', 'cx-a(x+b)'];
      const skeleton = randomFrom(skeletons);
      
      const outsideMag = randomInt(2, 12);
      const outside = -outsideMag;
      const insideTerm = randomInt(1, 12);
      const standaloneTerm = randomInt(1, 12);
      
      let problem, insideOp, standaloneCoef;
      
      if (skeleton === '-a(x+b)+cx') {
        insideOp = '+';
        standaloneCoef = standaloneTerm;
        problem = `${outside}(x + ${insideTerm}) + ${formatCoefficient(standaloneTerm, 'x')}`;
      } else if (skeleton === '-a(x-b)+cx') {
        insideOp = '-';
        standaloneCoef = standaloneTerm;
        problem = `${outside}(x - ${insideTerm}) + ${formatCoefficient(standaloneTerm, 'x')}`;
      } else {
        insideOp = '+';
        standaloneCoef = standaloneTerm;
        problem = `${formatCoefficient(standaloneTerm, 'x')} ${outside}(x + ${insideTerm})`;
      }
      
      const distributedCoef = outside;
      const distributedConstant = insideOp === '-' ? outside * (-insideTerm) : outside * insideTerm;
      const totalXCoef = distributedCoef + standaloneCoef;
      
      const answer = formatAnswer(totalXCoef, 'x', distributedConstant);
           const misconceptions = [
        answer,
        canonicalizeExpression(distributedCoef, 'x', distributedConstant + standaloneTerm, false), // Combined wrong terms
        canonicalizeExpression(totalXCoef, 'x', insideTerm, false), // Used inside constant instead of distributed
        canonicalizeExpression(-distributedCoef, 'x', distributedConstant, false), // Flipped only variable coefficient
        canonicalizeExpression(distributedCoef, 'x', -distributedConstant, false) // Flipped only constant
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, outsideMag, insideTerm, standaloneTerm });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
        const choices = ensureFourChoices(misconceptions, answer);
        const row1Terms = buildRow1Terms({ outside, variable: 'x', insideConst: insideTerm, insideOp, standaloneCoef });
        const row1Bank = buildTermBank({
          correctTerms: row1Terms,
                   distractorTerms: [formatWithSign(formatCoefficient(-outside, 'x')), formatWithSign(-distributedConstant), formatWithSign(formatCoefficient(standaloneTerm - outside, 'x'))],
        padTo: 12
        });
        const staged = makeStagedSpec({ row1Terms, row2Answer: answer, row1Bank, row2Choices: choices });
        
        return {
          explanation: {
            originalProblem: problem,
            steps: [
              { description: `Distribute ${outside}`, work: row1Terms.join(' ') },
              { description: 'Combine like terms', work: answer }
            ],
            rule: "Negative outside flips ALL signs inside: -(a + b) = -a - b",
            finalAnswer: answer
          }
      }
    } else {
      const skeletons = ['-a(v+b)+cv', '-a(v-b)+cv', 'cv-a(v+b)', '-a(v+b)-cv'];
      const skeleton = randomFrom(skeletons);
      
      const outsideMag = randomInt(2, 12);
      const outside = -outsideMag;
      const insideTerm = randomInt(1, 12);
      const standaloneMag = randomInt(1, 12);
      const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
      
      let problem, insideOp, standaloneCoef;
      
      if (skeleton === '-a(v+b)+cv') {
        insideOp = '+';
        standaloneCoef = standaloneMag;
        problem = `${outside}(${variable} + ${insideTerm}) + ${formatCoefficient(standaloneMag, variable)}`;
      } else if (skeleton === '-a(v-b)+cv') {
        insideOp = '-';
        standaloneCoef = standaloneMag;
        problem = `${outside}(${variable} - ${insideTerm}) + ${formatCoefficient(standaloneMag, variable)}`;
      } else if (skeleton === 'cv-a(v+b)') {
        insideOp = '+';
        standaloneCoef = standaloneMag;
        problem = `${formatCoefficient(standaloneMag, variable)} ${outside}(${variable} + ${insideTerm})`;
      } else {
        insideOp = '+';
        standaloneCoef = -standaloneMag;
        problem = `${outside}(${variable} + ${insideTerm}) - ${formatCoefficient(standaloneMag, variable)}`;
      }
      
      const distributedCoef = outside;
      const distributedConstant = insideOp === '-' ? outside * (-insideTerm) : outside * insideTerm;
      const totalCoef = distributedCoef + standaloneCoef;
      
      const answer = formatAnswer(totalCoef, variable, distributedConstant);
      const misconceptions = [
        answer,
        formatAnswer(-distributedCoef + standaloneCoef, variable, distributedConstant),
        formatAnswer(totalCoef, variable, -distributedConstant),
        formatAnswer(Math.abs(distributedCoef) + standaloneCoef, variable, Math.abs(distributedConstant))
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, outsideMag, insideTerm, standaloneMag, variable });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
        const choices = ensureFourChoices(misconceptions, answer);
        const row1Terms = buildRow1Terms({ outside, variable, insideConst: insideTerm, insideOp, standaloneCoef });
        const row1Bank = buildTermBank({
          correctTerms: row1Terms,
          distractorTerms: [formatCoefficient(-outside, variable), String(-distributedConstant), formatCoefficient(standaloneMag, variable)],
          padTo: 14
        });
        const staged = makeStagedSpec({ row1Terms, row2Answer: answer, row1Bank, row2Choices: choices });
        
        const fallbackRow1 = [formatWithSign(formatCoefficient(-2, 'x')), formatWithSign(-4), formatWithSign(formatCoefficient(standaloneTerm, 'x'))];
        return { problem, displayProblem: problem, answer, choices, staged, explanation: { originalProblem: problem, steps: [{ description: 'Distribute -2', work: fallbackRow1.join(' ') }, { description: 'Combine like terms', work: answer }], rule: "Negative outside flips ALL signs inside: -(a + b) = -a - b", finalAnswer: answer } };
        
      }
    }
  }
  
  const outside = -randomInt(2, 12), insideTerm = randomInt(1, 12), standaloneTerm = randomInt(1, 12);
  const answer = formatAnswer(outside + standaloneTerm, 'x', outside * insideTerm);
  const problem = `${outside}(x + ${insideTerm}) + ${formatCoefficient(standaloneTerm, 'x')}`;
  const choices = ensureFourChoices([answer], answer);
  const row1Terms = buildRow1Terms({ outside, variable: 'x', insideConst: insideTerm, insideOp: '+', standaloneCoef: standaloneTerm });
   const row1Bank = buildTermBank({
          correctTerms: row1Terms,
          distractorTerms: [formatWithSign(formatCoefficient(-outside, 'x')), formatWithSign(-distributedConstant), formatWithSign(formatCoefficient(standaloneTerm - outside, 'x'))],

  const staged = makeStagedSpec({ row1Terms, row2Answer: answer, row1Bank, row2Choices: choices });
  return { problem, displayProblem: problem, answer, choices, staged, explanation: { originalProblem: problem, steps: [], rule: "Distribute → Combine", finalAnswer: answer } };
};


// ============================================
// LEVEL 1-16: SUMMIT (Complex Simplification)
// ============================================

export const generateComplexSimplifyProblem = (difficulty) => {
  const levelId = '1-16';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (difficulty === 'easy') {
      const skeletons = ['a(x+b)+cx+d', 'a(x-b)+cx+d', 'a(x+b)+cx-d', 'a(x-b)+cx+d'];
      const skeleton = randomFrom(skeletons);
      
      const outside = randomInt(2, 12);
      const insideTerm = randomInt(1, 12);
      const standaloneTerm = randomInt(1, 12);
      const constantMag = randomInt(1, 12);
      
      let problem, insideOp, trailingConst;
      
      if (skeleton === 'a(x+b)+cx-d') {
        insideOp = '+';
        trailingConst = -constantMag;
        problem = `${outside}(x + ${insideTerm}) + ${formatCoefficient(standaloneTerm, 'x')} - ${constantMag}`;
      } else if (skeleton === 'a(x+b)+cx+d') {
        insideOp = '+';
        trailingConst = constantMag;
        problem = `${outside}(x + ${insideTerm}) + ${formatCoefficient(standaloneTerm, 'x')} + ${constantMag}`;
      } else {
        insideOp = '-';
        trailingConst = -constantMag;
        problem = `${outside}(x - ${insideTerm}) + ${formatCoefficient(standaloneTerm, 'x')} - ${constantMag}`;
      }
      
      const distributedCoef = outside;
      const distributedConstant = insideOp === '-' ? -(outside * insideTerm) : (outside * insideTerm);
      const totalXCoef = distributedCoef + standaloneTerm;
      const totalConstant = distributedConstant + trailingConst;
      
      const answer = formatAnswer(totalXCoef, 'x', totalConstant);
         const misconceptions = [
        answer,
        formatAnswer(distributedCoef, 'x', distributedConstant + trailingConst), // Wrong constant combination
        formatAnswer(totalXCoef, 'x', insideTerm), // Used inside constant
        formatAnswer(distributedCoef, 'x', totalConstant), // Didn't combine x terms
        formatAnswer(totalXCoef, 'x', distributedConstant) // Forgot trailing constant
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, outside, insideTerm, standaloneTerm, constantMag });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
        const choices = ensureFourChoices(misconceptions, answer);
        const row1Terms = buildRow1Terms({ outside, variable: 'x', insideConst: insideTerm, insideOp, standaloneCoef: standaloneTerm, trailingConst });
        const row1Bank = buildTermBank({
          correctTerms: row1Terms,
                distractorTerms: [formatWithSign(formatCoefficient(outside, 'x')), formatWithSign(insideTerm), formatWithSign(distributedConstant + constantMag), formatWithSign(formatCoefficient(totalXCoef, 'x'))],
        });
        const staged = makeStagedSpec({ row1Terms, row2Answer: answer, row1Bank, row2Choices: choices });
        
        return {
          problem, displayProblem: problem, answer, choices, staged,
         explanation: {
            originalProblem: problem,
            steps: [
              { description: `Distribute ${outside}`, work: row1Terms.slice(0, 2).join(' ') },
              { description: 'Add standalone terms', work: row1Terms.join(' ') },
              { description: 'Combine like terms', work: answer }
            ],
            rule: 'Full simplification: (1) Distribute. (2) Combine like terms. (3) Combine constants. Track all signs!',
            finalAnswer: answer
          }
        };
      }
    } else {
      const skeletons = ['±a(v±b)±cv±d', '±a(v±b)±cv±d', '±a(v±b)±cv±d', '±a(v±b)±cv±d'];
      const skeleton = randomFrom(skeletons);
      
      const outsideMag = randomInt(2, 12);
      const outside = Math.random() < 0.5 ? outsideMag : -outsideMag;
      const insideTerm = randomInt(1, 12);
      const insideOp = Math.random() < 0.5 ? '+' : '-';
      const standaloneMag = randomInt(1, 12);
      const standaloneCoef = Math.random() < 0.5 ? standaloneMag : -standaloneMag;
      const constantMag = randomInt(1, 12);
      const trailingConst = Math.random() < 0.5 ? constantMag : -constantMag;
      const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
      
      const distributedCoef = outside;
      const distributedConstant = insideOp === '-' ? outside * (-insideTerm) : outside * insideTerm;
      const totalCoef = distributedCoef + standaloneCoef;
      const totalConstant = distributedConstant + trailingConst;
      
      const standaloneStr = standaloneCoef >= 0 ? `+ ${formatCoefficient(standaloneCoef, variable)}` : `- ${formatCoefficient(Math.abs(standaloneCoef), variable)}`;
      const trailingStr = trailingConst >= 0 ? `+ ${trailingConst}` : `- ${Math.abs(trailingConst)}`;
      const problem = `${outside}(${variable} ${insideOp} ${insideTerm}) ${standaloneStr} ${trailingStr}`;
      
      const answer = formatAnswer(totalCoef, variable, totalConstant);
      const misconceptions = [
        answer,
        formatAnswer(totalCoef, variable, -totalConstant),
        formatAnswer(distributedCoef, variable, totalConstant),
        formatAnswer(totalCoef, variable, distributedConstant)
      ];
      
      const signature = generateSignature(levelId, difficulty, { outsideMag, insideTerm, standaloneMag, constantMag, variable });
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
        const choices = ensureFourChoices(misconceptions, answer);
        const row1Terms = buildRow1Terms({ outside, variable, insideConst: insideTerm, insideOp, standaloneCoef, trailingConst });
        const row1Bank = buildTermBank({
          correctTerms: row1Terms,
          distractorTerms: [formatCoefficient(outsideMag, variable), String(insideTerm), String(-distributedConstant), String(trailingConst * -1)],
          padTo: 16
        });
        const staged = makeStagedSpec({ row1Terms, row2Answer: answer, row1Bank, row2Choices: choices });
        
        const fallbackRow1 = [formatWithSign(formatCoefficient(3, 'x')), formatWithSign(6), formatWithSign(formatCoefficient(2, 'x')), formatWithSign(5)];
        return { problem, displayProblem: problem, answer, choices, staged, explanation: { originalProblem: problem, steps: [{ description: 'Distribute 3', work: '+3x +6' }, { description: 'Add standalone terms', work: fallbackRow1.join(' ') }, { description: 'Combine like terms', work: answer }], rule: 'Full simplification: (1) Distribute. (2) Combine like terms. (3) Combine constants. Track all signs!', finalAnswer: answer } };
      }
    }
  } 
// Fallback after MAX_RETRIES
const outside = randomInt(2, 12);
const insideTerm = randomInt(1, 12);
const standaloneTerm = randomInt(1, 12);
const constant = randomInt(1, 12);
const distributedConstant = outside * insideTerm;
const answer = formatAnswer(outside + standaloneTerm, 'x', distributedConstant - constant);
const problem = `${outside}(x + ${insideTerm}) + ${formatCoefficient(standaloneTerm, 'x')} - ${constant}`;
const choices = ensureFourChoices([answer], answer);

const row1Terms = buildRow1Terms({
  outside,
  variable: 'x',
  insideConst: insideTerm,
  insideOp: '+',
  standaloneCoef: standaloneTerm,
  trailingConst: -constant,
});

const row1Bank = buildTermBank({
  correctTerms: row1Terms,
  distractorTerms: [
    formatWithSign(formatCoefficient(outside, 'x')),
    formatWithSign(insideTerm),
    formatWithSign(distributedConstant + constant),
  ],
});

const staged = makeStagedSpec({ row1Terms, row2Answer: answer, row1Bank, row2Choices: choices });

return { problem, displayProblem: problem, answer, choices, staged, explanation: { originalProblem: problem, steps: [], rule: "Distribute → Combine", finalAnswer: answer } };
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
    const variable = randomFrom(['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']);
    
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
//***********************************************************************************************************************************************
// ============================================
// LEVELS 13-14 GENERATORS - FIXED VERSION
// No prompts, sorted terms, proper problem display
// ============================================

const formatWithSign = (value) => {
  if (typeof value === 'number') {
    return value >= 0 ? `+${value}` : `${value}`;
  }
  // For strings like "3x"
  if (value.startsWith('-')) return value;
  return `+${value}`;
};

const sortTermBank = (terms) => {
  // Sort: variables first (alphabetically), then constants (numerically)
  return terms.sort((a, b) => {
    const aHasVar = /[a-z]/i.test(a);
    const bHasVar = /[a-z]/i.test(b);
    
    if (aHasVar && !bHasVar) return -1;
    if (!aHasVar && bHasVar) return 1;
    
    // Both have vars or both are constants
    if (aHasVar && bHasVar) {
      // Sort variables alphabetically by the variable letter
      const aVar = a.match(/[a-z]/i)[0];
      const bVar = b.match(/[a-z]/i)[0];
      if (aVar !== bVar) return aVar.localeCompare(bVar);
      // Same variable, sort by coefficient
      const aCoef = parseInt(a.replace(/[a-z]/i, '')) || 1;
      const bCoef = parseInt(b.replace(/[a-z]/i, '')) || 1;
      return aCoef - bCoef;
    }
    
    // Both constants, sort numerically
    return parseInt(a) - parseInt(b);
  });
};

// ============================================
// LEVEL 1-13: MOUNTAIN BASE
// ============================================

export const generateDistributeCombineProblemNEW = (difficulty) => {
  const levelId = '1-13';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const outside = randomInt(-12, 12);
    const inside = randomInt(1, 12);
    const standalone = randomInt(-12, 12);
    
    let skeleton, problem, insideOp;
    
    if (difficulty === 'easy') {
      const outsidePos = Math.abs(outside);
      const standaloneAbs = Math.abs(standalone);
      
      skeleton = randomFrom(['a(x+b)+cx', 'cx+a(x+b)', 'a(x+b)+c']);
      
      if (skeleton === 'a(x+b)+cx') {
        problem = `${outsidePos}(x + ${inside}) + ${formatCoefficient(standaloneAbs, 'x')}`;
        insideOp = '+';
      } else if (skeleton === 'cx+a(x+b)') {
        problem = `${formatCoefficient(standaloneAbs, 'x')} + ${outsidePos}(x + ${inside})`;
        insideOp = '+';
      } else {
        problem = `${outsidePos}(x + ${inside}) + ${standaloneAbs}`;
        insideOp = '+';
      }
      
      const distVarCoef = outsidePos;
      const distConst = outsidePos * inside;
      
      const row1Expected = [];
      row1Expected.push(formatWithSign(formatCoefficient(distVarCoef, 'x')));
      row1Expected.push(formatWithSign(distConst));
      
      if (skeleton !== 'a(x+b)+c') {
        row1Expected.push(formatWithSign(formatCoefficient(standaloneAbs, 'x')));
      } else {
        row1Expected.push(formatWithSign(standaloneAbs));
      }
      
      const termBank = new Set();
      row1Expected.forEach(term => termBank.add(term));
      
      // Distractors
      termBank.add(formatWithSign(inside));
      termBank.add(formatWithSign(outsidePos));
      termBank.add(formatWithSign(-distConst));
      termBank.add(formatWithSign(formatCoefficient(-distVarCoef, 'x')));
      termBank.add(formatWithSign(formatCoefficient(distVarCoef + standaloneAbs, 'x')));
      termBank.add(formatWithSign(distConst + inside));
      termBank.add(formatWithSign(formatCoefficient(distVarCoef - 1, 'x')));
      termBank.add(formatWithSign(distConst + 1));
      
      while (termBank.size < 12) {
        const randomVal = randomInt(-12, 12);
        termBank.add(formatWithSign(randomVal));
      }
      
      let finalCoef, finalConst;
      if (skeleton === 'a(x+b)+cx' || skeleton === 'cx+a(x+b)') {
        finalCoef = distVarCoef + standaloneAbs;
        finalConst = distConst;
      } else {
        finalCoef = distVarCoef;
        finalConst = distConst + standaloneAbs;
      }
      
      const answer = formatCoefficient(finalCoef, 'x') + (finalConst >= 0 ? ' + ' : ' - ') + Math.abs(finalConst);
      
      // FIXED: Better misconceptions that avoid duplicates
      const row2Choices = [
        answer,
        formatCoefficient(distVarCoef, 'x') + (distConst >= 0 ? ' + ' : ' - ') + Math.abs(distConst), // Didn't combine constants
        formatCoefficient(finalCoef, 'x') + (inside >= 0 ? ' + ' : ' - ') + Math.abs(inside), // Used inside constant instead of distributed
        formatCoefficient(distVarCoef + standaloneAbs, 'x') + (finalConst >= 0 ? ' + ' : ' - ') + Math.abs(finalConst) // Added standalone to coefficient instead of constant
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, outside: outsidePos, inside, standalone: standaloneAbs });
      
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
        return {
          problem,
          displayProblem: problem,
          answer,
          choices: row2Choices,
          staged: {
            mode: 'distribute_then_combine',
            rows: [
              {
                id: 'row1_distribute',
                blanks: row1Expected.length,
                expected: row1Expected,
                bank: sortTermBank(Array.from(termBank))
              },
              {
                id: 'row2_combine',
                blanks: 1,
                expected: [answer],
                choices: row2Choices
              }
            ]
          },
          explanation: {
            originalProblem: problem,
            steps: [
              { description: 'Distribute', work: row1Expected.join(' ') },
              { description: 'Combine like terms', work: answer }
            ],
            rule: 'Two steps: (1) Distribute to remove parentheses. (2) Combine like terms.',
            finalAnswer: answer
          }
        };
      }
    } else {
      // Hard mode
      const variables = ['x', 'y', 'n', 'm', 'p', 'q', 'r', 's', 't', 'w'];
      const variable = randomFrom(variables);
      
      // FIXED: Removed problematic skeletons
      skeleton = randomFrom(['a(v+b)+cv', 'cv+a(v+b)', 'a(v-b)+cv', 'cv+a(v-b)']);
      
      let standaloneTerm, trailingConst = 0;
      
      if (skeleton === 'a(v-b)+cv' || skeleton === 'cv+a(v-b)') {
        standaloneTerm = Math.abs(standalone);
        if (skeleton === 'a(v-b)+cv') {
          problem = `${outside}(${variable} - ${inside}) + ${formatCoefficient(standaloneTerm, variable)}`;
        } else {
          problem = `${formatCoefficient(standaloneTerm, variable)} + ${outside}(${variable} - ${inside})`;
        }
        insideOp = '-';
      } else {
        standaloneTerm = Math.abs(standalone);
        if (skeleton === 'cv+a(v+b)') {
          problem = `${formatCoefficient(standaloneTerm, variable)} + ${outside}(${variable} + ${inside})`;
        } else {
          problem = `${outside}(${variable} + ${inside}) + ${formatCoefficient(standaloneTerm, variable)}`;
        }
        insideOp = '+';
      }
      
      const distVarCoef = outside;
      const distConst = insideOp === '-' ? -(outside * inside) : (outside * inside);
      
      const row1Expected = [];
      if (skeleton === 'cv+a(v+b)' || skeleton === 'cv+a(v-b)') {
        row1Expected.push(formatWithSign(formatCoefficient(standaloneTerm, variable)));
        row1Expected.push(formatWithSign(formatCoefficient(distVarCoef, variable)));
        row1Expected.push(formatWithSign(distConst));
      } else {
        row1Expected.push(formatWithSign(formatCoefficient(distVarCoef, variable)));
        row1Expected.push(formatWithSign(distConst));
        row1Expected.push(formatWithSign(formatCoefficient(standaloneTerm, variable)));
      }
      
      const termBank = new Set();
      row1Expected.forEach(term => termBank.add(term));
      
      termBank.add(formatWithSign(inside));
      termBank.add(formatWithSign(outside));
      termBank.add(formatWithSign(-distConst));
      termBank.add(formatWithSign(formatCoefficient(-distVarCoef, variable)));
      termBank.add(formatWithSign(formatCoefficient(distVarCoef + standaloneTerm, variable)));
      termBank.add(formatWithSign(distConst + inside));
      
      while (termBank.size < 14) {
        const randomVal = randomInt(-12, 12);
        termBank.add(formatWithSign(randomVal));
      }
      
      const finalCoef = distVarCoef + standaloneTerm;
      const answer = formatCoefficient(finalCoef, variable) + (distConst >= 0 ? ' + ' : ' - ') + Math.abs(distConst);
      
      const row2Choices = [
        answer,
        formatCoefficient(distVarCoef, variable) + (distConst >= 0 ? ' + ' : ' - ') + Math.abs(distConst),
        formatCoefficient(finalCoef, variable) + (inside >= 0 ? ' + ' : ' - ') + Math.abs(inside),
        formatCoefficient(finalCoef, variable) + (-distConst >= 0 ? ' + ' : ' - ') + Math.abs(-distConst)
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, outside, inside, standalone, variable });
      
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
        return {
          problem,
          displayProblem: problem,
          answer,
          choices: row2Choices,
          staged: {
            mode: 'distribute_then_combine',
            rows: [
              {
                id: 'row1_distribute',
                blanks: row1Expected.length,
                expected: row1Expected,
                bank: sortTermBank(Array.from(termBank))
              },
              {
                id: 'row2_combine',
                blanks: 1,
                expected: [answer],
                choices: row2Choices
              }
            ]
          },
          explanation: {
            originalProblem: problem,
            steps: [],
            rule: 'Two steps: (1) Distribute to remove parentheses. (2) Combine like terms.',
            finalAnswer: answer
          }
        };
      }
    }
  }
  
  // Fallback
  const fallbackAnswer = '3x + 6';
  return {
    problem: '3(x + 2)',
    displayProblem: '3(x + 2)',
    answer: fallbackAnswer,
    choices: [fallbackAnswer, '3x + 2', 'x + 6', '5x'],
    staged: {
      mode: 'distribute_then_combine',
      rows: [
        {
          id: 'row1_distribute',
          blanks: 2,
          expected: ['+3x', '+6'],
          bank: sortTermBank(['+3x', '+6', '+2', '+3', '-3x', '-6', '+5x', '+9', '+4', '-2'])
        },
        {
          id: 'row2_combine',
          blanks: 1,
          expected: [fallbackAnswer],
          choices: [fallbackAnswer, '3x + 2', 'x + 6', '5x']
        }
      ]
    },
    explanation: {
      originalProblem: '3(x + 2)',
      steps: [],
      rule: 'Two steps: (1) Distribute to remove parentheses. (2) Combine like terms.',
      finalAnswer: fallbackAnswer
    }
  };
};
// ============================================
// LEVEL 1-14: STEEP CLIMB
// ============================================

export const generateDistributeSubtractProblemNEW = (difficulty) => {
  const levelId = '1-14';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const outside = randomInt(-12, 12);
    const inside = randomInt(1, 12);
    const standalone = randomInt(-12, 12);
    
    let skeleton, problem, insideOp;
    
    if (difficulty === 'easy') {
      const outsidePos = Math.abs(outside);
      const standaloneAbs = Math.abs(standalone);
      
      skeleton = randomFrom(['a(x-b)+cx', 'a(x+b)-cx', 'cx+a(x-b)']);
      
      let standaloneCoef;
      
      if (skeleton === 'a(x-b)+cx') {
        insideOp = '-';
        standaloneCoef = standaloneAbs;
        problem = `${outsidePos}(x - ${inside}) + ${formatCoefficient(standaloneCoef, 'x')}`;
      } else if (skeleton === 'a(x+b)-cx') {
        insideOp = '+';
        standaloneCoef = -standaloneAbs;
        problem = `${outsidePos}(x + ${inside}) - ${formatCoefficient(standaloneAbs, 'x')}`;
      } else {
        insideOp = '-';
        standaloneCoef = standaloneAbs;
        problem = `${formatCoefficient(standaloneCoef, 'x')} + ${outsidePos}(x - ${inside})`;
      }
      
      const distVarCoef = outsidePos;
      const distConst = insideOp === '-' ? -(outsidePos * inside) : (outsidePos * inside);
      
      const row1Expected = [];
      
      if (skeleton === 'cx+a(x-b)') {
        row1Expected.push(formatWithSign(formatCoefficient(standaloneCoef, 'x')));
        row1Expected.push(formatWithSign(formatCoefficient(distVarCoef, 'x')));
        row1Expected.push(formatWithSign(distConst));
      } else {
        row1Expected.push(formatWithSign(formatCoefficient(distVarCoef, 'x')));
        row1Expected.push(formatWithSign(distConst));
        row1Expected.push(formatWithSign(formatCoefficient(standaloneCoef, 'x')));
      }
      
      const termBank = new Set();
      row1Expected.forEach(term => termBank.add(term));
      
      termBank.add(formatWithSign(inside));
      termBank.add(formatWithSign(outsidePos));
      termBank.add(formatWithSign(-distConst));
      termBank.add(formatWithSign(formatCoefficient(-distVarCoef, 'x')));
      termBank.add(formatWithSign(formatCoefficient(distVarCoef + standaloneCoef, 'x')));
      
      while (termBank.size < 12) {
        termBank.add(formatWithSign(randomInt(-12, 12)));
      }
      
      const finalCoef = distVarCoef + standaloneCoef;
      const finalConst = distConst;
      const answer = formatCoefficient(finalCoef, 'x') + (finalConst >= 0 ? ' + ' : ' - ') + Math.abs(finalConst);
      
      const row2Choices = [
        answer,
        formatCoefficient(distVarCoef, 'x') + (finalConst >= 0 ? ' + ' : ' - ') + Math.abs(finalConst), // Didn't combine x terms
        formatCoefficient(finalCoef, 'x') + (inside >= 0 ? ' + ' : ' - ') + Math.abs(inside), // Used inside constant instead of distributed
        formatCoefficient(outsidePos + Math.abs(standaloneCoef), 'x') + (finalConst >= 0 ? ' + ' : ' - ') + Math.abs(finalConst) // Added coefficients instead of distributing
      ];
      
      const signature = generateSignature(levelId, difficulty, { skeleton, outside: outsidePos, inside, standalone: standaloneAbs });
      
      if (!isRecentDuplicate(levelId, difficulty, signature)) {
        recordProblem(levelId, difficulty, signature);
        
        return {
          problem,
          displayProblem: problem,
          answer,
          choices: row2Choices,
          staged: {
            mode: 'distribute_then_combine',
            rows: [
              {
                id: 'row1_distribute',
                blanks: row1Expected.length,
                expected: row1Expected,
                bank: sortTermBank(Array.from(termBank))
              },
              {
                id: 'row2_combine',
                blanks: 1,
                expected: [answer],
                choices: row2Choices
              }
            ]
          },
          explanation: {
            originalProblem: problem,
            steps: [
              { description: 'Distribute', work: row1Expected.join(' ') },
              { description: 'Combine like terms', work: answer }
            ],
            rule: 'Watch the signs! When subtracting, be extra careful with negatives.',
            finalAnswer: answer
          }
        };
      }
    }
  }
  
  // Fallback
  return {
    problem: '4(x - 2) + 3x',
    displayProblem: '4(x - 2) + 3x',
    answer: '7x - 8',
    choices: ['7x - 8', '7x + 8', '4x - 5', '7x - 2'],
    staged: {
      mode: 'distribute_then_combine',
      rows: [
        {
          id: 'row1_distribute',
          blanks: 3,
          expected: ['+4x', '-8', '+3x'],
          bank: sortTermBank(['+4x', '-8', '+3x', '-2', '+8', '+7x', '-4x', '+2', '-3x', '+5', '+11', '-5'])
        },
        {
          id: 'row2_combine',
          blanks: 1,
          expected: ['7x - 8'],
          choices: ['7x - 8', '7x + 8', '4x - 5', '7x - 2']
        }
      ]
    },
    explanation: {
      originalProblem: '4(x - 2) + 3x',
      steps: [],
      rule: 'Watch the signs! When subtracting, be extra careful with negatives.',
      finalAnswer: '7x - 8'
    }
  };
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
'1-13': generateDistributeCombineProblemNEW,
'1-14': generateDistributeSubtractProblemNEW,
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
