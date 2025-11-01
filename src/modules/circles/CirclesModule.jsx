// CirclesModule.jsx — Circles: One Shape, Two Formulas, Three Words

import React, { useEffect, useRef, useState } from "react";
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
    <div >
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
  { type: 'triangle', emoji: '' },
  { type: 'rectangle', emoji: '▭' },
];

// Circle visualization with clickable regions
const CircleVisualization = ({ problem, stage, placedTerms, visibleValues, onCircleClick, askedValues = [] }) => {
  const { r, d, C, A, radiusAngle, diameterAngle, colors } = problem;
  
  const hasRadius = r !== null && r > 0;
  const size = 350;
  const displayR = 110;
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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} >
      <rect width={size} height={size} fill="#f0f9ff" rx="12" />
      
      {showCircle ? (
        <>
          {/* Area (filled) - clickable for stage 2 with wider hit zone */}
          {showArea && (
            <g onClick={() => stage === 2 && onCircleClick?.('area')} >
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
          <g onClick={() => stage === 2 && onCircleClick?.('circumference')} >
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
            <g onClick={() => stage === 2 && onCircleClick?.('diameter')} >
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
          <g onClick={() => stage === 2 && onCircleClick?.('radius')} >
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

// Local Success overlay (green check), no external import required
function SuccessOverlay({ show }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(34,197,94,0.28)', animation: 'scaleIn 0.3s ease-out'
    }}>
      <div style={{ fontSize: '120px', color: '#16a34a', fontWeight: 900 }}>✓</div>
    </div>
  );
}



// Main component
export default function CirclesModule({ onProblemComplete, registerReset, updateStats }) {
  // ------------------------------
  // Core state
  // ------------------------------
  const [stage, setStage] = useState(1);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [scoreLocked, setScoreLocked] = useState(false);
  const timerRef = useRef(null);

  const [problem, setProblem] = useState(() => generateProblem(1));
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [problemCount, setProblemCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMoveOnChoice, setShowMoveOnChoice] = useState(false);
  const [currentFormula, setCurrentFormula] = useState(''); // e.g., "d = r × 2"
  const [totalCoins, setTotalCoins] = useState(0); // Total coins earned

  // ------------------------------
  // Stage-specific state
  // ------------------------------
  // Stage 1
  const [shapes, setShapes] = useState([]);

  // Stage 2
  const [termToPlace, setTermToPlace] = useState(null);
  const [placedTerms, setPlacedTerms] = useState({});

  // Stages 3+
  const [visibleValues, setVisibleValues] = useState({});
  const [currentStep, setCurrentStep] = useState(null); // 'operation' or 'value'
  const [currentTarget, setCurrentTarget] = useState(null);
  const [questionQueue, setQuestionQueue] = useState([]);

  // ------------------------------
  // Timer controls
  // ------------------------------
  const startTimer = (minutes) => {
    if (scoreLocked) return;
    setTimeRemaining(minutes * 60);
    setTimerRunning(true);
  };

  // Tick every second while running
  useEffect(() => {
    if (!timerRunning || scoreLocked) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimerRunning(false);
          setScoreLocked(true); // lock score/coins until reload
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, scoreLocked]);

  // Expose a reset to the parent header "New Problem" button
  useEffect(() => {
    if (!registerReset) return;
    const resetAll = () => {
      setTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setScoreLocked(false);
      setTimeRemaining(0);
      setShowError(false);
      setShowSuccess(false);
      setShowConfetti(false);
      setShowMoveOnChoice(false);
      setCurrentFormula('');
      setProblemCount(0);
      setVisibleValues({});
      setCurrentStep(null);
      setCurrentTarget(null);
      setQuestionQueue([]);
      setTermToPlace(null);
      setPlacedTerms({});
      setShapes([]);
      // regenerate based on current stage
      setProblem(generateProblem(stage));
    };
    registerReset(resetAll);
  }, [registerReset, stage]);

  // ------------------------------
  // Error helper (kept as-is)
  // ------------------------------
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
      try { ugConfetti.burst(); } catch {}
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
        try { ugConfetti.burst(); } catch {}
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
        try { ugConfetti.burst(); } catch {}
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
    <div >
      <ErrorOverlay show={showError} />
      <SuccessOverlay show={showSuccess} />
      {showConfetti && <Confetti show={true} />}
      
      <style>{`
        @keyframes fall { to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }
        @keyframes scaleIn { 0% { transform: scale(0); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
      `}</style>
      
      <div >
        
        {/* Title */}
        <div >
          {/* Skip to Stage 10 button (only show if not already on stage 10) */}
          {stage < 10 && (
            <button
              onClick={() => {
                setStage(10);
                setProblemCount(0);
                setTotalCoins(prev => prev * 2); // Double coins for skipping
              }}
              
            >
              Skip to Stage 10 (2× coins!)
            </button>
          )}
          
          {/* Coins display */}
          <div >
            <span ></span>
            <span >{totalCoins}</span>
          </div>
          
          <h1 >
            Circles
          </h1>
          <p >
            One Shape, Two Formulas, Three Words
          </p>
          <p >
            Stage {stage}
          </p>
        </div>
        
        <div >
        
          {/* LEFT: Visual */}
          <div >
            
            {/* Formula display (stage 3+ when formula exists) */}
            {stage >= 3 && currentFormula && (
              <div >
                {currentFormula}
              </div>
            )}
            
            {/* Stage 1: Show shapes */}
            {stage === 1 && (
              <div >
                {shapes.map((shape, i) => (
                  <button
                    key={i}
                    onClick={() => handleShapeSelect(shape)}
                    
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
          <div >
            
            {showMoveOnChoice ? (
              <div >
                <div ></div>
                <div >
                  Great job!
                </div>
                <div >
                  <button
                    onClick={() => handlePracticeChoice(false)}
                    
                  >
                    More practice
                  </button>
                  {stage < 10 && (
                    <button
                      onClick={() => handlePracticeChoice(true)}
                      
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
                    <div >
                      Which one is a circle?
                    </div>
                    <p >
                      Click on the circle shape on the left.
                    </p>
                  </div>
                )}

                {/* Stage 2 */}
                {stage === 2 && (
                  <div>
                    <div >
                      Where is the {termToPlace}?
                    </div>
                    <p >
                      Click on the {termToPlace} on the circle to the left.
                    </p>
                  </div>
                )}

                {/* Stages 3+ */}
                {stage >= 3 && currentTarget && (
                  <div>
                    {currentStep === 'operation' ? (
                      <>
                        <div >
                          {currentTarget} = {currentQuestion?.fromLabel} _____
                        </div>
                        <div >
                          {getOperationChoices(currentTarget).map((op, i) => (
                            <button
                              key={i}
                              onClick={() => handleOperationSelect(op)}
                              
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div >
                          What is {currentTarget}?
                        </div>
                        <div >
                          {getValueChoices(currentTarget).map((val, i) => (
                            <button
                              key={i}
                              onClick={() => handleValueSelect(val)}
                              
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
