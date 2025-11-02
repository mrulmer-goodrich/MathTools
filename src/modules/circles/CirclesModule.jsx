// CirclesModule.jsx — UG Math Tools
// Circles: One Shape, Two Formulas, Three Words

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

// Calculator
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

// Stage Unlock with coin animations
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
      <div style={{ fontSize: '40px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{
            animation: `coinBounce ${1 + Math.random()}s ease-in-out ${i * 0.1}s infinite`,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            border: '3px solid #d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#78350f',
            boxShadow: '0 4px 8px rgba(217, 119, 6, 0.3)'
          }}>
            ¢
          </div>
        ))}
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
        @keyframes coinBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

// Success overlay
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

// Exploding coins
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
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          border: '3px solid #d97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#78350f',
          boxShadow: '0 4px 8px rgba(217, 119, 6, 0.3)'
        }}>
          ¢
        </div>
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

const generateColors = () => {
  const colorSets = [
    { radius: '#ef4444', diameter: '#8b5cf6', circumference: '#3b82f6', area: '#f59e0b' },
    { radius: '#10b981', diameter: '#ec4899', circumference: '#f59e0b', area: '#06b6d4' },
    { radius: '#3b82f6', diameter: '#10b981', circumference: '#ef4444', area: '#8b5cf6' },
    { radius: '#f59e0b', diameter: '#06b6d4', circumference: '#8b5cf6', area: '#10b981' },
  ];
  return colorSets[Math.floor(Math.random() * colorSets.length)];
};

