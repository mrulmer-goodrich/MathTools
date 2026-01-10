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
      problem = `x ÷ ${a} = ${b}`;
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
      problem = `${b} = x ÷ ${a}`;
      operationNeeded = 'multiply';
      operationValue = a;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'a=x/b') {
      b = randomInt(2, 12);
      a = Math.floor(solution / b);
      if (a === 0) a = 1;
      solution = a * b;
      problem = `${a} = x ÷ ${b}`;
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
      problem = `x ÷ ${a} = ${b}`;
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
      problem = `${b} = x ÷ ${a}`;
      operationNeeded = 'multiply';
      operationValue = a;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'a=x/b') {
      b = randomNonZeroInt(-12, 12);
      a = Math.floor(solution / Math.abs(b));
      if (a === 0) a = b > 0 ? 1 : -1;
      solution = a * b;
      problem = `${a} = x ÷ ${b}`;
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
    a = randomNonZeroInt(-12, 12);
    b = randomNonZeroInt(-12, 12);
    
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

export const generateOneStepMultiplyDivideNegativesFractions = (difficulty) => {
  const levelId = '1-20';
  
  // Format fraction for display with proper HTML structure
  const formatFraction = (num, den) => {
    if (den === 1) return String(num);
    // Return fraction in format that UI can render with fraction bar
    return `(${num}/${den})`;
  };
  
  // All 7 skeletons - includes negatives
  const allSkeletons = [
    'ax=b',
    'x/a=b',
    'b=ax',
    'b=x/a',
    'a=x/b',
    '-ax=b',    // New: negative coefficient
    'x/(-a)=b'  // New: negative in denominator
  ];
  
  // Get next skeleton from rotation
  const skeleton = getNextSkeleton(levelId, difficulty, allSkeletons);
  
  let a, b, solution, problem, operationNeeded, operationValue;
  let problemHasConstantOnLeft = false;
  let useFraction = false;
  let aNum, aDen; // For fraction representation
  
  if (difficulty === 'easy') {
    // Easy: x ∈ {-12..12}, simple fractions (1/2, 1/3, 1/4)
    solution = randomNonZeroInt(-12, 12);
    useFraction = Math.random() < 0.25; // 25% chance of fraction
    
    if (useFraction) {
      // Use simple fractions: 1/2, 1/3, 1/4
      const denominators = [2, 3, 4];
      aDen = denominators[Math.floor(Math.random() * denominators.length)];
      aNum = 1;
      a = aNum / aDen;
    } else {
      a = randomNonZeroInt(-12, 12);
      aNum = a;
      aDen = 1;
    }
    
    if (skeleton === 'ax=b') {
      b = Math.round(a * solution);
      if (useFraction) {
        problem = `${formatFraction(aNum, aDen)}x = ${b}`;
      } else {
        problem = `${a}x = ${b}`;
      }
      operationNeeded = 'divide';
      operationValue = a;
    } else if (skeleton === 'x/a=b') {
      if (!useFraction) {
        a = randomNonZeroInt(2, 12); // Avoid -1, 1 for division
        b = Math.floor(solution / a);
        solution = a * b;
      } else {
        b = Math.floor(solution * a);
        solution = Math.floor(b / a);
      }
      if (useFraction) {
        problem = `x ÷ ${formatFraction(aNum, aDen)} = ${b}`;
      } else {
        problem = `x ÷ ${a} = ${b}`;
      }
      operationNeeded = 'multiply';
      operationValue = a;
    } else if (skeleton === 'b=ax') {
      b = Math.round(a * solution);
      if (useFraction) {
        problem = `${b} = ${formatFraction(aNum, aDen)}x`;
      } else {
        problem = `${b} = ${a}x`;
      }
      operationNeeded = 'divide';
      operationValue = a;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'b=x/a') {
      if (!useFraction) {
        a = randomNonZeroInt(2, 12);
        b = Math.floor(solution / a);
        solution = a * b;
      } else {
        b = Math.floor(solution * a);
        solution = Math.floor(b / a);
      }
      if (useFraction) {
        problem = `${b} = x ÷ ${formatFraction(aNum, aDen)}`;
      } else {
        problem = `${b} = x ÷ ${a}`;
      }
      operationNeeded = 'multiply';
      operationValue = a;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'a=x/b') {
      b = randomNonZeroInt(2, 12);
      a = Math.floor(solution / b);
      if (a === 0) a = 1;
      solution = a * b;
      problem = `${a} = x ÷ ${b}`;
      operationNeeded = 'multiply';
      operationValue = b;
      problemHasConstantOnLeft = true;
    } else if (skeleton === '-ax=b') {
      a = Math.abs(randomNonZeroInt(2, 12));
      b = -a * solution;
      problem = `−${a}x = ${b}`;
      operationNeeded = 'divide';
      operationValue = -a;
    } else if (skeleton === 'x/(-a)=b') {
      a = Math.abs(randomNonZeroInt(2, 12));
      b = Math.floor(solution / -a);
      solution = -a * b;
      problem = `x ÷ (−${a}) = ${b}`;
      operationNeeded = 'multiply';
      operationValue = -a;
    }
  } else {
    // Hard: x ∈ {-20..20}, complex fractions, decimals
    solution = randomNonZeroInt(-20, 20);
    useFraction = Math.random() < 0.3; // 30% chance of fraction
    const useDecimal = !useFraction && Math.random() < 0.3;
    
    if (useFraction) {
      // More complex fractions: 1/2, 1/3, 1/4, 1/5, 2/3, 3/4
      const fractions = [
        {n: 1, d: 2}, {n: 1, d: 3}, {n: 1, d: 4}, {n: 1, d: 5},
        {n: 2, d: 3}, {n: 3, d: 4}, {n: 2, d: 5}, {n: 3, d: 5}
      ];
      const frac = fractions[Math.floor(Math.random() * fractions.length)];
      aNum = frac.n;
      aDen = frac.d;
      a = aNum / aDen;
      // Make negative sometimes
      if (Math.random() < 0.3) {
        aNum = -aNum;
        a = -a;
      }
    } else if (useDecimal) {
      a = randomNonZeroInt(-40, 40) / 2;
      aNum = a;
      aDen = 1;
    } else {
      a = randomNonZeroInt(-12, 12);
      aNum = a;
      aDen = 1;
    }
    
    if (skeleton === 'ax=b') {
      b = Math.round(a * solution);
      if (useFraction && aDen !== 1) {
        problem = `${formatFraction(aNum, aDen)}x = ${b}`;
      } else {
        problem = `${a}x = ${b}`;
      }
      operationNeeded = 'divide';
      operationValue = a;
    } else if (skeleton === 'x/a=b') {
      if (!useFraction) {
        a = randomNonZeroInt(-12, 12);
        if (a === 0) a = 2;
        b = Math.floor(solution / a);
        solution = a * b;
      } else {
        b = Math.floor(solution * a);
        solution = Math.floor(b / a);
      }
      if (useFraction && aDen !== 1) {
        problem = `x ÷ ${formatFraction(aNum, aDen)} = ${b}`;
      } else {
        problem = `x ÷ ${a} = ${b}`;
      }
      operationNeeded = 'multiply';
      operationValue = a;
    } else if (skeleton === 'b=ax') {
      b = Math.round(a * solution);
      if (useFraction && aDen !== 1) {
        problem = `${b} = ${formatFraction(aNum, aDen)}x`;
      } else {
        problem = `${b} = ${a}x`;
      }
      operationNeeded = 'divide';
      operationValue = a;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'b=x/a') {
      if (!useFraction) {
        a = randomNonZeroInt(-12, 12);
        if (a === 0) a = 2;
        b = Math.floor(solution / a);
        solution = a * b;
      } else {
        b = Math.floor(solution * a);
        solution = Math.floor(b / a);
      }
      if (useFraction && aDen !== 1) {
        problem = `${b} = x ÷ ${formatFraction(aNum, aDen)}`;
      } else {
        problem = `${b} = x ÷ ${a}`;
      }
      operationNeeded = 'multiply';
      operationValue = a;
      problemHasConstantOnLeft = true;
    } else if (skeleton === 'a=x/b') {
      b = randomNonZeroInt(-12, 12);
      if (b === 0) b = 3;
      a = Math.floor(solution / b);
      if (a === 0) a = b > 0 ? 1 : -1;
      solution = a * b;
      problem = `${a} = x ÷ ${b}`;
      operationNeeded = 'multiply';
      operationValue = b;
      problemHasConstantOnLeft = true;
    } else if (skeleton === '-ax=b') {
      a = Math.abs(randomNonZeroInt(2, 12));
      b = -a * solution;
      problem = `−${a}x = ${b}`;
      operationNeeded = 'divide';
      operationValue = -a;
    } else if (skeleton === 'x/(-a)=b') {
      a = Math.abs(randomNonZeroInt(2, 12));
      b = Math.floor(solution / -a);
      solution = -a * b;
      problem = `x ÷ (−${a}) = ${b}`;
      operationNeeded = 'multiply';
      operationValue = -a;
    }
  }
  
  // Build Row 1 bank - Enhanced for fractions and negatives
  const absOpValue = Math.abs(operationValue);
  const row1Bank = [
    operationNeeded === 'multiply' ? `× ${absOpValue}` : `÷ ${absOpValue}`,
    operationNeeded === 'multiply' ? `÷ ${absOpValue}` : `× ${absOpValue}`,
    operationNeeded === 'multiply' ? `× ${-absOpValue}` : `÷ ${-absOpValue}`,
    `× ${absOpValue + 1}`,
    `÷ ${absOpValue + 1}`,
    formatWithSign(absOpValue),
    formatWithSign(-absOpValue),
    useFraction && aDen !== 1 ? `× ${formatFraction(aDen, Math.abs(aNum))}` : `× ${Math.abs(b)}`, // Reciprocal or confusion
    `÷ ${Math.abs(b)}`,
    operationNeeded === 'multiply' ? `× ${absOpValue * 2}` : `÷ ${absOpValue * 2}` // Double error
  ];
  
  // Expected operation
  const row1Expected = operationNeeded === 'multiply' 
    ? [`× ${absOpValue}`, `× ${absOpValue}`]
    : [`÷ ${absOpValue}`, `÷ ${absOpValue}`];
  
  // Build Row 2 bank
  const row2Bank = [
    'x',
    '-x',
    String(solution),
    String(-solution),
    String(solution + 1),
    String(solution - 1),
    String(Math.abs(solution)),
    String(-Math.abs(solution)),
    useFraction && aDen !== 1 ? `${formatFraction(aNum, aDen)}x` : `${Math.abs(a)}x`,
    `x ÷ ${Math.abs(a)}`,
    String(Math.round(b * a)),
    String(Math.abs(Math.round(b / a))),
    String(Math.abs(a)),
    String(-Math.abs(a)),
    String(Math.abs(b)),
    String(-Math.abs(b))
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
  
  // Determine rule
  const rule = operationNeeded === 'multiply' 
    ? 'To isolate the variable, clear the fence by multiplying both sides by the number across the fence. When working with fractions, multiply by the reciprocal. When working with negatives, keep track of the sign.'
    : 'To isolate the variable, unstick the sticky by dividing the sticky number on both sides. When working with fractions, divide by multiplying by the reciprocal. When working with negatives, keep track of the sign.';
  
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
          description: `Step 1: ${operationNeeded === 'multiply' ? 'Multiply' : 'Divide'} both sides by ${absOpValue}`, 
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
