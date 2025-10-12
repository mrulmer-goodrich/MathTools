// src/modules/pgraphs/ProportionalGraphsModule.jsx – v2.5.0
// Proportional Graphs learning tool

import React, { useEffect, useMemo, useRef, useState } from "react";
import { genPGraph } from "../../lib/generator.js";
import BigButton from "../../components/BigButton.jsx";
import ugConfetti from "../../lib/confetti.js";
import { reduceFraction, fractionToDecimal } from "../../lib/mathUtils.js";

// format to 2 decimal places; returns Number (not string)
const fmt2 = (n) => Number(n.toFixed(2));

// Round up to a “nice” tick (default step = 5)
const niceCeil = (n, step = 5) => Math.ceil(n / step) * step;

/** 
 * Proportional Graphs Module
 * Teaches students to identify proportional relationships and calculate k
 */

const shuffle = (arr) => { 
  const a = [...arr]; 
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [a[i], a[j]] = [a[j], a[i]]; 
  } 
  return a; 
};

// Canvas-based graph renderer with dynamic axes
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
    
// Dynamic axis range based on *perfectPoints* so at least one is visible
let maxX = 10;
let maxY = 10;

const ppts = Array.isArray(problem?.perfectPoints) ? problem.perfectPoints : [];
if (ppts.length > 0) {
  // choose the smallest perfect point by overall size to ensure it fits
  const smallest = [...ppts].sort((a, b) => Math.max(a.x, a.y) - Math.max(b.x, b.y))[0];
  const minXNeeded = (smallest?.x ?? 1) + 1; // +1 headroom
  const minYNeeded = (smallest?.y ?? 1) + 1;
  maxX = niceCeil(Math.max(10, minXNeeded), 5);
  maxY = niceCeil(Math.max(10, minYNeeded), 5);
}

    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Helper function to convert graph coordinates to canvas coordinates
    const toCanvasX = (x) => padding + (x / maxX) * graphWidth;
    const toCanvasY = (y) => height - padding - (y / maxY) * graphHeight;
    
    // darken grid lines for better visibility
