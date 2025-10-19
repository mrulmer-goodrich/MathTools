// src/modules/pgraphs/ProportionalGraphsModule.jsx — v4.0.1 with Stats

import React, { useEffect, useMemo, useRef, useState } from "react";
import { genPGraph } from "../../lib/generator.js";
import ugConfetti from "../../lib/confetti.js";
import { reduceFraction, fractionToDecimal } from "../../lib/mathUtils.js";
import { ErrorOverlay } from "../../components/StatsSystem.jsx";

const fmt2 = (n) => Number(n.toFixed(2));

const chooseStep = (range, target = 12) => {
  const raw = range / target;
  if (raw <= 1) return 1;
  if (raw <= 2) return 2;
  if (raw <= 5) return 5;
  if (raw <= 10) return 10;
  return Math.ceil(raw);
};

const Formula = ({ children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, lineHeight: 1 }}>
    {children}
  </span>
);

const niceCeil = (n, step = 5) => Math.ceil(n / step) * step;

const shuffle = (arr) => { 
  const a = [...arr]; 
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [a[i], a[j]] = [a[j], a[i]]; 
  } 
  return a; 
};

function GraphCanvas({ problem, onPointClick, highlightPoint, showOrigin, showCoordinates }) {
  const canvasRef = useRef(null);
  const [clickedPoint, setClickedPoint] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    
    const maxX = problem?.xMax || 20;
    const maxY = problem?.yMax || 20;
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    const toCanvasX = (x) => padding + (x / maxX) * graphWidth;
    const toCanvasY = (y) => height - padding - (y / maxY) * graphHeight;
    
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.25;
    
    const xStep = problem?.xStep || chooseStep(maxX);
    const yStep = problem?.yStep || chooseStep(maxY);
    
    for (let i = 0; i <= maxX; i += xStep) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(i), padding);
      ctx.lineTo(toCanvasX(i), height - padding);
      ctx.stroke();
    }
    
    for (let i = 0; i <= maxY; i += yStep) {
      ctx.beginPath();
      ctx.moveTo(padding, toCanvasY(i));
      ctx.lineTo(width - padding, toCanvasY(i));
      ctx.stroke();
    }
    
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    
    for (let i = 0; i <= maxX; i += xStep) {
      ctx.fillText(i.toString(), toCanvasX(i), height - padding + 25);
    }
    
    for (let i = yStep; i <= maxY; i += yStep) {
      ctx.textAlign = 'right';
      ctx.fillText(i.toString(), padding - 15, toCanvasY(i) + 5);
      ctx.textAlign = 'center';
    }
    
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('x', width - padding + 30, height - padding + 5);
    ctx.fillText('y', padding - 5, padding - 30);
    
    ctx.strokeStyle = '#0b4b8c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    
    let x2, y2;
    if (problem?.isProportional) {
      if (problem.k * maxX <= maxY) {
        x2 = maxX;
        y2 = problem.k * maxX;
      } else {
        y2 = maxY;
        x2 = maxY / problem.k;
      }
      ctx.moveTo(toCanvasX(0), toCanvasY(0));
      ctx.lineTo(toCanvasX(x2), toCanvasY(y2));
    } else if (problem.type === 'curved') {
      let started = false;
      for (let x = 0; x <= maxX; x += 0.1) {
        const y = problem.curveFunc(x);
        if (y > maxY) break;
        if (!started) {
          ctx.moveTo(toCanvasX(x), toCanvasY(y));
          started = true;
        } else {
          ctx.lineTo(toCanvasX(x), toCanvasY(y));
        }
      }
    } else if (problem.type === 'notThroughOrigin') {
      const y0 = problem.yIntercept;
      const yEnd = Math.min(problem.k * maxX + problem.yIntercept, maxY);
      ctx.moveTo(toCanvasX(0), toCanvasY(y0));
      ctx.lineTo(toCanvasX(maxX), toCanvasY(yEnd));
    } else if (problem.type === 'curvedNotThrough') {
      let started = false;
      for (let x = 0; x <= maxX; x += 0.1) {
        const y = problem.curveFunc(x);
        if (y > maxY) break;
        if (!started) {
          ctx.moveTo(toCanvasX(x), toCanvasY(y));
          started = true;
        } else {
          ctx.lineTo(toCanvasX(x), toCanvasY(y));
        }
      }
    }
    ctx.stroke();
    
    if (showOrigin) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(toCanvasX(0), toCanvasY(0), 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    if (highlightPoint) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(toCanvasX(highlightPoint.x), toCanvasY(highlightPoint.y), 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      if (showCoordinates) {
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        const label = `(${highlightPoint.x}, ${highlightPoint.y})`;
        ctx.strokeText(label, toCanvasX(highlightPoint.x), toCanvasY(highlightPoint.y) - 25);
        ctx.fillText(label, toCanvasX(highlightPoint.x), toCanvasY(highlightPoint.y) - 25);
      }
    }
    
    if (clickedPoint) {
      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.arc(toCanvasX(clickedPoint.x), toCanvasY(clickedPoint.y), 6, 0, Math.PI * 2);
      ctx.fill();
    }
    
  }, [problem, highlightPoint, showOrigin, clickedPoint, showCoordinates]);
  
  const handleClick = (e) => {
    if (!onPointClick) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const canvasY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const padding = 60;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;
    const maxX = problem?.xMax || 20;
    const maxY = problem?.yMax || 20;

    const left = padding;
    const top = padding;
    const right = padding + graphWidth;
    const bottom = padding + graphHeight;

    if (canvasX < left || canvasX > right || canvasY < top || canvasY > bottom) return;

    const graphX = (canvasX - left) / graphWidth * maxX;
    const graphY = (bottom - canvasY) / graphHeight * maxY;
    const snappedX = Math.round(graphX);
    const snappedY = Math.round(graphY);

    if (
      problem.isProportional &&
      snappedX >= 0 && snappedX <= maxX &&
      snappedY >= 0 && snappedY <= maxY
    ) {
      setClickedPoint({ x: snappedX, y: snappedY });
      setTimeout(() => setClickedPoint(null), 500);
      onPointClick({ x: snappedX, y: snappedY });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      onClick={handleClick}
      style={{
        border: '3px solid #1f2937',
        borderRadius: '12px',
        cursor: onPointClick ? 'crosshair' : 'default',
        maxWidth: '100%',
        height: 'auto',
        touchAction: 'none',
        userSelect: 'none',
      }}
      aria-label={onPointClick ? "Click on a point on the line to select it" : "Graph display"}
    />
  );
}

