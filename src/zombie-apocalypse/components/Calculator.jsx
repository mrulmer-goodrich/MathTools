// Calculator.jsx
// VERSION: 3.0.0
// Last Updated: November 30, 2024
// Changes: Cap decimals at 4 places, enable chaining calculations from result

import React, { useState, useRef, useEffect } from 'react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [justCalculated, setJustCalculated] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const calcRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('.za-calc-btn')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const formatNumber = (num) => {
    // Cap at 4 decimal places
    const numValue = parseFloat(num);
    if (isNaN(numValue)) return '0';
    
    // If it's a whole number, return as is
    if (Number.isInteger(numValue)) return numValue.toString();
    
    // Otherwise, cap at 4 decimal places and remove trailing zeros
    const fixed = numValue.toFixed(4);
    return parseFloat(fixed).toString();
  };

  const handleNumber = (num) => {
    if (justCalculated) {
      // If we just calculated, start fresh
      setDisplay(num);
      setJustCalculated(false);
    } else if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op) => {
    if (justCalculated && lastResult !== null) {
      // Use the last result to continue calculating
      setEquation(lastResult + ' ' + op + ' ');
      setDisplay('0');
      setJustCalculated(false);
    } else {
      setEquation(display + ' ' + op + ' ');
      setDisplay('0');
    }
  };

  const handleEquals = () => {
    try {
      const fullEquation = equation + display;
      const result = eval(fullEquation.replace(/×/g, '*').replace(/÷/g, '/'));
      const formattedResult = formatNumber(result);
      setDisplay(formattedResult);
      setLastResult(formattedResult);
      setJustCalculated(true);
      setEquation('');
    } catch (error) {
      setDisplay('Error');
      setEquation('');
      setLastResult(null);
      setJustCalculated(false);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setLastResult(null);
    setJustCalculated(false);
  };

  const handleDecimal = () => {
    if (justCalculated) {
      setDisplay('0.');
      setJustCalculated(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  return (
    <div 
      ref={calcRef}
      className="za-calculator"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="za-calc-header">Calculator</div>
      <div className="za-calc-display">
        {equation && <div className="za-calc-equation">{equation}</div>}
        <div className="za-calc-value">{display}</div>
      </div>
      <div className="za-calc-buttons">
        <button className="za-calc-btn za-calc-clear" onClick={handleClear}>C</button>
        <button className="za-calc-btn za-calc-back" onClick={handleBackspace}>←</button>
        <button className="za-calc-btn za-calc-op" onClick={() => handleOperator('÷')}>÷</button>
        <button className="za-calc-btn za-calc-op" onClick={() => handleOperator('×')}>×</button>
        
        <button className="za-calc-btn" onClick={() => handleNumber('7')}>7</button>
        <button className="za-calc-btn" onClick={() => handleNumber('8')}>8</button>
        <button className="za-calc-btn" onClick={() => handleNumber('9')}>9</button>
        <button className="za-calc-btn za-calc-op" onClick={() => handleOperator('-')}>−</button>
        
        <button className="za-calc-btn" onClick={() => handleNumber('4')}>4</button>
        <button className="za-calc-btn" onClick={() => handleNumber('5')}>5</button>
        <button className="za-calc-btn" onClick={() => handleNumber('6')}>6</button>
        <button className="za-calc-btn za-calc-op" onClick={() => handleOperator('+')}>+</button>
        
        <button className="za-calc-btn" onClick={() => handleNumber('1')}>1</button>
        <button className="za-calc-btn" onClick={() => handleNumber('2')}>2</button>
        <button className="za-calc-btn" onClick={() => handleNumber('3')}>3</button>
        <button className="za-calc-btn za-calc-eq" onClick={handleEquals}>=</button>
        
        <button className="za-calc-btn za-calc-zero" onClick={() => handleNumber('0')}>0</button>
        <button className="za-calc-btn" onClick={handleDecimal}>.</button>
      </div>
    </div>
  );
};

export default Calculator;
