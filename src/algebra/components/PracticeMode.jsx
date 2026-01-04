// PracticeMode.jsx - FINAL: No scroll, clean UI, correct difficulty
// Location: src/algebra/components/PracticeMode.jsx

import React, { useState } from 'react';
import '../styles/algebra.css';

const PracticeMode = ({ onSelectLevel, onBackToBaseCamp, completedLevels, playerName }) => {
  // Track current difficulty selection
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  
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

  const handleLevelClick = (levelId) => {
    console.log('PracticeMode: Selected difficulty =', selectedDifficulty);
    console.log('PracticeMode: Calling onSelectLevel with', levelId, selectedDifficulty);
    // Pass both levelId and current difficulty
    onSelectLevel(levelId, selectedDifficulty);
  };

  return (
    <div className="base-camp-screen" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'auto'
    }}>
      <button className="btn-back-base" onClick={onBackToBaseCamp}>
        ← Back to Base Camp
      </button>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
        paddingTop: '5rem'
      }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          fontWeight: 700,
          color: '#1F2937',
          marginBottom: '1.5rem',
          fontFamily: 'Poppins, sans-serif',
          textShadow: '2px 2px 4px rgba(255,255,255,0.8)'
        }}>
          Practice Mode
        </h1>

        {/* DIFFICULTY TOGGLE PILL */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2.5rem'
        }}>
          <div style={{
            display: 'inline-flex',
            background: '#F3F4F6',
            borderRadius: '9999px',
            padding: '0.25rem',
            gap: '0.25rem',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <button
              onClick={() => setSelectedDifficulty('easy')}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '9999px',
                border: 'none',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: selectedDifficulty === 'easy' 
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'transparent',
                color: selectedDifficulty === 'easy' ? 'white' : '#6B7280',
                boxShadow: selectedDifficulty === 'easy' 
                  ? '0 2px 8px rgba(16, 185, 129, 0.4)'
                  : 'none'
              }}
            >
              📍 Standard Route
            </button>
            <button
              onClick={() => setSelectedDifficulty('notEasy')}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '9999px',
                border: 'none',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: selectedDifficulty === 'notEasy' 
                  ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                  : 'transparent',
                color: selectedDifficulty === 'notEasy' ? 'white' : '#6B7280',
                boxShadow: selectedDifficulty === 'notEasy' 
                  ? '0 2px 8px rgba(245, 158, 11, 0.4)'
                  : 'none'
              }}
            >
              ⚡ Advanced Route
            </button>
          </div>
        </div>

        {levelGroups.map((group, groupIndex) => (
          <div key={groupIndex} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1F2937',
              marginBottom: '1rem',
              fontFamily: 'Poppins, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>{group.badge}</span>
              <span>{group.name}</span>
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1rem'
            }}>
              {group.levels.map((level) => {
                const isCompleted = completedLevels.includes(level.id);
                
                return (
                  <div
                    key={level.id}
                    onClick={() => handleLevelClick(level.id)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: `3px solid ${isCompleted ? '#10B981' : '#E5E7EB'}`,
                      borderRadius: '0.75rem',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      minHeight: '120px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                      e.currentTarget.style.borderColor = isCompleted ? '#059669' : '#10B981';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = isCompleted ? '#10B981' : '#E5E7EB';
                    }}
                  >
                    {isCompleted && (
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        fontSize: '1.5rem',
                        color: '#10B981'
                      }}>
                        ✓
                      </div>
                    )}

                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#10B981',
                      marginBottom: '0.5rem',
                      fontFamily: 'Poppins, sans-serif',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Level {level.id.split('-')[1]}
                    </div>

                    <div style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: '#1F2937',
                      marginBottom: '0.5rem',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      {level.name}
                    </div>

                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6B7280',
                      fontFamily: 'Poppins, sans-serif',
                      lineHeight: 1.4
                    }}>
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
