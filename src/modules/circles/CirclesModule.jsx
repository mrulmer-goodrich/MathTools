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
      <div
        key={i}
        style={{
          position: 'absolute', left: left + 'vw', width: size + 'px', height: size + 4 + 'px',
          background: color, transform: `rotate(${rot}deg)`,
          animation: `fall ${duration}s linear ${delay}s forwards`, top: '-20px'
        }}
      />
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
  const r = Math.floor(Math.random() * 7) + 4; // 4-10 for good sizing
  const d = r * 2;
  const C = 2 * PI * r;
  const A = PI * r * r;
  const radiusAngle = Math.floor(Math.random() * 360);
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
  
  // Label positions - positioned FAR from lines with larger circle
  const radiusLabelPos = {
    x: center + (displayR * 0.5) * Math.cos(radAngle) + 50 * Math.cos(radAngle + Math.PI/2),
    y: center + (displayR * 0.5) * Math.sin(radAngle) + 50 * Math.sin(radAngle + Math.PI/2)
  };
  
  const diameterLabelPos = {
    x: center + 55 * Math.cos(diamAngle + Math.PI/2),
    y: center + 55 * Math.sin(diamAngle + Math.PI/2)
  };
  
  const circumferenceLabelPos = {
    x: center + (displayR + 45) * Math.cos(radAngle + Math.PI/3),
    y: center + (displayR + 45) * Math.sin(radAngle + Math.PI/3)
  };
  
  const areaLabelPos = {
    x: center - displayR * 0.4,
    y: center - displayR * 0.4
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

  const resetStageState = () => {
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
    const allOps = ['× 2', '÷ 2', '× π', '÷ π', 'πr²'];
    const currentQuestion = questionQueue.find(q => q.target === target);
    const correct = currentQuestion?.operation;
    const availableDistractors = allOps.filter(op => op !== correct);
    const selectedDistractors = shuffle(availableDistractors).slice(0, 3);
    return shuffle([correct, ...selectedDistractors]);
  };

  const getValueChoices = (target) => {
    const correct = problem[target];
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
    
    distractors.delete(correct);
    const distractorArray = Array.from(distractors).slice(0, 3);
    
    while (distractorArray.length < 3) {
      const randomValue = problem[['r', 'd', 'C', 'A'][Math.floor(Math.random() * 4)]];
      if (randomValue !== correct && !distractorArray.includes(randomValue)) {
        distractorArray.push(randomValue);
      }
    }
    
    return shuffle([correct, ...distractorArray]);
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
      {showConfetti && <Confetti show={true} />}
      
      <style>{`
        @keyframes fall { to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes scaleIn { 0% { transform: scale(0); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
      `}</style>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Compact Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
            {getStageTitle(stage)}
          </div>
          
          <div style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: '#fef3c7',
            border: '2px solid #f59e0b',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            🪙 <span>{totalCoins}</span>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* LEFT: Visual */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
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
                    style={{ fontSize: '18px', padding: '12px 24px' }}
                  >
                    More practice
                  </button>
                  {stage < 10 && (
                    <button
                      onClick={() => handlePracticeChoice(true)}
                      className="ug-answer ug-answer--pill"
                      style={{ fontSize: '18px', padding: '12px 24px' }}
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
                              style={{ fontSize: '18px', padding: '12px 24px' }}
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
                              className="ug-answer ug-answer--pill"
                              style={{ fontSize: '18px', padding: '12px 24px' }}
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
