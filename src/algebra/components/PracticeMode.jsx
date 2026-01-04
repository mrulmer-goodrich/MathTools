// PracticeMode.jsx - WITH DIFFICULTY SELECTION
// Location: src/algebra/components/PracticeMode.jsx

import React, { useState } from 'react';
import '../styles/algebra.css';

const PracticeMode = ({ onStartLevel, onBack, levelsCompleted = [] }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);

  // Skill groups for practice
  const skillGroups = [
    {
      name: '🔢 Operations with Integers',
      levels: ['1-1', '1-2', '1-3', '1-4']
    },
    {
      name: '📦 Distribution',
      levels: ['1-5', '1-6', '1-7', '1-8']
    },
    {
      name: '🧮 Combining Like Terms',
      levels: ['1-9', '1-10', '1-11', '1-12']
    },
    {
      name: '⛺ Distribute Then Combine',
      levels: ['1-13', '1-14', '1-15', '1-16']
    },
    {
      name: '🌊 One-Step Equations',
      levels: ['1-17', '1-18', '1-19', '1-20']
    },
    {
      name: '⛰️ Two-Step Equations',
      levels: ['1-21', '1-22', '1-23', '1-24']
    },
    {
      name: '🏔️ Multi-Step Equations',
      levels: ['1-25', '1-26', '1-27', '1-28']
    },
    {
      name: '🗝️ Variables on Both Sides',
      levels: ['1-29', '1-30', '1-31']
    },
    {
      name: '🏆 Ultimate Challenges',
      levels: ['1-32', '1-33']
    },
    {
      name: '⚖️ Inequalities',
      levels: ['1-34', '1-35', '1-36', '1-37']
    }
  ];

  const handleLevelClick = (levelId) => {
    setSelectedLevel(levelId);
    setShowDifficultyModal(true);
  };

  const handleDifficultySelect = (difficulty) => {
    setShowDifficultyModal(false);
    onStartLevel(selectedLevel, difficulty, 'practice');
  };

  const handleCancel = () => {
    setShowDifficultyModal(false);
    setSelectedLevel(null);
  };

  return (
    <div className="practice-mode-container">
      <button className="btn-back-base" onClick={onBack}>
        ← Back to Base Camp
      </button>

      <div className="practice-content">
        <h2 className="practice-title">Practice Mode</h2>
        <p className="practice-subtitle">Choose any skill to practice</p>

        <div className="skill-groups">
          {skillGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="skill-group">
              <h3 className="skill-group-name">{group.name}</h3>
              <div className="skill-group-levels">
                {group.levels.map((levelId) => {
                  const levelNum = levelId.split('-')[1];
                  const isCompleted = levelsCompleted.includes(levelId);
                  
                  return (
                    <button
                      key={levelId}
                      className={`practice-level-card ${isCompleted ? 'completed' : ''}`}
                      onClick={() => handleLevelClick(levelId)}
                    >
                      <span className="level-number">Level {levelNum}</span>
                      {isCompleted && <span className="completed-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Selection Modal */}
      {showDifficultyModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content difficulty-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Select Difficulty</h2>
            <p className="modal-subtitle">Choose your route for this practice session:</p>
            
            <div className="difficulty-options">
              <button 
                className="difficulty-option standard"
                onClick={() => handleDifficultySelect('easy')}
              >
                <div className="difficulty-icon">📍</div>
                <div className="difficulty-name">Standard Route</div>
                <div className="difficulty-desc">Whole numbers, clear problems, variable always x</div>
              </button>
              
              <button 
                className="difficulty-option advanced"
                onClick={() => handleDifficultySelect('notEasy')}
              >
                <div className="difficulty-icon">⚡</div>
                <div className="difficulty-name">Advanced Route</div>
                <div className="difficulty-desc">Fractions, decimals, multiple variables, grade-level rigor</div>
              </button>
            </div>
            
            <button 
              className="btn-cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeMode;
