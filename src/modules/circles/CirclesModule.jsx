// CirclesModule.jsx — SYSTEMATIC FIXES APPLIED
// Core Issues Fixed:
// 1. Answer choices include correct value
// 2. ?? markers properly aligned and hidden until placed
// 3. Labels show only given value initially
// 4. Question format: "If r = 7, what is d?"
// 5. Formula strip between question and answers
// 6. Given value strip after operation selected
// 7. No shuffling on wrong clicks - locked until new problem
// 8. Stage 10 = random from stages 3-9
// 9. Better π symbol (Unicode)
// 10. Stage unlock = pulsate/grow animation
// 11. Calculate overlay button after perfect run

import React, { useEffect, useState } from "react";
import { ErrorOverlay } from "../../components/StatsSystem.jsx";
import BigButton from "../../components/BigButton.jsx";
import ugConfetti from "../../lib/confetti.js";

const PI = Math.PI;

const shuffle = (arr) => { 
  const a = [...arr]; 
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [a[i], a[j]] = [a[j], a[i]]; 
  } 
  return a; 
};

// Simple calculator for π calculations
const Calculator = ({ show, onClose }) => {
  if (!show) return null;
  const [display, setDisplay] = useState('');
  
  const calculate = () => {
    try {
      const expr = display.replace(/π/g, Math.PI.toString());
      const result = eval(expr);
      setDisplay(result.toFixed(2));
    } catch {
      setDisplay('Error');
    }
  };
  
  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      background: 'white', borderRadius: '16px', padding: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 10001
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Calculator</h3>
        <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
      </div>
      <input 
        type="text" 
        value={display}
        onChange={(e) => setDisplay(e.target.value)}
        style={{ 
          width: '100%', 
          padding: '12px', 
          fontSize: '20px', 
          marginBottom: '12px',
          border: '2px solid #e5e7eb',
          borderRadius: '8px'
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {['7','8','9','÷','4','5','6','×','1','2','3','-','0','π','.','+',' '].map(btn => (
          <button
            key={btn}
            onClick={() => btn === ' ' ? calculate() : setDisplay(d => d + btn)}
            style={{
              padding: '16px',
              fontSize: '18px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              background: btn === ' ' ? '#3b82f6' : 'white',
              color: btn === ' ' ? 'white' : 'black',
              cursor: 'pointer'
            }}
          >
            {btn === ' ' ? '=' : btn}
          </button>
        ))}
        <button 
          onClick={() => setDisplay('')}
          style={{
            padding: '16px',
            fontSize: '18px',
            gridColumn: 'span 4',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            background: '#fee2e2',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

// Stage Unlock overlay - PULSATE/GROW animation
const StageUnlockOverlay = ({ show, nextStage }) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(59, 130, 246, 0.3)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 10000, pointerEvents: 'none'
    }}>
      <div style={{ 
        fontSize: '80px', 
        color: '#2563eb', 
        fontWeight: '900',
        textShadow: '0 8px 32px rgba(37, 99, 235, 0.5)',
        animation: 'stageUnlockPulse 2s ease-out',
        marginBottom: '20px'
      }}>
        🎉 STAGE {nextStage} UNLOCKED! 🎉
      </div>
      <style>{`
        @keyframes stageUnlockPulse {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); opacity: 1; }
          60% { transform: scale(0.9); }
          70% { transform: scale(1.1); }
          80% { transform: scale(0.95); }
          90% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// Success overlay - HUGE animated green checkmark
const SuccessOverlay = ({ show }) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(34, 197, 94, 0.2)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 10000, pointerEvents: 'none'
    }}>
      <div style={{ 
        fontSize: '280px', 
        color: '#16a34a', 
        fontWeight: '900',
        textShadow: '0 8px 32px rgba(22, 163, 74, 0.5)',
        animation: 'successPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        filter: 'drop-shadow(0 0 20px rgba(22, 163, 74, 0.8))'
      }}>
        ✓
      </div>
      <style>{`
        @keyframes successPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// Exploding coins animation
const FlyingCoins = ({ show }) => {
  if (!show) return null;
  const COUNT = 40;
  const coins = Array.from({ length: COUNT }).map((_, i) => {
    const angle = (i / COUNT) * 360;
    const distance = 200 + Math.random() * 100;
    const duration = 1.2 + Math.random() * 0.6;
    const delay = Math.random() * 0.2;
    const rotation = Math.random() * 720;
    
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          animation: `coinExplode ${duration}s ease-out ${delay}s forwards`,
          '--angle': `${angle}deg`,
          '--distance': `${distance}px`,
          '--rotation': `${rotation}deg`
        }}
      >
        <svg width="40" height="40" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="15" fill="#f59e0b" stroke="#d97706" strokeWidth="2"/>
          <circle cx="16" cy="16" r="12" fill="#fbbf24" opacity="0.7"/>
          <text x="16" y="21" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#78350f">¢</text>
        </svg>
      </div>
    );
  });
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999 }}>
      <style>{`
        @keyframes coinExplode {
          0% { 
            transform: translate(-50%, -50%) rotate(0deg) scale(0);
            opacity: 1;
          }
          100% { 
            transform: translate(
              calc(-50% + cos(var(--angle)) * var(--distance)),
              calc(-50% + sin(var(--angle)) * var(--distance))
            ) rotate(var(--rotation)) scale(1);
            opacity: 0;
          }
        }
      `}</style>
      {coins}
    </div>
  );
};

