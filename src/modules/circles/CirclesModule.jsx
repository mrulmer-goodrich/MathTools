// CirclesModule.jsx — UG Math Tools
// Circles: One Shape, Two Formulas, Three Words

import React, { useEffect, useState } from "react";
import { ErrorOverlay } from "../../components/StatsSystem.jsx";
import BigButton from "../../components/BigButton.jsx";
import ugConfetti from "../../lib/confetti.js";

const PI = 3.14159265359;

const shuffle = (arr) => { 
  const a = [...arr]; 
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [a[i], a[j]] = [a[j], a[i]]; 
  } 
  return a; 
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
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// Exploding coins animation - burst from center in all directions
const FlyingCoins = ({ show }) => {
  if (!show) return null;
  const COUNT = 40;
  const coins = Array.from({ length: COUNT }).map((_, i) => {
    const angle = (i / COUNT) * 360; // Spread evenly in circle
    const distance = 200 + Math.random() * 100; // How far they travel
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
          60% { 
            transform: 
              translate(
                calc(-50% + cos(var(--angle)) * var(--distance)),
                calc(-50% + sin(var(--angle)) * var(--distance))
              )
              rotate(var(--rotation))
              scale(1.2);
            opacity: 1;
          }
          100% { 
            transform: 
              translate(
                calc(-50% + cos(var(--angle)) * var(--distance)),
                calc(-50% + sin(var(--angle)) * var(--distance))
              )
              rotate(var(--rotation))
              scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
      {coins}
    </div>
  );
};

// Generate colors
const generateColors = () => {
  const colorSets = [
    { radius: '#ef4444', diameter: '#8b5cf6', circumference: '#3b82f6', area: '#f59e0b' },
    { radius: '#10b981', diameter: '#ec4899', circumference: '#f59e0b', area: '#06b6d4' },
    { radius: '#3b82f6', diameter: '#10b981', circumference: '#ef4444', area: '#8b5cf6' },
    { radius: '#f59e0b', diameter: '#06b6d4', circumference: '#8b5cf6', area: '#10b981' },
  ];
  return colorSets[Math.floor(Math.random() * colorSets.length)];
};

// Generate problem
const generateProblem = (stage) => {
  const r = Math.floor(Math.random() * 7) + 4; // 4-10 for good sizing
  const d = r * 2;
  const C = 2 * PI * r;
  const A = PI * r * r;
  
  // Limited rotation angles - every 45 degrees to prevent overlaps
  const safeAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const radiusAngle = safeAngles[Math.floor(Math.random() * safeAngles.length)];
  const diameterAngle = (radiusAngle + 90) % 360;
  
  const colors = generateColors();
  return { r, d, C, A, radiusAngle, diameterAngle, colors, stage };
};

// Extended shape bank with variety
const SHAPE_BANK = [
  { type: 'circle', label: 'Circle', emoji: '⭕' },
  { type: 'square', label: 'Square', emoji: '⬜' },
  { type: 'triangle', label: 'Triangle', emoji: '🔺' },
  { type: 'rectangle', label: 'Rectangle', emoji: '▭' },
  { type: 'pentagon', label: 'Pentagon', emoji: '⬟' },
  { type: 'hexagon', label: 'Hexagon', emoji: '⬡' },
  { type: 'star', label: 'Star', emoji: '⭐' },
  { type: 'heart', label: 'Heart', emoji: '❤️' },
  { type: 'oval', label: 'Oval', emoji: '🥚' },
  { type: 'diamond', label: 'Diamond', emoji: '💎' },
];

// Circle visualization
const CircleVisualization = ({ problem, stage, placedTerms, visibleValues, askedValues = [], onCircleClick }) => {
  const { r, d, C, A, radiusAngle, diameterAngle, colors } = problem;
  
  const size = 400; // Increased canvas size
  const center = size / 2;
  
  // Fixed radius - circle should be large and consistent
  const displayR = 120; // Fixed large radius (was calculated before)
  
  const radAngle = (radiusAngle * Math.PI) / 180;
  const diamAngle = (diameterAngle * Math.PI) / 180;
  
  const radiusEnd = {
    x: center + displayR * Math.cos(radAngle),
    y: center + displayR * Math.sin(radAngle)
  };
  
  const diamStart = {
    x: center - displayR * Math.cos(diamAngle),
    y: center - displayR * Math.sin(diamAngle)
  };
  
  const diamEnd = {
    x: center + displayR * Math.cos(diamAngle),
    y: center + displayR * Math.sin(diamAngle)
  };
  
  // Dynamic label positioning based on line angles - ALWAYS clear of lines
  // Radius label: perpendicular to radius, outside the line
  const radiusLabelPos = {
    x: center + (displayR * 0.7) * Math.cos(radAngle) + 40 * Math.cos(radAngle + Math.PI/2),
    y: center + (displayR * 0.7) * Math.sin(radAngle) + 40 * Math.sin(radAngle + Math.PI/2)
  };
  
  // Diameter label: perpendicular to diameter, pushed away from radius
  // Check which side to push it based on radius angle
  const diamPerpOffset = Math.PI/2;
  const diameterLabelPos = {
    x: center + 50 * Math.cos(diamAngle + diamPerpOffset),
    y: center + 50 * Math.sin(diamAngle + diamPerpOffset)
  };
  
  // Circumference: outside circle, avoiding both lines
  // Place at angle that's 135° from radius (in safe quadrant)
  const circumAngle = radAngle + (135 * Math.PI / 180);
  const circumferenceLabelPos = {
    x: center + (displayR + 45) * Math.cos(circumAngle),
    y: center + (displayR + 45) * Math.sin(circumAngle)
  };
  
  // Area: inside circle, in quadrant opposite to radius
  // Place at angle opposite to radius
  const areaAngle = radAngle + Math.PI; // 180° opposite
  const areaLabelPos = {
    x: center + (displayR * 0.5) * Math.cos(areaAngle),
    y: center + (displayR * 0.5) * Math.sin(areaAngle)
  };
  
  const showCircle = stage >= 2;
  const showDiameter = stage >= 2;
  const showArea = stage >= 2;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      <rect width={size} height={size} fill="#ffffff" rx="12" />
      
      {showCircle ? (
        <>
          {showArea && (
            <g onClick={() => stage === 2 && onCircleClick?.('area')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
              <circle cx={center} cy={center} r={displayR} fill={colors.area} fillOpacity="0.3" />
              <circle cx={center} cy={center} r={displayR} fill="transparent" strokeWidth="20" stroke="transparent" />
            </g>
          )}
          
          <g onClick={() => stage === 2 && onCircleClick?.('circumference')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
            <circle cx={center} cy={center} r={displayR} fill="none" stroke={colors.circumference} strokeWidth="6" />
            <circle cx={center} cy={center} r={displayR} fill="none" strokeWidth="30" stroke="transparent" />
          </g>
          
          {showDiameter && (
            <g onClick={() => stage === 2 && onCircleClick?.('diameter')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
              <line x1={diamStart.x} y1={diamStart.y} x2={diamEnd.x} y2={diamEnd.y} stroke={colors.diameter} strokeWidth="5" />
              <line x1={diamStart.x} y1={diamStart.y} x2={diamEnd.x} y2={diamEnd.y} stroke="transparent" strokeWidth="25" />
            </g>
          )}
          
          <g onClick={() => stage === 2 && onCircleClick?.('radius')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
            <line x1={center} y1={center} x2={radiusEnd.x} y2={radiusEnd.y} stroke={colors.radius} strokeWidth="5" />
            <line x1={center} y1={center} x2={radiusEnd.x} y2={radiusEnd.y} stroke="transparent" strokeWidth="25" />
          </g>
          
          <circle cx={center} cy={center} r="5" fill="#1f2937" />
          
          {stage === 2 && (
            <>
              <text x={radiusLabelPos.x} y={radiusLabelPos.y} fill={colors.radius} fontSize="24" fontWeight="bold" textAnchor="middle">
                {placedTerms.radius ? 'r' : '?'}
              </text>
              {showDiameter && (
                <text x={diameterLabelPos.x} y={diameterLabelPos.y} fill={colors.diameter} fontSize="24" fontWeight="bold" textAnchor="middle">
                  {placedTerms.diameter ? 'd' : '?'}
                </text>
              )}
              <text x={circumferenceLabelPos.x} y={circumferenceLabelPos.y} fill={colors.circumference} fontSize="24" fontWeight="bold" textAnchor="middle">
                {placedTerms.circumference ? 'C' : '?'}
              </text>
              {showArea && (
                <text x={areaLabelPos.x} y={areaLabelPos.y} fill={colors.area} fontSize="24" fontWeight="bold" textAnchor="middle">
                  {placedTerms.area ? 'A' : '?'}
                </text>
              )}
            </>
          )}
          
          {stage >= 3 && (
            <>
              {(visibleValues.r !== undefined || askedValues.includes('r')) && (
                <text x={radiusLabelPos.x} y={radiusLabelPos.y} fill={colors.radius} fontSize="20" fontWeight="bold" textAnchor="middle">
                  r {visibleValues.r !== undefined ? `= ${visibleValues.r % 1 === 0 ? visibleValues.r : visibleValues.r.toFixed(1)}` : ''}
                </text>
              )}
              
              {(visibleValues.d !== undefined || askedValues.includes('d')) && (
                <text x={diameterLabelPos.x} y={diameterLabelPos.y} fill={colors.diameter} fontSize="20" fontWeight="bold" textAnchor="middle">
                  d {visibleValues.d !== undefined ? `= ${visibleValues.d % 1 === 0 ? visibleValues.d : visibleValues.d.toFixed(1)}` : ''}
                </text>
              )}
              
              {(visibleValues.C !== undefined || askedValues.includes('C')) && (
                <text x={circumferenceLabelPos.x} y={circumferenceLabelPos.y} fill={colors.circumference} fontSize="18" fontWeight="bold" textAnchor="middle">
                  C {visibleValues.C !== undefined ? `= ${visibleValues.C.toFixed(1)}` : ''}
                </text>
              )}
              
              {(visibleValues.A !== undefined || askedValues.includes('A')) && (
                <text x={areaLabelPos.x} y={areaLabelPos.y} fill={colors.area} fontSize="20" fontWeight="bold" textAnchor="middle">
                  A {visibleValues.A !== undefined ? `= ${visibleValues.A.toFixed(1)}` : ''}
                </text>
              )}
            </>
          )}
        </>
      ) : (
        <text x={center} y={center} fill="#9ca3af" fontSize="18" textAnchor="middle" dominantBaseline="middle">
          Circle appears here...
        </text>
      )}
    </svg>
  );
};

// MAIN COMPONENT
export default function CirclesModule({ onProblemComplete, registerReset, updateStats }) {
  const [stage, setStage] = useState(null); // null = entry screen
  const [problem, setProblem] = useState(() => generateProblem(1));
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [problemCount, setProblemCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMoveOnChoice, setShowMoveOnChoice] = useState(false);
  const [currentFormula, setCurrentFormula] = useState('');
  const [totalCoins, setTotalCoins] = useState(0);
  
  const [shapes, setShapes] = useState([]);
  const [termToPlace, setTermToPlace] = useState(null);
  const [placedTerms, setPlacedTerms] = useState({});
  const [visibleValues, setVisibleValues] = useState({});
  const [currentStep, setCurrentStep] = useState(null);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [questionQueue, setQuestionQueue] = useState([]);
  const [currentAnswerChoices, setCurrentAnswerChoices] = useState([]); // Prevent re-shuffling

  // Register reset with parent
  useEffect(() => {
    registerReset?.(() => {
      setStage(null); // Back to entry
      setProblem(generateProblem(1));
      setProblemCount(0);
      setTotalCoins(0);
      setShowError(false);
      setShowSuccess(false);
      setShowConfetti(false);
      setShowMoveOnChoice(false);
      resetStageState();
    });
  }, [registerReset]);

  const handleError = () => {
    setShowError(true);
    // Penalty: lose 5 coins, but Stage 10 resets to 0
    if (stage === 10) {
      setTotalCoins(0);
    } else {
      setTotalCoins(prev => Math.max(0, prev - 5));
    }
    setTimeout(() => setShowError(false), 1000);
  };

  const getStageConfig = (stageNum) => {
    switch(stageNum) {
      case 3: return { given: 'r', steps: [{ target: 'd', operation: '× 2', fromLabel: 'r' }] };
      case 4: return { given: 'd', steps: [{ target: 'r', operation: '÷ 2', fromLabel: 'd' }] };
      case 5: return { given: 'd', steps: [
        { target: 'r', operation: '÷ 2', fromLabel: 'd' },
        { target: 'C', operation: '× π', fromLabel: 'd' }
      ]};
      case 6: return { given: 'r', steps: [
        { target: 'd', operation: '× 2', fromLabel: 'r' },
        { target: 'C', operation: '× π', fromLabel: 'd' }
      ]};
      case 7: return { given: 'C', steps: [
        { target: 'd', operation: '÷ π', fromLabel: 'C' },
        { target: 'r', operation: '÷ 2', fromLabel: 'd' }
      ]};
      case 8: return { given: 'r', steps: [
        { target: 'd', operation: '× 2', fromLabel: 'r' },
        { target: 'A', operation: 'π r²', fromLabel: '' }
      ]};
      case 9: return { given: 'd', steps: [
        { target: 'r', operation: '÷ 2', fromLabel: 'd' },
        { target: 'A', operation: 'π r²', fromLabel: '' }
      ]};
      case 10: {
        const configs = [
          { given: 'r', steps: [
            { target: 'd', operation: '× 2', fromLabel: 'r' },
            { target: 'C', operation: '× π', fromLabel: 'd' },
            { target: 'A', operation: 'π r²', fromLabel: '' }
          ]},
          { given: 'd', steps: [
            { target: 'r', operation: '÷ 2', fromLabel: 'd' },
            { target: 'C', operation: '× π', fromLabel: 'd' },
            { target: 'A', operation: 'π r²', fromLabel: '' }
          ]},
          { given: 'C', steps: [
            { target: 'd', operation: '÷ π', fromLabel: 'C' },
            { target: 'r', operation: '÷ 2', fromLabel: 'd' },
            { target: 'A', operation: 'π r²', fromLabel: '' }
          ]},
        ];
        return configs[Math.floor(Math.random() * configs.length)];
      }
      default: return { given: null, steps: [] };
    }
  };

  const resetStageState = () => {
    setPlacedTerms({});
    setVisibleValues({});
    setCurrentStep(null);
    setCurrentTarget(null);
    setQuestionQueue([]);
    setCurrentFormula('');
    setCurrentAnswerChoices([]); // Clear stored choices
    setShowMoveOnChoice(false);
    
    if (stage === 1) {
      const otherShapes = shuffle(SHAPE_BANK.filter(s => s.type !== 'circle')).slice(0, 3);
      const allShapes = shuffle([SHAPE_BANK[0], ...otherShapes]);
      setShapes(allShapes);
    }
    
    if (stage === 2) {
      const terms = shuffle(['radius', 'diameter', 'circumference', 'area']);
      setTermToPlace(terms[0]);
    }
    
    if (stage >= 3) {
      const config = getStageConfig(stage);
      setVisibleValues({ [config.given]: problem[config.given] });
      setQuestionQueue(config.steps);
      setCurrentTarget(config.steps[0].target);
      setCurrentStep('operation');
    }
  };

  const resetAll = () => {
    const newProblem = generateProblem(stage);
    setProblem(newProblem);
    resetStageState();
  };

  useEffect(() => {
    if (stage !== null) {
      resetAll();
    }
  }, [stage]);

  const handleCorrectAnswer = () => {
    const coinsEarned = stage <= 2 ? 10 : 10 * (questionQueue.length || 1);
    setTotalCoins(prev => prev + coinsEarned);
    
    setShowSuccess(true);
    setShowConfetti(true);
    
    try {
      ugConfetti?.burst?.();
    } catch {}
    
    onProblemComplete?.({ module: "circles", stage, correct: true });
    updateStats?.({ module: "circles", problemsSolved: 1, lastStage: stage });
    
    setTimeout(() => {
      setShowSuccess(false);
      setShowConfetti(false);
      
      const newCount = problemCount + 1;
      setProblemCount(newCount);
      
      if (stage === 10 || newCount < 2) {
        resetAll();
      } else {
        setShowMoveOnChoice(true);
      }
    }, 1500);
  };

  const handleShapeSelect = (shape) => {
    if (shape.type === 'circle') {
      handleCorrectAnswer();
    } else {
      handleError();
    }
  };

  const handleCircleClick = (term) => {
    if (term === termToPlace) {
      const newPlaced = { ...placedTerms, [term]: true };
      setPlacedTerms(newPlaced);
      
      const allTerms = ['radius', 'diameter', 'circumference', 'area'];
      const allPlaced = allTerms.every(t => newPlaced[t]);
      
      if (allPlaced) {
        handleCorrectAnswer();
      } else {
        const remaining = allTerms.filter(t => !newPlaced[t]);
        setTermToPlace(remaining[0]);
      }
    } else {
      handleError();
    }
  };

  const getOperationChoices = (target) => {
    const allOps = ['× 2', '÷ 2', '× π', '÷ π', 'π r²'];
    const currentQuestion = questionQueue.find(q => q.target === target);
    const correct = currentQuestion?.operation;
    const availableDistractors = allOps.filter(op => op !== correct);
    const selectedDistractors = shuffle(availableDistractors).slice(0, 3);
    return shuffle([correct, ...selectedDistractors]);
  };

  const getValueChoices = (target) => {
    const correct = problem[target];
    const distractors = [];
    
    // Generate distractors based on actual problem values
    if (target === 'd') {
      distractors.push(problem.r); // Just the radius
      distractors.push(problem.r * 3); // Triple radius
      distractors.push(problem.C / PI); // C divided by pi
    } else if (target === 'r') {
      distractors.push(problem.d); // Just the diameter
      distractors.push(problem.d / 4); // Quarter diameter
      distractors.push(problem.C / (2 * PI) * 1.5); // Off by 50%
    } else if (target === 'C') {
      distractors.push(problem.d * PI); // Forgot the 2
      distractors.push(problem.r * 2 * PI * 1.5); // Off by 50%
      distractors.push(problem.A / problem.r); // Wrong formula
    } else if (target === 'A') {
      distractors.push(problem.r * problem.r); // Forgot pi
      distractors.push(PI * problem.d * problem.d / 4 * 1.5); // Off calculation
      distractors.push(problem.C * problem.r / 2 * 1.2); // Alternative wrong
    }
    
    // Filter out the correct answer and ensure unique values
    const uniqueDistractors = distractors
      .filter(val => Math.abs(val - correct) > 0.5)
      .filter((val, idx, arr) => arr.findIndex(v => Math.abs(v - val) < 0.5) === idx)
      .slice(0, 3);
    
    // If we don't have enough distractors, add some more
    while (uniqueDistractors.length < 3) {
      const factor = [0.5, 0.75, 1.25, 1.5, 2, 3][Math.floor(Math.random() * 6)];
      const distractor = correct * factor;
      if (Math.abs(distractor - correct) > 0.5 && 
          !uniqueDistractors.find(v => Math.abs(v - distractor) < 0.5)) {
        uniqueDistractors.push(distractor);
      }
    }
    
    return shuffle([correct, ...uniqueDistractors.slice(0, 3)]);
  };

  const handleOperationSelect = (operation) => {
    const currentQuestion = questionQueue.find(q => q.target === currentTarget);
    
    if (operation === currentQuestion.operation) {
      let formula;
      if (currentTarget === 'A') {
        formula = `${currentTarget} = ${operation}`;
      } else {
        formula = `${currentTarget} = ${currentQuestion.fromLabel} ${operation}`;
      }
      setCurrentFormula(formula);
      
      // Generate answer choices ONCE and store them
      const choices = getValueChoices(currentTarget);
      setCurrentAnswerChoices(choices);
      
      setCurrentStep('value');
    } else {
      handleError();
    }
  };

  const handleValueSelect = (value) => {
    const correctValue = problem[currentTarget];
    
    if (Math.abs(value - correctValue) < 0.01) {
      const newVisible = { ...visibleValues, [currentTarget]: value };
      setVisibleValues(newVisible);
      
      const remainingQuestions = questionQueue.filter(q => newVisible[q.target] === undefined);
      
      if (remainingQuestions.length === 0) {
        handleCorrectAnswer();
      } else {
        setCurrentTarget(remainingQuestions[0].target);
        setCurrentStep('operation');
        setCurrentFormula('');
        setCurrentAnswerChoices([]); // Clear for next question
      }
    } else {
      handleError();
    }
  };

  const handlePracticeChoice = (moveOn) => {
    setShowMoveOnChoice(false);
    
    if (moveOn && stage < 10) {
      setStage(stage + 1);
      setProblemCount(0);
    } else {
      resetAll();
    }
  };

  const getStageTitle = (stg) => {
    const titles = {
      1: 'Stage 1: Identify a Circle',
      2: 'Stage 2: Label Circle Parts',
      3: 'Stage 3: Find Diameter from Radius',
      4: 'Stage 4: Find Radius from Diameter',
      5: 'Stage 5: Find Radius and Circumference',
      6: 'Stage 6: Find Diameter and Circumference',
      7: 'Stage 7: Work Backwards from Circumference',
      8: 'Stage 8: Find Diameter and Area',
      9: 'Stage 9: Find Radius and Area',
      10: 'Stage 10: Mixed Practice'
    };
    return titles[stg] || `Stage ${stg}`;
  };

  const currentQuestion = questionQueue.find(q => q.target === currentTarget);

  // Entry screen
  if (stage === null) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '48px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '500px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            🏭 Circles
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
            One Shape, Two Formulas, Three Words
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <BigButton 
              onClick={() => setStage(1)}
              className="ug-button"
              style={{ fontSize: '18px', padding: '16px 32px' }}
            >
              Start at Stage 1
            </BigButton>
            
            <BigButton 
              onClick={() => setStage(10)}
              className="ug-button"
              style={{ fontSize: '18px', padding: '16px 32px', background: '#f59e0b', borderColor: '#f59e0b' }}
            >
              Skip to Stage 10 (2× coins!)
            </BigButton>
          </div>
          
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '24px' }}>
            Choose your starting point
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)', padding: '16px' }}>
      <ErrorOverlay show={showError} />
      <SuccessOverlay show={showSuccess} />
      {showConfetti && <FlyingCoins show={true} />}
      
      <style>{`
        @keyframes successPop {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Compact Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
            {getStageTitle(stage)}
          </div>
          
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
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* LEFT: Visual */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {stage >= 3 && currentFormula && (
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
            
            {stage === 1 ? (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', padding: '40px 0' }}>
                {shapes.map((shape, i) => (
                  <button
                    key={i}
                    onClick={() => handleShapeSelect(shape)}
                    style={{
                      fontSize: '80px', padding: '32px', border: '3px solid #e5e7eb',
                      borderRadius: '12px', background: 'white', cursor: 'pointer',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
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
                placedTerms={placedTerms}
                visibleValues={visibleValues}
                askedValues={questionQueue.map(q => q.target)}
                onCircleClick={handleCircleClick}
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

                {stage >= 3 && currentTarget && (
                  <div>
                    {currentStep === 'operation' ? (
                      <>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
                          {currentTarget} = {currentQuestion?.fromLabel || ''} _____
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
                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
                          What is {currentTarget}?
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
