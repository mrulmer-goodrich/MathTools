// src/modules/pgraphs/ProportionalGraphsModule.jsx — v1.0.0
// Proportional Graphs learning tool

import React, { useEffect, useMemo, useRef, useState } from "react";
import { genPGraph } from "../../lib/generator.js";
import BigButton from "../../components/BigButton.jsx";
import ugConfetti from "../../lib/confetti.js";

/** 
 * Proportional Graphs Module
 * Teaches students to identify proportional relationships and calculate k
 */

const loadDifficulty = () => localStorage.getItem("pgraphs-difficulty") || "easy";
const saveDifficulty = (d) => localStorage.setItem("pgraphs-difficulty", d);
const shuffle = (arr) => { 
  const a = [...arr]; 
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [a[i], a[j]] = [a[j], a[i]]; 
  } 
  return a; 
};

// Canvas-based graph renderer
function GraphCanvas({ problem, onPointClick, highlightPoint, showOrigin }) {
  const canvasRef = useRef(null);
  const [clickedPoint, setClickedPoint] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Helper function to convert graph coordinates to canvas coordinates
    const toCanvasX = (x) => padding + (x / 10) * graphWidth;
    const toCanvasY = (y) => height - padding - (y / 10) * graphHeight;
    
    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(toCanvasX(i), padding);
      ctx.lineTo(toCanvasX(i), height - padding);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(padding, toCanvasY(i));
      ctx.lineTo(width - padding, toCanvasY(i));
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
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
    for (let i = 0; i <= 10; i++) {
      // X-axis labels
      ctx.fillText(i.toString(), toCanvasX(i), height - padding + 20);
      // Y-axis labels
      if (i > 0) {
        ctx.textAlign = 'right';
        ctx.fillText(i.toString(), padding - 10, toCanvasY(i) + 5);
        ctx.textAlign = 'center';
      }
    }
    
    // Draw axis titles
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('x', width - padding + 20, height - padding + 5);
    ctx.fillText('y', padding - 5, padding - 20);
    
    // Draw the line/curve
    ctx.strokeStyle = '#0b4b8c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    if (problem.isProportional) {
      // Draw straight line through origin
      ctx.moveTo(toCanvasX(0), toCanvasY(0));
      ctx.lineTo(toCanvasX(10), toCanvasY(problem.k * 10));
    } else if (problem.type === 'curved') {
      // Draw curve
      for (let x = 0; x <= 10; x += 0.1) {
        const y = problem.curveFunc(x);
        if (x === 0) {
          ctx.moveTo(toCanvasX(x), toCanvasY(y));
        } else {
          ctx.lineTo(toCanvasX(x), toCanvasY(y));
        }
      }
    } else if (problem.type === 'notThroughOrigin') {
      // Draw straight line not through origin
      const y0 = problem.yIntercept;
      const y10 = problem.k * 10 + problem.yIntercept;
      ctx.moveTo(toCanvasX(0), toCanvasY(y0));
      ctx.lineTo(toCanvasX(10), toCanvasY(y10));
    }
    ctx.stroke();
    
    // Highlight origin if requested
    if (showOrigin) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(toCanvasX(0), toCanvasY(0), 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Highlight perfect point if provided
    if (highlightPoint) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(toCanvasX(highlightPoint.x), toCanvasY(highlightPoint.y), 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw coordinate label
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `(${highlightPoint.x}, ${highlightPoint.y})`,
        toCanvasX(highlightPoint.x),
        toCanvasY(highlightPoint.y) - 18
      );
    }
    
    // Show clicked point temporarily
    if (clickedPoint) {
      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.arc(toCanvasX(clickedPoint.x), toCanvasY(clickedPoint.y), 6, 0, Math.PI * 2);
      ctx.fill();
    }
    
  }, [problem, highlightPoint, showOrigin, clickedPoint]);
  
  const handleClick = (e) => {
    if (!onPointClick) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const padding = 50;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;
    
    // Convert canvas coordinates to graph coordinates
    const graphX = ((clickX - padding) / graphWidth) * 10;
    const graphY = ((canvas.height - clickY - padding) / graphHeight) * 10;
    
    // Round to nearest integer
    const roundedX = Math.round(graphX);
    const roundedY = Math.round(graphY);
    
    // Validate click is on the line (with large tolerance)
    if (problem.isProportional) {
      const expectedY = problem.k * roundedX;
      if (Math.abs(roundedY - expectedY) < 0.75 && roundedX >= 0 && roundedX <= 10 && roundedY >= 0 && roundedY <= 10) {
        setClickedPoint({ x: roundedX, y: roundedY });
        setTimeout(() => setClickedPoint(null), 500);
        onPointClick({ x: roundedX, y: roundedY });
      }
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
      }}
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
  const [difficulty, setDifficulty] = useState(loadDifficulty());
  const [problem, setProblem] = useState(() => genPGraph(difficulty));
  
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
  
  useEffect(() => saveDifficulty(difficulty), [difficulty]);
  
  const resetAll = (nextDiff = difficulty) => {
    const next = genPGraph(nextDiff);
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
  };
  
  // Generate coordinate choices
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
  
  // Generate y-value choices
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
  
  // Generate x-value choices
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
  
  // Handle step 1: Is proportional?
  const handleProportionalChoice = (choice) => {
    setSelectedProportional(choice);
    if (!problem.isProportional && choice === 'not') {
      setCurrentStep(2); // Go to "why not"
    } else if (problem.isProportional && choice === 'yes') {
      setCurrentStep(3); // Go to "why yes"
    } else {
      // Wrong answer
      setTimeout(() => setSelectedProportional(null), 1000);
    }
  };
  
  // Handle step 2: Why not proportional?
  const handleWhyNot = (reason) => {
    setWhyNotProportional(reason);
    const correct = problem.whyNot === reason;
    if (correct) {
      try { ugConfetti.burst(); } catch {}
      // End game - show new problem button
    } else {
      setTimeout(() => setWhyNotProportional(null), 1000);
    }
  };
  
  // Handle step 3: Why proportional?
  const handleWhyProportional = (reason) => {
    setWhyProportional(reason);
    if (reason === 'both') {
      setCurrentStep(4); // Go to find perfect point
    } else {
      setTimeout(() => setWhyProportional(null), 1000);
    }
  };
  
  // Handle step 4: Click on graph
  const handlePointClick = (point) => {
    // Check if it's a perfect point
    const isPerfect = problem.perfectPoints.some(p => p.x === point.x && p.y === point.y);
    if (isPerfect) {
      setSelectedPoint(point);
      setCurrentStep(5); // Go to coordinate selection
    }
  };
  
  // Handle step 5: Select coordinates
  const handleCoordinateSelect = (coord) => {
    setSelectedCoordinates(coord);
    if (coord.isCorrect) {
      setCurrentStep(6); // Go to formula
    } else {
      setTimeout(() => setSelectedCoordinates(null), 1000);
    }
  };
  
  // Handle step 6: Select formula
  const handleFormulaSelect = (formula) => {
    setSelectedFormula(formula);
    if (formula === 'y/x') {
      setCurrentStep(7); // Go to y-value
    } else {
      setTimeout(() => setSelectedFormula(null), 1000);
    }
  };
  
  // Handle step 7: Select y-value
  const handleYSelect = (choice) => {
    setSelectedY(choice.value);
    if (choice.isCorrect) {
      setCurrentStep(8); // Go to x-value
    } else {
      setTimeout(() => setSelectedY(null), 1000);
    }
  };
  
  // Handle step 8: Select x-value
  const handleXSelect = (choice) => {
    setSelectedX(choice.value);
    if (choice.isCorrect) {
      setCurrentStep(9); // Go to compute
    } else {
      setTimeout(() => setSelectedX(null), 1000);
    }
  };
  
  // Handle step 9: Compute k
  const handleCompute = () => {
    const k = selectedY / selectedX;
    setCalculatedK(k);
    try { ugConfetti.burst(); } catch {}
  };
  
  return (
    <>
      <div className="panes pgraphs-layout">
        <div className="card">
          {/* Difficulty buttons */}
          <div className="row" style={{ justifyContent: "flex-start", marginBottom: 16, gap: 8 }}>
            <div className={`press ${difficulty === "easy" ? "is-active" : ""}`}>
              <BigButton 
                className={difficulty === "easy" ? "active" : ""}
                onClick={() => { setDifficulty("easy"); resetAll("easy"); }}
                aria-pressed={difficulty === "easy"}
              >
                Easy
              </BigButton>
            </div>
            <div className={`press ${difficulty === "medium" ? "is-active" : ""}`}>
              <BigButton 
                className={difficulty === "medium" ? "active" : ""}
                onClick={() => { setDifficulty("medium"); resetAll("medium"); }}
                aria-pressed={difficulty === "medium"}
              >
                Medium
              </BigButton>
            </div>
            <div className={`press ${difficulty === "hard" ? "is-active" : ""}`}>
              <BigButton 
                className={difficulty === "hard" ? "active" : ""}
                onClick={() => { setDifficulty("hard"); resetAll("hard"); }}
                aria-pressed={difficulty === "hard"}
              >
                Hard
              </BigButton>
            </div>
          </div>
          
          {/* Graph */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <GraphCanvas 
              problem={problem}
              onPointClick={currentStep === 4 ? handlePointClick : null}
              highlightPoint={selectedPoint}
              showOrigin={currentStep === 2 || currentStep === 3}
            />
          </div>
          
          {/* New Problem button (shown after completion) */}
          {(whyNotProportional === problem.whyNot || calculatedK !== null) && (
            <div className="center" style={{ marginTop: 18 }}>
              <BigButton onClick={() => resetAll()}>New Problem</BigButton>
            </div>
          )}
        </div>
        
        {/* Right panel - Questions */}
        <div className="card right-steps">
          {/* Step 1: Is proportional? */}
          {currentStep === 1 && (
            <div className="section">
              <div className="step-title">Is this graph proportional or not proportional?</div>
              <div className="row" style={{ gap: 10, marginTop: 12 }}>
                <button 
                  className="answer-btn"
                  onClick={() => handleProportionalChoice('yes')}
                >
                  Proportional
                </button>
                <button 
                  className="answer-btn"
                  onClick={() => handleProportionalChoice('not')}
                >
                  Not Proportional
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Why not proportional? */}
          {currentStep === 2 && (
            <div className="section">
              <div className="step-title">Why is this graph NOT proportional?</div>
              <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <button 
                  className="answer-btn"
                  onClick={() => handleWhyNot('notStraight')}
                  style={{ width: '100%' }}
                >
                  It's not a straight line
                </button>
                <button 
                  className="answer-btn"
                  onClick={() => handleWhyNot('notThroughOrigin')}
                  style={{ width: '100%' }}
                >
                  It doesn't go through the origin (0,0)
                </button>
                <button 
                  className="answer-btn"
                  onClick={() => handleWhyNot('both')}
                  style={{ width: '100%' }}
                >
                  Both - it's not straight AND doesn't go through origin
                </button>
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
                <button 
                  className="answer-btn"
                  onClick={() => handleWhyProportional('both')}
                  style={{ width: '100%' }}
                >
                  It's a straight line AND goes through the origin (0,0)
                </button>
                <button 
                  className="answer-btn"
                  onClick={() => handleWhyProportional('straightOnly')}
                  style={{ width: '100%' }}
                >
                  It's a straight line only
                </button>
                <button 
                  className="answer-btn"
                  onClick={() => handleWhyProportional('originOnly')}
                  style={{ width: '100%' }}
                >
                  It goes through the origin (0,0) only
                </button>
              </div>
            </div>
          )}
          
          {/* Step 4: Find perfect point */}
          {currentStep === 4 && (
            <div className="section">
              <div className="step-title">Find a Punto Perfecto - tap on the line where you can clearly identify both x and y values!</div>
              <div className="muted" style={{ marginTop: 8, fontSize: '14px' }}>
                Click directly on a point on the graph line.
              </div>
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
                    className="answer-btn"
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
                <button className="answer-btn" onClick={() => handleFormulaSelect('y/x')}>
                  k = <Fraction numerator="y" denominator="x" />
                </button>
                <button className="answer-btn" onClick={() => handleFormulaSelect('x/y')}>
                  k = <Fraction numerator="x" denominator="y" />
                </button>
                <button className="answer-btn" onClick={() => handleFormulaSelect('x+y')}>
                  k = x + y
                </button>
                <button className="answer-btn" onClick={() => handleFormulaSelect('y-x')}>
                  k = y - x
                </button>
              </div>
            </div>
          )}
          
          {/* Step 7: Identify y-value */}
          {currentStep === 7 && selectedCoordinates && (
            <div className="section">
              <div className="step-title">What is the y-value from your point ({selectedCoordinates.x}, {selectedCoordinates.y})?</div>
              <div style={{ marginTop: 12, marginBottom: 12, fontSize: '24px', fontWeight: 900, textAlign: 'center' }}>
                k = <Fraction numerator={<span className="ptable-pulse" style={{ display: 'inline-block', width: '30px', height: '4px', background: '#3b82f6' }} />} denominator={selectedCoordinates.x} />
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {yChoices.map((choice, i) => (
                  <button
                    key={i}
                    className="answer-btn"
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
              <div style={{ marginTop: 12, marginBottom: 12, fontSize: '24px', fontWeight: 900, textAlign: 'center' }}>
                k = <Fraction numerator={selectedY} denominator={<span className="ptable-pulse" style={{ display: 'inline-block', width: '30px', height: '4px', background: '#3b82f6' }} />} />
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {xChoices.map((choice, i) => (
                  <button
                    key={i}
                    className="answer-btn"
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
              <div style={{ marginTop: 12, marginBottom: 12, fontSize: '24px', fontWeight: 900, textAlign: 'center' }}>
                k = <Fraction numerator={selectedY} denominator={selectedX} />
              </div>
              <div className="center">
                <button 
                  className="answer-btn flash"
                  onClick={handleCompute}
                  style={{ fontSize: '20px', padding: '16px 28px' }}
                >
                  Compute
                </button>
              </div>
            </div>
          )}
          
          {/* Result */}
          {calculatedK !== null && (
            <div className="section">
              <div className="step-title">✓ Excellent!</div>
              <div style={{ marginTop: 12, fontSize: '20px', fontWeight: 900, textAlign: 'center' }}>
                k = {calculatedK < 1 ? (
                  <Fraction numerator={selectedY} denominator={selectedX} />
                ) : (
                  calculatedK
                )}
              </div>
              <div className="muted" style={{ marginTop: 8, textAlign: 'center' }}>
                For every 1 unit increase in x, y increases by {calculatedK} units.
              </div>
              <div style={{ marginTop: 8, textAlign: 'center', fontWeight: 700 }}>
                y = {calculatedK}x
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
