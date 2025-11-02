// CirclesModule.jsx — Circles: One Shape, Two Formulas, Three Words

import React, { useEffect, useState } from "react";

const PI = 3.14159265359;

const shuffle = (arr) => { 
  const a = [...arr]; 
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [a[i], a[j]] = [a[j], a[i]]; 
  } 
  return a; 
};

// ErrorOverlay
const ErrorOverlay = ({ show }) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(239, 68, 68, 0.3)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 10000, pointerEvents: 'none'
    }}>
      <div style={{ fontSize: '120px', color: '#dc2626', fontWeight: 'bold', animation: 'shake 0.5s' }}>✗</div>
    </div>
  );
};

// Success overlay with green checkmark
const SuccessOverlay = ({ show }) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(34, 197, 94, 0.3)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 10000, pointerEvents: 'none'
    }}>
      <div style={{ fontSize: '120px', color: '#16a34a', fontWeight: 'bold', animation: 'scaleIn 0.3s' }}>✓</div>
    </div>
  );
};

// Confetti
const Confetti = ({ show }) => {
  if (!show) return null;
  const COUNT = 90;
  const pieces = Array.from({ length: COUNT }).map((_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 2;
    const duration = 3.8 + Math.random() * 2.2;
    const size = 6 + Math.floor(Math.random() * 8);
    const rot = Math.floor(Math.random() * 360);
    const colors = ['#16a34a', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];
    const color = colors[i % colors.length];
    return (
      <div key={i} style={{
        position: 'absolute', left: left + 'vw', width: size + 'px', height: size + 4 + 'px',
        background: color, transform: `rotate(${rot}deg)`,
        animation: `fall ${duration}s linear ${delay}s forwards`, top: '-20px'
      }} />
    );
  });
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999 }}>
      {pieces}
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
  const r = Math.floor(Math.random() * 7) + 4; // 4-10 for larger circles
  const d = r * 2;
  const C = 2 * PI * r;
  const A = PI * r * r;
  // Radius at random angle, diameter perpendicular to it
  const radiusAngle = Math.floor(Math.random() * 360);
  const diameterAngle = (radiusAngle + 90) % 360;
  const colors = generateColors();
  return { r, d, C, A, radiusAngle, diameterAngle, colors, stage };
};

// Shape bank
const SHAPE_BANK = [
  { type: 'circle', emoji: '⭕' },
  { type: 'square', emoji: '⬜' },
  { type: 'triangle', emoji: '🔺' },
  { type: 'rectangle', emoji: '▭' },
];

