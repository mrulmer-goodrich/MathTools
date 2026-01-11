// FractionDisplay.jsx - Renders fractions from "/" notation
// Location: src/algebra/components/LevelPlayer/FractionDisplay.jsx

import React from 'react';

/**
 * Renders mathematical expressions with proper fraction notation
 * Handles both simple fractions (x/4) and complex expressions ((4)(x/4))
 * 
 * Examples:
 *   "x/4" → renders with x on top, bar, 4 on bottom
 *   "(4)(x/4)" → renders "(4)" then fraction, handles wrapping
 *   "12" → renders as "12"
 *   "3x" → renders as "3x"
 */
const FractionDisplay = ({ expression }) => {
  if (!expression) return null;
  
  const str = String(expression).trim();
  
  // Check for coefficient fraction pattern: (n/d)x or (-n/d)x
  const coefficientPattern = /^\((-?\d+)\s*\/\s*(\d+)\)\s*x$/;
  const coeffMatch = str.match(coefficientPattern);
  
  if (coeffMatch) {
    const [, numerator, denominator] = coeffMatch;
    return (
      <span className="coefficient-fraction-expression">
        <div className="fraction-wrapper">
          <div className="fraction-num">{numerator.trim()}</div>
          <div className="fraction-bar"></div>
          <div className="fraction-den">{denominator.trim()}</div>
        </div>
        <span className="variable-x">x</span>
      </span>
    );
  }
  
  // Check if contains "/" for fraction rendering
  if (!str.includes('/')) {
    // No fraction, render as text
    return <span>{str}</span>;
  }
  
  // Handle wrapped expressions like "(4)(x/4)"
  if (str.includes(')(') && str.includes('/')) {
    // Split on ")(" to get parts
    const parts = str.split(')(');
    
    return (
      <span className="fraction-expression">
        {parts.map((part, idx) => {
          const cleanPart = part.replace(/[()]/g, '');
          
          if (cleanPart.includes('/')) {
            const [num, den] = cleanPart.split('/');
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="expression-separator"></span>}
                <span>(</span>
                <div className="fraction-wrapper">
                  <div className="fraction-num">{num.trim()}</div>
                  <div className="fraction-bar"></div>
                  <div className="fraction-den">{den.trim()}</div>
                </div>
                <span>)</span>
              </React.Fragment>
            );
          }
          
          return (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="expression-separator"></span>}
              <span>({cleanPart})</span>
            </React.Fragment>
          );
        })}
      </span>
    );
  }
  
  // Simple fraction: split and render
  const [numerator, denominator] = str.split('/');
  
  return (
    <div className="fraction-wrapper">
      <div className="fraction-num">{numerator.trim()}</div>
      <div className="fraction-bar"></div>
      <div className="fraction-den">{denominator.trim()}</div>
    </div>
  );
};

export default FractionDisplay;