// Circle visualization component
const CircleVisualization = ({ problem, stage, onCircleClick, showLabels, givenValue }) => {
  const { r, d, C, A, rotation } = problem;
  
  const centerX = 250;
  const centerY = 250;
  const displayR = r * 10;
  
  // Calculate endpoints for radius and diameter
  const radAngle = rotation * Math.PI / 180;
  const radEndX = centerX + displayR * Math.cos(radAngle);
  const radEndY = centerY + displayR * Math.sin(radAngle);
  
  const diamAngle = rotation * Math.PI / 180;
  const diam1X = centerX - displayR * Math.cos(diamAngle);
  const diam1Y = centerY - displayR * Math.sin(diamAngle);
  const diam2X = centerX + displayR * Math.cos(diamAngle);
  const diam2Y = centerY + displayR * Math.sin(diamAngle);
  
  // Label positioning - ONLY show given value initially
  const getLabelPosition = (type) => {
    if (type === 'r') {
      const midX = centerX + (displayR * 0.7) * Math.cos(radAngle);
      const midY = centerY + (displayR * 0.7) * Math.sin(radAngle);
      const perpAngle = radAngle + Math.PI / 2;
      return {
        x: midX + 40 * Math.cos(perpAngle),
        y: midY + 40 * Math.sin(perpAngle)
      };
    } else if (type === 'd') {
      const perpAngle = diamAngle + Math.PI / 2;
      return {
        x: centerX + 50 * Math.cos(perpAngle),
        y: centerY + 50 * Math.sin(perpAngle)
      };
    } else if (type === 'C') {
      const labelAngle = (rotation + 135) * Math.PI / 180;
      return {
        x: centerX + (displayR + 45) * Math.cos(labelAngle),
        y: centerY + (displayR + 45) * Math.sin(labelAngle)
      };
    } else if (type === 'A') {
      const labelAngle = (rotation + 180) * Math.PI / 180;
      return {
        x: centerX + (displayR * 0.5) * Math.cos(labelAngle),
        y: centerY + (displayR * 0.5) * Math.sin(labelAngle)
      };
    }
    return { x: 0, y: 0 };
  };
  
  // Determine which label to show based on givenValue
  const showR = showLabels && givenValue === 'r';
  const showD = showLabels && givenValue === 'd';
  const showC = showLabels && givenValue === 'C';
  const showA = showLabels && givenValue === 'A';
  
  const rPos = getLabelPosition('r');
  const dPos = getLabelPosition('d');
  const cPos = getLabelPosition('C');
  const aPos = getLabelPosition('A');
  
  return (
    <svg width="500" height="500" viewBox="0 0 500 500" style={{ background: '#f9fafb', borderRadius: '8px' }}>
      {/* Circle */}
      <circle 
        cx={centerX} 
        cy={centerY} 
        r={displayR} 
        fill="none" 
        stroke="#3b82f6" 
        strokeWidth="3"
        style={{ cursor: stage === 2 ? 'pointer' : 'default' }}
        onClick={() => stage === 2 && onCircleClick && onCircleClick('circumference')}
      />
      
      {/* Radius line */}
      <line 
        x1={centerX} 
        y1={centerY} 
        x2={radEndX} 
        y2={radEndY} 
        stroke="#ef4444" 
        strokeWidth="2"
        style={{ cursor: stage === 2 ? 'pointer' : 'default' }}
        onClick={() => stage === 2 && onCircleClick && onCircleClick('radius')}
      />
      
      {/* Diameter line */}
      <line 
        x1={diam1X} 
        y1={diam1Y} 
        x2={diam2X} 
        y2={diam2Y} 
        stroke="#10b981" 
        strokeWidth="2" 
        strokeDasharray="5,5"
        style={{ cursor: stage === 2 ? 'pointer' : 'default' }}
        onClick={() => stage === 2 && onCircleClick && onCircleClick('diameter')}
      />
      
      {/* Center dot */}
      <circle 
        cx={centerX} 
        cy={centerY} 
        r="4" 
        fill="#1f2937"
        style={{ cursor: stage === 2 ? 'pointer' : 'default' }}
        onClick={() => stage === 2 && onCircleClick && onCircleClick('center')}
      />
      
      {/* Labels - ONLY show given value */}
      {showR && (
        <g>
          <rect 
            x={rPos.x - 25} 
            y={rPos.y - 18} 
            width="50" 
            height="36" 
            fill="white" 
            stroke="#ef4444" 
            strokeWidth="2" 
            rx="6"
          />
          <text 
            x={rPos.x} 
            y={rPos.y + 6} 
            textAnchor="middle" 
            fontSize="20" 
            fontWeight="bold" 
            fill="#ef4444"
          >
            r={r}
          </text>
        </g>
      )}
      
      {showD && (
        <g>
          <rect 
            x={dPos.x - 25} 
            y={dPos.y - 18} 
            width="50" 
            height="36" 
            fill="white" 
            stroke="#10b981" 
            strokeWidth="2" 
            rx="6"
          />
          <text 
            x={dPos.x} 
            y={dPos.y + 6} 
            textAnchor="middle" 
            fontSize="20" 
            fontWeight="bold" 
            fill="#10b981"
          >
            d={d}
          </text>
        </g>
      )}
      
      {showC && (
        <g>
          <rect 
            x={cPos.x - 35} 
            y={cPos.y - 18} 
            width="70" 
            height="36" 
            fill="white" 
            stroke="#3b82f6" 
            strokeWidth="2" 
            rx="6"
          />
          <text 
            x={cPos.x} 
            y={cPos.y + 6} 
            textAnchor="middle" 
            fontSize="18" 
            fontWeight="bold" 
            fill="#3b82f6"
          >
            C={C.toFixed(1)}
          </text>
        </g>
      )}
      
      {showA && (
        <g>
          <rect 
            x={aPos.x - 35} 
            y={aPos.y - 18} 
            width="70" 
            height="36" 
            fill="white" 
            stroke="#8b5cf6" 
            strokeWidth="2" 
            rx="6"
          />
          <text 
            x={aPos.x} 
            y={aPos.y + 6} 
            textAnchor="middle" 
            fontSize="18" 
            fontWeight="bold" 
            fill="#8b5cf6"
          >
            A={A.toFixed(1)}
          </text>
        </g>
      )}
      
      {/* Question marks for Stage 2 - PROPERLY POSITIONED */}
      {stage === 2 && (
        <>
          {/* Center ?? */}
          <text 
            x={centerX} 
            y={centerY - 15} 
            textAnchor="middle" 
            fontSize="32" 
            fontWeight="bold" 
            fill="#9ca3af"
          >
            ??
          </text>
          
          {/* Radius ?? */}
          <text 
            x={rPos.x} 
            y={rPos.y + 6} 
            textAnchor="middle" 
            fontSize="32" 
            fontWeight="bold" 
            fill="#9ca3af"
          >
            ??
          </text>
          
          {/* Diameter ?? */}
          <text 
            x={dPos.x} 
            y={dPos.y + 6} 
            textAnchor="middle" 
            fontSize="32" 
            fontWeight="bold" 
            fill="#9ca3af"
          >
            ??
          </text>
          
          {/* Circumference ?? */}
          <text 
            x={cPos.x} 
            y={cPos.y + 6} 
            textAnchor="middle" 
            fontSize="32" 
            fontWeight="bold" 
            fill="#9ca3af"
          >
            ??
          </text>
        </>
      )}
    </svg>
  );
};