// Circle visualization with clickable regions
const CircleVisualization = ({ problem, stage, placedTerms, visibleValues, onCircleClick, askedValues = [] }) => {
  const { r, d, C, A, radiusAngle, diameterAngle, colors } = problem;
  
  const hasRadius = r !== null && r > 0;
  const size = 350;
  const scale = hasRadius ? Math.min((size * 0.35) / r, 20) : 10;
  const displayR = hasRadius ? r * scale : size * 0.3;
  const center = size / 2;
  
  // Calculate positions
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
  
  // Label positions (offset from lines)
  const radiusLabelPos = {
    x: center + (displayR * 0.5) * Math.cos(radAngle) + 25 * Math.cos(radAngle + Math.PI/2),
    y: center + (displayR * 0.5) * Math.sin(radAngle) + 25 * Math.sin(radAngle + Math.PI/2)
  };
  
  const diameterLabelPos = {
    x: center + 25 * Math.cos(diamAngle + Math.PI/2),
    y: center + 25 * Math.sin(diamAngle + Math.PI/2)
  };
  
  const circumferenceLabelPos = {
    x: center + (displayR + 35) * Math.cos(radAngle + Math.PI/4),
    y: center + (displayR + 35) * Math.sin(radAngle + Math.PI/4)
  };
  
  const areaLabelPos = {
    x: center - displayR * 0.5,
    y: center - displayR * 0.5
  };
  
  const showCircle = stage >= 2;
  const showDiameter = stage >= 2; // Always show in stage 2+ so students can click it
  const showArea = stage >= 2; // Always show in stage 2+ so students can click it
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      <rect width={size} height={size} fill="#f0f9ff" rx="12" />
      
      {showCircle ? (
        <>
          {/* Area (filled) - clickable for stage 2 with wider hit zone */}
          {showArea && (
            <g onClick={() => stage === 2 && onCircleClick?.('area')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
              <circle 
                cx={center} cy={center} r={displayR} 
                fill={colors.area} fillOpacity="0.3"
              />
              {/* Wider hit zone */}
              <circle 
                cx={center} cy={center} r={displayR} 
                fill="transparent" strokeWidth="20" stroke="transparent"
              />
            </g>
          )}
          
          {/* Circumference (outline) - clickable for stage 2 with wider hit zone */}
          <g onClick={() => stage === 2 && onCircleClick?.('circumference')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
            <circle 
              cx={center} cy={center} r={displayR} 
              fill="none" stroke={colors.circumference} strokeWidth="5"
            />
            {/* Wider hit zone */}
            <circle 
              cx={center} cy={center} r={displayR} 
              fill="none" strokeWidth="25" stroke="transparent"
            />
          </g>
          
          {/* Diameter line - clickable for stage 2 with wider hit zone */}
          {showDiameter && (
            <g onClick={() => stage === 2 && onCircleClick?.('diameter')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
              <line 
                x1={diamStart.x} y1={diamStart.y} 
                x2={diamEnd.x} y2={diamEnd.y} 
                stroke={colors.diameter} strokeWidth="4"
              />
              {/* Wider hit zone */}
              <line 
                x1={diamStart.x} y1={diamStart.y} 
                x2={diamEnd.x} y2={diamEnd.y} 
                stroke="transparent" strokeWidth="20"
              />
            </g>
          )}
          
          {/* Radius line - clickable for stage 2 with wider hit zone */}
          <g onClick={() => stage === 2 && onCircleClick?.('radius')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
            <line 
              x1={center} y1={center} 
              x2={radiusEnd.x} y2={radiusEnd.y} 
              stroke={colors.radius} strokeWidth="4"
            />
            {/* Wider hit zone */}
            <line 
              x1={center} y1={center} 
              x2={radiusEnd.x} y2={radiusEnd.y} 
              stroke="transparent" strokeWidth="20"
            />
          </g>
          
          {/* Center point */}
          <circle cx={center} cy={center} r="4" fill="#1f2937" />
          
          {/* Labels on circle (stage 2 only - with question marks) */}
          {stage === 2 && (
            <>
              {/* Radius label */}
              <text 
                x={radiusLabelPos.x} y={radiusLabelPos.y}
                fill={colors.radius} fontSize="20" fontWeight="bold" textAnchor="middle"
              >
                {placedTerms.radius ? 'r' : '?'}
              </text>
              
              {/* Diameter label */}
              {showDiameter && (
                <text 
                  x={diameterLabelPos.x} y={diameterLabelPos.y}
                  fill={colors.diameter} fontSize="20" fontWeight="bold" textAnchor="middle"
                >
                  {placedTerms.diameter ? 'd' : '?'}
                </text>
              )}
              
              {/* Circumference label */}
              <text 
                x={circumferenceLabelPos.x} y={circumferenceLabelPos.y}
                fill={colors.circumference} fontSize="20" fontWeight="bold" textAnchor="middle"
              >
                {placedTerms.circumference ? 'C' : '?'}
              </text>
              
              {/* Area label */}
              {showArea && (
                <text 
                  x={areaLabelPos.x} y={areaLabelPos.y}
                  fill={colors.area} fontSize="20" fontWeight="bold" textAnchor="middle"
                >
                  {placedTerms.area ? 'A' : '?'}
                </text>
              )}
            </>
          )}
          
          {/* Labels and values (stage 3+ - no question marks, just labels with values) */}
          {stage >= 3 && (
            <>
              {/* Only show labels relevant to this stage */}
              {/* Radius - show if given or if it's a target we're finding */}
              {(visibleValues.r !== undefined || askedValues.includes('r')) && (
                <text 
                  x={radiusLabelPos.x} y={radiusLabelPos.y}
                  fill={colors.radius} fontSize="18" fontWeight="bold" textAnchor="middle"
                >
                  r {visibleValues.r !== undefined ? `= ${visibleValues.r % 1 === 0 ? visibleValues.r : visibleValues.r.toFixed(1)}` : ''}
                </text>
              )}
              
              {/* Diameter - show if given or if it's a target */}
              {(visibleValues.d !== undefined || askedValues.includes('d')) && (
                <text 
                  x={diameterLabelPos.x} y={diameterLabelPos.y}
                  fill={colors.diameter} fontSize="18" fontWeight="bold" textAnchor="middle"
                >
                  d {visibleValues.d !== undefined ? `= ${visibleValues.d % 1 === 0 ? visibleValues.d : visibleValues.d.toFixed(1)}` : ''}
                </text>
              )}
              
              {/* Circumference - show if given or if it's a target */}
              {(visibleValues.C !== undefined || askedValues.includes('C')) && (
                <text 
                  x={circumferenceLabelPos.x} y={circumferenceLabelPos.y}
                  fill={colors.circumference} fontSize="16" fontWeight="bold" textAnchor="middle"
                >
                  C {visibleValues.C !== undefined ? `= ${visibleValues.C.toFixed(1)}` : ''}
                </text>
              )}
              
              {/* Area - show if given or if it's a target */}
              {(visibleValues.A !== undefined || askedValues.includes('A')) && (
                <text 
                  x={areaLabelPos.x} y={areaLabelPos.y}
                  fill={colors.area} fontSize="18" fontWeight="bold" textAnchor="middle"
                >
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

// Main component
export default function CirclesModule() {
  const [stage, setStage] = useState(1);
  const [problem, setProblem] = useState(() => generateProblem(1));
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [problemCount, setProblemCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMoveOnChoice, setShowMoveOnChoice] = useState(false);
  const [currentFormula, setCurrentFormula] = useState(''); // e.g., "d = r × 2"
  const [totalCoins, setTotalCoins] = useState(0); // Total coins earned
  
  // Stage 1 state
  const [shapes, setShapes] = useState([]);
  
  // Stage 2 state
  const [termToPlace, setTermToPlace] = useState(null);
  const [placedTerms, setPlacedTerms] = useState({});
  
  // Stages 3+ state
  const [visibleValues, setVisibleValues] = useState({});
  const [currentStep, setCurrentStep] = useState(null); // 'operation' or 'value'
  const [currentTarget, setCurrentTarget] = useState(null);
  const [questionQueue, setQuestionQueue] = useState([]);

  const handleError = () => {
    setShowError(true);
    setTimeout(() => setShowError(false), 1000);
  };

  // Get stage configuration
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
        { target: 'A', operation: 'πr²', fromLabel: '' }
      ]};
      case 9: return { given: 'd', steps: [
        { target: 'r', operation: '÷ 2', fromLabel: 'd' },
        { target: 'A', operation: 'πr²', fromLabel: '' }
      ]};
      case 10: {
        const configs = [
          { given: 'r', steps: [
            { target: 'd', operation: '× 2', fromLabel: 'r' },
            { target: 'C', operation: '× π', fromLabel: 'd' },
            { target: 'A', operation: 'πr²', fromLabel: '' }
          ]},
          { given: 'd', steps: [
            { target: 'r', operation: '÷ 2', fromLabel: 'd' },
            { target: 'C', operation: '× π', fromLabel: 'd' },
            { target: 'A', operation: 'πr²', fromLabel: '' }
          ]},
          { given: 'C', steps: [
            { target: 'd', operation: '÷ π', fromLabel: 'C' },
            { target: 'r', operation: '÷ 2', fromLabel: 'd' },
            { target: 'A', operation: 'πr²', fromLabel: '' }
          ]},
        ];
        return configs[Math.floor(Math.random() * configs.length)];
      }
      default: return { given: null, steps: [] };
    }
  };

  // Reset
  const resetAll = () => {
    const newProblem = generateProblem(stage);
    setProblem(newProblem);
    setPlacedTerms({});
    setVisibleValues({});
    setCurrentStep(null);
    setCurrentTarget(null);
    setQuestionQueue([]);
    setCurrentFormula('');
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
      setVisibleValues({ [config.given]: newProblem[config.given] });
      setQuestionQueue(config.steps);
      setCurrentTarget(config.steps[0].target);
      setCurrentStep('operation');
    }
  };

  useEffect(() => {
    resetAll();
  }, [stage]);

  // Stage 1: Shape selection
  const handleShapeSelect = (shape) => {
    if (shape.type === 'circle') {
      setShowSuccess(true);
      setShowConfetti(true);
      const coinsEarned = 10;
      setTotalCoins(prev => prev + coinsEarned);
      
      setTimeout(() => {
        setShowSuccess(false);
        setShowConfetti(false);
        
        const newCount = problemCount + 1;
        setProblemCount(newCount);
        
        // Stage 10 never shows move-on choice
        if (stage === 10 || newCount < 2) {
          resetAll();
        } else {
          setShowMoveOnChoice(true);
        }
      }, 1500);
    } else {
      handleError();
    }
  };

  // Stage 2: Term clicking on circle
  const handleCircleClick = (term) => {
    if (term === termToPlace) {
      const newPlaced = { ...placedTerms, [term]: true };
      setPlacedTerms(newPlaced);
      
      const allTerms = ['radius', 'diameter', 'circumference', 'area'];
      const allPlaced = allTerms.every(t => newPlaced[t]);
      
      if (allPlaced) {
        setShowSuccess(true);
        setShowConfetti(true);
        const coinsEarned = 10;
        setTotalCoins(prev => prev + coinsEarned);
        
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
      } else {
        const remaining = allTerms.filter(t => !newPlaced[t]);
        setTermToPlace(remaining[0]);
      }
    } else {
      handleError();
    }
  };

  // Get operation choices
  const getOperationChoices = (target) => {
    const allOps = ['× 2', '÷ 2', '× π', '÷ π', 'πr²'];
    const currentQuestion = questionQueue.find(q => q.target === target);
    const correct = currentQuestion?.operation;
    
    // Get unique distractors
    const availableDistractors = allOps.filter(op => op !== correct);
    const selectedDistractors = [];
    const shuffledDistractors = shuffle(availableDistractors);
    
    for (let i = 0; i < 3 && i < shuffledDistractors.length; i++) {
      selectedDistractors.push(shuffledDistractors[i]);
    }
    
    return shuffle([correct, ...selectedDistractors]);
  };

  // Get value choices
  const getValueChoices = (target) => {
    const correct = problem[target];
    const allValues = [problem.r, problem.d, problem.C, problem.A];
    
    // Generate some plausible wrong answers
    const distractors = new Set();
    
    if (target === 'd') {
      distractors.add(problem.r / 2);
      distractors.add(problem.r * 3);
      distractors.add(problem.C / 2);
    } else if (target === 'r') {
      distractors.add(problem.d * 2);
      distractors.add(problem.d / 4);
      distractors.add(problem.C);
    } else if (target === 'C') {
      distractors.add(problem.d * 2);
      distractors.add(problem.r * 6);
      distractors.add(problem.A / 3);
    } else if (target === 'A') {
      distractors.add(problem.r * 3);
      distractors.add(problem.C);
      distractors.add(problem.d * 3);
    }
    
    // Remove the correct answer from distractors
    distractors.delete(correct);
    
    // Convert to array and take first 3
    const distractorArray = Array.from(distractors).slice(0, 3);
    
    // Make sure we have exactly 3 distractors
    while (distractorArray.length < 3) {
      const randomValue = problem[['r', 'd', 'C', 'A'][Math.floor(Math.random() * 4)]];
      if (randomValue !== correct && !distractorArray.includes(randomValue)) {
        distractorArray.push(randomValue);
      }
    }
    
    return shuffle([correct, ...distractorArray]);
  };

  // Operation handler - builds formula
  const handleOperationSelect = (operation) => {
    const currentQuestion = questionQueue.find(q => q.target === currentTarget);
    
    if (operation === currentQuestion.operation) {
      // Build the formula string with proper spacing
      // Special case for Area (πr²) - no fromLabel needed
      let formula;
      if (currentTarget === 'A') {
        formula = `${currentTarget} = ${operation}`;
      } else {
        formula = `${currentTarget} = ${currentQuestion.fromLabel} ${operation}`;
      }
      setCurrentFormula(formula);
      setCurrentStep('value');
    } else {
      handleError();
    }
  };

  // Value handler
  const handleValueSelect = (value) => {
    const correctValue = problem[currentTarget];
    
    if (Math.abs(value - correctValue) < 0.01) {
      const newVisible = { ...visibleValues, [currentTarget]: value };
      setVisibleValues(newVisible);
      
      // Check if all questions done
      const remainingQuestions = questionQueue.filter(q => newVisible[q.target] === undefined);
      
      if (remainingQuestions.length === 0) {
        // All done for this problem - show success
        const coinsEarned = 10 * questionQueue.length;
        setTotalCoins(prev => prev + coinsEarned);
        setShowSuccess(true);
        setShowConfetti(true);
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
      } else {
        // Move to next question immediately
        setCurrentTarget(remainingQuestions[0].target);
        setCurrentStep('operation');
        setCurrentFormula('');
      }
    } else {
      handleError();
    }
  };

  // Practice choice
  const handlePracticeChoice = (moveOn) => {
    setShowMoveOnChoice(false);
    
    if (moveOn && stage < 10) {
      setStage(stage + 1);
      setProblemCount(0);
    } else {
      resetAll();
    }
  };

  const currentQuestion = questionQueue.find(q => q.target === currentTarget);
  const fromValue = currentQuestion?.from ? visibleValues[currentQuestion.from] : null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)', padding: '16px' }}>
      <ErrorOverlay show={showError} />
      <SuccessOverlay show={showSuccess} />
      {showConfetti && <Confetti show={true} />}
      
      <style>{`
        @keyframes fall { to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }
        @keyframes scaleIn { 0% { transform: scale(0); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
      `}</style>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative' }}>
          {/* Skip to Stage 10 button (only show if not already on stage 10) */}
          {stage < 10 && (
            <button
              onClick={() => {
                setStage(10);
                setProblemCount(0);
                setTotalCoins(prev => prev * 2); // Double coins for skipping
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                padding: '8px 16px',
                borderRadius: '8px',
                border: '2px solid #f59e0b',
                background: '#fef3c7',
                color: '#92400e',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Skip to Stage 10 (2× coins!)
            </button>
          )}
          
          {/* Coins display */}
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            padding: '8px 16px',
            borderRadius: '8px',
            background: '#fef3c7',
            border: '2px solid #f59e0b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>🪙</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e' }}>{totalCoins}</span>
          </div>
          
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            Circles
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>
            One Shape, Two Formulas, Three Words
          </p>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>
            Stage {stage}
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        
          {/* LEFT: Visual */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            
            {/* Formula display (stage 3+ when formula exists) */}
            {stage >= 3 && currentFormula && (
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '16px', 
                padding: '12px', 
                background: '#f0f9ff', 
                borderRadius: '8px',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937'
              }}>
                {currentFormula}
              </div>
            )}
            
            {/* Stage 1: Show shapes */}
            {stage === 1 && (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
            )}
            
            {/* Stage 2+: Show circle */}
            {stage >= 2 && (
              <CircleVisualization 
                problem={problem}
                stage={stage}
                placedTerms={placedTerms}
                visibleValues={visibleValues}
                onCircleClick={handleCircleClick}
                askedValues={questionQueue.map(q => q.target)}
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
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={() => handlePracticeChoice(false)}
                    style={{
                      padding: '16px 32px', borderRadius: '24px', border: '2px solid #4f46e5',
                      background: 'white', color: '#4f46e5', fontWeight: 'bold',
                      cursor: 'pointer', fontSize: '18px'
                    }}
                  >
                    More practice
                  </button>
                  {stage < 10 && (
                    <button
                      onClick={() => handlePracticeChoice(true)}
                      style={{
                        padding: '16px 32px', borderRadius: '24px', border: '2px solid #4f46e5',
                        background: '#4f46e5', color: 'white', fontWeight: 'bold',
                        cursor: 'pointer', fontSize: '18px'
                      }}
                    >
                      Move on →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Stage 1 */}
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

                {/* Stage 2 */}
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

                {/* Stages 3+ */}
                {stage >= 3 && currentTarget && (
                  <div>
                    {currentStep === 'operation' ? (
                      <>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
                          {currentTarget} = {currentQuestion?.fromLabel} _____
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {getOperationChoices(currentTarget).map((op, i) => (
                            <button
                              key={i}
                              onClick={() => handleOperationSelect(op)}
                              style={{
                                padding: '16px 24px', borderRadius: '24px', border: '2px solid #4f46e5',
                                background: 'white', color: '#1f2937', fontWeight: 'bold',
                                cursor: 'pointer', fontSize: '18px'
                              }}
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
                          {getValueChoices(currentTarget).map((val, i) => (
                            <button
                              key={i}
                              onClick={() => handleValueSelect(val)}
                              style={{
                                padding: '16px 24px', borderRadius: '24px', border: '2px solid #4f46e5',
                                background: 'white', color: '#1f2937', fontWeight: 'bold',
                                cursor: 'pointer', fontSize: '18px'
                              }}
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