const generateProblem = (stage) => {
  const r = Math.floor(Math.random() * 20) + 1;
  const d = r * 2;
  const C = 2 * PI * r;
  const A = PI * r * r;
  
  const safeAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const radiusAngle = safeAngles[Math.floor(Math.random() * safeAngles.length)];
  const diameterAngle = (radiusAngle + 90) % 360;
  
  const colors = generateColors();
  return { r, d, C, A, radiusAngle, diameterAngle, colors, stage };
};

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
const CircleVisualization = ({ problem, stage, placedTerms, givenValue, visibleValues, currentTargetValue, onCircleClick }) => {
  const { r, d, C, A, radiusAngle, diameterAngle, colors } = problem;
  
  const size = 400;
  const center = size / 2;
  const displayR = 120;
  
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
  
  const radiusLabelPos = {
    x: center + (displayR * 0.7) * Math.cos(radAngle) + 40 * Math.cos(radAngle + Math.PI/2),
    y: center + (displayR * 0.7) * Math.sin(radAngle) + 40 * Math.sin(radAngle + Math.PI/2)
  };
  
  const diamPerpOffset = Math.PI/2;
  const diameterLabelPos = {
    x: center + 50 * Math.cos(diamAngle + diamPerpOffset),
    y: center + 50 * Math.sin(diamAngle + diamPerpOffset)
  };
  
  const circumAngle = radAngle + (135 * Math.PI / 180);
  const circumferenceLabelPos = {
    x: center + (displayR + 45) * Math.cos(circumAngle),
    y: center + (displayR + 45) * Math.sin(circumAngle)
  };
  
  const areaAngle = radAngle + Math.PI;
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
          
          {/* Stage 2: Show ?? only for current target, then keep revealed after placement */}
          {stage === 2 && (
            <>
              {(currentTargetValue === 'radius' || placedTerms.radius) && (
                <text x={radiusLabelPos.x} y={radiusLabelPos.y} fill={colors.radius} fontSize="32" fontWeight="bold" textAnchor="middle">
                  {placedTerms.radius ? 'r' : '??'}
                </text>
              )}
              {(currentTargetValue === 'diameter' || placedTerms.diameter) && showDiameter && (
                <text x={diameterLabelPos.x} y={diameterLabelPos.y} fill={colors.diameter} fontSize="32" fontWeight="bold" textAnchor="middle">
                  {placedTerms.diameter ? 'd' : '??'}
                </text>
              )}
              {(currentTargetValue === 'circumference' || placedTerms.circumference) && (
                <text x={circumferenceLabelPos.x} y={circumferenceLabelPos.y} fill={colors.circumference} fontSize="32" fontWeight="bold" textAnchor="middle">
                  {placedTerms.circumference ? 'C' : '??'}
                </text>
              )}
              {(currentTargetValue === 'area' || placedTerms.area) && showArea && (
                <text x={areaLabelPos.x} y={areaLabelPos.y} fill={colors.area} fontSize="32" fontWeight="bold" textAnchor="middle">
                  {placedTerms.area ? 'A' : '??'}
                </text>
              )}
            </>
          )}
          
          {/* Stage 3+: Show only given value, then reveal as calculated */}
          {stage >= 3 && (
            <>
              {visibleValues.r !== undefined && (
                <g>
                  <rect 
                    x={radiusLabelPos.x - 35} 
                    y={radiusLabelPos.y - 18} 
                    width="70" 
                    height="36" 
                    fill="white" 
                    stroke={colors.radius} 
                    strokeWidth="2" 
                    rx="6"
                  />
                  <text x={radiusLabelPos.x} y={radiusLabelPos.y + 6} fill={colors.radius} fontSize="20" fontWeight="bold" textAnchor="middle">
                    r = {visibleValues.r % 1 === 0 ? visibleValues.r : visibleValues.r.toFixed(1)}
                  </text>
                </g>
              )}
              
              {visibleValues.d !== undefined && (
                <g>
                  <rect 
                    x={diameterLabelPos.x - 35} 
                    y={diameterLabelPos.y - 18} 
                    width="70" 
                    height="36" 
                    fill="white" 
                    stroke={colors.diameter} 
                    strokeWidth="2" 
                    rx="6"
                  />
                  <text x={diameterLabelPos.x} y={diameterLabelPos.y + 6} fill={colors.diameter} fontSize="20" fontWeight="bold" textAnchor="middle">
                    d = {visibleValues.d % 1 === 0 ? visibleValues.d : visibleValues.d.toFixed(1)}
                  </text>
                </g>
              )}
              
              {visibleValues.C !== undefined && (
                <g>
                  <rect 
                    x={circumferenceLabelPos.x - 45} 
                    y={circumferenceLabelPos.y - 18} 
                    width="90" 
                    height="36" 
                    fill="white" 
                    stroke={colors.circumference} 
                    strokeWidth="2" 
                    rx="6"
                  />
                  <text x={circumferenceLabelPos.x} y={circumferenceLabelPos.y + 6} fill={colors.circumference} fontSize="18" fontWeight="bold" textAnchor="middle">
                    C = {visibleValues.C.toFixed(1)}
                  </text>
                </g>
              )}
              
              {visibleValues.A !== undefined && (
                <g>
                  <rect 
                    x={areaLabelPos.x - 45} 
                    y={areaLabelPos.y - 18} 
                    width="90" 
                    height="36" 
                    fill="white" 
                    stroke={colors.area} 
                    strokeWidth="2" 
                    rx="6"
                  />
                  <text x={areaLabelPos.x} y={areaLabelPos.y + 6} fill={colors.area} fontSize="18" fontWeight="bold" textAnchor="middle">
                    A = {visibleValues.A.toFixed(1)}
                  </text>
                </g>
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
  const [stage, setStage] = useState(null);
  const [problem, setProblem] = useState(() => generateProblem(1));
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMoveOnChoice, setShowMoveOnChoice] = useState(false);
  const [currentFormula, setCurrentFormula] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [problemWasCorrect, setProblemWasCorrect] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showStageUnlock, setShowStageUnlock] = useState(false);
  const [skippedToAdvanced, setSkippedToAdvanced] = useState(false);
  
  const [shapes, setShapes] = useState([]);
  const [termToPlace, setTermToPlace] = useState(null);
  const [placedTerms, setPlacedTerms] = useState({});
  const [givenValue, setGivenValue] = useState(null);
  const [visibleValues, setVisibleValues] = useState({});
  const [currentStep, setCurrentStep] = useState(null);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [questionQueue, setQuestionQueue] = useState([]);
  const [currentAnswerChoices, setCurrentAnswerChoices] = useState([]);
  const [selectedOperation, setSelectedOperation] = useState(null);

  useEffect(() => {
    registerReset?.(() => {
      setStage(null);
      setProblem(generateProblem(1));
      setTotalPoints(0);
      setShowError(false);
      setShowSuccess(false);
      setShowConfetti(false);
      setShowMoveOnChoice(false);
      setSkippedToAdvanced(false);
      resetStageState();
    });
  }, [registerReset]);

  const handleError = () => {
    setShowError(true);
    setProblemWasCorrect(false);
    
    // Point deduction logic
    let deduction;
    if (stage === 10 && skippedToAdvanced) {
      deduction = totalPoints; // Everything - back to zero
    } else if (stage === 10) {
      deduction = 5;
    } else {
      deduction = 1;
    }
    
    setTotalPoints(prev => Math.max(0, prev - deduction));
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
        { target: 'A', operation: 'π r²', fromLabel: 'r' }
      ]};
      case 9: return { given: 'd', steps: [
        { target: 'r', operation: '÷ 2', fromLabel: 'd' },
        { target: 'A', operation: 'π r²', fromLabel: 'r' }
      ]};
      case 10: {
        const randomStage = Math.floor(Math.random() * 7) + 3;
        return getStageConfig(randomStage);
      }
      default: return { given: null, steps: [] };
    }
  };

  const resetStageState = () => {
    setPlacedTerms({});
    setVisibleValues({});
    setGivenValue(null);
    setCurrentStep(null);
    setCurrentTarget(null);
    setQuestionQueue([]);
    setCurrentFormula('');
    setCurrentAnswerChoices([]);
    setSelectedOperation(null);
    setShowMoveOnChoice(false);
    setProblemWasCorrect(true);
    
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
      setGivenValue(config.given);
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
    // Points logic
    let pointsEarned;
    if (stage === 10 && skippedToAdvanced) {
      pointsEarned = 20;
    } else {
      pointsEarned = stage;
    }
    
    setTotalPoints(prev => prev + pointsEarned);
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
      
      if (problemWasCorrect) {
        const newStreak = correctStreak + 1;
        setCorrectStreak(newStreak);
        
        if (newStreak >= 2 && stage < 10) {
          setShowMoveOnChoice(true);
        } else {
          resetAll();
        }
      } else {
        setCorrectStreak(0);
        resetAll();
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
    let distractors = [];
    
    if (target === 'd') {
      distractors = [problem.r, problem.r / 2, problem.r + 2];
    } else if (target === 'r') {
      distractors = [problem.d * 2, problem.d, problem.d - 2];
    } else if (target === 'C') {
      distractors = [problem.r * PI, problem.d * 2, problem.d / PI];
    } else if (target === 'A') {
      distractors = [PI * problem.r, PI * problem.d * problem.d, problem.r * problem.r];
    }
    
    const uniqueDistractors = distractors
      .filter(val => Math.abs(val - correct) > 0.1)
      .filter((val, idx, arr) => arr.findIndex(v => Math.abs(v - val) < 0.1) === idx)
      .slice(0, 3);
    
    while (uniqueDistractors.length < 3) {
      const factor = [0.5, 0.75, 1.25, 1.5, 2][Math.floor(Math.random() * 5)];
      const distractor = correct * factor;
      if (Math.abs(distractor - correct) > 0.1 && 
          !uniqueDistractors.find(v => Math.abs(v - distractor) < 0.1)) {
        uniqueDistractors.push(distractor);
      }
    }
    
    return shuffle([correct, ...uniqueDistractors.slice(0, 3)]);
  };

  const handleOperationSelect = (operation) => {
    const currentQuestion = questionQueue.find(q => q.target === currentTarget);
    
    if (operation === currentQuestion.operation) {
      setSelectedOperation(operation);
      
      let formula;
      if (currentTarget === 'A') {
        formula = `${currentTarget} = ${operation}`;
      } else {
        formula = `${currentTarget} = ${currentQuestion.fromLabel} ${operation}`;
      }
      setCurrentFormula(formula);
      
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
        setCurrentAnswerChoices([]);
        setSelectedOperation(null);
      }
    } else {
      handleError();
    }
  };

  const handlePracticeChoice = (moveOn) => {
    setShowMoveOnChoice(false);
    
    if (moveOn && stage < 10) {
      setShowStageUnlock(true);
      setTimeout(() => {
        setShowStageUnlock(false);
        setStage(stage + 1);
        setCorrectStreak(0);
      }, 2500);
    } else {
      setCorrectStreak(0);
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
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⭕</div>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            Circles
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
              Begin Practice
            </BigButton>
            
            <BigButton 
              onClick={() => { setStage(10); setSkippedToAdvanced(true); }}
              className="ug-button"
              style={{ fontSize: '18px', padding: '16px 32px', background: '#f59e0b', borderColor: '#f59e0b' }}
            >
              Advanced Mode
            </BigButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)', padding: '16px' }}>
      <ErrorOverlay show={showError} />
      <SuccessOverlay show={showSuccess} />
      <StageUnlockOverlay show={showStageUnlock} nextStage={stage + 1} />
      <Calculator show={showCalculator} onClose={() => setShowCalculator(false)} />
      {showConfetti && <FlyingCoins show={true} />}
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
            {getStageTitle(stage)}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                border: '2px solid #d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#78350f'
              }}>
                ¢
              </div>
              <span>{totalPoints}</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* LEFT: Visual */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {stage === 1 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '40px 0' }}>
                {shapes.map((shape, i) => (
                  <button
                    key={i}
                    onClick={() => handleShapeSelect(shape)}
                    style={{
                      fontSize: '80px', 
                      padding: '32px', 
                      border: '3px solid #e5e7eb',
                      borderRadius: '12px', 
                      background: 'white', 
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
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
                givenValue={givenValue}
                visibleValues={visibleValues}
                currentTargetValue={termToPlace}
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

                {stage >= 3 && currentTarget && currentQuestion && (
                  <div>
                    {currentStep === 'operation' ? (
                      <>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
                          {currentTarget} = {currentQuestion.fromLabel} _____
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
                        {currentFormula && (
                          <div style={{ 
                            textAlign: 'center', 
                            marginBottom: '12px', 
                            padding: '16px 24px', 
                            background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)', 
                            borderRadius: '16px',
                            border: '2px solid #3b82f6',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            color: '#1e40af'
                          }}>
                            {currentFormula}
                          </div>
                        )}
                        
                        {selectedOperation && currentQuestion && (
                          <div style={{
                            textAlign: 'center',
                            marginBottom: '24px',
                            padding: '16px 24px',
                            background: '#fef3c7',
                            borderRadius: '16px',
                            border: '2px solid #f59e0b',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            color: '#78350f'
                          }}>
                            {currentTarget} = {visibleValues[currentQuestion.fromLabel] || problem[currentQuestion.fromLabel]} {selectedOperation}
                          </div>
                        )}
                        
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
