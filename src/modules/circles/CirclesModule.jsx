// CirclesModule.jsx — UG Math Tools Integration
// Circles: One Shape, Two Formulas, Three Words

import React, { useEffect, useRef, useState } from "react";
import { ErrorOverlay } from "../../components/StatsSystem.jsx";
import BigButton from "../../components/BigButton.jsx";
import ugConfetti from "../../lib/confetti.js";

const PI = Math.PI;

// HOISTED: Generate problem (must be outside component for initial state)
function generateProblem(stage) {
  const r = 1 + Math.floor(Math.random() * 20); // 1-20
  const d = 2 * r;
  const C = 2 * PI * r;
  const A = PI * r * r;
  
  // Rotate visuals; radius/diameter lines must be visually distinct
  const radiusAngle = Math.floor(Math.random() * 360);
  const diameterAngle = (radiusAngle + 90) % 360;
  
  // Rotate colors
  const colorSets = [
    { radius: '#ef4444', diameter: '#8b5cf6', circumference: '#3b82f6', area: '#f59e0b' },
    { radius: '#10b981', diameter: '#ec4899', circumference: '#f59e0b', area: '#06b6d4' },
    { radius: '#3b82f6', diameter: '#10b981', circumference: '#ef4444', area: '#8b5cf6' },
  ];
  const colors = colorSets[Math.floor(Math.random() * colorSets.length)];
  
  return { r, d, C, A, radiusAngle, diameterAngle, colors, stage };
}

// Shuffle utility
const shuffle = (arr) => { 
  const a = [...arr]; 
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [a[i], a[j]] = [a[j], a[i]]; 
  } 
  return a; 
};

// Shape bank for Stage 1
const SHAPE_BANK = [
  { type: 'circle', label: 'Circle' },
  { type: 'square', label: 'Square' },
  { type: 'triangle', label: 'Triangle' },
  { type: 'rectangle', label: 'Rectangle' },
];

