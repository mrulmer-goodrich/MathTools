// TermBank.jsx - Reusable term chips with signs
// Location: src/algebra/components/LevelPlayer/TermBank.jsx

import React from 'react';
import '../../styles/algebra.css';

const TermBank = ({ 
  terms, 
  selectedTerms, 
  onTermClick, 
  disabled 
}) => {
  return (
    <div className="term-bank">
      <div className="bank-label">Available Terms:</div>
      <div className="term-chips">
        {terms.map((term, index) => {
          // Count how many times this term has been used
          const timesUsed = selectedTerms.filter(t => t === term).length;
          
          return (
            <button
              key={index}
              className={`term-chip ${timesUsed > 0 ? 'used' : ''}`}
              onClick={() => onTermClick(term)}
              disabled={disabled}
              data-use-count={timesUsed}
            >
              {term}
              {timesUsed > 0 && <span className="use-badge">{timesUsed}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TermBank;
