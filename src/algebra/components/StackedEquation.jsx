// StackedEquation.jsx - Properly formatted stacked equations for feedback
import React from 'react';
import '../../styles/algebra.css';

const StackedEquation = ({ steps }) => {
  return (
    <div className="stacked-equations-container">
      {steps.map((step, index) => (
        <div key={index} className="equation-step">
          {step.description && (
            <div className="step-description">{step.description}</div>
          )}
          {step.work && (
            <pre className="step-work">{step.work}</pre>
          )}
        </div>
      ))}
    </div>
  );
};

export default StackedEquation;

// USAGE EXAMPLE in FeedbackModal.jsx:
/*
import StackedEquation from './StackedEquation';

// In your feedback display:
{explanation.steps && explanation.steps.length > 0 && (
  <StackedEquation steps={explanation.steps} />
)}
*/

// ========================================
// EXAMPLE: How to structure steps in problemGenerators.js
// ========================================
/*
For equation: 3x + 5 = 17

steps: [
  { 
    description: "Problem:", 
    work: "3x + 5 = 17" 
  },
  { 
    description: "Step 1: Subtract 5 from both sides",
    work: 
`    3x + 5 = 17
       - 5   - 5
    ___________
    3x     = 12`
  },
  { 
    description: "Step 2: Divide both sides by 3",
    work:
`    3x = 12
    __   __
    3     3
    
    x = 4`
  },
  {
    description: "Step 3: Check your answer",
    work:
`    3(4) + 5 = 12 + 5 = 17 ✓`
  }
]
*/

// ========================================
// MORE EXAMPLES
// ========================================

// Example 1: Two-step equation
/*
For: 2x + 7 = 15

steps: [
  {
    description: "Original equation:",
    work: "2x + 7 = 15"
  },
  {
    description: "Subtract 7 from both sides:",
    work:
`    2x + 7 = 15
       - 7   - 7
    ___________
    2x     = 8`
  },
  {
    description: "Divide both sides by 2:",
    work:
`    2x = 8
    __   _
    2    2
    
    x = 4`
  },
  {
    description: "Check:",
    work: "2(4) + 7 = 8 + 7 = 15 ✓"
  }
]
*/

// Example 2: Distribution then solve
/*
For: 3(x + 4) = 21

steps: [
  {
    description: "Original equation:",
    work: "3(x + 4) = 21"
  },
  {
    description: "Distribute 3 to both terms:",
    work:
`    3 × x = 3x
    3 × 4 = 12
    
    3x + 12 = 21`
  },
  {
    description: "Subtract 12 from both sides:",
    work:
`    3x + 12 = 21
        - 12  - 12
    _____________
    3x      = 9`
  },
  {
    description: "Divide both sides by 3:",
    work:
`    3x = 9
    __   _
    3    3
    
    x = 3`
  },
  {
    description: "Check:",
    work: "3(3 + 4) = 3(7) = 21 ✓"
  }
]
*/

// Example 3: Variables on both sides
/*
For: 5x + 3 = 2x + 15

steps: [
  {
    description: "Original equation:",
    work: "5x + 3 = 2x + 15"
  },
  {
    description: "Subtract 2x from both sides:",
    work:
`    5x + 3 = 2x + 15
    -2x      -2x
    _________________
    3x + 3 =     15`
  },
  {
    description: "Subtract 3 from both sides:",
    work:
`    3x + 3 = 15
       - 3   - 3
    ___________
    3x     = 12`
  },
  {
    description: "Divide both sides by 3:",
    work:
`    3x = 12
    __   __
    3     3
    
    x = 4`
  },
  {
    description: "Check:",
    work:
`    Left:  5(4) + 3 = 20 + 3 = 23
    Right: 2(4) + 15 = 8 + 15 = 23 ✓`
  }
]
*/

// Example 4: Complex multi-step
/*
For: 2(x + 3) + 4x - 5 = 25

steps: [
  {
    description: "Original equation:",
    work: "2(x + 3) + 4x - 5 = 25"
  },
  {
    description: "Distribute 2:",
    work:
`    2 × x = 2x
    2 × 3 = 6
    
    2x + 6 + 4x - 5 = 25`
  },
  {
    description: "Combine like terms (x terms):",
    work:
`    2x + 4x = 6x
    
    6x + 6 - 5 = 25`
  },
  {
    description: "Combine constants:",
    work:
`    6 - 5 = 1
    
    6x + 1 = 25`
  },
  {
    description: "Subtract 1 from both sides:",
    work:
`    6x + 1 = 25
       - 1   - 1
    ___________
    6x     = 24`
  },
  {
    description: "Divide both sides by 6:",
    work:
`    6x = 24
    __   __
    6     6
    
    x = 4`
  }
]
*/
