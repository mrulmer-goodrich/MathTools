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
  
  // REMOVED 2025-01-14: This function was CAUSING bugs, not fixing them!
  // It was evaluating denominators like "3-12" to "-9", causing mismatch with term banks
  // The generator should NEVER create unsimplified denominators in the first place
  // const simplifyIfNeeded = (value) => {
  //   return String(value).trim();
  // };
  
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
  
  // CRITICAL FIX 2025-01-14: Smart split that identifies ONLY the fraction term
  // "-6 + x/-2" should be "-6 + (x/-2)" NOT "(-6+x)/-2"
  // We need to find the term IMMEDIATELY before the /, not everything before it
  const smartFractionSplit = (str) => {
    const slashIndex = str.indexOf('/');
    if (slashIndex === -1) return null;
    
    // Find the START of the fraction numerator by looking backwards from /
    // Stop at: space followed by operator, or start of string
    let numeratorStart = 0;
    for (let i = slashIndex - 1; i >= 0; i--) {
      const char = str[i];
      const prevChar = i > 0 ? str[i-1] : '';
      
      // If we hit a space followed by + or -, that's where the fraction term starts
      if (char === ' ' && i > 0 && /[\+\-]/.test(prevChar)) {
        numeratorStart = i + 1; // Start after the space
        break;
      }
    }
    
    const beforeFraction = str.substring(0, numeratorStart).trim();
    const numerator = str.substring(numeratorStart, slashIndex).trim();
    const afterSlash = str.substring(slashIndex + 1);
    
    // Find the end of the denominator (stop at space + operator)
    let denominatorEnd = afterSlash.length;
    const operatorMatch = afterSlash.match(/\s+[\+\-]/);
    if (operatorMatch) {
      denominatorEnd = operatorMatch.index;
    }
    
    const denominator = afterSlash.substring(0, denominatorEnd).trim();
    const afterFraction = afterSlash.substring(denominatorEnd).trim();
    
    return { 
      beforeFraction, 
      numerator, 
      denominator, 
      afterFraction,
      hasBefore: beforeFraction.length > 0,
      hasAfter: afterFraction.length > 0
    };
  };
  
  // Check if contains "/" for fraction rendering
  if (!str.includes('/')) {
    // No fraction, render as text
    return <span>{str}</span>;
  }
  
  // Try smart split first
  const smartSplit = smartFractionSplit(str);
  if (smartSplit && (smartSplit.hasBefore || smartSplit.hasAfter)) {
    // This is something like "-6 + x/-2" or "x/3 - 12"
    return (
      <span>
        {smartSplit.hasBefore && <span>{smartSplit.beforeFraction} </span>}
        <div className="fraction-wrapper" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <div className="fraction-num">{smartSplit.numerator}</div>
          <div className="fraction-bar"></div>
          <div className="fraction-den">{smartSplit.denominator}</div>
        </div>
        {smartSplit.hasAfter && <span> {smartSplit.afterFraction}</span>}
      </span>
    );
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
