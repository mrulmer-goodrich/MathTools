// FractionDisplay.jsx - Renders fractions from "/" notation
// Location: src/algebra/components/LevelPlayer/FractionDisplay.jsx

import React from 'react';

/**
 * FractionDisplay
 *
 * Goal: Render ONLY true "fraction tokens" (e.g., "x/4", "-2/3", "(2/3)x")
 * as stacked numerator/denominator. Do NOT greedily fraction-render full
 * expressions like "8 + x/12" or "(b+a)/x".
 *
 * CRITICAL: All denominators MUST be simplified before reaching this component.
 * Never pass "x/(7+12)" - always pass "x/19"
 */

const FractionDisplay = ({ value, expression }) => {
  const resolved = (value !== undefined ? value : expression);
  if (resolved === null || resolved === undefined) return null;

  const str = String(resolved).trim();
  if (!str) return null;

  // -----------------------------
  // Helpers
  // -----------------------------
  const stripOuterParensOnce = (s) => {
    const t = s.trim();
    if (t.startsWith('(') && t.endsWith(')')) {
      // Only strip one layer
      return t.slice(1, -1).trim();
    }
    return t;
  };

  const simplifyIfNeeded = (den) => {
    // This component is not a CAS. We only do very light cleanup:
    // - remove stray parentheses around plain integers: "(-8)" -> "-8"
    // - trim whitespace
    let d = String(den ?? '').trim();

    // remove a single outer paren layer if it wraps a simple integer
    const parenInt = d.match(/^\(\s*(-?\d+)\s*\)$/);
    if (parenInt) return parenInt[1];

    return d;
  };

  // True "token" detectors (avoid greedy parsing)
  // - simple fraction token: "-2/3", "(2/3)", "+ 2/3"
  const simpleFractionToken = /^\s*([+-])?\s*\(?\s*\d+\s*\/\s*\d+\s*\)?\s*$/;

  // - x-over-int: "x/4", "-x/12"
  const xOverIntToken = /^\s*([+-])?\s*x\s*\/\s*\(?\s*\d+\s*\)?\s*$/;

  // - fractional coefficient times x:
  //   "(2/3)x", "-(2/3)x", "+ (2/3) x", "2/3x"
  const coeffTimesXToken = /^\s*([+-])?\s*\(?\s*(\d+)\s*\/\s*(\d+)\s*\)?\s*x\s*$/;

  // If the string contains operators/spaces in a way that indicates an expression,
  // we refuse to fraction-render to avoid (b+a)/x mistakes.
  // (We still allow spaces inside the token patterns above.)
  const looksLikeExpression = (() => {
    // If it includes any of these, it's almost certainly not a single token:
    // equals, plus between terms, multiple slashes, parentheses with operators, etc.
    if (/[=]/.test(str)) return true;
    // If it has more than one slash, it isn't a simple token we support.
    if ((str.match(/\//g) || []).length > 1) return true;
    // If it has + or - not at the beginning, it's an expression (e.g., "8 + x/12").
    // Note: allow a single leading sign.
    const inner = str.replace(/^\s*[+-]\s*/, '');
    if (/[+\-]/.test(inner)) return true;
    // If it has an asterisk/multiplication/division symbols besides the slash itself.
    if (/[×*÷]/.test(inner)) return true;
    return false;
  })();

  // -----------------------------
  // 1) Fractional coefficient times x: "(2/3)x"
  // -----------------------------
  const coeffMatch = str.match(coeffTimesXToken);
  if (coeffMatch) {
    const leadingSign = coeffMatch[1] || '';
    const num = coeffMatch[2];
    const den = simplifyIfNeeded(coeffMatch[3]);

    return (
      <span className="fraction-inline">
        {leadingSign ? <span className="fraction-sign">{leadingSign}</span> : null}
        <span className="fraction-wrapper">
          <span className="fraction-num">{num}</span>
          <span className="fraction-bar"></span>
          <span className="fraction-den">{den}</span>
        </span>
        <span className="fraction-suffix">x</span>
      </span>
    );
  }

  // -----------------------------
  // 2) Simple x over integer: "x/4" or "-x/12"
  // -----------------------------
  if (!looksLikeExpression && xOverIntToken.test(str)) {
    const cleaned = str.replace(/\s+/g, '');
    const [numRaw, denRaw] = cleaned.split('/');
    const den = simplifyIfNeeded(stripOuterParensOnce(denRaw));

    return (
      <span className="fraction-wrapper">
        <span className="fraction-num">{numRaw}</span>
        <span className="fraction-bar"></span>
        <span className="fraction-den">{den}</span>
      </span>
    );
  }

  // -----------------------------
  // 3) Simple numeric fraction token: "-2/3", "(2/3)"
  // -----------------------------
  if (!looksLikeExpression && simpleFractionToken.test(str)) {
    // Preserve a leading sign if present, but render the fraction itself cleanly.
    const leading = str.match(/^\s*([+-])\s*/);
    const sign = leading ? leading[1] : '';

    // remove leading sign and outer parens, then strip spaces
    let core = str.replace(/^\s*[+-]\s*/, '').trim();
    core = stripOuterParensOnce(core).replace(/\s+/g, '');

    const [num, denRaw] = core.split('/');
    const den = simplifyIfNeeded(denRaw);

    return (
      <span className="fraction-inline">
        {sign ? <span className="fraction-sign">{sign}</span> : null}
        <span className="fraction-wrapper">
          <span className="fraction-num">{num}</span>
          <span className="fraction-bar"></span>
          <span className="fraction-den">{den}</span>
        </span>
      </span>
    );
  }

  // -----------------------------
  // 4) Anything else: render as plain text (NO greedy fraction parsing)
  // -----------------------------
  return <span>{str}</span>;
};

export default FractionDisplay;
