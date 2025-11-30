import React, { useState, useRef, useEffect } from 'react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [position, setPosition] = useState({ x: window.innerWidth - 250, y: 100 });
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

  const handleNumber = (num) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleEquals = () => {
    try {
      const fullEquation = equation + display;
      const result = eval(fullEquation.replace(/×/g, '*').replace(/÷/g, '/'));
      setDisplay(result.toString());
      setEquation('');
    } catch (error) {
      setDisplay('Error');
      setEquation('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
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