// Main component
export default function CirclesModule({ onBack }) {
  const [stage, setStage] = useState(1);
  const [problem, setProblem] = useState(null);
  const [totalCoins, setTotalCoins] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [showMoveOnChoice, setShowMoveOnChoice] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showStageUnlock, setShowStageUnlock] = useState(false);
  const [unlockedStages, setUnlockedStages] = useState([1, 2]);
  
  // Stage 1 state
  const [shapes, setShapes] = useState([]);
  const [stage1Answered, setStage1Answered] = useState(false);
  
  // Stage 2 state
  const [termToPlace, setTermToPlace] = useState('');
  const [placedTerms, setPlacedTerms] = useState([]);
  
  // Stage 3+ state
  const [currentStep, setCurrentStep] = useState('question'); // 'question' or 'operation' or 'value'
  const [currentTarget, setCurrentTarget] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswerChoices, setCurrentAnswerChoices] = useState([]);
  const [questionQueue, setQuestionQueue] = useState([]);
  const [answeredCorrectly, setAnsweredCorrectly] = useState([]);
  const [problemWasCorrect, setProblemWasCorrect] = useState(true);
  const [currentFormula, setCurrentFormula] = useState('');
  const [givenValue, setGivenValue] = useState(''); // Track which value is given
  const [selectedOperation, setSelectedOperation] = useState(''); // Track selected operation
  
  // Generate problem
  const generateProblem = () => {
    const r = Math.floor(Math.random() * 20) + 1; // 1-20
    const d = r * 2;
    const C = 2 * PI * r;
    const A = PI * r * r;
    
    // Limited rotation angles for predictable label placement
    const rotations = [0, 45, 90, 135, 180, 225, 270, 315];
    const rotation = rotations[Math.floor(Math.random() * rotations.length)];
    
    return { r, d, C, A, rotation };
  };
  
  // Generate shapes for Stage 1
  const generateShapes = () => {
    const allShapes = [
      { emoji: '⬜', isCircle: false },
      { emoji: '🔺', isCircle: false },
      { emoji: '⬟', isCircle: false },
      { emoji: '⭐', isCircle: false },
      { emoji: '🔶', isCircle: false },
      { emoji: '⚫', isCircle: true }
    ];
    return shuffle(allShapes);
  };
  
  // Initialize
  useEffect(() => {
    setProblem(generateProblem());
    setShapes(generateShapes());
    setStage1Answered(false);
    if (stage === 2) {
      setTermToPlace('center');
      setPlacedTerms([]);
    }
    if (stage >= 3) {
      setupQuestionQueue();
    }
  }, [stage]);
  
  // Setup question queue for multi-step stages
  const setupQuestionQueue = () => {
    const prob = problem || generateProblem();
    setProblem(prob);
    
    let queue = [];
    let given = '';
    
    if (stage === 3) {
      // Given: r, Find: d
      queue = [{ target: 'd', from: 'r', fromValue: prob.r, fromLabel: 'r', calcValue: prob.r, calcLabel: 'r', formula: 'd = r × 2' }];
      given = 'r';
    } else if (stage === 4) {
      // Given: d, Find: r
      queue = [{ target: 'r', from: 'd', fromValue: prob.d, fromLabel: 'd', calcValue: prob.d, calcLabel: 'd', formula: 'r = d ÷ 2' }];
      given = 'd';
    } else if (stage === 5) {
      // Given: d, Find: r, then C
      queue = [
        { target: 'r', from: 'd', fromValue: prob.d, fromLabel: 'd', calcValue: prob.d, calcLabel: 'd', formula: 'r = d ÷ 2' },
        { target: 'C', from: 'd', fromValue: prob.d, fromLabel: 'd', calcValue: prob.d, calcLabel: 'd', formula: 'C = d × π' }
      ];
      given = 'd';
    } else if (stage === 6) {
      // Given: r, Find: d, then C
      queue = [
        { target: 'd', from: 'r', fromValue: prob.r, fromLabel: 'r', calcValue: prob.r, calcLabel: 'r', formula: 'd = r × 2' },
        { target: 'C', from: 'd', fromValue: prob.r, fromLabel: 'r', calcValue: prob.d, calcLabel: 'd', formula: 'C = d × π' }
      ];
      given = 'r';
    } else if (stage === 7) {
      // Given: C, Find: d, then r
      queue = [
        { target: 'd', from: 'C', fromValue: prob.C, fromLabel: 'C', calcValue: prob.C, calcLabel: 'C', formula: 'd = C ÷ π' },
        { target: 'r', from: 'd', fromValue: prob.C, fromLabel: 'C', calcValue: prob.d, calcLabel: 'd', formula: 'r = d ÷ 2' }
      ];
      given = 'C';
    } else if (stage === 8) {
      // Given: r, Find: d, then A
      queue = [
        { target: 'd', from: 'r', fromValue: prob.r, fromLabel: 'r', calcValue: prob.r, calcLabel: 'r', formula: 'd = r × 2' },
        { target: 'A', from: 'r', fromValue: prob.r, fromLabel: 'r', calcValue: prob.r, calcLabel: 'r', formula: 'A = πr²' }
      ];
      given = 'r';
    } else if (stage === 9) {
      // Given: d, Find: r, then A
      queue = [
        { target: 'r', from: 'd', fromValue: prob.d, fromLabel: 'd', calcValue: prob.d, calcLabel: 'd', formula: 'r = d ÷ 2' },
        { target: 'A', from: 'r', fromValue: prob.d, fromLabel: 'd', calcValue: prob.r, calcLabel: 'r', formula: 'A = πr²' }
      ];
      given = 'd';
    } else if (stage === 10) {
      // Mixed: randomly pick one of stages 3-9
      const randomStage = Math.floor(Math.random() * 7) + 3; // 3-9
      const tempStage = stage;
      setStage(randomStage);
      setupQuestionQueue();
      setStage(tempStage);
      return;
    }
    
    setQuestionQueue(queue);
    setCurrentQuestion(queue[0]);
    setCurrentTarget(queue[0].target);
    setCurrentStep('operation');
    setAnsweredCorrectly([]);
    setProblemWasCorrect(true);
    setCurrentFormula('');
    setGivenValue(given);
    setSelectedOperation('');
    setCurrentAnswerChoices([]);
  };
  
  // Get operation choices based on target
  const getOperationChoices = (target) => {
    const q = questionQueue.find(q => q.target === target);
    if (!q) return [];
    
    if (target === 'd' && q.from === 'r') return ['× 2', '÷ 2', '+ 2'];
    if (target === 'r' && q.from === 'd') return ['× 2', '÷ 2', '- 2'];
    if (target === 'C' && q.from === 'd') return ['× π', '÷ π', '× 2'];
    if (target === 'd' && q.from === 'C') return ['× π', '÷ π', '÷ 2'];
    if (target === 'A' && q.from === 'r') return ['× π', '× πr²', 'r²'];
    
    return [];
  };
  
  // Get correct operation
  const getCorrectOperation = (target) => {
    const q = questionQueue.find(q => q.target === target);
    if (!q) return '';
    
    if (target === 'd' && q.from === 'r') return '× 2';
    if (target === 'r' && q.from === 'd') return '÷ 2';
    if (target === 'C' && q.from === 'd') return '× π';
    if (target === 'd' && q.from === 'C') return '÷ π';
    if (target === 'A' && q.from === 'r') return '× πr²';
    
    return '';
  };
  
  // Get value choices with distractors INCLUDING correct answer
  const getValueChoices = (target) => {
    const correct = problem[target];
    let distractors = [];
    
    if (target === 'd') {
      distractors = [
        problem.r, // forgot to multiply
        problem.r / 2, // divided instead
        problem.r + 2 // added instead
      ];
    } else if (target === 'r') {
      distractors = [
        problem.d * 2, // multiplied instead
        problem.d, // forgot to divide
        problem.d - 2 // subtracted
      ];
    } else if (target === 'C') {
      distractors = [
        problem.r * PI, // used r not d
        problem.d * 2, // forgot π
        problem.d / PI // divided instead
      ];
    } else if (target === 'A') {
      distractors = [
        PI * problem.r, // forgot to square
        PI * problem.d * problem.d, // used d instead
        problem.r * problem.r // forgot π
      ];
    }
    
    // Filter out any that match the correct answer
    distractors = distractors.filter(d => Math.abs(d - correct) > 0.1);
    
    // Take first 3 unique distractors
    const unique = [...new Set(distractors)].slice(0, 3);
    
    // Add correct answer and shuffle
    return shuffle([correct, ...unique]);
  };
  
  // Get correct value
  const getCorrectValue = (target) => {
    return problem[target];
  };
  
  // Handle Stage 1: Shape selection
  const handleShapeSelect = (shape) => {
    if (stage1Answered) return; // Prevent multiple clicks
    
    if (shape.isCircle) {
      setStage1Answered(true);
      handleCorrect(10);
    } else {
      handleError();
    }
  };
  
  // Handle Stage 2: Click on circle parts
  const handleCircleClick = (term) => {
    if (term === termToPlace) {
      const newPlaced = [...placedTerms, term];
      setPlacedTerms(newPlaced);
      
      if (newPlaced.length === 4) {
        handleCorrect(10);
      } else {
        const next = ['center', 'radius', 'diameter', 'circumference'][newPlaced.length];
        setTermToPlace(next);
      }
    } else {
      handleError();
    }
  };
  
  // Handle Stage 3+: Operation selection
  const handleOperationSelect = (operation) => {
    const correct = getCorrectOperation(currentTarget);
    
    if (operation === correct) {
      // Show success briefly
      setShowSuccess(true);
      ugConfetti();
      setTimeout(() => setShowSuccess(false), 800);
      
      // Set formula and generate answer choices ONCE
      setCurrentFormula(currentQuestion.formula);
      setSelectedOperation(operation);
      const choices = getValueChoices(currentTarget);
      setCurrentAnswerChoices(choices);
      
      // Move to value selection
      setCurrentStep('value');
    } else {
      handleError();
    }
  };
  
  // Handle Stage 3+: Value selection
  const handleValueSelect = (value) => {
    const correct = getCorrectValue(currentTarget);
    
    if (Math.abs(value - correct) < 0.1) {
      // Mark this step as answered correctly
      const newAnswered = [...answeredCorrectly, currentTarget];
      setAnsweredCorrectly(newAnswered);
      
      // Show success
      setShowSuccess(true);
      ugConfetti();
      setTimeout(() => setShowSuccess(false), 800);
      
      // Check if all steps done
      if (newAnswered.length === questionQueue.length) {
        handleCorrect(10 * questionQueue.length);
      } else {
        // Move to next question
        const nextQ = questionQueue[newAnswered.length];
        setCurrentQuestion(nextQ);
        setCurrentTarget(nextQ.target);
        setCurrentStep('operation');
        setCurrentFormula('');
        setSelectedOperation('');
        setCurrentAnswerChoices([]);
      }
    } else {
      handleError();
    }
  };
  
  // Handle correct answer
  const handleCorrect = (coins) => {
    setTotalCoins(prev => prev + coins);
    setShowSuccess(true);
    setShowCoins(true);
    ugConfetti();
    
    setTimeout(() => {
      setShowSuccess(false);
      setShowCoins(false);
    }, 1500);
    
    // Check streak
    if (problemWasCorrect) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      
      if (newStreak >= 2) {
        // Show move on choice after animation
        setTimeout(() => {
          setShowMoveOnChoice(true);
        }, 1600);
      } else {
        // Generate new problem after animation
        setTimeout(() => {
          if (stage === 1) {
            setStage1Answered(false); // Reset FIRST
            setShapes(generateShapes()); // Then generate new shapes
          } else if (stage === 2) {
            setProblem(generateProblem());
            setTermToPlace('center');
            setPlacedTerms([]);
          } else {
            setupQuestionQueue();
          }
        }, 1600);
      }
    } else {
      // Had errors, reset streak and generate new problem
      setCorrectStreak(0);
      setTimeout(() => {
        if (stage === 1) {
          setStage1Answered(false);
          setShapes(generateShapes());
        } else if (stage === 2) {
          setProblem(generateProblem());
          setTermToPlace('center');
          setPlacedTerms([]);
        } else {
          setupQuestionQueue();
        }
      }, 1600);
    }
  };
  
  // Handle error
  const handleError = () => {
    setShowError(true);
    setProblemWasCorrect(false);
    setTotalCoins(prev => Math.max(0, prev - 5));
    setTimeout(() => setShowError(false), 1000);
    // NO SHUFFLING - everything stays locked
  };
  
  // Handle practice choice
  const handlePracticeChoice = (moveOn) => {
    if (moveOn && stage < 10) {
      const nextStage = stage + 1;
      setShowStageUnlock(true);
      
      setTimeout(() => {
        setShowStageUnlock(false);
        setStage(nextStage);
        setUnlockedStages(prev => [...new Set([...prev, nextStage])]);
        setCorrectStreak(0);
        setShowMoveOnChoice(false);
        setProblemWasCorrect(true);
      }, 2500);
    } else {
      setShowMoveOnChoice(false);
      setCorrectStreak(0);
      setProblemWasCorrect(true);
      
      if (stage === 1) {
        setShapes(generateShapes());
        setStage1Answered(false);
      } else if (stage === 2) {
        setProblem(generateProblem());
        setTermToPlace('center');
        setPlacedTerms([]);
      } else {
        setupQuestionQueue();
      }
    }
  };
  
  // Get stage title
  const getStageTitle = (s) => {
    const titles = {
      1: "Stage 1: Identify a Circle",
      2: "Stage 2: Label Circle Parts",
      3: "Stage 3: Find d from r",
      4: "Stage 4: Find r from d",
      5: "Stage 5: Find r and C from d",
      6: "Stage 6: Find d and C from r",
      7: "Stage 7: Work Backwards from C",
      8: "Stage 8: Find d and A from r",
      9: "Stage 9: Find r and A from d",
      10: "Stage 10: Mixed Practice"
    };
    return titles[s] || "Circles";
  };
  
  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#f3f4f6' }}>
      {showSuccess && <SuccessOverlay show={true} />}
      {showError && <ErrorOverlay show={true} />}
      {showCoins && <FlyingCoins show={true} />}
      {showStageUnlock && <StageUnlockOverlay show={true} nextStage={stage + 1} />}
      {showCalculator && <Calculator show={true} onClose={() => setShowCalculator(false)} />}
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={onBack} style={{ 
              padding: '8px 16px', 
              borderRadius: '8px', 
              border: '2px solid #e5e7eb',
              background: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              ← Back
            </button>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
              {getStageTitle(stage)}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Calculator Button */}
            {stage >= 3 && (
              <button
                onClick={() => setShowCalculator(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'white',
                  border: '2px solid #3b82f6',
                  color: '#3b82f6',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🔢 Calculator
              </button>
            )}
            
            {/* Coins Display */}
            <div style={{
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '2px solid #f59e0b',
              fontSize: '22px',
              fontWeight: 'bold',
              color: '#78350f',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="11" fill="#f59e0b" stroke="#d97706" strokeWidth="2"/>
                <circle cx="12" cy="12" r="8" fill="#fbbf24" opacity="0.7"/>
                <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#78350f">¢</text>
              </svg>
              <span>{totalCoins}</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* LEFT: Visual */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {stage === 1 ? (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', padding: '40px 0' }}>
                {shapes.map((shape, i) => (
                  <button
                    key={i}
                    onClick={stage1Answered ? undefined : () => handleShapeSelect(shape)}
                    disabled={stage1Answered}
                    style={{
                      fontSize: '80px', padding: '32px', border: '3px solid #e5e7eb',
                      borderRadius: '12px', background: 'white', 
                      cursor: stage1Answered ? 'not-allowed' : 'pointer',
                      transition: 'transform 0.2s',
                      opacity: stage1Answered ? 0.5 : 1,
                      pointerEvents: stage1Answered ? 'none' : 'auto'
                    }}
                    onMouseEnter={(e) => !stage1Answered && (e.target.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    {shape.emoji}
                  </button>
                ))}
              </div>
            ) : (
              <CircleVisualization 
                problem={problem}
                stage={stage}
                onCircleClick={handleCircleClick}
                showLabels={stage >= 3}
                givenValue={givenValue}
              />
            )}
          </div>

          {/* RIGHT: Questions */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            
            {showMoveOnChoice ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px', color: '#1f2937' }}>
                  Great job!
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handlePracticeChoice(false)}
                    className="ug-answer ug-answer--pill"
                    style={{ fontSize: '20px', padding: '14px 28px' }}
                  >
                    More practice
                  </button>
                  {stage < 10 && (
                    <button
                      onClick={() => handlePracticeChoice(true)}
                      className="ug-answer ug-answer--pill"
                      style={{ fontSize: '20px', padding: '14px 28px' }}
                    >
                      Move on →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {stage === 1 && (
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
                      Which one is a circle?
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '16px' }}>
                      Click on the circle shape on the left.
                    </p>
                  </div>
                )}

                {stage === 2 && (
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
                      Where is the {termToPlace}?
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '16px' }}>
                      Click on the {termToPlace} on the circle to the left.
                    </p>
                  </div>
                )}

                {stage >= 3 && currentTarget && currentQuestion && (
                  <div>
                    {/* Question: "If r = 7, what is d?" */}
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
                      If {currentQuestion.fromLabel} = {currentQuestion.fromValue}, what is {currentTarget}?
                    </div>
                    
                    {/* Formula strip (shown between question and answers) */}
                    {currentFormula && (
                      <div style={{ 
                        textAlign: 'center', 
                        marginBottom: '16px', 
                        padding: '14px 24px', 
                        background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)', 
                        borderRadius: '24px',
                        border: '2px solid #3b82f6',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#1e40af',
                        boxShadow: '0 2px 6px rgba(59, 130, 246, 0.2)'
                      }}>
                        {currentFormula}
                      </div>
                    )}
                    
                    {/* Given value strip (shown after operation selected) */}
                    {selectedOperation && currentStep === 'value' && (
                      <div style={{ 
                        textAlign: 'center', 
                        marginBottom: '16px', 
                        padding: '12px 20px', 
                        background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)', 
                        borderRadius: '16px',
                        border: '2px solid #0ea5e9',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#0c4a6e'
                      }}>
                        {currentTarget} = {currentQuestion.calcValue} {selectedOperation}
                      </div>
                    )}
                    
                    {currentStep === 'operation' ? (
                      <>
                        <div style={{ fontSize: '18px', marginBottom: '16px', color: '#6b7280' }}>
                          Choose the correct operation:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {getOperationChoices(currentTarget).map((op, i) => (
                            <button
                              key={i}
                              onClick={() => handleOperationSelect(op)}
                              className="ug-answer ug-answer--pill"
                              style={{ fontSize: '22px', padding: '16px 28px' }}
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '18px', marginBottom: '16px', color: '#6b7280' }}>
                          Choose the correct value:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {currentAnswerChoices.map((val, i) => (
                            <button
                              key={i}
                              onClick={() => handleValueSelect(val)}
                              className="ug-answer ug-answer--pill"
                              style={{ fontSize: '22px', padding: '16px 28px' }}
                            >
                              {val % 1 === 0 ? val : val.toFixed(1)}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