function Fraction({ numerator, denominator, showEquals = false, whiteBar = false }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      {showEquals && <span style={{ fontSize: '20px', fontWeight: 900, display: 'inline-flex', alignItems: 'center' }}>=</span>}
      <div className="fraction mini-frac" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle' }}>
        <div style={{ fontSize: '20px', fontWeight: 900, minHeight: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{numerator ?? '—'}</div>
        <div className="frac-bar narrow" style={whiteBar ? { background: '#ffffff', width: '100%', margin: '2px 0' } : { width: '100%', margin: '2px 0' }} />
        <div style={{ fontSize: '20px', fontWeight: 900, minHeight: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{denominator ?? '—'}</div>
      </div>
    </div>
  );
}

export default function ProportionalGraphsModule({ onProblemComplete, registerReset, updateStats }) {
  console.log('📐 ProportionalGraphsModule rendered')
  console.log('📐 Props received:', { 
    hasOnProblemComplete: !!onProblemComplete, 
    hasRegisterReset: !!registerReset, 
    hasUpdateStats: !!updateStats,
    updateStatsType: typeof updateStats 
  })
  
  const [problem, setProblem] = useState(() => genPGraph());
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProportional, setSelectedProportional] = useState(null);
  const [whyNotProportional, setWhyNotProportional] = useState(null);
  const [whyProportional, setWhyProportional] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [selectedY, setSelectedY] = useState(null);
  const [selectedX, setSelectedX] = useState(null);
  const [calculatedK, setCalculatedK] = useState(null);
  const [reducedFraction, setReducedFraction] = useState(null);
  const [selectedEquation, setSelectedEquation] = useState(null);
  const [showFinalConfetti, setShowFinalConfetti] = useState(false);
  const confettiInterval = useRef(null);
  
  // NEW: Error tracking state
  const [showError, setShowError] = useState(false);
  const [currentProblemErrors, setCurrentProblemErrors] = useState(0);
  
  useEffect(() => {
    const styleId = 'pgraph-pulse-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  
  useEffect(() => {
    if (showFinalConfetti) {
      try { ugConfetti.burst(); } catch {}
      confettiInterval.current = setInterval(() => {
        try { ugConfetti.burst(); } catch {}
      }, 2000);
    } else {
      if (confettiInterval.current) {
        clearInterval(confettiInterval.current);
        confettiInterval.current = null;
      }
    }
    return () => {
      if (confettiInterval.current) {
        clearInterval(confettiInterval.current);
      }
    };
  }, [showFinalConfetti]);
  
  // NEW: Error handler - shows red X and tracks errors
  const handleError = () => {
    setShowError(true);
    setCurrentProblemErrors(prev => prev + 1);
    setTimeout(() => setShowError(false), 1000);
  };
  
  const resetAll = () => {
    const next = genPGraph();
    setProblem(next);
    setCurrentStep(1);
    setSelectedProportional(null);
    setWhyNotProportional(null);
    setWhyProportional(null);
    setSelectedPoint(null);
    setSelectedCoordinates(null);
    setSelectedFormula(null);
    setSelectedY(null);
    setSelectedX(null);
    setCalculatedK(null);
    setReducedFraction(null);
    setSelectedEquation(null);
    setShowFinalConfetti(false);
    setCurrentProblemErrors(0);
  };

  useEffect(() => {
    registerReset?.(resetAll)
  }, [])

  const coordinateChoices = useMemo(() => {
    if (!problem.isProportional || !selectedPoint) return [];
    
    const correct = { x: selectedPoint.x, y: selectedPoint.y };
    const swapped = { x: selectedPoint.y, y: selectedPoint.x };
    const offByOne = { x: selectedPoint.x + 1, y: selectedPoint.y };
    const other = problem.perfectPoints.find(p => p.x !== selectedPoint.x && p.y !== selectedPoint.y) || { x: selectedPoint.x, y: selectedPoint.y + 1 };
    
    return shuffle([
      { ...correct, label: `(${correct.x}, ${correct.y})`, isCorrect: true },
      { ...swapped, label: `(${swapped.x}, ${swapped.y})`, isCorrect: false },
      { ...offByOne, label: `(${offByOne.x}, ${offByOne.y})`, isCorrect: false },
      { ...other, label: `(${other.x}, ${other.y})`, isCorrect: false },
    ]);
  }, [problem, selectedPoint]);
  
  const yChoices = useMemo(() => {
    if (!selectedCoordinates) return [];
    
    const correct = selectedCoordinates.y;
    const xValue = selectedCoordinates.x;
    const otherPoint = problem.perfectPoints.find(p => p.x !== selectedCoordinates.x) || {};
    
    return shuffle([
      { value: correct, label: correct.toString(), isCorrect: true },
      { value: xValue, label: xValue.toString(), isCorrect: false },
      { value: correct + 1, label: (correct + 1).toString(), isCorrect: false },
      { value: ((otherPoint.y) ?? (correct - 1)), label: (((otherPoint.y) ?? (correct - 1))).toString(), isCorrect: false },
    ]);
  }, [selectedCoordinates, problem]);
  
  const xChoices = useMemo(() => {
    if (!selectedCoordinates) return [];
    
    const correct = selectedCoordinates.x;
    const yValue = selectedCoordinates.y;
    const otherPoint = problem.perfectPoints.find(p => p.y !== selectedCoordinates.y) || {};
    
    return shuffle([
      { value: correct, label: correct.toString(), isCorrect: true },
      { value: yValue, label: yValue.toString(), isCorrect: false },
      { value: correct + 1, label: (correct + 1).toString(), isCorrect: false },
      { value: ((otherPoint.x) ?? (correct - 1)), label: (((otherPoint.x) ?? (correct - 1))).toString(), isCorrect: false },
    ]);
  }, [selectedCoordinates, problem]);
  
  const equationChoices = useMemo(() => {
    if (calculatedK === null || !reducedFraction) return [];
    const { num, den } = reducedFraction;
    const kDec2 = fmt2(calculatedK);

    const Y = <span>y</span>;
    const X = <span>x</span>;
    const EQ = <span>=</span>;
    const PLUS = <span>+</span>;

    const Kfrac = (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <Fraction numerator={num} denominator={den} whiteBar={true} />
      </span>
    );
    const ReciprocalFrac = (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <Fraction numerator={den} denominator={num} whiteBar={true} />
      </span>
    );

    const Kdisplay = calculatedK < 1 ? Kfrac : <span>{kDec2}</span>;

    return shuffle([
      {
        formula: (
          <Formula>
            {Y}{EQ}{Kdisplay}{X}
          </Formula>
        ),
        displayText: `y = ${calculatedK < 1 ? `(${num}/${den})` : kDec2}x`,
        isCorrect: true,
      },
      {
        formula: (
          <Formula>
            {Y}{EQ}{calculatedK < 1 ? ReciprocalFrac : <span>{`1/${kDec2}`}</span>}{X}
          </Formula>
        ),
        displayText: `y = ${calculatedK < 1 ? `(${den}/${num})` : `(1/${kDec2})`}x`,
        isCorrect: false,
      },
      {
        formula: (
          <Formula>
            <span>x</span>{EQ}{Kdisplay}{Y}
          </Formula>
        ),
        displayText: `x = ${calculatedK < 1 ? `(${num}/${den})` : kDec2}y`,
        isCorrect: false,
      },
      {
        formula: (
          <Formula>
            {Y}{EQ}{X}{PLUS}{Kdisplay}
          </Formula>
        ),
        displayText: `y = x + ${calculatedK < 1 ? `(${num}/${den})` : kDec2}`,
        isCorrect: false,
      },
    ]);
  }, [calculatedK, reducedFraction]);
  
  const handleProportionalChoice = (choice) => {
    setSelectedProportional(choice);
    if (!problem.isProportional && choice === 'not') {
      setCurrentStep(2);
    } else if (problem.isProportional && choice === 'yes') {
      setCurrentStep(3);
    } else {
      handleError();
      setTimeout(() => setSelectedProportional(null), 1000);
    }
  };
  
  const handleWhyNot = (reason) => {
    setWhyNotProportional(reason);
    const correct = problem.whyNot === reason;
    if (correct) {
      try { ugConfetti.burst(); } catch {}
      updateStats?.(currentProblemErrors, true);
    } else {
      handleError();
      setTimeout(() => setWhyNotProportional(null), 1000);
    }
  };
  
  const handleWhyProportional = (reason) => {
    setWhyProportional(reason);
    if (reason === 'both') {
      setCurrentStep(4);
    } else {
      handleError();
      setTimeout(() => setWhyProportional(null), 1000);
    }
  };
  
  const handlePointClick = (point) => {
    if (point.x <= 0) {
      handleError();
      return;
    }

    const expectedY = problem.k * point.x;
    const matchesSlope = Math.abs(point.y - expectedY) < 0.01;
    const withinBounds = point.x > 0 && point.x <= problem.xMax && 
                          point.y >= 0 && point.y <= problem.yMax;
    const isValid = problem.isProportional && matchesSlope && withinBounds;

    if (!isValid) {
      handleError();
      return;
    }

    setSelectedPoint({ x: point.x, y: point.y });
    setSelectedCoordinates({ x: point.x, y: point.y });
    setCurrentStep(5);
  };
  
  const handleCoordinateSelect = (coord) => {
    setSelectedCoordinates(coord);
    if (coord.isCorrect) {
      setCurrentStep(6);
    } else {
      handleError();
      setTimeout(() => setSelectedCoordinates(null), 1000);
    }
  };
  
  const handleFormulaSelect = (formula) => {
    setSelectedFormula(formula);
    if (formula === 'y/x') {
      setCurrentStep(7);
    } else {
      handleError();
      setTimeout(() => setSelectedFormula(null), 1000);
    }
  };
  
  const handleYSelect = (choice) => {
    setSelectedY(choice.value);
    if (choice.isCorrect) {
      setCurrentStep(8);
    } else {
      handleError();
      setTimeout(() => setSelectedY(null), 1000);
    }
  };
  
  const handleXSelect = (choice) => {
    setSelectedX(choice.value);
    if (choice.isCorrect) {
      setCurrentStep(9);
    } else {
      handleError();
      setTimeout(() => setSelectedX(null), 1000);
    }
  };
  
  const handleCompute = () => {
    const yVal = (selectedY ?? selectedCoordinates?.y);
    const xVal = (selectedX ?? selectedCoordinates?.x);
    if (yVal == null || xVal == null || xVal === 0) return;
    const k = yVal / xVal;
    setCalculatedK(k);
    setReducedFraction(reduceFraction(yVal, xVal));
    setCurrentStep(10);
  };
  
  const handleEquationSelect = (equation) => {
    setSelectedEquation(equation.displayText);
    if (equation.isCorrect) {
      setShowFinalConfetti(true);
      updateStats?.(currentProblemErrors, true);
      onProblemComplete?.();
    } else {
      handleError();
      setTimeout(() => setSelectedEquation(null), 1000);
    }
  };
  
  return (
    <>
      <ErrorOverlay show={showError} />
      
      <div className="panes pgraphs-layout">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <GraphCanvas 
              problem={problem}
              onPointClick={currentStep === 4 ? handlePointClick : null}
              highlightPoint={selectedPoint}
              showOrigin={whyProportional === 'both'} 
              showCoordinates={currentStep >= 6}
            />
          </div>
        </div>
        
        <div className="card right-steps">
          {currentStep === 1 && (
            <div className="section">
              <div className="step-title">Is this graph proportional or not proportional?</div>
              <div className="row ug-answers-row" style={{ gap: 10, marginTop: 12 }}>
                {shuffle([
                  { key: 'yes', label: 'Proportional' },
                  { key: 'not', label: 'Not Proportional' }
                ]).map(choice => (
                  <button 
                    key={choice.key}
                    className="answer-btn pgraph-choice-btn ug-answer ug-answer--pill"
                    onClick={() => handleProportionalChoice(choice.key)}
                    style={{ flex: '1 1 calc(50% - 5px)', minWidth: '140px' }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="section">
              <div className="step-title">Why is this graph NOT proportional?</div>
              <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {shuffle([
                  { key: 'notStraight', label: "It's not a straight line" },
                  { key: 'notThroughOrigin', label: "It doesn't go through the origin (0,0)" },
                  { key: 'both', label: "Both - it's not straight AND doesn't go through origin" }
                ]).map(choice => (
                  <button 
                    key={choice.key}
                    className="answer-btn pgraph-choice-btn"
                    onClick={() => handleWhyNot(choice.key)}
                    style={{ width: '100%' }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
              {whyNotProportional === problem.whyNot && (
                <div className="center" style={{ marginTop: 12 }}>
                  <div className="badge" style={{ background: "#ecfdf5", borderColor: "#86efac" }}>
                    ✓ Correct!
                  </div>
                </div>
              )}
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="section">
              <div className="step-title">Why is this graph proportional?</div>
              <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {shuffle([
                  { key: 'both', label: "It's a straight line AND goes through the origin (0,0)" },
                  { key: 'straightOnly', label: "It's a straight line only" },
                  { key: 'originOnly', label: "It goes through the origin (0,0) only" },
                  { key: 'notStraight', label: "It's not a straight line" }
                ]).map(choice => (
                  <button 
                    key={choice.key}
                    className="answer-btn pgraph-choice-btn"
                    onClick={() => handleWhyProportional(choice.key)}
                    style={{ width: '100%' }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {currentStep === 4 && (
            <div className="section">
              <div className="step-title">Find a Punto Perfecto - tap on the line where you can clearly identify both x and y values!</div>
            </div>
          )}
          
          {currentStep === 5 && (
            <div className="section">
              <div className="step-title">What are the coordinates of this point?</div>
              <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {coordinateChoices.map((coord, i) => (
                  <button
                    key={i}
                    className="answer-btn pgraph-choice-btn"
                    onClick={() => handleCoordinateSelect(coord)}
                    style={{ flex: '1 1 calc(50% - 4px)', minWidth: '120px' }}
                  >
                    {coord.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {currentStep === 6 && (
            <div className="section">
              <div className="step-title">What is the formula to find k?</div>
              <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {shuffle([
                  { key: 'y/x', formula: <Fraction numerator="y" denominator="x" whiteBar={true} />, correct: true },
                  { key: 'x/y', formula: <Fraction numerator="x" denominator="y" whiteBar={true} />, correct: false },
                  { key: 'x+y', formula: 'x + y', correct: false },
                  { key: 'y-x', formula: 'y − x', correct: false }
                ]).map(({ key, formula, correct }) => (
                  <button 
                    key={key}
                    className="answer-btn pgraph-choice-btn" 
                    onClick={() => handleFormulaSelect(key)}
                    style={{ flex: '1 1 calc(50% - 4px)', minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    k = {formula}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {currentStep === 7 && selectedCoordinates && (
            <div className="section">
              <div className="step-title">What is the y-value from your point ({selectedCoordinates.x}, {selectedCoordinates.y})?</div>
              <div style={{ marginTop: 12, marginBottom: 12 }}>
                <div style={{ fontSize: '24px', fontWeight: 900, textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '12px', border: '3px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>k =</span>
                  <div className="fraction mini-frac" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, minHeight: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ display: 'inline-block', width: '50px', height: '6px', background: '#f59e0b', borderRadius: '3px' }} />
                    </div>
                    <div className="frac-bar narrow" style={{ width: '100%', margin: '2px 0' }} />
                    <div style={{ fontSize: '20px', fontWeight: 900, minHeight: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</div>
                  </div>
                </div>
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {yChoices.map((choice, i) => (
                  <button
                    key={i}
                    className="answer-btn pgraph-choice-btn"
                    onClick={() => handleYSelect(choice)}
                    style={{ flex: '1 1 calc(50% - 4px)', minWidth: '120px' }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {currentStep === 8 && selectedCoordinates && (
            <div className="section">
              <div className="step-title">What is the x-value from your point ({selectedCoordinates.x}, {selectedCoordinates.y})?</div>
              <div style={{ marginTop: 12, marginBottom: 12 }}>
                <div style={{ fontSize: '24px', fontWeight: 900, textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '12px', border: '3px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>k =</span>
                  <div className="fraction mini-frac" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, minHeight: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{selectedY}</div>
                    <div className="frac-bar narrow" style={{ width: '100%', margin: '2px 0' }} />
                    <div style={{ fontSize: '20px', fontWeight: 900, minHeight: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ display: 'inline-block', width: '50px', height: '6px', background: '#f59e0b', borderRadius: '3px' }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {xChoices.map((choice, i) => (
                  <button
                    key={i}
                    className="answer-btn pgraph-choice-btn"
                    onClick={() => handleXSelect(choice)}
                    style={{ flex: '1 1 calc(50% - 4px)', minWidth: '120px' }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {currentStep === 9 && (
            <div className="section">
              <div className="step-title">Click Compute to calculate k!</div>
              <div style={{ marginTop: 12, marginBottom: 12, fontSize: '24px', fontWeight: 900, textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '12px', border: '3px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>k =</span>
                <Fraction numerator={selectedY} denominator={selectedX} />
              </div>
              <div className="center">
                <button 
                  className="answer-btn pgraph-choice-btn flash"
                  onClick={handleCompute}
                  style={{ fontSize: '20px', padding: '16px 28px' }}
                >
                  Compute
                </button>
              </div>
            </div>
          )}
          
          {currentStep === 10 && calculatedK !== null && reducedFraction && (
            <div className="section">
              <div className="step-title">Now that you know k, what is the equation?</div>
              <div style={{ marginTop: 12, marginBottom: 12, fontSize: '24px', fontWeight: 900, textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '12px', border: '3px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>k =</span>
                <Fraction numerator={selectedY} denominator={selectedX} />
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>=</span>
                {calculatedK < 1 ? (
                  <>
                    <Fraction numerator={reducedFraction.num} denominator={reducedFraction.den} />
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>=</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>{fmt2(fractionToDecimal(reducedFraction.num, reducedFraction.den))}</span>
                  </>
                ) : (
                 <span style={{ display: 'inline-flex', alignItems: 'center' }}>{fmt2(calculatedK)}</span>
                )}
              </div>
              {!selectedEquation && (
                <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {equationChoices.map((eq, i) => (
                    <button
                      key={i}
                      className="answer-btn pgraph-choice-btn"
                      onClick={() => handleEquationSelect(eq)}
                      style={{ width: '100%' }}
                    >
                      {eq.formula}
                    </button>
                  ))}
                </div>
              )}
              {selectedEquation && !equationChoices.find(eq => eq.displayText === selectedEquation && eq.isCorrect) && (
                <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {equationChoices.map((eq, i) => (
                    <button
                      key={i}
                      className="answer-btn pgraph-choice-btn"
                      onClick={() => handleEquationSelect(eq)}
                      style={{ width: '100%' }}
                    >
                      {eq.formula}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {selectedEquation && equationChoices.find(eq => eq.displayText === selectedEquation && eq.isCorrect) && reducedFraction && (
            <div className="section">
              <div className="step-title">✓ Excellent!</div>
              <div style={{ marginTop: 12, fontSize: '20px', fontWeight: 900, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span>k =</span>
                {calculatedK < 1 ? (
                  <Fraction numerator={reducedFraction.num} denominator={reducedFraction.den} />
                ) : (
                  <span>{calculatedK}</span>
                )}
              </div>
              <div className="muted" style={{ marginTop: 8, textAlign: 'center' }}>
               For every 1 unit increase in x, y increases by {calculatedK < 1 ? `${reducedFraction.num}/${reducedFraction.den}` : fmt2(calculatedK)} units.
              </div>
              <div style={{ marginTop: 8, textAlign: 'center', fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span>y =</span>
                {calculatedK < 1 ? (
                  <Fraction numerator={reducedFraction.num} denominator={reducedFraction.den} />
                ) : (
                  <span>{calculatedK}</span>
                )}
                <span>x</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
