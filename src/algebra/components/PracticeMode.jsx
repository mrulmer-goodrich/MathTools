// PracticeMode.jsx - FIXED: Readable headers, spacing, completion indicator
// Location: src/algebra/components/PracticeMode.jsx

import React from 'react';
import '../styles/algebra.css';

const PracticeMode = ({ onSelectLevel, onBackToBaseCamp, completedLevels, playerName }) => {
  
  const levelGroups = [
    {
      name: 'Operations with Integers',
      badge: '🔢',
      levels: [
        { id: '1-1', name: 'Addition Supplies', skill: 'Adding positive and negative integers' },
        { id: '1-2', name: 'Subtraction Supplies', skill: 'Subtracting integers (including subtracting negatives)' },
        { id: '1-3', name: 'Multiplication Supplies', skill: 'Multiplying integers (positive and negative)' },
        { id: '1-4', name: 'Division Supplies', skill: 'Dividing integers (positive and negative)' }
      ]
    },
    {
      name: 'Distribution',
      badge: '📦',
      levels: [
        { id: '1-5', name: 'Clear Path', skill: 'Basic distribution with positive numbers' },
        { id: '1-6', name: 'Rocky Trail', skill: 'Distribution with subtraction in parentheses' },
        { id: '1-7', name: 'Dark Forest', skill: 'Negative coefficient outside parentheses' },
        { id: '1-8', name: 'Mixed Terrain', skill: 'Mixed negatives inside and outside parentheses' }
      ]
    },
    {
      name: 'Combining Like Terms',
      badge: '🧮',
      levels: [
        { id: '1-9', name: 'Soil Supplies', skill: 'Basic combining like terms' },
        { id: '1-10', name: 'Organic Gear', skill: 'Identifying and ignoring unlike terms' },
        { id: '1-11', name: 'Complex Packing', skill: 'Multiple like terms to combine' },
        { id: '1-12', name: 'Final Inventory', skill: 'Subtracting like terms (including negatives)' }
      ]
    },
    {
      name: 'Distribute Then Combine',
      badge: '⛺',
      levels: [
        { id: '1-13', name: 'Pack It Up', skill: 'Distribute then combine' },
        { id: '1-14', name: 'Double Check', skill: 'Distribute with subtraction then combine' },
        { id: '1-15', name: 'Rocky Ledge', skill: 'Negative distribution then combine' },
        { id: '1-16', name: 'Summit', skill: 'Complex with trailing constants' }
      ]
    },
    {
      name: 'One-Step Equations',
      badge: '🌊',
      levels: [
        { id: '1-17', name: 'River Crossing', skill: 'Addition equations: x + a = b' },
        { id: '1-18', name: 'Bridge Building', skill: 'Multiplication equations: ax = b' },
        { id: '1-19', name: 'Canyon Leap', skill: 'Variable on right: b = x + a' },
        { id: '1-20', name: 'Waterfall', skill: 'Negative variable: -x + a = b' }
      ]
    },
    {
      name: 'Two-Step Equations',
      badge: '⛰️',
      levels: [
        { id: '1-21', name: 'Storm Passage', skill: 'Two-step with negative coefficients' },
        { id: '1-22', name: 'Fraction Falls', skill: 'Two-step with fractions' },
        { id: '1-23', name: 'Misty Decimals', skill: 'Two-step with decimals' }
      ]
    },
    {
      name: 'Multi-Step Equations',
      badge: '🏔️',
      levels: [
        { id: '1-24', name: 'Ancient Ruins', skill: 'Distribution in equations' },
        { id: '1-25', name: 'Complex Caverns', skill: 'Distribute, combine, then solve' }
      ]
    },
    {
      name: 'Variables on Both Sides',
      badge: '🗝️',
      levels: [
        { id: '1-26', name: 'The Divide', skill: 'Variables on both sides' },
        { id: '1-27', name: 'Outer Vault Approach', skill: 'Constants and variables both sides' },
        { id: '1-28', name: 'Inner Chamber', skill: 'Distribution with variables both sides' },
        { id: '1-29', name: 'Combination Lock', skill: 'Combine like terms then solve' },
        { id: '1-30', name: 'Puzzle Chamber', skill: 'All skills: distribute, combine, solve' }
      ]
    },
    {
      name: 'Ultimate Challenges',
      badge: '🏆',
      levels: [
        { id: '1-31', name: 'Vault Antechamber', skill: 'Distribute both sides, then solve' },
        { id: '1-32', name: 'THE VAULT', skill: 'Ultimate equation challenge' }
      ]
    },
    {
      name: 'Inequalities',
      badge: '⚖️',
      levels: [
        { id: '1-33', name: 'Boundary Markers', skill: 'Match inequality to number line' },
        { id: '1-34', name: 'Reverse Recognition', skill: 'Match number line to inequality' },
        { id: '1-35', name: 'Secure Perimeter', skill: 'Two-step inequalities (no flip)' },
        { id: '1-36', name: 'Shifting Boundaries', skill: 'Inequalities with sign flip' },
        { id: '1-37', name: 'FINAL FRONTIER', skill: 'Complex inequalities (all skills + flip)' }
      ]
    }
  ];

  return (
    <div className="base-camp-screen" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      <button className="btn-back-base" onClick={onBackToBaseCamp}>
        ← Back to Base Camp
      </button>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '6rem 2rem 2rem'
      }}>
        <div className="practice-mode-header">
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#1F2937',
            marginBottom: 0,
            fontFamily: 'Poppins, sans-serif',
            textShadow: '2px 2px 4px rgba(255,255,255,0.8)'
          }}>
            Practice Mode
          </h1>
        </div>

        {levelGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="practice-section">
            <div className="practice-section-header">
              <span className="badge-emoji">{group.badge}</span>
              <span>{group.name}</span>
            </div>

            <div className="practice-tiles-grid">
              {group.levels.map((level) => {
                const isCompleted = completedLevels.includes(level.id);
                
                return (
                  <div
                    key={level.id}
                    onClick={() => onSelectLevel(level.id)}
                    className={`practice-tile ${isCompleted ? 'completed' : ''}`}
                  >
                    {isCompleted && (
                      <div className="practice-tile-completion">
                        ✓
                      </div>
                    )}

                    <div className="practice-tile-level-num">
                      Level {level.id.split('-')[1]}
                    </div>

                    <div className="practice-tile-name">
                      {level.name}
                    </div>

                    <div className="practice-tile-skill">
                      {level.skill}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PracticeMode;
