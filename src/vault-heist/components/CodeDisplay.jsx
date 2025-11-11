import React from 'react';

const CodeDisplay = ({ totalDigits, lockedDigits, codeSequence }) => {
  const digits = Array.from({ length: totalDigits }, (_, i) => i + 1);
  
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
            <span className="spinning-char">{getRandomChar()}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default CodeDisplay;
