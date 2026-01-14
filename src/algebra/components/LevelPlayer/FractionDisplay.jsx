// FractionDisplay.jsx - SURGICAL FIX: Compound numerator handling
// Location: src/algebra/components/LevelPlayer/FractionDisplay.jsx
// 
// CRITICAL FIX: Added pattern matching for (expression)/denominator BEFORE greedy split
// This ensures "(4+x)/12" renders with parentheses intact, not as "4 + x/12"
// VERSION: 2025-01-14-SURGICAL

import React from 'react';

/**
 * Renders mathematical expressions with proper fraction notation
 * Handles both simple fractions (x/4) and complex expressions ((4)(x/4))
 * 
 * CRITICAL: All denominators MUST be simplified before reaching this component.
 * Never pass "x/(7+12)" - always pass "x/19"
 * 
 * NEW: Now handles compound numerators like (4+x)/12, (x-3)/7, etc.
 * 
 * Examples:
 *   "x/4" → renders with x on top, bar, 4 on bottom
 *   "(4+x)/12" → renders with (4+x) on top, bar, 12 on bottom [NEW FIX]
 *   "(4)(x/4)" → renders "(4)" then fraction, handles wrapping
 *   "12" → renders as "12"
 *   "3x" → renders as "3x"
 */
const FractionDisplay = ({ expression }) => {
  if (!expression) return null;
  
  const str = String(expression).trim();
  
  // FIX BUG #2: If we somehow get an unsimplified denominator, try to simplify it
  const simplifyIfNeeded = (value) => {
    const v = String(value).trim();
    // If contains arithmetic, evaluate it (safety check)
    if (v.includes('+') || (v.includes('-') && v.length > 2)) {
      try {
        const sanitized = v.replace(/[^0-9+\-*/().\s]/g, '');
        if (sanitized === v && sanitized.length > 0) {
          const result = eval(sanitized);
          if (Number.isFinite(result)) {
            console.warn(`FractionDisplay received unsimplified denominator: ${v}, simplified to: ${result}`);
            return String(result);
          }
        }
      } catch (e) {
        // If eval fails, return original
      }
    }
    return v;
  };
  
  // Check for coefficient fraction pattern: (n/d)x or (-n/d)x
  const coefficientPattern = /^\((-?\d+)\s*\/\s*(\d+)\)\s*x$/;
  const coeffMatch = str.match(coefficientPattern);
  
  if (coeffMatch) {
    const [, numerator, denominator] = coeffMatch;
    const simplifiedDen = simplifyIfNeeded(denominator);
    return (
      <span className="coefficient-fraction-expression">
        <div className="fraction-wrapper">
          <div className="fraction-num">{numerator.trim()}</div>
          <div className="fraction-bar"></div>
          <div className="fraction-den">{simplifiedDen}</div>
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
  
  // CRITICAL FIX: Check for (expression)/denominator pattern BEFORE greedy split
  // Defense-in-depth for cases like "(4+x)/12", "(x-3)/7", "(-5+x)/8"
  // This pattern catches compound numerators that should stay grouped
  const compoundNumeratorPattern = /^\(([^)]+)\)\s*\/\s*(.+)$/;
  const compoundMatch = str.match(compoundNumeratorPattern);
  
  if (compoundMatch) {
    const [, numerator, denominator] = compoundMatch;
    // Keep the numerator expression intact with parentheses
    return (
      <div className="fraction-wrapper">
        <div className="fraction-num">({numerator.trim()})</div>
        <div className="fraction-bar"></div>
        <div className="fraction-den">{denominator.trim()}</div>
      </div>
    );
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
            const simplifiedDen = simplifyIfNeeded(den);
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="expression-separator"></span>}
                <span>(</span>
                <div className="fraction-wrapper">
                  <div className="fraction-num">{num.trim()}</div>
                  <div className="fraction-bar"></div>
                  <div className="fraction-den">{simplifiedDen}</div>
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
  const simplifiedDen = simplifyIfNeeded(denominator);
  
  return (
    <div className="fraction-wrapper">
      <div className="fraction-num">{numerator.trim()}</div>
      <div className="fraction-bar"></div>
      <div className="fraction-den">{simplifiedDen}</div>
    </div>
  );
};

export default FractionDisplay;