ctx.strokeStyle = '#cbd5e1'; // Tailwind slate-300
ctx.lineWidth = 1.25;
    
    const xStep = maxX <= 10 ? 1 : 2;
    const yStep = maxY <= 10 ? 1 : 2;
    
    for (let i = 0; i <= maxX; i += xStep) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(toCanvasX(i), padding);
      ctx.lineTo(toCanvasX(i), height - padding);
      ctx.stroke();
    }
    
    for (let i = 0; i <= maxY; i += yStep) {
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(padding, toCanvasY(i));
      ctx.lineTo(width - padding, toCanvasY(i));
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 3;
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // Draw axis labels
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
    
    // Draw axis titles
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('x', width - padding + 30, height - padding + 5);
    ctx.fillText('y', padding - 5, padding - 30);
    
    // Draw the line/curve
    ctx.strokeStyle = '#0b4b8c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    
    if (problem.isProportional) {
      // Draw straight line through origin
      ctx.moveTo(toCanvasX(0), toCanvasY(0));
      const endY = Math.min(problem.k * maxX, maxY);
      ctx.lineTo(toCanvasX(maxX), toCanvasY(endY));
    } else if (problem.type === 'curved') {
      // Draw curve - stop drawing when y reaches maxY to avoid flat line
      let started = false;
      for (let x = 0; x <= maxX; x += 0.1) {
        const y = problem.curveFunc(x);
        if (y > maxY) break; // Stop drawing when curve exceeds graph bounds
        if (!started) {
          ctx.moveTo(toCanvasX(x), toCanvasY(y));
          started = true;
        } else {
          ctx.lineTo(toCanvasX(x), toCanvasY(y));
        }
      }
    } else if (problem.type === 'notThroughOrigin') {
      // Draw straight line not through origin
      const y0 = problem.yIntercept;
      const yEnd = Math.min(problem.k * maxX + problem.yIntercept, maxY);
      ctx.moveTo(toCanvasX(0), toCanvasY(y0));
      ctx.lineTo(toCanvasX(maxX), toCanvasY(yEnd));
    } else if (problem.type === 'curvedNotThrough') {
      // Draw curve not through origin - stop drawing when y reaches maxY
      let started = false;
      for (let x = 0; x <= maxX; x += 0.1) {
        const y = problem.curveFunc(x);
        if (y > maxY) break; // Stop drawing when curve exceeds graph bounds
        if (!started) {
          ctx.moveTo(toCanvasX(x), toCanvasY(y));
          started = true;
        } else {
          ctx.lineTo(toCanvasX(x), toCanvasY(y));
        }
      }
    }
    ctx.stroke();
    
    // Highlight origin if requested (only AFTER correct answer)
    if (showOrigin) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(toCanvasX(0), toCanvasY(0), 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    // Highlight perfect point if provided
    if (highlightPoint) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(toCanvasX(highlightPoint.x), toCanvasY(highlightPoint.y), 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw coordinate label ONLY if showCoordinates is true
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
    
    // Show clicked point temporarily
    if (clickedPoint) {
      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.arc(toCanvasX(clickedPoint.x), toCanvasY(clickedPoint.y), 6, 0, Math.PI * 2);
      ctx.fill();
    }
    
  }, [problem, highlightPoint, showOrigin, clickedPoint, showCoordinates]);
  
  const handleClick = (e) => {
    if (!onPointClick) {
      console.log('❌ Click handler not active - onPointClick is null');
      return;
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Account for canvas scaling (CSS vs actual canvas size)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    
    const padding = 60;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;
    
    // Dynamic max values (must match rendering)
    let maxX = 10;
    let maxY = 10;
    if (problem.isProportional && problem.k < 1) {
      maxX = 20;
      maxY = 10;
    } else if (problem.isProportional && problem.k > 1) {
      maxX = 10;
      maxY = Math.min(problem.k * 10, 20);
    }
    
    // Convert canvas coordinates to graph coordinates
    const graphX = ((clickX - padding) / graphWidth) * maxX;
    const canvasYFromBottom = canvas.height - clickY;
    const graphY = ((canvasYFromBottom - padding) / graphHeight) * maxY;
    
    // Round to nearest integer
    const roundedX = Math.round(graphX);
    const roundedY = Math.round(graphY);
    
    console.log('🖱️ CLICK DEBUG:', {
      canvas: { clickX, clickY },
      graph: { graphX, graphY },
      rounded: { x: roundedX, y: roundedY },
      problem: {
        k: problem.k,
        isProportional: problem.isProportional,
        perfectPoints: problem.perfectPoints
      }
    });
    
    // For proportional graphs, pass the rounded coordinates to the parent handler
    // The parent will validate against the perfectPoints array
    if (problem.isProportional && roundedX >= 0 && roundedX <= maxX && roundedY >= 0 && roundedY <= maxY) {
      console.log('✅ Click coordinates passed to parent handler');
      setClickedPoint({ x: roundedX, y: roundedY });
      setTimeout(() => setClickedPoint(null), 500);
      onPointClick({ x: roundedX, y: roundedY });
    } else {
      console.log('❌ Click outside graph bounds');
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

// Fraction display component (horizontal bar, not slash)
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

export default function ProportionalGraphsModule() {
  const [problem, setProblem] = useState(() => genPGraph());
  const [showConfirmNew, setShowConfirmNew] = useState(false);
  
  // Add pulse animation style
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
  
  // Step tracking
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
  
  // Continuous confetti effect
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
    setShowConfirmNew(false);
  };
  
  const handleNewProblem = () => {
    if (currentStep === 1 || whyNotProportional || selectedEquation) {
      resetAll();
    } else {
      setShowConfirmNew(true);
    }
  };
  
  // Generate coordinate choices (randomized)
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
  
  // Generate y-value choices (randomized)
  const yChoices = useMemo(() => {
    if (!selectedCoordinates) return [];
    
    const correct = selectedCoordinates.y;
    const xValue = selectedCoordinates.x;
    const otherPoint = problem.perfectPoints.find(p => p.x !== selectedCoordinates.x) || {};
    
    return shuffle([
      { value: correct, label: correct.toString(), isCorrect: true },
      { value: xValue, label: xValue.toString(), isCorrect: false },
      { value: correct + 1, label: (correct + 1).toString(), isCorrect: false },
      { value: otherPoint.y || correct - 1, label: (otherPoint.y || correct - 1).toString(), isCorrect: false },
    ]);
  }, [selectedCoordinates, problem]);
  
  // Generate x-value choices (randomized)
  const xChoices = useMemo(() => {
    if (!selectedCoordinates) return [];
    
    const correct = selectedCoordinates.x;
    const yValue = selectedCoordinates.y;
    const otherPoint = problem.perfectPoints.find(p => p.y !== selectedCoordinates.y) || {};
    
    return shuffle([
      { value: correct, label: correct.toString(), isCorrect: true },
      { value: yValue, label: yValue.toString(), isCorrect: false },
      { value: correct + 1, label: (correct + 1).toString(), isCorrect: false },
      { value: otherPoint.x || correct - 1, label: (otherPoint.x || correct - 1).toString(), isCorrect: false },
    ]);
  }, [selectedCoordinates, problem]);
  
  // Generate equation choices (randomized)
 const equationChoices = useMemo(() => {
  if (calculatedK === null || !reducedFraction) return [];
  
  const { num, den } = reducedFraction;
  const kDec2 = fmt2(calculatedK);

  // For display in equation choices: use fraction for k < 1, 2-decimal for k >= 1
  const kDisplay = calculatedK < 1 ? (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <Fraction numerator={num} denominator={den} whiteBar={true} />
    </span>
  ) : kDec2.toString();
  
  const reciprocalDisplay = calculatedK < 1 ? (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <Fraction numerator={den} denominator={num} whiteBar={true} />
    </span>
  ) : (
    // plain "1/k" text for k>=1 (avoid fraction with decimal denominator)
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>1/{kDec2}</span>
  );


    
    return shuffle([
      { 
        formula: <span>y = {kDisplay}x</span>, 
        displayText: `y = ${calculatedK < 1 ? `(${num}/${den})` : kDec2}x`,
        isCorrect: true 
      },
      { 
        formula: <span>y = {reciprocalDisplay}x</span>, 
        displayText: `y = ${calculatedK < 1 ? `(${den}/${num})` : `(1/${kDec2})`}x`,
        isCorrect: false 
      },
      { 
        formula: <span>x = {kDisplay}y</span>, 
        displayText: `x = ${calculatedK < 1 ? `(${num}/${den})` : kDec2}y`,
        isCorrect: false 
      },
      { 
        formula: <span>y = x + {kDisplay}</span>, 
        displayText: `y = x + ${calculatedK < 1 ? `(${num}/${den})` : kDec2}`,
        isCorrect: false 
      },
    ]);
  }, [calculatedK, reducedFraction]);
  
  // Handle step 1: Is proportional?
  const handleProportionalChoice = (choice) => {
    setSelectedProportional(choice);
    if (!problem.isProportional && choice === 'not') {
      setCurrentStep(2);
    } else if (problem.isProportional && choice === 'yes') {
      setCurrentStep(3);
    } else {
      setTimeout(() => setSelectedProportional(null), 1000);
    }
  };
  
  // Handle step 2: Why not proportional?
  const handleWhyNot = (reason) => {
    setWhyNotProportional(reason);
    const correct = problem.whyNot === reason;
    if (correct) {
      try { ugConfetti.burst(); } catch {}
    } else {
      setTimeout(() => setWhyNotProportional(null), 1000);
    }
  };
  
  // Handle step 3: Why proportional?
  const handleWhyProportional = (reason) => {
    setWhyProportional(reason);
    if (reason === 'both') {
      setCurrentStep(4);
    } else {
      setTimeout(() => setWhyProportional(null), 1000);
    }
  };
  
  // Handle step 4: Click on graph
  const handlePointClick = (point) => {
    console.log('📍 handlePointClick called with:', point);
    console.log('📍 Current problem.k:', problem.k);
    console.log('📍 Perfect points available:', problem.perfectPoints);
    
    // Check if this point exists in the perfectPoints array
    const isValid = problem.perfectPoints.some(p => p.x === point.x && p.y === point.y);
    
    console.log('📍 Validation:', {
      clickedPoint: point,
      isValid,
      perfectPoints: problem.perfectPoints
    });
    
    if (isValid) {
      console.log('✅ Valid perfect point confirmed, moving to step 5');
      setSelectedPoint(point);
      setCurrentStep(5);
    } else {
      console.log('❌ Not a valid perfect point, ignoring');
    }
  };
  
  // Handle step 5: Select coordinates
  const handleCoordinateSelect = (coord) => {
    setSelectedCoordinates(coord);
    if (coord.isCorrect) {
      setCurrentStep(6);
    } else {
      setTimeout(() => setSelectedCoordinates(null), 1000);
    }
  };
  
  // Handle step 6: Select formula
  const handleFormulaSelect = (formula) => {
    setSelectedFormula(formula);
    if (formula === 'y/x') {
      setCurrentStep(7);
    } else {
      setTimeout(() => setSelectedFormula(null), 1000);
    }
  };
  
  // Handle step 7: Select y-value
  const handleYSelect = (choice) => {
    setSelectedY(choice.value);
    if (choice.isCorrect) {
      setCurrentStep(8);
    } else {
      setTimeout(() => setSelectedY(null), 1000);
    }
  };
  
  // Handle step 8: Select x-value
  const handleXSelect = (choice) => {
    setSelectedX(choice.value);
    if (choice.isCorrect) {
      setCurrentStep(9);
    } else {
      setTimeout(() => setSelectedX(null), 1000);
    }
  };
  
  // Handle step 9: Compute k
  const handleCompute = () => {
    const k = selectedY / selectedX;
    setCalculatedK(k);
    
    // Reduce the fraction
    const reduced = reduceFraction(selectedY, selectedX);
    setReducedFraction(reduced);
    
    setCurrentStep(10);
  };
  
  // Handle step 10: Select equation
  const handleEquationSelect = (equation) => {
    setSelectedEquation(equation.displayText);
    if (equation.isCorrect) {
      setShowFinalConfetti(true);
    } else {
      setTimeout(() => setSelectedEquation(null), 1000);
    }
  };
  
  return (
    <>
      <div className="panes pgraphs-layout">
        <div className="card">
          {/* Graph */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <GraphCanvas 
              problem={problem}
              onPointClick={currentStep === 4 ? handlePointClick : null}
              highlightPoint={selectedPoint}
              showOrigin={whyProportional === 'both'} 
              showCoordinates={selectedCoordinates !== null}
            />
          </div>
        </div>
        
        {/* Right panel - Questions */}
        <div className="card right-steps">
          {/* Step 1: Is proportional? */}
          {currentStep === 1 && (
            <div className="section">
              <div className="step-title">Is this graph proportional or not proportional?</div>
              <div className="row" style={{ gap: 10, marginTop: 12 }}>
                {shuffle([
                  { key: 'yes', label: 'Proportional' },
                  { key: 'not', label: 'Not Proportional' }
                ]).map(choice => (
                  <button 
                    key={choice.key}
                    className="answer-btn pgraph-choice-btn"
                    onClick={() => handleProportionalChoice(choice.key)}
                    style={{ flex: '1 1 calc(50% - 5px)', minWidth: '140px' }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 2: Why not proportional? */}
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
          
          {/* Step 3: Why proportional? */}
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
          
          {/* Step 4: Find perfect point */}
          {currentStep === 4 && (
            <div className="section">
              <div className="step-title">Find a Punto Perfecto - tap on the line where you can clearly identify both x and y values!</div>
            </div>
          )}
          
          {/* Step 5: Identify coordinates */}
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
          
          {/* Step 6: Formula for k */}
          {currentStep === 6 && (
            <div className="section">
              <div className="step-title">What is the formula to find k?</div>
              <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {shuffle([
                  { key: 'y/x', formula: <Fraction numerator="y" denominator="x" whiteBar={true} />, correct: true },
                  { key: 'x/y', formula: <Fraction numerator="x" denominator="y" whiteBar={true} />, correct: false },
                  { key: 'x+y', formula: 'x + y', correct: false },
                  { key: 'y-x', formula: 'y – x', correct: false }
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
          
          {/* Step 7: Identify y-value */}
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
          
          {/* Step 8: Identify x-value */}
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
          
          {/* Step 9: Compute */}
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
          
          {/* Step 10: Select equation */}
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
          
          {/* Final Result */}
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
          
          {/* New Problem button - always visible at bottom of right panel */}
          <div className="section" style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #e2e8f0' }}>
            <div className="center">
              <BigButton 
                onClick={handleNewProblem}
                className={showFinalConfetti ? 'flash' : ''}
                style={showFinalConfetti ? { animation: 'pulse 1.5s ease-in-out infinite' } : {}}
              >
                New Problem
              </BigButton>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmNew && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '400px', padding: '24px' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: 16 }}>
              Start a new problem?
            </div>
            <div className="muted" style={{ marginBottom: 20 }}>
              You'll lose your progress on the current problem.
            </div>
            <div className="row" style={{ gap: 12, justifyContent: 'center' }}>
              <button 
                className="button primary"
                onClick={resetAll}
              >
                Yes, New Problem
              </button>
              <button 
                className="button"
                onClick={() => setShowConfirmNew(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
