// src/modules/pgraphs/ProportionalGraphsModule.jsx – v2.5.0
// Proportional Graphs learning tool

import React, { useEffect, useMemo, useRef, useState } from "react";
import { genPGraph } from "../../lib/generator.js";
import BigButton from "../../components/BigButton.jsx";
import ugConfetti from "../../lib/confetti.js";
import { reduceFraction, fractionToDecimal } from "../../lib/mathUtils.js";

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
function GraphCanvas({ problem, onPointClick, highlightPoint, showOrigin, showCoordinates, blinkPoint }) {
  const canvasRef = useRef(null);
  const [clickedPoint, setClickedPoint] = useState(null);
  const [blinkState, setBlinkState] = useState(false);

  // Blink animation for the green dot
  useEffect(() => {
    if (!blinkPoint) return;
    const interval = setInterval(() => {
      setBlinkState(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, [blinkPoint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    
    // Dynamic axis range based on k value
    let maxX = 10;
    let maxY = 10;
    
    if (problem.isProportional && problem.k < 1) {
      // For k < 1, expand x-axis to show more points
      maxX = 20;
      maxY = 10;
    } else if (problem.isProportional && problem.k > 1) {
      maxX = 10;
      maxY = Math.min(problem.k * 10, 20);
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Helper function to convert graph coordinates to canvas coordinates
    const toCanvasX = (x) => padding + (x / maxX) * graphWidth;
    const toCanvasY = (y) => height - padding - (y / maxY) * graphHeight;
    
    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
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
      // Draw curve
      for (let x = 0; x <= maxX; x += 0.1) {
        const y = Math.min(problem.curveFunc(x), maxY);
        if (x === 0) {
          ctx.moveTo(toCanvasX(x), toCanvasY(y));
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
      // Draw curve not through origin
      for (let x = 0; x <= maxX; x += 0.1) {
        const y = Math.min(problem.curveFunc(x), maxY);
        if (x === 0) {
          ctx.moveTo(toCanvasX(x), toCanvasY(y));
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
      // Only show if not blinking, or if blinking and currently in "on" state
      if (!blinkPoint || blinkState) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(toCanvasX(highlightPoint.x), toCanvasY(highlightPoint.y), 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      
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
    
  }, [problem, highlightPoint, showOrigin, clickedPoint, showCoordinates, blinkPoint, blinkState]);
  
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
    
    // Check if this point is in the perfectPoints array
    const isPerfect = problem.perfectPoints && problem.perfectPoints.some(p => {
      const match = p.x === roundedX && p.y === roundedY;
      console.log(`  Checking point (${p.x}, ${p.y}) vs (${roundedX}, ${roundedY}): ${match ? '✅ MATCH!' : '❌'}`);
      return match;
    });
    
    console.log(`Result: ${isPerfect ? '✅ PERFECT POINT!' : '❌ Not a perfect point'}`);
    
    if (isPerfect) {
      console.log('✅ Accepting point:', { x: roundedX, y: roundedY });
      setClickedPoint({ x: roundedX, y: roundedY });
      setTimeout(() => setClickedPoint(null), 500);
      onPointClick({ x: roundedX, y: roundedY });
    } else {
      console.log('❌ Point rejected - not in perfectPoints array');
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
function Fraction({ numerator, denominator, showEquals = false }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      {showEquals && <span style={{ fontSize: '20px', fontWeight: 900 }}>=</span>}
      <div className="fraction mini-frac">
        <div style={{ fontSize: '20px', fontWeight: 900 }}>{numerator ?? '—'}</div>
        <div className="frac-bar narrow" />
        <div style={{ fontSize: '20px', fontWeight: 900 }}>{denominator ?? '—'}</div>
      </div>
    </div>
  );
}

export default function ProportionalGraphsModule() {
  const [problem, setProblem] = useState(() => genPGraph());
  const [showConfirmNew, setShowConfirmNew] = useState(false);
  
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
    
    // For display in equation choices: use fraction for k < 1, whole number for k >= 1
    const kDisplay = calculatedK < 1 ? (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <Fraction numerator={num} denominator={den} />
      </span>
    ) : calculatedK.toString();
    
    const reciprocalDisplay = calculatedK < 1 ? (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <Fraction numerator={den} denominator={num} />
      </span>
    ) : (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <Fraction numerator={1} denominator={calculatedK} />
      </span>
    );
    
    return shuffle([
      { 
        formula: <span>y = {kDisplay}x</span>, 
        displayText: `y = ${calculatedK < 1 ? `(${num}/${den})` : calculatedK}x`,
        isCorrect: true 
      },
      { 
        formula: <span>y = {reciprocalDisplay}x</span>, 
        displayText: `y = ${calculatedK < 1 ? `(${den}/${num})` : `(1/${calculatedK})`}x`,
        isCorrect: false 
      },
      { 
        formula: <span>x = {kDisplay}y</span>, 
        displayText: `x = ${calculatedK < 1 ? `(${num}/${den})` : calculatedK}y`,
        isCorrect: false 
      },
      { 
        formula: <span>y = x + {kDisplay}</span>, 
        displayText: `y = x + ${calculatedK < 1 ? `(${num}/${den})` : calculatedK}`,
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
    console.log('📍 Current problem.perfectPoints:', problem.perfectPoints);
    
    // Safety check - if perfectPoints doesn't exist, accept any point on the line
    if (!problem.perfectPoints || problem.perfectPoints.length === 0) {
      console.log('⚠️ WARNING: perfectPoints array is missing or empty! Accepting any integer point on line.');
      // Verify point is on the line
      const expectedY = Math.round(problem.k * point.x);
      if (Math.abs(point.y - expectedY) < 0.5) {
        console.log('✅ Point is on line, accepting');
        setSelectedPoint(point);
        setCurrentStep(5);
      } else {
        console.log('❌ Point is not on line');
      }
      return;
    }
    
    const isPerfect = problem.perfectPoints.some(p => p.x === point.x && p.y === point.y);
    console.log('📍 Is perfect?', isPerfect);
    
    if (isPerfect) {
      console.log('✅ Perfect point confirmed, moving to step 5');
      setSelectedPoint(point);
      setCurrentStep(5);
    } else {
      console.log('❌ Not a perfect point, ignoring');
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
              blinkPoint={currentStep === 7 || currentStep === 8}
            />
          </div>
          
          {/* New Problem button */}
          <div className="center" style={{ marginTop: 18 }}>
            <BigButton onClick={handleNewProblem}>New Problem</BigButton>
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
                  { key: 'y/x', formula: <Fraction numerator="y" denominator="x" />, correct: true },
                  { key: 'x/y', formula: <Fraction numerator="x" denominator="y" />, correct: false },
                  { key: 'x+y', formula: 'x + y', correct: false },
                  { key: 'y-x', formula: 'y – x', correct: false }
                ]).map(({ key, formula, correct }) => (
                  <button 
                    key={key}
                    className="answer-btn pgraph-choice-btn" 
                    onClick={() => handleFormulaSelect(key)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
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
                <div style={{ fontSize: '24px', fontWeight: 900, textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '12px', border: '3px solid #e2e8f0' }}>
                  k = <span style={{ position: 'relative', display: 'inline-block' }}>
                    <Fraction 
                      numerator={<span className="ptable-pulse" style={{ display: 'inline-block', minWidth: '40px', height: '4px', background: '#f59e0b', borderRadius: '2px' }} />} 
                      denominator="x" 
                    />
                  </span>
                </div>
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {yChoices.map((choice, i) => (
                  <button
                    key={i}
                    className="answer-btn pgraph-choice-btn"
                    onClick={() => handleYSelect(choice)}
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
                <div style={{ fontSize: '24px', fontWeight: 900, textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '12px', border: '3px solid #e2e8f0' }}>
                  k = <span style={{ position: 'relative', display: 'inline-block' }}>
                    <Fraction 
                      numerator={selectedY} 
                      denominator={<span className="ptable-pulse" style={{ display: 'inline-block', minWidth: '40px', height: '4px', background: '#f59e0b', borderRadius: '2px' }} />} 
                    />
                  </span>
                </div>
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {xChoices.map((choice, i) => (
                  <button
                    key={i}
                    className="answer-btn pgraph-choice-btn"
                    onClick={() => handleXSelect(choice)}
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
              <div style={{ marginTop: 12, marginBottom: 12, fontSize: '24px', fontWeight: 900, textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '12px', border: '3px solid #e2e8f0' }}>
                k = <Fraction numerator={selectedY} denominator={selectedX} />
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
                <span>k =</span>
                {calculatedK < 1 ? (
                  <>
                    <Fraction numerator={reducedFraction.num} denominator={reducedFraction.den} />
                    <span>=</span>
                    <span>{fractionToDecimal(reducedFraction.num, reducedFraction.den)}</span>
                  </>
                ) : (
                  <span>{calculatedK}</span>
                )}
              </div>
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
                For every 1 unit increase in x, y increases by {calculatedK < 1 ? `${reducedFraction.num}/${reducedFraction.den}` : calculatedK} units.
              </div>
              <div style={{ marginTop: 8, textAlign: 'center', fontWeight: 700, fontSize: '18px' }}>
                {selectedEquation}
              </div>
            </div>
          )}
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
