import React, { useState, useEffect } from 'react';

const CodeDisplay = ({ totalDigits, lockedDigits, codeSequence }) => {
  const digits = Array.from({ length: totalDigits }, (_, i) => i + 1);
  
  // State to track current spinning character for each digit
  const [spinningChars, setSpinningChars] = useState({});
  
  const getRandomChar = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*';
    return chars[Math.floor(Math.random() * chars.length)];
  };
  
  // Get the correct character for this position
  const getCorrectChar = (position) => {
    if (codeSequence && codeSequence[position - 1]) {
      return codeSequence[position - 1];
    }
    return String(position - 1).padStart(1, '0');
  };
  
  // Independent spinning effect for each unlocked digit
  useEffect(() => {
    const intervals = {};
    
    digits.forEach(digit => {
      if (!lockedDigits.includes(digit)) {
        // Each digit spins at a different speed (between 50-150ms)
        const speed = 50 + (digit * 10);
        
        // Stagger the start time for each digit
        setTimeout(() => {
          intervals[digit] = setInterval(() => {
            setSpinningChars(prev => ({
              ...prev,
              [digit]: getRandomChar()
            }));
          }, speed);
        }, digit * 30); // Stagger by 30ms per digit
      }
    });
    
    // Cleanup intervals
    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [lockedDigits.length, totalDigits]);
  
  return (
    <div className="code-display">
      {digits.map(digit => (
        <div 
          key={digit}
          className={`code-digit ${lockedDigits.includes(digit) ? 'locked' : 'spinning'}`}
        >
          {lockedDigits.includes(digit) ? (
            <span className="locked-char">{getCorrectChar(digit)}</span>
          ) : (
            <span className="spinning-char">{spinningChars[digit] || getRandomChar()}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default CodeDisplay;
