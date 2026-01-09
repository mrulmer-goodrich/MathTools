// ============================================
// EQUATION GENERATORS - LEVELS 17+
// One-step and multi-step equation solving
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
// 10 Skeletons with rotation
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
    } else if (skeleton === 'b=x-a') {
      solution = b + a;
      problem = `${b} = x - ${a}`;
      operationNeeded = 'add';
      operationValue = a;
    } else if (skeleton === 'b=a+x') {
      solution = b - a;
      if (solution < 1) { b = a + randomInt(1, 12); solution = b - a; }
      problem = `${b} = ${a} + x`;
      operationNeeded = 'subtract';
      operationValue = a;
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
    } else if (skeleton === 'b=x-a') {
      solution = b + a;
      if (solution !== Math.floor(solution)) {
        b = randomNonZeroInt(-25, 25) - a;
        solution = b + a;
      }
      problem = `${b} = x - ${a}`;
      operationNeeded = 'add';
      operationValue = a;
    } else if (skeleton === 'b=a+x') {
      solution = b - a;
      if (solution !== Math.floor(solution)) {
        b = a + randomNonZeroInt(-25, 25);
        solution = b - a;
      }
      problem = `${b} = ${a} + x`;
      operationNeeded = 'subtract';
      operationValue = a;
    }
  }
  
  // Determine left and right sides of original equation
  const equationParts = problem.split('=');
  const leftSide = equationParts[0].trim();
  const rightSide = equationParts[1].trim();
  
  // Build Row 1 bank (operations to perform)
  const row1Bank = [
    formatWithSign(operationValue),
    formatWithSign(-operationValue),
    formatWithSign(Math.abs(a)),
    formatWithSign(-Math.abs(a)),
    formatWithSign(Math.abs(b)),
    formatWithSign(-Math.abs(b)),
    `× ${Math.abs(a)}`,
    `÷ ${Math.abs(a)}`,
    `× ${Math.abs(b)}`,
    `÷ ${Math.abs(b)}`
  ];
  
  // Expected operation (same on both sides)
  const row1Expected = operationNeeded === 'add' 
    ? [formatWithSign(operationValue), formatWithSign(operationValue)]
    : [formatWithSign(-operationValue), formatWithSign(-operationValue)];
  
  // Build Row 2 bank (final results)
  // Left side should simplify to x or -x
  // Right side should simplify to solution
  const row2Bank = [
    'x',
    '-x',
    formatWithSign(solution),
    formatWithSign(-solution),
    formatWithSign(solution + Math.abs(a)),
    formatWithSign(solution - Math.abs(a)),
    formatWithSign(Math.abs(a)),
    formatWithSign(-Math.abs(a)),
    formatWithSign(Math.abs(b)),
    formatWithSign(-Math.abs(b)),
    `x + ${Math.abs(a)}`,
    `x - ${Math.abs(a)}`,
    `${Math.abs(b)} - x`,
    `${Math.abs(a)} + x`
  ];
  
  // Expected Row 2 (left: x, right: solution WITHOUT leading +)
  const row2ExpectedLeft = ['x'];
  const row2ExpectedRight = [String(solution)];
  
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
        { description: `${operationNeeded === 'add' ? 'Add' : 'Subtract'} ${Math.abs(operationValue)} from both sides`, work: `` },
        { description: 'Simplify', work: `x = ${solution}` }
      ],
      rule: `To isolate the variable, remove the lonely number by performing the opposite operation on both sides.`,
      finalAnswer: String(solution)
    }
  };
};
