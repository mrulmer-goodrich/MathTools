import React from 'react';

const CodeDisplay = ({ totalDigits, lockedDigits }) => {
  const digits = Array.from({ length: totalDigits }, (_, i) => i + 1);
  
  const getRandomChar = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return chars[Math.floor(Math.random() * chars.length)];
  };
  
  return (
    <div className="code-display">
      {digits.map(digit => (
        <div 
          key={digit}
          className={`code-digit ${lockedDigits.includes(digit) ? 'locked' : 'spinning'}`}
        >
          {lockedDigits.includes(digit) ? (
            <span className="locked-char">{String(digit - 1).padStart(1, '0')}</span>
          ) : (
            <span className="spinning-char">{getRandomChar()}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default CodeDisplay;
