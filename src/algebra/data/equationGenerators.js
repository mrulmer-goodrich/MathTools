// ============================================
// EQUATION GENERATORS - LEVELS 17+
// One-step and multi-step equation solving
// FIXED: Sides swapped bug, improved bank distribution
// ============================================

// ============================================
// SKELETON ROTATION SYSTEM
// Ensures no skeleton repeats until all have been seen
// ============================================

const skeletonHistory = {
  // Format: { '1-17-easy': ['x+a=b', 'x-a=b', ...] }
};

const resetSkeletonPool = (levelId, difficulty, allSkeletons) => {
  const key = `${levelId}-${difficulty}`;
  skeletonHistory[key] = [...allSkeletons];
  // Shuffle the pool
  for (let i = skeletonHistory[key].length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [skeletonHistory[key][i], skeletonHistory[key][j]] = [skeletonHistory[key][j], skeletonHistory[key][i]];
  }
};

const getNextSkeleton = (levelId, difficulty, allSkeletons) => {
  const key = `${levelId}-${difficulty}`;
  
  // Initialize pool if empty or doesn't exist
  if (!skeletonHistory[key] || skeletonHistory[key].length === 0) {
    resetSkeletonPool(levelId, difficulty, allSkeletons);
  }
  
  // Pop from pool
  return skeletonHistory[key].pop();
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomNonZeroInt = (min, max) => {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (val === 0);
  return val;
};

// FIX BUG #2: Helper to simplify denominators - NEVER show "x/(7+12)", always show "x/19"
const simplifyDenominator = (denominator) => {
  // If it's a number, return as-is
  if (typeof denominator === 'number') return denominator;
  
  // If it's a string that looks like arithmetic, evaluate it
  const str = String(denominator).trim();
  
  // Check if it contains arithmetic operations
  if (str.includes('+') || str.includes('-') || str.includes('*') || str.includes('/')) {
    try {
      // Safely evaluate simple arithmetic (only numbers and basic operators)
      const sanitized = str.replace(/[^0-9+\-*/().\s]/g, '');
      if (sanitized === str) {
        // eslint-disable-next-line no-eval
        const result = eval(sanitized);
        return Number.isFinite(result) ? result : str;
      }
    } catch (e) {
      console.warn('Could not simplify denominator:', str);
    }
  }
  
  return str;
};

// Format with explicit sign (for equation banks)
const formatWithSign = (num) => {
  if (num === 0) return '0';
  if (num > 0) return `+${num}`;
  return String(num);
};

// Format operation for display
const formatOperation = (op, num) => {
  const absNum = Math.abs(num);
  if (op === 'add') return formatWithSign(absNum);
  if (op === 'subtract') return formatWithSign(-absNum);
  if (op === 'multiply') return `× ${absNum}`;
  if (op === 'divide') return `÷ ${absNum}`;
  return String(num);
};

// ============================================
// LEVEL 1-17: ONE-STEP EQUATIONS (Add/Subtract)
// Easy: 1-12, positive only, whole solutions
// Hard: -25 to 25, decimals .5 only, whole solutions
// 8 Skeletons with rotation
// ============================================

export const generateOneStepAddSubtract = (difficulty) => {
  const levelId = '1-17';
  
  // All 8 skeletons (ONE STEP ONLY)
  const allSkeletons = [
    'x+a=b',
    'x-a=b',
    'a+x=b',
    'x+a=-b',
    'x-a=-b',
    'b=x+a',
    'b=x-a',
    'b=a+x'
  ];
  
  // Get next skeleton from rotation
  const skeleton = getNextSkeleton(levelId, difficulty, allSkeletons);
  
  let a, b, solution, problem, operationNeeded, operationValue;
  let problemHasConstantOnLeft = false;
  
  if (difficulty === 'easy') {
    // Easy: 1-12, positive only
    a = randomInt(1, 12);
    b = randomInt(1, 12);
    
    // Ensure solution is positive and whole
    if (skeleton === 'x+a=b') {
      solution = b - a;
      if (solution < 1) { b = a + randomInt(1, 12); solution = b - a; }
      problem = `x + ${a} = ${b}`;
      operationNeeded = 'subtract';
      operationValue = a;
    } else if (skeleton === 'x-a=b') {
      solution = b + a;
      problem = `x - ${a} = ${b}`;
      operationNeeded = 'add';
      operationValue = a;
    } else if (skeleton === 'a+x=b') {
      solution = b - a;
      if (solution < 1) { b = a + randomInt(1, 12); solution = b - a; }
      problem = `${a} + x = ${b}`;
      operationNeeded = 'subtract';
      operationValue = a;
    } else if (skeleton === 'x+a=-b') {
      // Skip in easy mode, regenerate
      return generateOneStepAddSubtract(difficulty);
    } else if (skeleton === 'x-a=-b') {
      // Skip in easy mode, regenerate
      return generateOneStepAddSubtract(difficulty);
    } else if (skeleton === 'b=x+a') {
      solution = b - a;
      if (solution < 1) { b = a + randomInt(1, 12); solution = b - a; }
      problem = `${b} = x + ${a}`;
      operationNeeded = 'subtract';
      operationValue = a;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'b=x-a') {
      solution = b + a;
      problem = `${b} = x - ${a}`;
      operationNeeded = 'add';
      operationValue = a;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'b=a+x') {
      solution = b - a;
      if (solution < 1) { b = a + randomInt(1, 12); solution = b - a; }
      problem = `${b} = ${a} + x`;
      operationNeeded = 'subtract';
      operationValue = a;
      problemHasConstantOnLeft = true;
    }
  } else {
    // Hard: -25 to 25, decimals .5 only
    const useDecimal = Math.random() < 0.3;
    a = useDecimal ? (randomInt(-50, 50) / 2) : randomNonZeroInt(-25, 25);
    b = useDecimal ? (randomInt(-50, 50) / 2) : randomNonZeroInt(-25, 25);
    
    // Ensure solution is WHOLE number
    if (skeleton === 'x+a=b') {
      solution = b - a;
      if (solution !== Math.floor(solution)) {
        b = a + randomNonZeroInt(-25, 25);
        solution = b - a;
      }
      problem = `x + ${a} = ${b}`;
      operationNeeded = 'subtract';
      operationValue = a;
    } else if (skeleton === 'x-a=b') {
      solution = b + a;
      if (solution !== Math.floor(solution)) {
        b = randomNonZeroInt(-25, 25) - a;
        solution = b + a;
      }
      problem = `x - ${a} = ${b}`;
      operationNeeded = 'add';
      operationValue = a;
    } else if (skeleton === 'a+x=b') {
      solution = b - a;
      if (solution !== Math.floor(solution)) {
        b = a + randomNonZeroInt(-25, 25);
        solution = b - a;
      }
      problem = `${a} + x = ${b}`;
      operationNeeded = 'subtract';
      operationValue = a;
    } else if (skeleton === 'x+a=-b') {
      b = Math.abs(b);
      solution = -b - a;
      if (solution !== Math.floor(solution)) {
        a = randomNonZeroInt(-25, 25);
        solution = -b - a;
      }
      problem = `x + ${a} = ${-b}`;
      operationNeeded = 'subtract';
      operationValue = a;
    } else if (skeleton === 'x-a=-b') {
      b = Math.abs(b);
      solution = -b + a;
      if (solution !== Math.floor(solution)) {
        a = randomNonZeroInt(-25, 25);
        solution = -b + a;
      }
      problem = `x - ${a} = ${-b}`;
      operationNeeded = 'add';
      operationValue = a;
    } else if (skeleton === 'b=x+a') {
      solution = b - a;
      if (solution !== Math.floor(solution)) {
        b = a + randomNonZeroInt(-25, 25);
        solution = b - a;
      }
      problem = `${b} = x + ${a}`;
      operationNeeded = 'subtract';
      operationValue = a;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'b=x-a') {
      solution = b + a;
      if (solution !== Math.floor(solution)) {
        b = randomNonZeroInt(-25, 25) - a;
        solution = b + a;
      }
      problem = `${b} = x - ${a}`;
      operationNeeded = 'add';
      operationValue = a;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'b=a+x') {
      solution = b - a;
      if (solution !== Math.floor(solution)) {
        b = a + randomNonZeroInt(-25, 25);
        solution = b - a;
      }
      problem = `${b} = ${a} + x`;
      operationNeeded = 'subtract';
      operationValue = a;
      problemHasConstantOnLeft = true;
    }
  }
  
  // Build Row 1 bank (operations to perform) - IMPROVED VARIETY
  const row1Bank = [
    formatWithSign(operationValue),
    formatWithSign(-operationValue),
    formatWithSign(Math.abs(a)),
    formatWithSign(-Math.abs(a)),
    formatWithSign(Math.abs(b)),
    formatWithSign(-Math.abs(b)),
    `× ${Math.abs(a)}`,
    `÷ ${Math.abs(a)}`,
    formatWithSign(Math.abs(operationValue) + 1), // Near-miss distractor
    formatWithSign(-(Math.abs(operationValue) + 1)) // Near-miss distractor
  ];
  
  // Expected operation (same on both sides)
  const row1Expected = operationNeeded === 'add' 
    ? [formatWithSign(operationValue), formatWithSign(operationValue)]
    : [formatWithSign(-operationValue), formatWithSign(-operationValue)];
  
  // Build Row 2 bank (final results) - IMPROVED VARIETY
  const row2Bank = [
    'x',
    '-x',
    String(solution),
    String(-solution),
    String(solution + 1), // Off by 1
    String(solution - 1), // Off by 1
    String(Math.abs(a)),
    String(-Math.abs(a)),
    String(Math.abs(b)),
    String(-Math.abs(b)),
    `x + ${Math.abs(a)}`, // Didn't complete operation
    `x - ${Math.abs(a)}`, // Didn't complete operation
    String(a + b), // Added instead of subtracted
    String(Math.abs(a - b)) // Wrong order
  ];
  
  // FIXED: Row 2 expected (handles sides-swapped bug)
  // For problems where constant is on LEFT (b=x+a, b=a+x, b=x-a)
  // Left side = solution value, Right side = x
  // For problems where variable is on LEFT (x+a=b, x-a=b, a+x=b)
  // Left side = x, Right side = solution value
  
  const row2ExpectedLeft = problemHasConstantOnLeft ? [String(solution)] : ['x'];
  const row2ExpectedRight = problemHasConstantOnLeft ? ['x'] : [String(solution)];
  
  // Build staged structure
  const staged = {
    mode: 'equation_solver',
    rows: [
      {
        id: 'row0_draw_line',
        type: 'single_choice',
        instruction: 'What do you do first?',
        choices: ['Draw a line'],
        expected: ['Draw a line']
      },
      {
        id: 'row1_operation',
        type: 'dual_box',
        instruction: 'What do we do to both sides?',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: [row1Expected[0]],
        expectedRight: [row1Expected[1]],
        bank: [...new Set(row1Bank)].sort()
      },
      {
        id: 'row2_solution',
        type: 'dual_box',
        instruction: 'Simplify each side',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: row2ExpectedLeft,
        expectedRight: row2ExpectedRight,
        bank: [...new Set(row2Bank)].sort()
      }
    ]
  };
  
  return {
    problem,
    displayProblem: problem,
    answer: String(solution),
    choices: [String(solution)], // For compatibility
    staged,
    explanation: {
      originalProblem: problem,
      steps: [
        { 
          description: 'Original Problem:', 
          work: problem 
        },
        { 
          description: `Step 1: ${operationNeeded === 'add' ? 'Add' : 'Subtract'} ${Math.abs(operationValue)} from both sides`, 
          work: `    ${problem.split('=')[0].trim()}\n${row1Expected[0]}   ${row1Expected[1]}\n_____________\n    ${row2ExpectedLeft[0]} = ${row2ExpectedRight[0]}`
        },
        { 
          description: 'Solution:', 
          work: `x = ${solution}` 
        }
      ],
      rule: `To isolate the variable, remove the lonely number by performing the opposite operation on both sides.`,
      finalAnswer: String(solution)
    }
  };
};

// ============================================
// LEVEL 1-18: ONE-STEP EQUATIONS (Multiply/Divide)
// Easy: x ∈ {2..12}, a derived, whole solutions
// Hard: x ∈ {-20..20}, negative allowed, decimals .5 optional
// 5 Skeletons with rotation
// ============================================

export const generateOneStepMultiplyDivide = (difficulty) => {
  const levelId = '1-18';
  
  // All 5 skeletons (ONE STEP ONLY - multiply/divide)
  const allSkeletons = [
    'ax=b',      // a*x = b
    'x/a=b',     // x ÷ a = b
    'b=ax',      // b = a*x
    'b=x/a',     // b = x ÷ a
    'a=x/b'      // a = x ÷ b
  ];
  
  // Get next skeleton from rotation
  const skeleton = getNextSkeleton(levelId, difficulty, allSkeletons);
  
  let a, b, solution, problem, operationNeeded, operationValue;
  let problemHasConstantOnLeft = false;
  
  if (difficulty === 'easy') {
    // Easy: Choose x first (2-12), then derive a and b
    solution = randomInt(2, 12);
    
    if (skeleton === 'ax=b') {
      a = randomInt(2, 12);
      b = a * solution;
      problem = `${a}x = ${b}`;
      operationNeeded = 'divide';
      operationValue = a;
    } else if (skeleton === 'x/a=b') {
      a = randomInt(2, 12);
      b = Math.floor(solution / a); // Ensure clean division
      if (b === 0) b = 1;
      solution = a * b; // Recalculate to ensure integer solution
      problem = `x/${a} = ${b}`;
      operationNeeded = 'multiply';
      operationValue = a;
    } else if (skeleton === 'b=ax') {
      a = randomInt(2, 12);
      b = a * solution;
      problem = `${b} = ${a}x`;
      operationNeeded = 'divide';
      operationValue = a;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'b=x/a') {
      a = randomInt(2, 12);
      b = Math.floor(solution / a);
      if (b === 0) b = 1;
      solution = a * b;
      problem = `${b} = x/${a}`;
      operationNeeded = 'multiply';
      operationValue = a;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'a=x/b') {
      b = randomInt(2, 12);
      a = Math.floor(solution / b);
      if (a === 0) a = 1;
      solution = a * b;
      problem = `${a} = x/${b}`;
      operationNeeded = 'multiply';
      operationValue = b;
      problemHasConstantOnLeft = true;
    }
  } else {
    // Hard: x ∈ {-20..20}, x ≠ 0, optional decimals
    solution = randomNonZeroInt(-20, 20);
    const useDecimal = Math.random() < 0.3;
    
    if (skeleton === 'ax=b') {
      a = useDecimal ? (randomNonZeroInt(-40, 40) / 2) : randomNonZeroInt(-12, 12);
      b = a * solution;
      problem = `${a}x = ${b}`;
      operationNeeded = 'divide';
      operationValue = a;
    } else if (skeleton === 'x/a=b') {
      a = randomNonZeroInt(-12, 12);
      b = useDecimal ? (solution / 2) : Math.floor(solution / Math.abs(a));
      // Ensure clean result
      solution = b * a;
      problem = `x/${a} = ${b}`;
      operationNeeded = 'multiply';
      operationValue = a;
    } else if (skeleton === 'b=ax') {
      a = useDecimal ? (randomNonZeroInt(-40, 40) / 2) : randomNonZeroInt(-12, 12);
      b = a * solution;
      problem = `${b} = ${a}x`;
      operationNeeded = 'divide';
      operationValue = a;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'b=x/a') {
      a = randomNonZeroInt(-12, 12);
      b = useDecimal ? (solution / 2) : Math.floor(solution / Math.abs(a));
      solution = b * a;
      problem = `${b} = x/${a}`;
      operationNeeded = 'multiply';
      operationValue = a;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'a=x/b') {
      b = randomNonZeroInt(-12, 12);
      a = Math.floor(solution / Math.abs(b));
      if (a === 0) a = b > 0 ? 1 : -1;
      solution = a * b;
      problem = `${a} = x/${b}`;
      operationNeeded = 'multiply';
      operationValue = b;
      problemHasConstantOnLeft = true;
    }
  }
  
  // Build Row 1 bank (operations to perform) - MULTIPLY/DIVIDE DISTRACTORS
  const row1Bank = [
    operationNeeded === 'multiply' ? `× ${Math.abs(operationValue)}` : `÷ ${Math.abs(operationValue)}`,
    operationNeeded === 'multiply' ? `÷ ${Math.abs(operationValue)}` : `× ${Math.abs(operationValue)}`, // Wrong inverse
    operationNeeded === 'multiply' ? `× ${-Math.abs(operationValue)}` : `÷ ${-Math.abs(operationValue)}`, // Sign error
    `× ${Math.abs(operationValue) + 1}`, // Near-miss
    `÷ ${Math.abs(operationValue) + 1}`, // Near-miss
    formatWithSign(operationValue), // Carryover confusion from Level 17
    formatWithSign(-operationValue), // Carryover confusion
    `× ${Math.abs(b)}`, // Number confusion
    `÷ ${Math.abs(b)}` // Number confusion
  ];
  
  // Expected operation (same on both sides)
  const row1Expected = operationNeeded === 'multiply' 
    ? [`× ${Math.abs(operationValue)}`, `× ${Math.abs(operationValue)}`]
    : [`÷ ${Math.abs(operationValue)}`, `÷ ${Math.abs(operationValue)}`];
  
  // Build Row 2 bank (final results) - MULTIPLY/DIVIDE RESULTS
  const row2Bank = [
    'x',
    '-x',
    String(solution),
    String(-solution),
    String(solution + 1), // Off by 1
    String(solution - 1), // Off by 1
    `${Math.abs(a)}x`, // Didn't complete operation
    `x ÷ ${Math.abs(a)}`, // Didn't complete operation
    String(b * a), // Wrong operation (multiplied instead of divided)
    String(Math.abs(b / a)).includes('.') ? String(Math.floor(b / a)) : String(b / a), // Wrong operation
    String(Math.abs(a)),
    String(-Math.abs(a)),
    String(Math.abs(b)),
    String(-Math.abs(b))
  ];
  
  // Row 2 expected (handles sides-swapped)
  const row2ExpectedLeft = problemHasConstantOnLeft ? [String(solution)] : ['x'];
  const row2ExpectedRight = problemHasConstantOnLeft ? ['x'] : [String(solution)];
  
  // Build staged structure
  const staged = {
    mode: 'equation_solver',
    rows: [
      {
        id: 'row0_draw_line',
        type: 'single_choice',
        instruction: 'What do you do first?',
        choices: ['Draw a line'],
        expected: ['Draw a line']
      },
      {
        id: 'row1_operation',
        type: 'dual_box',
        instruction: 'What do we do to both sides?',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: [row1Expected[0]],
        expectedRight: [row1Expected[1]],
        bank: [...new Set(row1Bank)].sort()
      },
      {
        id: 'row2_solution',
        type: 'dual_box',
        instruction: 'Simplify each side',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: row2ExpectedLeft,
        expectedRight: row2ExpectedRight,
        bank: [...new Set(row2Bank)].sort()
      }
    ]
  };
  
  // Determine rule based on operation
  const rule = operationNeeded === 'multiply' 
    ? 'To isolate the variable, clear the fence by multiplying both sides by the number across the fence.'
    : 'To isolate the variable, unstick the sticky by dividing the sticky number on both sides.';
  
  return {
    problem,
    displayProblem: problem,
    answer: String(solution),
    choices: [String(solution)],
    staged,
    explanation: {
      originalProblem: problem,
      steps: [
        { 
          description: 'Original Problem:', 
          work: problem 
        },
        { 
          description: `Step 1: ${operationNeeded === 'multiply' ? 'Multiply' : 'Divide'} both sides by ${Math.abs(operationValue)}`, 
          work: `    ${problem.split('=')[0].trim()}\n${row1Expected[0]}   ${row1Expected[1]}\n_____________\n    ${row2ExpectedLeft[0]} = ${row2ExpectedRight[0]}`
        },
        { 
          description: 'Solution:', 
          work: `x = ${solution}` 
        }
      ],
      rule,
      finalAnswer: String(solution)
    }
  };
};

// ============================================
// LEVEL 1-19: ONE-STEP EQUATIONS (Add/Subtract with Negatives)
// Same as Level 17 but expands into negative numbers
// Easy: -12 to 12, whole solutions, negatives allowed
// Hard: -25 to 25, decimals .5, negatives allowed
// 10 Skeletons (adds negative variants)
// ============================================

export const generateOneStepAddSubtractNegatives = (difficulty) => {
  const levelId = '1-19';
  
  // All 10 skeletons - adds negative-b and negative-a variants
  const allSkeletons = [
    'x+a=b',
    'x-a=b',
    'a+x=b',
    'x+a=-b',   // Now included in easy
    'x-a=-b',   // Now included in easy
    'b=x+a',
    'b=x-a',
    'b=a+x',
    '-a+x=b',   // New: negative coefficient on constant
    'x+(-a)=b'  // New: explicit negative in parentheses
  ];
  
  // Get next skeleton from rotation
  const skeleton = getNextSkeleton(levelId, difficulty, allSkeletons);
  
  let a, b, solution, problem, operationNeeded, operationValue;
  let problemHasConstantOnLeft = false;
  
  if (difficulty === 'easy') {
    // Easy: -12 to 12, whole numbers only, allow negatives
    // NOTE: Keep denominator positive to avoid fraction-bar rendering bugs (e.g., x/(-1) displaying as (-1+x)/-1)
    // and ensure it stays a true 2-step equation.
    a = randomInt(2, 12); // positive, avoids ±1
    b = randomNonZeroInt(-12, 12);
    while (Math.abs(b) < 2) b = randomNonZeroInt(-12, 12); // avoid ±1 (degenerate/too easy)
    
    if (skeleton === 'x+a=b') {
      solution = b - a;
      problem = a >= 0 ? `x + ${a} = ${b}` : `x − ${Math.abs(a)} = ${b}`;
      operationNeeded = a >= 0 ? 'subtract' : 'add';
      operationValue = Math.abs(a);
    } else if (skeleton === 'x-a=b') {
      solution = b + a;
      problem = `x − ${Math.abs(a)} = ${b}`;
      operationNeeded = 'add';
      operationValue = Math.abs(a);
    } else if (skeleton === 'a+x=b') {
      solution = b - a;
      problem = a >= 0 ? `${a} + x = ${b}` : `${a} + x = ${b}`;
      operationNeeded = 'subtract';
      operationValue = Math.abs(a);
    } else if (skeleton === 'x+a=-b') {
      b = Math.abs(b);
      solution = -b - a;
      problem = a >= 0 ? `x + ${a} = ${-b}` : `x − ${Math.abs(a)} = ${-b}`;
      operationNeeded = a >= 0 ? 'subtract' : 'add';
      operationValue = Math.abs(a);
    } else if (skeleton === 'x-a=-b') {
      b = Math.abs(b);
      solution = -b + a;
      problem = `x − ${Math.abs(a)} = ${-b}`;
      operationNeeded = 'add';
      operationValue = Math.abs(a);
    } else if (skeleton === 'b=x+a') {
      solution = b - a;
      problem = a >= 0 ? `${b} = x + ${a}` : `${b} = x − ${Math.abs(a)}`;
      operationNeeded = 'subtract';
      operationValue = Math.abs(a);
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'b=x-a') {
      solution = b + a;
      problem = `${b} = x − ${Math.abs(a)}`;
      operationNeeded = 'add';
      operationValue = Math.abs(a);
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'b=a+x') {
      solution = b - a;
      problem = `${b} = ${a} + x`;
      operationNeeded = 'subtract';
      operationValue = Math.abs(a);
      problemHasConstantOnLeft = true;
    } else if (skeleton === '-a+x=b') {
      a = Math.abs(a);
      solution = b + a;
      problem = `−${a} + x = ${b}`;
      operationNeeded = 'add';
      operationValue = a;
    } else if (skeleton === 'x+(-a)=b') {
      a = Math.abs(a);
      solution = b + a;
      problem = `x + (−${a}) = ${b}`;
      operationNeeded = 'add';
      operationValue = a;
    }
  } else {
    // Hard: -25 to 25, decimals .5 only, allow negatives
    const useDecimal = Math.random() < 0.3;
    a = useDecimal ? (randomNonZeroInt(-50, 50) / 2) : randomNonZeroInt(-25, 25);
    b = useDecimal ? (randomNonZeroInt(-50, 50) / 2) : randomNonZeroInt(-25, 25);
    
    if (skeleton === 'x+a=b') {
      solution = b - a;
      problem = a >= 0 ? `x + ${a} = ${b}` : `x − ${Math.abs(a)} = ${b}`;
      operationNeeded = a >= 0 ? 'subtract' : 'add';
      operationValue = Math.abs(a);
    } else if (skeleton === 'x-a=b') {
      solution = b + a;
      problem = `x − ${Math.abs(a)} = ${b}`;
      operationNeeded = 'add';
      operationValue = Math.abs(a);
    } else if (skeleton === 'a+x=b') {
      solution = b - a;
      problem = `${a} + x = ${b}`;
      operationNeeded = 'subtract';
      operationValue = Math.abs(a);
    } else if (skeleton === 'x+a=-b') {
      b = Math.abs(b);
      solution = -b - a;
      problem = a >= 0 ? `x + ${a} = ${-b}` : `x − ${Math.abs(a)} = ${-b}`;
      operationNeeded = a >= 0 ? 'subtract' : 'add';
      operationValue = Math.abs(a);
    } else if (skeleton === 'x-a=-b') {
      b = Math.abs(b);
      solution = -b + a;
      problem = `x − ${Math.abs(a)} = ${-b}`;
      operationNeeded = 'add';
      operationValue = Math.abs(a);
    } else if (skeleton === 'b=x+a') {
      solution = b - a;
      problem = a >= 0 ? `${b} = x + ${a}` : `${b} = x − ${Math.abs(a)}`;
      operationNeeded = 'subtract';
      operationValue = Math.abs(a);
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'b=x-a') {
      solution = b + a;
      problem = `${b} = x − ${Math.abs(a)}`;
      operationNeeded = 'add';
      operationValue = Math.abs(a);
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'b=a+x') {
      solution = b - a;
      problem = `${b} = ${a} + x`;
      operationNeeded = 'subtract';
      operationValue = Math.abs(a);
      problemHasConstantOnLeft = true;
    } else if (skeleton === '-a+x=b') {
      a = Math.abs(a);
      solution = b + a;
      problem = `−${a} + x = ${b}`;
      operationNeeded = 'add';
      operationValue = a;
    } else if (skeleton === 'x+(-a)=b') {
      a = Math.abs(a);
      solution = b + a;
      problem = `x + (−${a}) = ${b}`;
      operationNeeded = 'add';
      operationValue = a;
    }
  }
  
  // Build Row 1 bank - Enhanced for negative number operations
  const row1Bank = [
    formatWithSign(operationValue),
    formatWithSign(-operationValue),
    formatWithSign(Math.abs(a)),
    formatWithSign(-Math.abs(a)),
    formatWithSign(Math.abs(b)),
    formatWithSign(-Math.abs(b)),
    `× ${Math.abs(a)}`,
    `÷ ${Math.abs(a)}`,
    formatWithSign(Math.abs(operationValue) + 1),
    formatWithSign(-(Math.abs(operationValue) + 1)),
    formatWithSign(operationValue * 2), // Double the operation (sign error)
  ];
  
  // Expected operation
  const row1Expected = operationNeeded === 'add' 
    ? [formatWithSign(operationValue), formatWithSign(operationValue)]
    : [formatWithSign(-operationValue), formatWithSign(-operationValue)];
  
  // Build Row 2 bank - Enhanced for negative results
  const row2Bank = [
    'x',
    '-x',
    String(solution),
    String(-solution),
    String(solution + 1),
    String(solution - 1),
    String(Math.abs(solution)), // Absolute value error
    String(-Math.abs(solution)),
    String(Math.abs(a)),
    String(-Math.abs(a)),
    String(Math.abs(b)),
    String(-Math.abs(b)),
    `x + ${Math.abs(a)}`,
    `x − ${Math.abs(a)}`,
    String(a + b),
    String(a - b),
    String(b - a)
  ];
  
  // Row 2 expected
  const row2ExpectedLeft = problemHasConstantOnLeft ? [String(solution)] : ['x'];
  const row2ExpectedRight = problemHasConstantOnLeft ? ['x'] : [String(solution)];
  
  // Build staged structure
  const staged = {
    mode: 'equation_solver',
    rows: [
      {
        id: 'row0_draw_line',
        type: 'single_choice',
        instruction: 'What do you do first?',
        choices: ['Draw a line'],
        expected: ['Draw a line']
      },
      {
        id: 'row1_operation',
        type: 'dual_box',
        instruction: 'What do we do to both sides?',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: [row1Expected[0]],
        expectedRight: [row1Expected[1]],
        bank: [...new Set(row1Bank)].sort()
      },
      {
        id: 'row2_solution',
        type: 'dual_box',
        instruction: 'Simplify each side',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: row2ExpectedLeft,
        expectedRight: row2ExpectedRight,
        bank: [...new Set(row2Bank)].sort()
      }
    ]
  };
  
  return {
    problem,
    displayProblem: problem,
    answer: String(solution),
    choices: [String(solution)],
    staged,
    explanation: {
      originalProblem: problem,
      steps: [
        { 
          description: 'Original Problem:', 
          work: problem 
        },
        { 
          description: `Step 1: ${operationNeeded === 'add' ? 'Add' : 'Subtract'} ${Math.abs(operationValue)} ${operationNeeded === 'add' ? 'to' : 'from'} both sides`, 
          work: `    ${problem.split('=')[0].trim()}\n${row1Expected[0]}   ${row1Expected[1]}\n_____________\n    ${row2ExpectedLeft[0]} = ${row2ExpectedRight[0]}`
        },
        { 
          description: 'Solution:', 
          work: `x = ${solution}` 
        }
      ],
      rule: `To isolate the variable, remove the lonely number by performing the opposite operation on both sides. When working with negative numbers, remember that subtracting a negative is the same as adding a positive.`,
      finalAnswer: String(solution)
    }
  };
};

// ============================================
// LEVEL 1-20: ONE-STEP EQUATIONS (Multiply/Divide with Negatives & Fractions)
// Same as Level 18 but expands with negatives and proper fractions
// Easy: x ∈ {-12..12}, negatives allowed, simple fractions
// Hard: x ∈ {-20..20}, negatives, decimals, complex fractions
// 7 Skeletons (adds negative variants)
// ============================================

// LEVEL 20 GENERATOR - EXACT MATH VERSION
// This replaces the Level 20 section in equationGenerators.js
// Copy lines 835-1179 and replace with this

export const generateOneStepMultiplyDivideNegativesFractions = (difficulty) => {
  const levelId = '1-20';
  
  // Format fraction for display with proper HTML structure
  const formatFraction = (num, den) => {
    if (den === 1) return String(num);
    // Return fraction in format: (num/den)
    return `(${num}/${den})`;
  };
  
  // All 7 skeletons
  const allSkeletons = [
    'ax=b',      // (p/q)x = b
    'x/a=b',     // x/a = b
    'b=ax',      // b = (p/q)x
    'b=x/a',     // b = x/a
    'a=x/b',     // a = x/b
    '-ax=b',     // -(p/q)x = b
    'x/(-a)=b'   // x/(-a) = b
  ];
  
  const skeleton = getNextSkeleton(levelId, difficulty, allSkeletons);
  
 let problem, operationNeeded, operationValue, operationValueDisplay;
let problemHasConstantOnLeft = false;
let p, q, k, b, solution, a;

  
  if (difficulty === 'easy') {
    // EASY MODE: Exact construction
    
    if (skeleton === 'ax=b' || skeleton === 'b=ax') {
      // Use coefficient form: (p/q)x = b
      // Construction: Pick p, q, k; then x = q*k and b = p*k
      const denominators = [2, 3, 4, 5];
      q = denominators[Math.floor(Math.random() * denominators.length)];
      p = randomNonZeroInt(-3, 3); // Small numerators
      k = randomNonZeroInt(1, 6);   // Small multiplier
      
      solution = q * k;  // EXACT
      b = p * k;         // EXACT
      
      if (skeleton === 'ax=b') {
        problem = `(${p}/${q})x = ${b}`;
      } else {
        problem = `${b} = (${p}/${q})x`;
        problemHasConstantOnLeft = true;
      }
      
      operationNeeded = 'divide';
      operationValue = p / q;  // Numeric value for calculations
      operationValueDisplay = `(${p}/${q})`;  // Display string
      
    } else if (skeleton === 'x/a=b' || skeleton === 'b=x/a') {
      // Division form: x/a = b
      // Construction: Pick a, b; then x = a*b
      a = randomNonZeroInt(2, 12);
      b = randomNonZeroInt(-10, 10);
      solution = a * b;  // EXACT
      
      if (skeleton === 'x/a=b') {
        problem = `x/${a} = ${b}`;
      } else {
        problem = `${b} = x/${a}`;
        problemHasConstantOnLeft = true;
      }
      
      operationNeeded = 'multiply';
      operationValue = a;
      operationValueDisplay = String(a);
      
    } else if (skeleton === 'a=x/b') {
      // Form: a = x/b
      b = randomNonZeroInt(2, 12);
      a = randomNonZeroInt(-10, 10);
      solution = a * b;  // EXACT
      
      problem = `${a} = x/${b}`;
      problemHasConstantOnLeft = true;
      operationNeeded = 'multiply';
      operationValue = b;
      operationValueDisplay = String(b);
      
    } else if (skeleton === '-ax=b') {
      // Negative coefficient: -(p/q)x = b
      q = [2, 3, 4][Math.floor(Math.random() * 3)];
      p = randomNonZeroInt(1, 3);  // Positive p
      k = randomNonZeroInt(1, 6);
      
      solution = -q * k;  // Negative solution
      b = -p * k;         // EXACT
      
      problem = `(-${p}/${q})x = ${b}`;
      operationNeeded = 'divide';
      operationValue = -p / q;
      operationValueDisplay = `(-${p}/${q})`;
      
    } else if (skeleton === 'x/(-a)=b') {
      // Negative divisor: x/(-a) = b (ASCII minus only!)
      a = randomNonZeroInt(2, 8);
      b = randomNonZeroInt(-8, 8);
      solution = -a * b;  // EXACT
      
      problem = `x/(-${a}) = ${b}`;  // ASCII minus
      operationNeeded = 'multiply';
      operationValue = -a;
      operationValueDisplay = `(-${a})`;
    }
    
  } else {
    // HARD MODE: Exact construction with larger ranges
    
    if (skeleton === 'ax=b' || skeleton === 'b=ax') {
      // Coefficient form with more complex fractions
      const denominators = [2, 3, 4, 5, 6, 8, 10, 12];
      q = denominators[Math.floor(Math.random() * denominators.length)];
      p = randomNonZeroInt(-9, 9);  // Larger range
      k = randomNonZeroInt(-12, 12);
      
      solution = q * k;  // EXACT
      b = p * k;         // EXACT
      
      if (skeleton === 'ax=b') {
        problem = `(${p}/${q})x = ${b}`;
      } else {
        problem = `${b} = (${p}/${q})x`;
        problemHasConstantOnLeft = true;
      }
      
      operationNeeded = 'divide';
      operationValue = p / q;
      operationValueDisplay = `(${p}/${q})`;
      
    } else if (skeleton === 'x/a=b' || skeleton === 'b=x/a') {
      a = randomNonZeroInt(-12, 12);
      b = randomNonZeroInt(-15, 15);
      solution = a * b;  // EXACT
      
      if (skeleton === 'x/a=b') {
        problem = `x/${a} = ${b}`;
      } else {
        problem = `${b} = x/${a}`;
        problemHasConstantOnLeft = true;
      }
      
      operationNeeded = 'multiply';
      operationValue = a;
      operationValueDisplay = String(a);
      
    } else if (skeleton === 'a=x/b') {
      b = randomNonZeroInt(-12, 12);
      a = randomNonZeroInt(-15, 15);
      solution = a * b;  // EXACT
      
      problem = `${a} = x/${b}`;
      problemHasConstantOnLeft = true;
      operationNeeded = 'multiply';
      operationValue = b;
      operationValueDisplay = String(b);
      
    } else if (skeleton === '-ax=b') {
      q = [2, 3, 4, 5, 6, 8][Math.floor(Math.random() * 6)];
      p = randomNonZeroInt(1, 9);
      k = randomNonZeroInt(-12, 12);
      
      solution = -q * k;
      b = -p * k;  // EXACT
      
      problem = `(-${p}/${q})x = ${b}`;
      operationNeeded = 'divide';
      operationValue = -p / q;
      operationValueDisplay = `(-${p}/${q})`;
      
    } else if (skeleton === 'x/(-a)=b') {
      a = randomNonZeroInt(2, 12);
      b = randomNonZeroInt(-15, 15);
      solution = -a * b;  // EXACT
      
      problem = `x/(-${a}) = ${b}`;  // ASCII minus
      operationNeeded = 'multiply';
      operationValue = -a;
      operationValueDisplay = `(-${a})`;
    }
  }
  
  // Build Row 1 bank (operations)
  // Use operationValueDisplay for all student-facing strings
  const isFractionCoefficient = operationValueDisplay.includes('/');
  
  let row1Bank;
  if (isFractionCoefficient) {
    // Fraction coefficient distractors - pedagogically meaningful
    const [fullMatch, sign, num, den] = operationValueDisplay.match(/^\((-?)(\d+)\/(\d+)\)$/) || [null, '', '1', '1'];
    const oppositeSign = sign === '-' ? '' : '-';
    
    row1Bank = [
      operationNeeded === 'multiply' ? `× ${operationValueDisplay}` : `÷ ${operationValueDisplay}`, // Correct
      operationNeeded === 'multiply' ? `÷ ${operationValueDisplay}` : `× ${operationValueDisplay}`, // Wrong operation
      operationNeeded === 'multiply' ? `× (${den}/${num})` : `÷ (${den}/${num})`, // Reciprocal
      operationNeeded === 'multiply' ? `÷ (${den}/${num})` : `× (${den}/${num})`, // Reciprocal wrong op
      operationNeeded === 'multiply' ? `× (${oppositeSign}${num}/${den})` : `÷ (${oppositeSign}${num}/${den})`, // Sign error
      operationNeeded === 'multiply' ? `÷ (${oppositeSign}${num}/${den})` : `× (${oppositeSign}${num}/${den})`, // Sign + op error
      `+ ${b}`, // Addition distractor
      `- ${b}`, // Subtraction distractor
      formatWithSign(b + 1),
      formatWithSign(b - 1)
    ];
  } else {
    // Integer distractors - existing logic works fine
    row1Bank = [
      operationNeeded === 'multiply' ? `× ${operationValueDisplay}` : `÷ ${operationValueDisplay}`, // Correct
      operationNeeded === 'multiply' ? `÷ ${operationValueDisplay}` : `× ${operationValueDisplay}`, // Wrong operation
      operationNeeded === 'multiply' ? `× ${-operationValue}` : `÷ ${-operationValue}`, // Sign error
      `× ${Math.abs(operationValue) + 1}`,
      `÷ ${Math.abs(operationValue) + 1}`,
      formatWithSign(Math.abs(operationValue)),
      formatWithSign(-Math.abs(operationValue)),
      `× ${Math.abs(b)}`,
      `÷ ${Math.abs(b)}`,
      operationNeeded === 'multiply' ? `× ${Math.abs(operationValue) * 2}` : `÷ ${Math.abs(operationValue) * 2}`
    ];
  }
  
  const row1Expected = operationNeeded === 'multiply' 
    ? [`× ${operationValueDisplay}`, `× ${operationValueDisplay}`]
    : [`÷ ${operationValueDisplay}`, `÷ ${operationValueDisplay}`];
  
  // Build Row 2 bank
  const row2Bank = [
    'x',
    '-x',
    String(solution),
    String(-solution),
    String(solution + 1),
    String(solution - 1),
    String(Math.abs(operationValue)),
    String(-Math.abs(operationValue)),
    String(Math.abs(b)),
    String(-Math.abs(b))
  ];
  
  const row2ExpectedLeft = problemHasConstantOnLeft ? [String(solution)] : ['x'];
  const row2ExpectedRight = problemHasConstantOnLeft ? ['x'] : [String(solution)];
  
    // Build staged structure (matches Levels 17-19 format)
  const staged = {
    mode: 'equation_solver',
    rows: [
      {
        id: 'row0_draw_line',
        type: 'single_choice',
        instruction: 'What do you do first?',
        choices: ['Draw a line'],
        expected: ['Draw a line']
      },
      {
        id: 'row1_operation',
        type: 'dual_box',
        instruction: 'What do we do to both sides?',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: [row1Expected[0]],
        expectedRight: [row1Expected[1]],
        bank: [...new Set(row1Bank)].sort()
      },
      {
        id: 'row2_solution',
        type: 'dual_box',
        instruction: 'Simplify each side',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: row2ExpectedLeft,
        expectedRight: row2ExpectedRight,
        bank: [...new Set(row2Bank)].sort()
      }
    ]
  };

  // Determine rule based on operation (same tone as Level 18)
  const rule = operationNeeded === 'multiply'
    ? 'To isolate the variable, clear the fence by multiplying both sides by the number across the fence.'
    : 'To isolate the variable, unstick the sticky by dividing the sticky number on both sides.';

  return {
    problem,
    displayProblem: problem,
    answer: String(solution),
    choices: [String(solution)],
    staged,
    explanation: {
      originalProblem: problem,
      steps: [
        { description: 'Original Problem:', work: problem },
        {
          description: `Step 1: ${operationNeeded === 'multiply' ? 'Multiply' : 'Divide'} both sides by ${operationValueDisplay}`,
          work: `    ${problem.split('=')[0].trim()}\n${row1Expected[0]}   ${row1Expected[1]}\n_____________\n    ${row2ExpectedLeft[0]} = ${row2ExpectedRight[0]}`
        },
        { description: 'Solution:', work: `x = ${solution}` }
      ],
      rule,
      finalAnswer: String(solution)
    }
  };
};

// ============================================
// LEVEL 1-21: TWO-STEP EQUATIONS (ax + b = c)
// Multiply then add: ax + b = c
// Solve: subtract b, then divide by a
// Easy: -12 to 12, times tables, whole numbers
// Hard: Same range, introduce decimals/fractions
// ============================================

export const generateTwoStepMultiplyAdd = (difficulty) => {
  const levelId = '1-21';
  
  // All 4 skeleton forms
  const allSkeletons = [
    'ax+b=c',
    'c=ax+b',
    'b+ax=c',
    'c=b+ax'
  ];
  
  const skeleton = getNextSkeleton(levelId, difficulty, allSkeletons);
  
  let a, b, c, solution, problem;
  let problemHasConstantOnLeft = false;
  let aDisplay, aNumeric;
  
  if (difficulty === 'easy') {
    // Easy: -12 to 12, times tables, whole numbers
    a = randomNonZeroInt(-12, 12);
    b = randomNonZeroInt(-12, 12);
    solution = randomNonZeroInt(-12, 12);
    
    // Calculate c: c = a*x + b
    c = a * solution + b;
    aDisplay = String(a);
    aNumeric = a;
    
    // Build problem string based on skeleton
    // CRITICAL: Handle negative coefficients properly to avoid + -7x
    if (skeleton === 'ax+b=c') {
      // ax + b = c form
      const axTerm = a < 0 ? `-${Math.abs(a)}x` : `${a}x`;
      problem = b < 0 ? `${axTerm} - ${Math.abs(b)} = ${c}` : `${axTerm} + ${b} = ${c}`;
    } else if (skeleton === 'c=ax+b') {
      // c = ax + b form
      const axTerm = a < 0 ? `-${Math.abs(a)}x` : `${a}x`;
      problem = b < 0 ? `${c} = ${axTerm} - ${Math.abs(b)}` : `${c} = ${axTerm} + ${b}`;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'b+ax=c') {
      // b + ax = c form - FIX: Handle negative a properly
      if (b < 0 && a < 0) {
        problem = `-${Math.abs(b)} - ${Math.abs(a)}x = ${c}`;
      } else if (b < 0 && a > 0) {
        problem = `-${Math.abs(b)} + ${a}x = ${c}`;
      } else if (b > 0 && a < 0) {
        problem = `${b} - ${Math.abs(a)}x = ${c}`;
      } else {
        problem = `${b} + ${a}x = ${c}`;
      }
    } else if (skeleton === 'c=b+ax') {
      // c = b + ax form - FIX: Handle negative a properly
      if (b < 0 && a < 0) {
        problem = `${c} = -${Math.abs(b)} - ${Math.abs(a)}x`;
      } else if (b < 0 && a > 0) {
        problem = `${c} = -${Math.abs(b)} + ${a}x`;
      } else if (b > 0 && a < 0) {
        problem = `${c} = ${b} - ${Math.abs(a)}x`;
      } else {
        problem = `${c} = ${b} + ${a}x`;
      }
      problemHasConstantOnLeft = true;
    }
    
  } else {
    // Hard: Same range but with occasional fractions/decimals
    const useDecimal = Math.random() < 0.2;
    const useFraction = !useDecimal && Math.random() < 0.2;
    
    if (useFraction) {
      // Use fraction for coefficient a
      const denoms = [2, 3, 4, 5];
      const q = denoms[Math.floor(Math.random() * denoms.length)];
      const p = randomNonZeroInt(-6, 6);
      
      // Pick solution that works cleanly
      const k = randomNonZeroInt(-8, 8);
      solution = q * k;  // Ensures clean result
      
      b = randomNonZeroInt(-12, 12);
      c = p * k + b;  // c = (p/q)*solution + b
      
      aDisplay = `(${p}/${q})`;  // Keep as fraction string
      aNumeric = p / q;  // For calculations only
      
      if (skeleton === 'ax+b=c') {
        problem = b < 0 ? `${aDisplay}x - ${Math.abs(b)} = ${c}` : `${aDisplay}x + ${b} = ${c}`;
      } else if (skeleton === 'c=ax+b') {
        problem = b < 0 ? `${c} = ${aDisplay}x - ${Math.abs(b)}` : `${c} = ${aDisplay}x + ${b}`;
        problemHasConstantOnLeft = true;
      } else if (skeleton === 'b+ax=c') {
        problem = b < 0 ? `-${Math.abs(b)} + ${aDisplay}x = ${c}` : `${b} + ${aDisplay}x = ${c}`;
      } else if (skeleton === 'c=b+ax') {
        problem = b < 0 ? `${c} = -${Math.abs(b)} + ${aDisplay}x` : `${c} = ${b} + ${aDisplay}x`;
        problemHasConstantOnLeft = true;
      }
      
      a = aNumeric;  // For calculations
      
    } else if (useDecimal) {
      // Decimals (.5 increments only - no long decimals)
      // Keep denominator positive to avoid fraction-bar rendering bugs
      a = (randomInt(2, 24) / 2); // 1.0 to 12.0, positive
      b = (randomNonZeroInt(-24, 24) / 2);
      while (Math.abs(b) < 1) b = (randomNonZeroInt(-24, 24) / 2); // avoid ±0.5
      solution = randomNonZeroInt(-12, 12);
      c = a * solution + b;
      aDisplay = String(a);
      aNumeric = a;
      
      const axTerm = a < 0 ? `-${Math.abs(a)}x` : `${a}x`;
      
      if (skeleton === 'ax+b=c') {
        problem = b < 0 ? `${axTerm} - ${Math.abs(b)} = ${c}` : `${axTerm} + ${b} = ${c}`;
      } else if (skeleton === 'c=ax+b') {
        problem = b < 0 ? `${c} = ${axTerm} - ${Math.abs(b)}` : `${c} = ${axTerm} + ${b}`;
        problemHasConstantOnLeft = true;
      } else if (skeleton === 'b+ax=c') {
        if (b < 0 && a < 0) {
          problem = `-${Math.abs(b)} - ${Math.abs(a)}x = ${c}`;
        } else if (b < 0 && a > 0) {
          problem = `-${Math.abs(b)} + ${a}x = ${c}`;
        } else if (b > 0 && a < 0) {
          problem = `${b} - ${Math.abs(a)}x = ${c}`;
        } else {
          problem = `${b} + ${a}x = ${c}`;
        }
      } else if (skeleton === 'c=b+ax') {
        if (b < 0 && a < 0) {
          problem = `${c} = -${Math.abs(b)} - ${Math.abs(a)}x`;
        } else if (b < 0 && a > 0) {
          problem = `${c} = -${Math.abs(b)} + ${a}x`;
        } else if (b > 0 && a < 0) {
          problem = `${c} = ${b} - ${Math.abs(a)}x`;
        } else {
          problem = `${c} = ${b} + ${a}x`;
        }
        problemHasConstantOnLeft = true;
      }
      
    } else {
      // Regular integers
      a = randomNonZeroInt(-12, 12);
      b = randomNonZeroInt(-12, 12);
      solution = randomNonZeroInt(-12, 12);
      c = a * solution + b;
      aDisplay = String(a);
      aNumeric = a;
      
      const axTerm = a < 0 ? `-${Math.abs(a)}x` : `${a}x`;
      
      if (skeleton === 'ax+b=c') {
        problem = b < 0 ? `${axTerm} - ${Math.abs(b)} = ${c}` : `${axTerm} + ${b} = ${c}`;
      } else if (skeleton === 'c=ax+b') {
        problem = b < 0 ? `${c} = ${axTerm} - ${Math.abs(b)}` : `${c} = ${axTerm} + ${b}`;
        problemHasConstantOnLeft = true;
      } else if (skeleton === 'b+ax=c') {
        if (b < 0 && a < 0) {
          problem = `-${Math.abs(b)} - ${Math.abs(a)}x = ${c}`;
        } else if (b < 0 && a > 0) {
          problem = `-${Math.abs(b)} + ${a}x = ${c}`;
        } else if (b > 0 && a < 0) {
          problem = `${b} - ${Math.abs(a)}x = ${c}`;
        } else {
          problem = `${b} + ${a}x = ${c}`;
        }
      } else if (skeleton === 'c=b+ax') {
        if (b < 0 && a < 0) {
          problem = `${c} = -${Math.abs(b)} - ${Math.abs(a)}x`;
        } else if (b < 0 && a > 0) {
          problem = `${c} = -${Math.abs(b)} + ${a}x`;
        } else if (b > 0 && a < 0) {
          problem = `${c} = ${b} - ${Math.abs(a)}x`;
        } else {
          problem = `${c} = ${b} + ${a}x`;
        }
        problemHasConstantOnLeft = true;
      }
    }
  }
  
  // STEP 1: Subtract b from both sides (inverse operation)
  // Sign-safe formatting: never concatenate sign with negative number
  const step1Operation = b < 0 ? `+ ${Math.abs(b)}` : `- ${Math.abs(b)}`;
  const afterStep1 = c - b;
  
  // FIX: For display, handle negative a properly in ax term
  let afterStep1LeftDisplay, afterStep1RightDisplay;
  if (problemHasConstantOnLeft) {
    afterStep1LeftDisplay = String(afterStep1);
    afterStep1RightDisplay = aDisplay.includes('/') ? `${aDisplay}x` : (aNumeric < 0 ? `-${Math.abs(aNumeric)}x` : `${aDisplay}x`);
  } else {
    afterStep1LeftDisplay = aDisplay.includes('/') ? `${aDisplay}x` : (aNumeric < 0 ? `-${Math.abs(aNumeric)}x` : `${aDisplay}x`);
    afterStep1RightDisplay = String(afterStep1);
  }
  
  // STEP 2: Divide by a on both sides
  // Consistent formatting: use parentheses for negative numbers
  const step2Operation = aNumeric < 0 ? `÷ (${aDisplay})` : `÷ ${aDisplay}`;
  const afterStep2Left = problemHasConstantOnLeft ? String(solution) : 'x';
  const afterStep2Right = problemHasConstantOnLeft ? 'x' : String(solution);
  
  // Build Row 1 bank (first operation: subtract b)
  // SIGN-SAFE: Never produce + -5 or - -5
  // CONSISTENT SPACING: Always "op space number" format
  const row1Bank = [
    step1Operation,  // Correct
    b < 0 ? `- ${Math.abs(b)}` : `+ ${Math.abs(b)}`,  // Wrong sign
    `× ${Math.abs(b)}`,
    `÷ ${Math.abs(b)}`,
    `+ ${Math.abs(b)}`,  // Distractor
    `- ${Math.abs(b)}`,  // Distractor
    // Use aDisplay for string distractors
    aDisplay.includes('/') ? `× ${aDisplay}` : `× ${Math.abs(aNumeric)}`,
    aDisplay.includes('/') ? `÷ ${aDisplay}` : `÷ ${Math.abs(aNumeric)}`,
    c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`,
    c >= 0 ? `- ${c}` : `+ ${Math.abs(c)}`
  ];
  
  // Build Row 2 bank (result after subtracting b)
  const axDisplay = aDisplay.includes('/') ? `${aDisplay}x` : (aNumeric < 0 ? `-${Math.abs(aNumeric)}x` : `${aDisplay}x`);
  const row2Bank = [
    axDisplay,
    aNumeric < 0 ? `${Math.abs(aNumeric)}x` : `-${aDisplay}x`,
    String(afterStep1),
    String(-afterStep1),
    String(afterStep1 + 1),
    String(afterStep1 - 1),
    'x',
    '-x',
    String(solution),
    String(-solution)
  ];
  
  // FIX: Use display versions for expected values
  const row2ExpectedLeft = problemHasConstantOnLeft ? [String(afterStep1)] : [axDisplay];
  const row2ExpectedRight = problemHasConstantOnLeft ? [axDisplay] : [String(afterStep1)];
  
  // Build Row 3 bank (operation: divide by a)
  // CONSISTENT FORMATTING: Always use same spacing
  const row3Bank = [
    step2Operation,  // Correct
    aNumeric < 0 ? `× (${aDisplay})` : `× ${aDisplay}`,  // Wrong operation
    aDisplay.includes('/') ? 
      `÷ (${aDisplay.replace(/^\(-?/, '(-').replace(/^\(/, '(-')})` :
      (aNumeric < 0 ? `÷ ${Math.abs(aNumeric)}` : `÷ ${-aNumeric}`),
    aDisplay.includes('/') ? 
      `× (${aDisplay.replace(/^\(-?/, '(-').replace(/^\(/, '(-')})` :
      (aNumeric < 0 ? `× ${Math.abs(aNumeric)}` : `× ${-aNumeric}`),
    aDisplay.includes('/') ? `÷ (2/3)` : `÷ ${Math.abs(aNumeric) + 1}`,
    aDisplay.includes('/') ? `× (3/2)` : `× ${Math.abs(aNumeric) + 1}`,
    aNumeric >= 0 ? `+ ${Math.floor(aNumeric)}` : `- ${Math.abs(Math.floor(aNumeric))}`,
    aNumeric >= 0 ? `- ${Math.floor(aNumeric)}` : `+ ${Math.abs(Math.floor(aNumeric))}`,
    b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`,
    b >= 0 ? `- ${b}` : `+ ${Math.abs(b)}`
  ];
  
  // Build Row 4 bank (final solution)
  const row4Bank = [
    'x',
    '-x',
    String(solution),
    String(-solution),
    String(solution + 1),
    String(solution - 1),
    String(Math.floor(aNumeric)),
    String(-Math.floor(aNumeric)),
    String(b),
    String(-b)
  ];
  
  const row4ExpectedLeft = problemHasConstantOnLeft ? [String(solution)] : ['x'];
  const row4ExpectedRight = problemHasConstantOnLeft ? ['x'] : [String(solution)];
  
  // Build staged structure (5 rows for two-step)
  const staged = {
    mode: 'equation_solver',
    rows: [
      {
        id: 'row0_draw_line',
        type: 'single_choice',
        instruction: 'What do you do first?',
        choices: ['Draw a line'],
        expected: ['Draw a line']
      },
      {
        id: 'row1_operation',
        type: 'dual_box',
        instruction: 'What do we do to both sides?',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: [step1Operation],
        expectedRight: [step1Operation],
        bank: [...new Set(row1Bank)].sort()
      },
      {
        id: 'row2_after_subtract',
        type: 'dual_box',
        instruction: 'Simplify each side',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: row2ExpectedLeft,
        expectedRight: row2ExpectedRight,
        bank: [...new Set(row2Bank)].sort()
      },
      {
        id: 'row3_divide',
        type: 'dual_box',
        instruction: 'What do we do to both sides?',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: [step2Operation],
        expectedRight: [step2Operation],
        bank: [...new Set(row3Bank)].sort()
      },
      {
        id: 'row4_solution',
        type: 'dual_box',
        instruction: 'Simplify to solve',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: row4ExpectedLeft,
        expectedRight: row4ExpectedRight,
        bank: [...new Set(row4Bank)].sort()
      }
    ]
  };
  
  const rule = 'Need to remove the lonely number before unsticking the sticky';
  
  return {
    problem,
    displayProblem: problem,
    answer: String(solution),
    choices: [String(solution)],
    staged,
    explanation: {
      originalProblem: problem,
      steps: [
        { description: 'Original Problem:', work: problem },
        {
          description: `Step 1: ${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)} to/from both sides`,
          work: `    ${problem.split('=')[0].trim()}\n${step1Operation}   ${step1Operation}\n_____________\n    ${afterStep1LeftDisplay} = ${afterStep1RightDisplay}`
        },
        {
          description: `Step 2: Divide both sides by ${aDisplay}`,
          work: `    ${afterStep1LeftDisplay} = ${afterStep1RightDisplay}\n${step2Operation}   ${step2Operation}\n_____________\n    ${afterStep2Left} = ${afterStep2Right}`
        },
        { description: 'Solution:', work: `x = ${solution}` }
      ],
      rule,
      finalAnswer: String(solution)
    }
  };
};

// ============================================
// LEVEL 1-22: TWO-STEP EQUATIONS (x/a + b = c)
// Divide then add: x/a + b = c
// Solve: subtract b, then multiply by a
// Easy: -12 to 12, times tables, whole numbers
// Hard: Same range, introduce decimals/fractions
// ============================================

export const generateTwoStepDivideAdd = (difficulty) => {
  const levelId = '1-22';
  
  // All 4 skeleton forms
  const allSkeletons = [
    'x/a+b=c',
    'c=x/a+b',
    'b+x/a=c',
    'c=b+x/a'
  ];
  
  const skeleton = getNextSkeleton(levelId, difficulty, allSkeletons);
  
  let a, b, c, solution, problem;
  let problemHasConstantOnLeft = false;
  
  if (difficulty === 'easy') {
    // Easy: -12 to 12, times tables, whole numbers
    a = randomNonZeroInt(-12, 12);
    b = randomNonZeroInt(-12, 12);
    
    // Pick solution such that x/a is a whole number (mental math friendly)
    const quotient = randomNonZeroInt(-12, 12);
    solution = a * quotient;  // Ensures x/a = quotient (whole number)
    
    // Calculate c: c = x/a + b = quotient + b
    c = quotient + b;
    
    // Build problem string based on skeleton
    // CRITICAL: If b is negative, display as subtraction
    if (skeleton === 'x/a+b=c') {
      problem = b < 0 ? `x/${a} - ${Math.abs(b)} = ${c}` : `x/${a} + ${b} = ${c}`;
    } else if (skeleton === 'c=x/a+b') {
      problem = b < 0 ? `${c} = x/${a} - ${Math.abs(b)}` : `${c} = x/${a} + ${b}`;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'b+x/a=c') {
      problem = b < 0 ? `-${Math.abs(b)} + x/${a} = ${c}` : `${b} + x/${a} = ${c}`;
    } else if (skeleton === 'c=b+x/a') {
      problem = b < 0 ? `${c} = -${Math.abs(b)} + x/${a}` : `${c} = ${b} + x/${a}`;
      problemHasConstantOnLeft = true;
    }
    
  } else {
    // Hard: Same range but with occasional decimals
    const useDecimal = Math.random() < 0.2;
    
    if (useDecimal) {
      // Decimals (.5 increments only)
      a = (randomNonZeroInt(-24, 24) / 2);
      b = (randomNonZeroInt(-24, 24) / 2);
      
      // Pick solution such that x/a is whole or half
      const quotient = (randomNonZeroInt(-24, 24) / 2);
      solution = a * quotient;
      c = quotient + b;
      
      if (skeleton === 'x/a+b=c') {
        problem = b < 0 ? `x/${a} - ${Math.abs(b)} = ${c}` : `x/${a} + ${b} = ${c}`;
      } else if (skeleton === 'c=x/a+b') {
        problem = b < 0 ? `${c} = x/${a} - ${Math.abs(b)}` : `${c} = x/${a} + ${b}`;
        problemHasConstantOnLeft = true;
      } else if (skeleton === 'b+x/a=c') {
        problem = b < 0 ? `-${Math.abs(b)} + x/${a} = ${c}` : `${b} + x/${a} = ${c}`;
      } else if (skeleton === 'c=b+x/a') {
        problem = b < 0 ? `${c} = -${Math.abs(b)} + x/${a}` : `${c} = ${b} + x/${a}`;
        problemHasConstantOnLeft = true;
      }
      
    } else {
      // Regular integers
      a = randomNonZeroInt(-12, 12);
      b = randomNonZeroInt(-12, 12);
      
      const quotient = randomNonZeroInt(-12, 12);
      solution = a * quotient;
      c = quotient + b;
      
      if (skeleton === 'x/a+b=c') {
        problem = b < 0 ? `x/${a} - ${Math.abs(b)} = ${c}` : `x/${a} + ${b} = ${c}`;
      } else if (skeleton === 'c=x/a+b') {
        problem = b < 0 ? `${c} = x/${a} - ${Math.abs(b)}` : `${c} = x/${a} + ${b}`;
        problemHasConstantOnLeft = true;
      } else if (skeleton === 'b+x/a=c') {
        problem = b < 0 ? `-${Math.abs(b)} + x/${a} = ${c}` : `${b} + x/${a} = ${c}`;
      } else if (skeleton === 'c=b+x/a') {
        problem = b < 0 ? `${c} = -${Math.abs(b)} + x/${a}` : `${c} = ${b} + x/${a}`;
        problemHasConstantOnLeft = true;
      }
    }
  }
  
  // STEP 1: Subtract b from both sides (inverse operation)
  const step1Operation = b < 0 ? `+ ${Math.abs(b)}` : `- ${Math.abs(b)}`;
  const afterStep1 = c - b;  // This is the quotient x/a
  const afterStep1Left = problemHasConstantOnLeft ? String(afterStep1) : `x/${a}`;
  const afterStep1Right = problemHasConstantOnLeft ? `x/${a}` : String(afterStep1);
  
  // STEP 2: Multiply by a on both sides
  const step2Operation = a < 0 ? `× (${a})` : `× ${a}`;
  const afterStep2Left = problemHasConstantOnLeft ? String(solution) : 'x';
  const afterStep2Right = problemHasConstantOnLeft ? 'x' : String(solution);
  
  // Build Row 1 bank (first operation: subtract b)
  // CONSISTENT SPACING
  const row1Bank = [
    step1Operation,
    b < 0 ? `- ${Math.abs(b)}` : `+ ${Math.abs(b)}`,
    `× ${Math.abs(b)}`,
    `÷ ${Math.abs(b)}`,
    `+ ${Math.abs(b)}`,
    `- ${Math.abs(b)}`,
    a < 0 ? `× ${Math.abs(a)}` : `× ${Math.abs(a)}`,
    a < 0 ? `÷ ${Math.abs(a)}` : `÷ ${Math.abs(a)}`,
    c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`,
    c >= 0 ? `- ${c}` : `+ ${Math.abs(c)}`
  ];
  
  // Build Row 2 bank (result after subtracting b)
  const row2Bank = [
    `x/${a}`,
    a < 0 ? `x/${-a}` : `-x/${a}`,
    String(afterStep1),
    String(-afterStep1),
    String(afterStep1 + 1),
    String(afterStep1 - 1),
    'x',
    '-x',
    String(solution),
    String(-solution)
  ];
  
  const row2ExpectedLeft = problemHasConstantOnLeft ? [String(afterStep1)] : [`x/${a}`];
  const row2ExpectedRight = problemHasConstantOnLeft ? [`x/${a}`] : [String(afterStep1)];
  
  // Build Row 3 bank (operation: multiply by a)
  // CONSISTENT FORMATTING
  const row3Bank = [
    step2Operation,
    a < 0 ? `÷ (${a})` : `÷ ${a}`,
    a < 0 ? `× ${-a}` : `× (${-a})`,
    a < 0 ? `÷ ${-a}` : `÷ (${-a})`,
    `× ${Math.abs(a) + 1}`,
    `÷ ${Math.abs(a) + 1}`,
    a >= 0 ? `+ ${a}` : `- ${Math.abs(a)}`,
    a >= 0 ? `- ${a}` : `+ ${Math.abs(a)}`,
    b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`,
    b >= 0 ? `- ${b}` : `+ ${Math.abs(b)}`
  ];
  
  // Build Row 4 bank (final solution)
  const row4Bank = [
    'x',
    '-x',
    String(solution),
    String(-solution),
    String(solution + 1),
    String(solution - 1),
    String(a),
    String(-a),
    String(b),
    String(-b)
  ];
  
  const row4ExpectedLeft = problemHasConstantOnLeft ? [String(solution)] : ['x'];
  const row4ExpectedRight = problemHasConstantOnLeft ? ['x'] : [String(solution)];
  
  // Build staged structure (5 rows for two-step)
  const staged = {
    mode: 'equation_solver',
    rows: [
      {
        id: 'row0_draw_line',
        type: 'single_choice',
        instruction: 'What do you do first?',
        choices: ['Draw a line'],
        expected: ['Draw a line']
      },
      {
        id: 'row1_operation',
        type: 'dual_box',
        instruction: 'What do we do to both sides?',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: [step1Operation],
        expectedRight: [step1Operation],
        bank: [...new Set(row1Bank)].sort()
      },
      {
        id: 'row2_after_subtract',
        type: 'dual_box',
        instruction: 'Simplify each side',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: row2ExpectedLeft,
        expectedRight: row2ExpectedRight,
        bank: [...new Set(row2Bank)].sort()
      },
      {
        id: 'row3_multiply',
        type: 'dual_box',
        instruction: 'What do we do to both sides?',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: [step2Operation],
        expectedRight: [step2Operation],
        bank: [...new Set(row3Bank)].sort()
      },
      {
        id: 'row4_solution',
        type: 'dual_box',
        instruction: 'Simplify to solve',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: row4ExpectedLeft,
        expectedRight: row4ExpectedRight,
        bank: [...new Set(row4Bank)].sort()
      }
    ]
  };
  
  const rule = 'Need to remove the lonely number before clearing the fence';
  
  return {
    problem,
    displayProblem: problem,
    answer: String(solution),
    choices: [String(solution)],
    staged,
    explanation: {
      originalProblem: problem,
      steps: [
        { description: 'Original Problem:', work: problem },
        {
          description: `Step 1: ${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)} to/from both sides`,
          work: `    ${problem.split('=')[0].trim()}\n${step1Operation}   ${step1Operation}\n_____________\n    ${afterStep1Left} = ${afterStep1Right}`
        },
        {
          description: `Step 2: Multiply both sides by ${a}`,
          work: `    ${afterStep1Left} = ${afterStep1Right}\n${step2Operation}   ${step2Operation}\n_____________\n    ${afterStep2Left} = ${afterStep2Right}`
        },
        { description: 'Solution:', work: `x = ${solution}` }
      ],
      rule,
      finalAnswer: String(solution)
    }
  };
};

// ============================================
// LEVEL 1-23: TWO-STEP EQUATIONS ((x + b)/a = c)
// Add then divide: (x + b)/a = c
// Solve: multiply by a, then subtract b
// Easy: -12 to 12, times tables, whole numbers
// Hard: Same range, introduce decimals/fractions
// FIX: Ensure c is ALWAYS clean (no long decimals)
// FIX: Avoid double parentheses in display
// ============================================

export const generateTwoStepAddDivide = (difficulty) => {
  const levelId = '1-23';
  
  // All 4 skeleton forms
  const allSkeletons = [
    '(x+b)/a=c',
    'c=(x+b)/a',
    '(b+x)/a=c',
    'c=(b+x)/a'
  ];
  
  const skeleton = getNextSkeleton(levelId, difficulty, allSkeletons);
  
  let a, b, c, solution, problem;
  let problemHasConstantOnLeft = false;
  
  if (difficulty === 'easy') {
    // Easy: -12 to 12, times tables, whole numbers
    // FIX: Pick c first to ensure clean division
    a = randomNonZeroInt(-12, 12);
    b = randomNonZeroInt(-12, 12);
    c = randomNonZeroInt(-12, 12);  // c is always whole number
    
    // Calculate solution: (x + b)/a = c → x + b = ac → x = ac - b
    solution = a * c - b;
    
    // Build problem string based on skeleton
    // CRITICAL: If b is negative, display as subtraction inside parentheses
    if (skeleton === '(x+b)/a=c') {
      problem = b < 0 ? `(x - ${Math.abs(b)})/${a} = ${c}` : `(x + ${b})/${a} = ${c}`;
    } else if (skeleton === 'c=(x+b)/a') {
      problem = b < 0 ? `${c} = (x - ${Math.abs(b)})/${a}` : `${c} = (x + ${b})/${a}`;
      problemHasConstantOnLeft = true;
    } else if (skeleton === '(b+x)/a=c') {
      problem = b < 0 ? `(-${Math.abs(b)} + x)/${a} = ${c}` : `(${b} + x)/${a} = ${c}`;
    } else if (skeleton === 'c=(b+x)/a') {
      problem = b < 0 ? `${c} = (-${Math.abs(b)} + x)/${a}` : `${c} = (${b} + x)/${a}`;
      problemHasConstantOnLeft = true;
    }
    
  } else {
    // Hard: Same range but with occasional decimals
    const useDecimal = Math.random() < 0.2;
    
    if (useDecimal) {
      // Decimals (.5 increments only)
      a = (randomNonZeroInt(-24, 24) / 2);
      b = (randomNonZeroInt(-24, 24) / 2);
      c = (randomNonZeroInt(-24, 24) / 2);  // c is clean decimal
      
      // Calculate solution
      solution = a * c - b;
      
      if (skeleton === '(x+b)/a=c') {
        problem = b < 0 ? `(x - ${Math.abs(b)})/${a} = ${c}` : `(x + ${b})/${a} = ${c}`;
      } else if (skeleton === 'c=(x+b)/a') {
        problem = b < 0 ? `${c} = (x - ${Math.abs(b)})/${a}` : `${c} = (x + ${b})/${a}`;
        problemHasConstantOnLeft = true;
      } else if (skeleton === '(b+x)/a=c') {
        problem = b < 0 ? `(-${Math.abs(b)} + x)/${a} = ${c}` : `(${b} + x)/${a} = ${c}`;
      } else if (skeleton === 'c=(b+x)/a') {
        problem = b < 0 ? `${c} = (-${Math.abs(b)} + x)/${a}` : `${c} = (${b} + x)/${a}`;
        problemHasConstantOnLeft = true;
      }
      
    } else {
      // Regular integers
      a = randomNonZeroInt(-12, 12);
      b = randomNonZeroInt(-12, 12);
      c = randomNonZeroInt(-12, 12);  // c is whole number
      
      // Calculate solution
      solution = a * c - b;
      
      if (skeleton === '(x+b)/a=c') {
        problem = b < 0 ? `(x - ${Math.abs(b)})/${a} = ${c}` : `(x + ${b})/${a} = ${c}`;
      } else if (skeleton === 'c=(x+b)/a') {
        problem = b < 0 ? `${c} = (x - ${Math.abs(b)})/${a}` : `${c} = (x + ${b})/${a}`;
        problemHasConstantOnLeft = true;
      } else if (skeleton === '(b+x)/a=c') {
        problem = b < 0 ? `(-${Math.abs(b)} + x)/${a} = ${c}` : `(${b} + x)/${a} = ${c}`;
      } else if (skeleton === 'c=(b+x)/a') {
        problem = b < 0 ? `${c} = (-${Math.abs(b)} + x)/${a}` : `${c} = (${b} + x)/${a}`;
        problemHasConstantOnLeft = true;
      }
    }
  }
  
  // STEP 1: Multiply by a on both sides (clear the fence first)
  // FIX: Don't over-parenthesize - just use number, no extra parens
  const step1Operation = a < 0 ? `× (${a})` : `× ${a}`;
  const afterStep1 = c * a;  // This is (x + b) - just the NUMBER, not wrapped in parens
  
  // FIX: For display after multiplying, show the algebraic expression without double parens
  const xPlusBTerm = b < 0 ? `x - ${Math.abs(b)}` : `x + ${b}`;
  const afterStep1Left = problemHasConstantOnLeft ? String(afterStep1) : xPlusBTerm;
  const afterStep1Right = problemHasConstantOnLeft ? xPlusBTerm : String(afterStep1);
  
  // STEP 2: Subtract b from both sides
  const step2Operation = b < 0 ? `+ ${Math.abs(b)}` : `- ${Math.abs(b)}`;
  const afterStep2Left = problemHasConstantOnLeft ? String(solution) : 'x';
  const afterStep2Right = problemHasConstantOnLeft ? 'x' : String(solution);
  
  // Build Row 1 bank (first operation: multiply by a)
  // CONSISTENT FORMATTING
  const row1Bank = [
    step1Operation,
    a < 0 ? `÷ (${a})` : `÷ ${a}`,
    a < 0 ? `× ${-a}` : `× (${-a})`,
    a < 0 ? `÷ ${-a}` : `÷ (${-a})`,
    `× ${Math.abs(a) + 1}`,
    `÷ ${Math.abs(a) + 1}`,
    a >= 0 ? `+ ${a}` : `- ${Math.abs(a)}`,
    a >= 0 ? `- ${a}` : `+ ${Math.abs(a)}`,
    b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`,
    b >= 0 ? `- ${b}` : `+ ${Math.abs(b)}`
  ];
  
  // Build Row 2 bank (result after multiplying by a)
  const row2Bank = [
    xPlusBTerm,
    b < 0 ? `-x - ${Math.abs(b)}` : `-x + ${b}`,
    String(afterStep1),
    String(-afterStep1),
    String(afterStep1 + 1),
    String(afterStep1 - 1),
    'x',
    '-x',
    String(solution),
    String(-solution)
  ];
  
  const row2ExpectedLeft = problemHasConstantOnLeft ? [String(afterStep1)] : [xPlusBTerm];
  const row2ExpectedRight = problemHasConstantOnLeft ? [xPlusBTerm] : [String(afterStep1)];
  
  // Build Row 3 bank (operation: subtract b)
  // CONSISTENT SPACING
  const row3Bank = [
    step2Operation,
    b < 0 ? `- ${Math.abs(b)}` : `+ ${Math.abs(b)}`,
    `× ${Math.abs(b)}`,
    `÷ ${Math.abs(b)}`,
    `+ ${Math.abs(b)}`,
    `- ${Math.abs(b)}`,
    a < 0 ? `× ${Math.abs(a)}` : `× ${Math.abs(a)}`,
    a < 0 ? `÷ ${Math.abs(a)}` : `÷ ${Math.abs(a)}`,
    c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`,
    c >= 0 ? `- ${c}` : `+ ${Math.abs(c)}`
  ];
  
  // Build Row 4 bank (final solution)
  const row4Bank = [
    'x',
    '-x',
    String(solution),
    String(-solution),
    String(solution + 1),
    String(solution - 1),
    String(a),
    String(-a),
    String(b),
    String(-b)
  ];
  
  const row4ExpectedLeft = problemHasConstantOnLeft ? [String(solution)] : ['x'];
  const row4ExpectedRight = problemHasConstantOnLeft ? ['x'] : [String(solution)];
  
  // Build staged structure (5 rows for two-step)
  const staged = {
    mode: 'equation_solver',
    rows: [
      {
        id: 'row0_draw_line',
        type: 'single_choice',
        instruction: 'What do you do first?',
        choices: ['Draw a line'],
        expected: ['Draw a line']
      },
      {
        id: 'row1_operation',
        type: 'dual_box',
        instruction: 'What do we do to both sides?',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: [step1Operation],
        expectedRight: [step1Operation],
        bank: [...new Set(row1Bank)].sort()
      },
      {
        id: 'row2_after_multiply',
        type: 'dual_box',
        instruction: 'Simplify each side',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: row2ExpectedLeft,
        expectedRight: row2ExpectedRight,
        bank: [...new Set(row2Bank)].sort()
      },
      {
        id: 'row3_subtract',
        type: 'dual_box',
        instruction: 'What do we do to both sides?',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: [step2Operation],
        expectedRight: [step2Operation],
        bank: [...new Set(row3Bank)].sort()
      },
      {
        id: 'row4_solution',
        type: 'dual_box',
        instruction: 'Simplify to solve',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: row4ExpectedLeft,
        expectedRight: row4ExpectedRight,
        bank: [...new Set(row4Bank)].sort()
      }
    ]
  };
  
  const rule = 'Need to clear the fence first, to protect the x grouped with the lonely number';
  
  return {
    problem,
    displayProblem: problem,
    answer: String(solution),
    choices: [String(solution)],
    staged,
    explanation: {
      originalProblem: problem,
      steps: [
        { description: 'Original Problem:', work: problem },
        {
          description: `Step 1: Multiply both sides by ${a}`,
          work: `    ${problem.split('=')[0].trim()}\n${step1Operation}   ${step1Operation}\n_____________\n    ${afterStep1Left} = ${afterStep1Right}`
        },
        {
          description: `Step 2: ${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)} to/from both sides`,
          work: `    ${afterStep1Left} = ${afterStep1Right}\n${step2Operation}   ${step2Operation}\n_____________\n    ${afterStep2Left} = ${afterStep2Right}`
        },
        { description: 'Solution:', work: `x = ${solution}` }
      ],
      rule,
      finalAnswer: String(solution)
    }
  };
};

// ============================================
// LEVEL 1-24: TWO-STEP MIXED REVIEW
// Mixes levels 21-23: ax+b=c, ax-b=c, x/a+b=c
// Requires 2 unique skeletons from each level
// Standard: 6 total problems (2 from each level type)
// Advanced: Same mix but with more complex numbers
// NOTE: Add this to equationGenerators.js, uses existing helper functions
// ============================================

export const generateTwoStepMixedReview = (difficulty) => {
  const levelId = '1-24';
  
  // Track which problems have been seen this session
  const sessionKey = `${levelId}-${difficulty}-session`;
  let sessionProblems = JSON.parse(sessionStorage.getItem(sessionKey) || '[]');
  
  // Define problem types with their level origins
  const problemTypes = [
    { type: 'multiply_add', level: 21, skeletons: ['ax+b=c', 'c=ax+b'] },
    { type: 'multiply_subtract', level: 22, skeletons: ['ax-b=c', 'c=ax-b'] },
    { type: 'divide_add', level: 23, skeletons: ['x/a+b=c', 'c=x/a+b'] }
  ];
  
  // Ensure we've seen at least 2 from each type
  const typeCounts = {
    'multiply_add': sessionProblems.filter(p => p.startsWith('multiply_add')).length,
    'multiply_subtract': sessionProblems.filter(p => p.startsWith('multiply_subtract')).length,
    'divide_add': sessionProblems.filter(p => p.startsWith('divide_add')).length
  };
  
  // Pick a type that hasn't reached 2 yet, or random if all have
  let selectedType;
  const needMoreTypes = problemTypes.filter(pt => typeCounts[pt.type] < 2);
  
  if (needMoreTypes.length > 0) {
    selectedType = needMoreTypes[Math.floor(Math.random() * needMoreTypes.length)];
  } else {
    // Reset session if all types completed
    sessionProblems = [];
    sessionStorage.setItem(sessionKey, JSON.stringify([]));
    selectedType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
  }
  
  // Pick a skeleton from the selected type that hasn't been used yet
  const usedSkeletons = sessionProblems.filter(p => p.startsWith(selectedType.type));
  const availableSkeletons = selectedType.skeletons.filter(sk => 
    !usedSkeletons.includes(`${selectedType.type}-${sk}`)
  );
  
  const skeleton = availableSkeletons.length > 0 
    ? availableSkeletons[Math.floor(Math.random() * availableSkeletons.length)]
    : selectedType.skeletons[Math.floor(Math.random() * selectedType.skeletons.length)];
  
  // Record this problem
  sessionProblems.push(`${selectedType.type}-${skeleton}`);
  sessionStorage.setItem(sessionKey, JSON.stringify(sessionProblems));
  
  // Generate based on type - uses existing generators!
  if (selectedType.type === 'multiply_add') {
    return generateLevel24MultiplyAdd(skeleton, difficulty);
  } else if (selectedType.type === 'multiply_subtract') {
    return generateLevel24MultiplySubtract(skeleton, difficulty);
  } else {
    return generateLevel24DivideAdd(skeleton, difficulty);
  }
};

// ============================================
// HELPER: Generate ax + b = c type (Level 21 style)
// ============================================
const generateLevel24MultiplyAdd = (skeleton, difficulty) => {
  let a, b, c, solution, problem;
  let problemHasConstantOnLeft = false;
  
  if (difficulty === 'easy') {
    a = randomNonZeroInt(-12, 12);
    b = randomNonZeroInt(-12, 12);
    solution = randomNonZeroInt(-12, 12);
    c = a * solution + b;
    
    if (skeleton === 'ax+b=c') {
      problem = b < 0 ? `${a}x - ${Math.abs(b)} = ${c}` : `${a}x + ${b} = ${c}`;
    } else {
      problem = b < 0 ? `${c} = ${a}x - ${Math.abs(b)}` : `${c} = ${a}x + ${b}`;
      problemHasConstantOnLeft = true;
    }
  } else {
    const useDecimal = Math.random() < 0.3;
    
    if (useDecimal) {
      a = randomNonZeroInt(-24, 24) / 2;
      b = randomNonZeroInt(-24, 24) / 2;
      solution = randomNonZeroInt(-24, 24) / 2;
      c = a * solution + b;
    } else {
      // Keep denominator positive to avoid fraction-bar rendering bugs
      a = randomInt(2, 15); // positive, avoids ±1
      b = randomNonZeroInt(-15, 15);
      while (Math.abs(b) < 2) b = randomNonZeroInt(-15, 15);
      solution = randomNonZeroInt(-15, 15);
      c = a * solution + b;
    }
    
    if (skeleton === 'ax+b=c') {
      problem = b < 0 ? `${a}x - ${Math.abs(b)} = ${c}` : `${a}x + ${b} = ${c}`;
    } else {
      problem = b < 0 ? `${c} = ${a}x - ${Math.abs(b)}` : `${c} = ${a}x + ${b}`;
      problemHasConstantOnLeft = true;
    }
  }
  
  const step1Operation = b < 0 ? `+ ${Math.abs(b)}` : `- ${Math.abs(b)}`;
  const afterStep1 = c - b;
  const step2Operation = a < 0 ? `÷ (${a})` : `÷ ${a}`;
  
  const row1Bank = [
    step1Operation,
    b < 0 ? `- ${Math.abs(b)}` : `+ ${Math.abs(b)}`,
    `× ${Math.abs(b)}`,
    `÷ ${Math.abs(b)}`,
    `× ${Math.abs(a)}`,
    `÷ ${Math.abs(a)}`,
    c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`,
    c >= 0 ? `- ${c}` : `+ ${Math.abs(c)}`
  ];
  
  const row2Bank = [
    `${a}x`,
    `${-a}x`,
    String(afterStep1),
    String(-afterStep1),
    String(afterStep1 + 1),
    String(afterStep1 - 1),
    'x',
    '-x',
    String(solution),
    String(-solution)
  ];
  
  const row3Bank = [
    step2Operation,
    a < 0 ? `× (${a})` : `× ${a}`,
    a < 0 ? `÷ ${-a}` : `÷ (${-a})`,
    `× ${Math.abs(a) + 1}`,
    `÷ ${Math.abs(a) + 1}`,
    b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`,
    b >= 0 ? `- ${b}` : `+ ${Math.abs(b)}`
  ];
  
  const row4Bank = [
    'x',
    '-x',
    String(solution),
    String(-solution),
    String(solution + 1),
    String(solution - 1),
    String(a),
    String(-a),
    String(b),
    String(-b)
  ];
  
  const row2ExpectedLeft = problemHasConstantOnLeft ? [String(afterStep1)] : [`${a}x`];
  const row2ExpectedRight = problemHasConstantOnLeft ? [`${a}x`] : [String(afterStep1)];
  
  const row4ExpectedLeft = problemHasConstantOnLeft ? [String(solution)] : ['x'];
  const row4ExpectedRight = problemHasConstantOnLeft ? ['x'] : [String(solution)];
  
  const staged = {
    mode: 'equation_solver',
    rows: [
      {
        id: 'row0_draw_line',
        type: 'single_choice',
        instruction: 'What do you do first?',
        choices: ['Draw a line'],
        expected: ['Draw a line']
      },
      {
        id: 'row1_operation',
        type: 'dual_box',
        instruction: 'What do we do to both sides?',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: [step1Operation],
        expectedRight: [step1Operation],
        bank: [...new Set(row1Bank)].sort()
      },
      {
        id: 'row2_after_subtract',
        type: 'dual_box',
        instruction: 'Simplify each side',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: row2ExpectedLeft,
        expectedRight: row2ExpectedRight,
        bank: [...new Set(row2Bank)].sort()
      },
      {
        id: 'row3_divide',
        type: 'dual_box',
        instruction: 'What do we do to both sides?',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: [step2Operation],
        expectedRight: [step2Operation],
        bank: [...new Set(row3Bank)].sort()
      },
      {
        id: 'row4_solution',
        type: 'dual_box',
        instruction: 'Simplify to solve',
        leftBlanks: 1,
        rightBlanks: 1,
        expectedLeft: row4ExpectedLeft,
        expectedRight: row4ExpectedRight,
        bank: [...new Set(row4Bank)].sort()
      }
    ]
  };
  
  return {
    problem,
    displayProblem: problem,
    answer: String(solution),
    choices: [String(solution)],
    staged,
    explanation: {
      rule: 'For ax + b = c, first clear the lonely number, then clear the fence',
      steps: [
        { description: 'Original Problem:', work: problem },
        { 
          description: `Step 1: ${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)}`,
          work: `${problem}\n${step1Operation}   ${step1Operation}\n${'_'.repeat(problem.length)}\n${a}x = ${afterStep1}`
        },
        {
          description: `Step 2: Divide by ${a}`,
          work: `${a}x = ${afterStep1}\n${'_'.repeat(3)}   ${'_'.repeat(String(afterStep1).length)}\n ${a}     ${a}\n\nx = ${solution}`
        }
      ]
    }
  };
};

// ============================================
// HELPER: Generate ax - b = c type (Level 22 style)
// ============================================
const generateLevel24MultiplySubtract = (skeleton, difficulty) => {
  let a, b, c, solution, problem;
  let problemHasConstantOnLeft = false;
  
  if (difficulty === 'easy') {
    // Ensure it's a true 2-step problem (avoid a = ±1 and tiny b)
    let attempts = 0;
    while (attempts < 100) {
      a = randomNonZeroInt(-12, 12);
      if (Math.abs(a) === 1) { attempts++; continue; }
      b = randomInt(2, 12);
      solution = randomNonZeroInt(-12, 12);
      c = a * solution - b;
      break;
    }
    
    if (skeleton === 'ax-b=c') {
      problem = `${a}x - ${b} = ${c}`;
    } else {
      problem = `${c} = ${a}x - ${b}`;
      problemHasConstantOnLeft = true;
    }
  } else {
    const useDecimal = Math.random() < 0.3;
    
    if (useDecimal) {
      // Ensure it's a true 2-step problem (avoid a = ±1.0 and tiny b)
      let attempts = 0;
      while (attempts < 100) {
        a = randomNonZeroInt(-24, 24) / 2;
        if (Math.abs(a) === 1) { attempts++; continue; }
        b = randomInt(2, 24) / 2;
        solution = randomNonZeroInt(-24, 24) / 2;
        c = a * solution - b;
        break;
      }
    } else {
      // Ensure it's a true 2-step problem (avoid a = ±1 and tiny b)
      let attempts = 0;
      while (attempts < 100) {
        a = randomNonZeroInt(-15, 15);
        if (Math.abs(a) === 1) { attempts++; continue; }
        b = randomInt(2, 15);
        solution = randomNonZeroInt(-15, 15);
        c = a * solution - b;
        break;
      }
    }
    
    if (skeleton === 'ax-b=c') {
      problem = `${a}x - ${b} = ${c}`;
    } else {
      problem = `${c} = ${a}x - ${b}`;
      problemHasConstantOnLeft = true;
    }
  }
  
  const step1Operation = `+ ${b}`;
  const afterStep1 = c + b;
  const step2Operation = a < 0 ? `÷ (${a})` : `÷ ${a}`;
  
  const row1Bank = [
    step1Operation,
    `- ${b}`,
    `× ${b}`,
    `÷ ${b}`,
    `× ${Math.abs(a)}`,
    `÷ ${Math.abs(a)}`
  ];
  
  const row2Bank = [
    `${a}x`,
    `${-a}x`,
    String(afterStep1),
    String(-afterStep1),
    'x',
    '-x',
    String(solution),
    String(-solution)
  ];
  
  const row3Bank = [
    step2Operation,
    a < 0 ? `× (${a})` : `× ${a}`,
    a < 0 ? `÷ ${-a}` : `÷ (${-a})`,
    `× ${Math.abs(a) + 1}`,
    `÷ ${Math.abs(a) + 1}`
  ];
  
  const row4Bank = [
    'x',
    '-x',
    String(solution),
    String(-solution),
    String(solution + 1),
    String(solution - 1)
  ];
  
  const staged = {
    mode: 'equation_solver',
    rows: [
      { id: 'row0_draw_line', type: 'single_choice', instruction: 'What do you do first?', choices: ['Draw a line'], expected: ['Draw a line'] },
      { id: 'row1_operation', type: 'dual_box', instruction: 'What do we do to both sides?', leftBlanks: 1, rightBlanks: 1, expectedLeft: [step1Operation], expectedRight: [step1Operation], bank: [...new Set(row1Bank)].sort() },
      { id: 'row2_after_add', type: 'dual_box', instruction: 'Simplify each side', leftBlanks: 1, rightBlanks: 1, expectedLeft: problemHasConstantOnLeft ? [String(afterStep1)] : [`${a}x`], expectedRight: problemHasConstantOnLeft ? [`${a}x`] : [String(afterStep1)], bank: [...new Set(row2Bank)].sort() },
      { id: 'row3_divide', type: 'dual_box', instruction: 'What do we do to both sides?', leftBlanks: 1, rightBlanks: 1, expectedLeft: [step2Operation], expectedRight: [step2Operation], bank: [...new Set(row3Bank)].sort() },
      { id: 'row4_solution', type: 'dual_box', instruction: 'Simplify to solve', leftBlanks: 1, rightBlanks: 1, expectedLeft: problemHasConstantOnLeft ? [String(solution)] : ['x'], expectedRight: problemHasConstantOnLeft ? ['x'] : [String(solution)], bank: [...new Set(row4Bank)].sort() }
    ]
  };
  
  return {
    problem,
    displayProblem: problem,
    answer: String(solution),
    choices: [String(solution)],
    staged,
    explanation: {
      rule: 'For ax - b = c, add b first, then divide by a',
      steps: [
        { description: 'Original Problem:', work: problem },
        { description: `Step 1: Add ${b}`, work: `${problem}\n+ ${b}   + ${b}\n${'_'.repeat(problem.length)}\n${a}x = ${afterStep1}` },
        { description: `Step 2: Divide by ${a}`, work: `${a}x = ${afterStep1}\n${'_'.repeat(3)}   ${'_'.repeat(String(afterStep1).length)}\n ${a}     ${a}\n\nx = ${solution}` }
      ]
    }
  };
};

// ============================================
// HELPER: Generate x/a + b = c type (Level 23 style)
// ============================================
const generateLevel24DivideAdd = (skeleton, difficulty) => {
  let a, b, c, solution, problem;
  let problemHasConstantOnLeft = false;
  
  if (difficulty === 'easy') {
    a = randomNonZeroInt(-12, 12);
    b = randomNonZeroInt(-12, 12);
    const quotient = randomNonZeroInt(-12, 12);
    solution = a * quotient;
    c = quotient + b;
    
    if (skeleton === 'x/a+b=c') {
      problem = b < 0 ? `x/${a} - ${Math.abs(b)} = ${c}` : `x/${a} + ${b} = ${c}`;
    } else {
      problem = b < 0 ? `${c} = x/${a} - ${Math.abs(b)}` : `${c} = x/${a} + ${b}`;
      problemHasConstantOnLeft = true;
    }
  } else {
    const useDecimal = Math.random() < 0.3;
    
    if (useDecimal) {
      a = randomNonZeroInt(-24, 24) / 2;
      b = randomNonZeroInt(-24, 24) / 2;
      const quotient = randomNonZeroInt(-24, 24) / 2;
      solution = a * quotient;
      c = quotient + b;
    } else {
      a = randomNonZeroInt(-15, 15);
      b = randomNonZeroInt(-15, 15);
      const quotient = randomNonZeroInt(-15, 15);
      solution = a * quotient;
      c = quotient + b;
    }
    
    if (skeleton === 'x/a+b=c') {
      problem = b < 0 ? `x/${a} - ${Math.abs(b)} = ${c}` : `x/${a} + ${b} = ${c}`;
    } else {
      problem = b < 0 ? `${c} = x/${a} - ${Math.abs(b)}` : `${c} = x/${a} + ${b}`;
      problemHasConstantOnLeft = true;
    }
  }
  
  const step1Operation = b < 0 ? `+ ${Math.abs(b)}` : `- ${Math.abs(b)}`;
  const afterStep1 = c - b;
  const step2Operation = a < 0 ? `× (${a})` : `× ${a}`;
  
  const row1Bank = [
    step1Operation,
    b < 0 ? `- ${Math.abs(b)}` : `+ ${Math.abs(b)}`,
    `× ${Math.abs(b)}`,
    `÷ ${Math.abs(b)}`,
    `× ${Math.abs(a)}`,
    `÷ ${Math.abs(a)}`
  ];
  
  const row2Bank = [
    `x/${a}`,
    a < 0 ? `x/${-a}` : `-x/${a}`,
    String(afterStep1),
    String(-afterStep1),
    'x',
    '-x',
    String(solution),
    String(-solution)
  ];
  
  const row3Bank = [
    step2Operation,
    a < 0 ? `÷ (${a})` : `÷ ${a}`,
    a < 0 ? `× ${-a}` : `× (${-a})`,
    `× ${Math.abs(a) + 1}`,
    `÷ ${Math.abs(a) + 1}`
  ];
  
  const row4Bank = [
    'x',
    '-x',
    String(solution),
    String(-solution),
    String(solution + 1),
    String(solution - 1)
  ];
  
  const staged = {
    mode: 'equation_solver',
    rows: [
      { id: 'row0_draw_line', type: 'single_choice', instruction: 'What do you do first?', choices: ['Draw a line'], expected: ['Draw a line'] },
      { id: 'row1_operation', type: 'dual_box', instruction: 'What do we do to both sides?', leftBlanks: 1, rightBlanks: 1, expectedLeft: [step1Operation], expectedRight: [step1Operation], bank: [...new Set(row1Bank)].sort() },
      { id: 'row2_after_subtract', type: 'dual_box', instruction: 'Simplify each side', leftBlanks: 1, rightBlanks: 1, expectedLeft: problemHasConstantOnLeft ? [String(afterStep1)] : [`x/${a}`], expectedRight: problemHasConstantOnLeft ? [`x/${a}`] : [String(afterStep1)], bank: [...new Set(row2Bank)].sort() },
      { id: 'row3_multiply', type: 'dual_box', instruction: 'What do we do to both sides?', leftBlanks: 1, rightBlanks: 1, expectedLeft: [step2Operation], expectedRight: [step2Operation], bank: [...new Set(row3Bank)].sort() },
      { id: 'row4_solution', type: 'dual_box', instruction: 'Simplify to solve', leftBlanks: 1, rightBlanks: 1, expectedLeft: problemHasConstantOnLeft ? [String(solution)] : ['x'], expectedRight: problemHasConstantOnLeft ? ['x'] : [String(solution)], bank: [...new Set(row4Bank)].sort() }
    ]
  };
  
  return {
    problem,
    displayProblem: problem,
    answer: String(solution),
    choices: [String(solution)],
    staged,
    explanation: {
      rule: 'For x/a + b = c, subtract b first, then multiply by a',
      steps: [
        { description: 'Original Problem:', work: problem },
        { description: `Step 1: ${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)}`, work: `${problem}\n${step1Operation}   ${step1Operation}\n${'_'.repeat(problem.length)}\nx/${a} = ${afterStep1}` },
        { description: `Step 2: Multiply by ${a}`, work: `x/${a} = ${afterStep1}\n${step2Operation}   ${step2Operation}\n${'_'.repeat(problem.length)}\nx = ${solution}` }
      ]
    }
  };
};