// Circle SVG Visualization
const CircleVisualization = ({ problem, stage, placedTerms, visibleValues, askedValues = [], onCircleClick }) => {
  const { r, d, C, A, radiusAngle, diameterAngle, colors } = problem;
  
  const size = 350;
  const displayR = Math.min(size * 0.35, r * 15);
  const center = size / 2;
  
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
  
  // Label positions
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
  const showDiameter = stage >= 2;
  const showArea = stage >= 2;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      <rect width={size} height={size} fill="#f0f9ff" rx="12" />
      
      {showCircle ? (
        <>
          {showArea && (
            <g onClick={() => stage === 2 && onCircleClick?.('area')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
              <circle cx={center} cy={center} r={displayR} fill={colors.area} fillOpacity="0.3" />
              <circle cx={center} cy={center} r={displayR} fill="transparent" strokeWidth="20" stroke="transparent" />
            </g>
          )}
          
          <g onClick={() => stage === 2 && onCircleClick?.('circumference')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
            <circle cx={center} cy={center} r={displayR} fill="none" stroke={colors.circumference} strokeWidth="5" />
            <circle cx={center} cy={center} r={displayR} fill="none" strokeWidth="25" stroke="transparent" />
          </g>
          
          {showDiameter && (
            <g onClick={() => stage === 2 && onCircleClick?.('diameter')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
              <line x1={diamStart.x} y1={diamStart.y} x2={diamEnd.x} y2={diamEnd.y} stroke={colors.diameter} strokeWidth="4" />
              <line x1={diamStart.x} y1={diamStart.y} x2={diamEnd.x} y2={diamEnd.y} stroke="transparent" strokeWidth="20" />
            </g>
          )}
          
          <g onClick={() => stage === 2 && onCircleClick?.('radius')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
            <line x1={center} y1={center} x2={radiusEnd.x} y2={radiusEnd.y} stroke={colors.radius} strokeWidth="4" />
            <line x1={center} y1={center} x2={radiusEnd.x} y2={radiusEnd.y} stroke="transparent" strokeWidth="20" />
          </g>
          
          <circle cx={center} cy={center} r="4" fill="#1f2937" />
          
          {stage === 2 && (
            <>
              <text x={radiusLabelPos.x} y={radiusLabelPos.y} fill={colors.radius} fontSize="20" fontWeight="bold" textAnchor="middle">
                {placedTerms.radius ? 'r' : '?'}
              </text>
              {showDiameter && (
                <text x={diameterLabelPos.x} y={diameterLabelPos.y} fill={colors.diameter} fontSize="20" fontWeight="bold" textAnchor="middle">
                  {placedTerms.diameter ? 'd' : '?'}
                </text>
              )}
              <text x={circumferenceLabelPos.x} y={circumferenceLabelPos.y} fill={colors.circumference} fontSize="20" fontWeight="bold" textAnchor="middle">
                {placedTerms.circumference ? 'C' : '?'}
              </text>
              {showArea && (
                <text x={areaLabelPos.x} y={areaLabelPos.y} fill={colors.area} fontSize="20" fontWeight="bold" textAnchor="middle">
                  {placedTerms.area ? 'A' : '?'}
                </text>
              )}
            </>
          )}
          
          {stage >= 3 && (
            <>
              {(visibleValues.r !== undefined || askedValues.includes('r')) && (
                <text x={radiusLabelPos.x} y={radiusLabelPos.y} fill={colors.radius} fontSize="18" fontWeight="bold" textAnchor="middle">
                  r {visibleValues.r !== undefined ? `= ${visibleValues.r % 1 === 0 ? visibleValues.r : visibleValues.r.toFixed(1)}` : ''}
                </text>
              )}
              
              {(visibleValues.d !== undefined || askedValues.includes('d')) && (
                <text x={diameterLabelPos.x} y={diameterLabelPos.y} fill={colors.diameter} fontSize="18" fontWeight="bold" textAnchor="middle">
                  d {visibleValues.d !== undefined ? `= ${visibleValues.d % 1 === 0 ? visibleValues.d : visibleValues.d.toFixed(1)}` : ''}
                </text>
              )}
              
              {(visibleValues.C !== undefined || askedValues.includes('C')) && (
                <text x={circumferenceLabelPos.x} y={circumferenceLabelPos.y} fill={colors.circumference} fontSize="16" fontWeight="bold" textAnchor="middle">
                  C {visibleValues.C !== undefined ? `= ${visibleValues.C.toFixed(1)}` : ''}
                </text>
              )}
              
              {(visibleValues.A !== undefined || askedValues.includes('A')) && (
                <text x={areaLabelPos.x} y={areaLabelPos.y} fill={colors.area} fontSize="18" fontWeight="bold" textAnchor="middle">
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
  // Core state
  const [stage, setStage] = useState(1);
  const [problem, setProblem] = useState(() => generateProblem(1));
  
  // Timer & lock
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [scoreLocked, setScoreLocked] = useState(false);
  const timerRef = useRef(null);
  
  // UI feedback & flow
  const [showError, setShowError] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMoveOnChoice, setShowMoveOnChoice] = useState(false);
  
  // Stage engine counters
  const [streak, setStreak] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  
  // Stage-specific state
  const [shapes, setShapes] = useState([]);
  const [termToPlace, setTermToPlace] = useState(null);
  const [placedTerms, setPlacedTerms] = useState({});
  const [visibleValues, setVisibleValues] = useState({});
  const [currentStep, setCurrentStep] = useState(null);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [questionQueue, setQuestionQueue] = useState([]);
  const [currentFormula, setCurrentFormula] = useState('');

  // Timer effect
  useEffect(() => {
    if (!timerRunning || scoreLocked) return;

    const id = setInterval(() => {
      setTimeRemaining(t => {
        if (t <= 1) {
          clearInterval(id);
          setTimerRunning(false);
          setScoreLocked(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [timerRunning, scoreLocked]);

  // Register reset
  useEffect(() => {
    registerReset?.(() => {
      setTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setScoreLocked(false);
      setTimeRemaining(0);
      setShowError(false);
      setShowConfetti(false);
      setShowMoveOnChoice(false);
      setStreak(0);
      setProblem(generateProblem(stage));
      resetStageState();
    });
  }, [registerReset, stage]);

  const handleError = () => {
    setShowError(true);
    setTimeout(() => setShowError(false), 1000);
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
    resetAll();
  }, [stage]);

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

  const coinValueFor = (stg) => {
    if (stg <= 2) return 10;
    const config = getStageConfig(stg);
    return 10 * (config.steps?.length || 1);
  };

  const handleCorrectAnswer = () => {
    if (!scoreLocked) {
      const coinsEarned = coinValueFor(stage);
      setTotalCoins(c => c + coinsEarned);
      
      try {
        ugConfetti?.burst?.();
      } catch {}
      
      onProblemComplete?.({ 
        module: "circles", 
        stage, 
        correct: true, 
        coinsDelta: coinsEarned, 
        timeRemaining 
      });
      
      updateStats?.({ 
        module: "circles", 
        problemsSolved: 1, 
        lastStage: stage, 
        lastOutcome: "correct" 
      });
    }
    
    setStreak(s => {
      const next = s + 1;
      if (next >= 2 && stage < 10) {
        setShowMoveOnChoice(true);
      }
      return next;
    });
  };

  // Stage 1 handler
  const handleShapeSelect = (shape) => {
    if (shape.type === 'circle') {
      handleCorrectAnswer();
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        if (!showMoveOnChoice && stage !== 10) {
          resetAll();
        }
      }, 1500);
    } else {
      handleError();
    }
  };

  // Stage 2 handler
  const handleCircleClick = (term) => {
    if (term === termToPlace) {
      const newPlaced = { ...placedTerms, [term]: true };
      setPlacedTerms(newPlaced);
      
      const allTerms = ['radius', 'diameter', 'circumference', 'area'];
      const allPlaced = allTerms.every(t => newPlaced[t]);
      
      if (allPlaced) {
        handleCorrectAnswer();
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          if (!showMoveOnChoice && stage !== 10) {
            resetAll();
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
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          if (!showMoveOnChoice && stage !== 10) {
            resetAll();
          }
        }, 1500);
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
      setStreak(0);
    } else {
      resetAll();
    }
  };

  const startTimer = (minutes) => {
    setTimeRemaining(minutes * 60);
    setTimerRunning(true);
    setScoreLocked(false);
  };

  const currentQuestion = questionQueue.find(q => q.target === currentTarget);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <ErrorOverlay show={showError} />
      
      <style>{`
        @keyframes fall { to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
      `}</style>
      
      {showConfetti && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999 }}>
          {Array.from({ length: 90 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: Math.random() * 100 + 'vw',
                width: (6 + Math.floor(Math.random() * 8)) + 'px',
                height: (10 + Math.floor(Math.random() * 8)) + 'px',
                background: ['#16a34a', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
                transform: `rotate(${Math.floor(Math.random() * 360)}deg)`,
                animation: `fall ${3.8 + Math.random() * 2.2}s linear ${Math.random() * 2}s forwards`,
                top: '-20px'
              }}
            />
          ))}
        </div>
      )}
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative' }}>
          {stage < 10 && (
            <BigButton
              onClick={() => {
                setStage(10);
                setStreak(0);
                if (!scoreLocked) setTotalCoins(prev => prev * 2);
              }}
              className="ug-button"
              style={{ position: 'absolute', left: 0, top: 0, fontSize: '14px', padding: '8px 16px' }}
            >
              Skip to Stage 10 (2× coins!)
            </BigButton>
          )}
          
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
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e' }}>{totalCoins} coins</span>
          </div>
          
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', marginTop: '40px' }}>
            Circles
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b' }}>
            One Shape, Two Formulas, Three Words
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
            Stage {stage}
          </p>
          
          {timeRemaining > 0 && (
            <div style={{ marginTop: '8px', fontSize: '18px', fontWeight: 'bold', color: scoreLocked ? '#ef4444' : '#3b82f6' }}>
              Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              {scoreLocked && ' (LOCKED)'}
            </div>
          )}
          
          {!timerRunning && timeRemaining === 0 && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[1, 2, 3, 5, 10].map(m => (
                <BigButton key={m} onClick={() => startTimer(m)} className="ug-button" style={{ fontSize: '14px', padding: '6px 12px' }}>
                  {m} min
                </BigButton>
              ))}
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 items-start">
          
          {/* LEFT: Visual */}
          <div className="bg-white rounded-xl shadow-md p-4">
            {stage >= 3 && currentFormula && (
              <div className="inline-block mb-3 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-mono">
                {currentFormula}
              </div>
            )}
            
            {stage === 1 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                Choose a shape on the right →
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
          <div className="bg-white rounded-xl shadow-md p-4">
            
            {showMoveOnChoice ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '24px' }}>🎉</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
                  Great job!
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <BigButton onClick={() => handlePracticeChoice(false)} className="ug-button">
                    More practice
                  </BigButton>
                  {stage < 10 && (
                    <BigButton onClick={() => handlePracticeChoice(true)} className="ug-button">
                      Move on →
                    </BigButton>
                  )}
                </div>
              </div>
            ) : (
              <>
                {stage === 1 && (
                  <div>
                    <div className="text-xl font-semibold mb-2">Which one is a circle?</div>
                    <p className="text-slate-600 mb-4">Click on the circle shape</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {shapes.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleShapeSelect(s)}
                          className="ug-answer ug-answer--pill text-lg px-5 py-3"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {stage === 2 && (
                  <div>
                    <div className="text-xl font-semibold mb-2">Where is the {termToPlace}?</div>
                    <p className="text-slate-600">Click on the {termToPlace} on the circle to the left</p>
                  </div>
                )}

                {stage >= 3 && currentTarget && (
                  <div>
                    {currentStep === 'operation' ? (
                      <>
                        <div className="text-xl font-semibold mb-4">
                          {currentTarget} = {currentQuestion?.fromLabel || ''} _____
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {getOperationChoices(currentTarget).map((op, i) => (
                            <button
                              key={i}
                              onClick={() => handleOperationSelect(op)}
                              className="ug-answer ug-answer--pill text-lg px-4 py-2"
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xl font-semibold mb-4">What is {currentTarget}?</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {getValueChoices(currentTarget).map((val, i) => (
                            <button
                              key={i}
                              onClick={() => handleValueSelect(val)}
                              className="ug-answer ug-answer--pill text-lg px-4 py-2"
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
