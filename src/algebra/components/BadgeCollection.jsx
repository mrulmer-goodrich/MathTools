// BadgeCollection.jsx - REDESIGNED: Band-based awards, unified modal styling, polished UI
// Location: src/algebra/components/BadgeCollection.jsx

import React from 'react';
import '../styles/badge-collection.css';

// Artifacts awarded when ALL levels in band are complete
const SKILL_BANDS = [
  { 
    id: 'band-1',
    name: 'Operations with Integers', 
    levels: [1, 2, 3, 4],
    artifact: { emoji: '🔢', name: 'Integer Compass' }
  },
  { 
    id: 'band-2',
    name: 'Distribution', 
    levels: [5, 6, 7, 8],
    artifact: { emoji: '📦', name: 'Distribution Lens' }
  },
  { 
    id: 'band-3',
    name: 'Combining Like Terms', 
    levels: [9, 10, 11, 12],
    artifact: { emoji: '🧮', name: 'Combining Crystal' }
  },
  { 
    id: 'band-4',
    name: 'Distribute Then Combine', 
    levels: [13, 14, 15, 16],
    artifact: { emoji: '⛺', name: 'Summit Stone' }
  },
  { 
    id: 'band-5',
    name: 'One-Step Equations', 
    levels: [17, 18, 19, 20],
    artifact: { emoji: '🌊', name: 'River Tablet' }
  },
  { 
    id: 'band-6',
    name: 'Two-Step Equations', 
    levels: [21, 22, 23],
    artifact: { emoji: '⛰️', name: 'Mountain Seal' }
  },
  { 
    id: 'band-7',
    name: 'Multi-Step Equations', 
    levels: [24, 25],
    artifact: { emoji: '🏔️', name: 'Peak Marker' }
  },
  { 
    id: 'band-8',
    name: 'Variables on Both Sides', 
    levels: [26, 27, 28, 29, 30],
    artifact: { emoji: '🗝️', name: 'Vault Key' }
  },
  { 
    id: 'band-9',
    name: 'Ultimate Challenges', 
    levels: [31, 32],
    artifact: { emoji: '🏆', name: 'Ultimate Relic' }
  },
  { 
    id: 'band-10',
    name: 'Inequalities', 
    levels: [33, 34, 35, 36, 37],
    artifact: { emoji: '⚖️', name: 'Balance Scale' }
  }
];

const BadgeCollection = ({ completedLevels, progress, onClose }) => {
  // Check if ALL levels in a band are complete
  const isBandComplete = (band) => {
    return band.levels.every(levelNum => 
      completedLevels.includes(`1-${levelNum}`)
    );
  };

  const earnedArtifacts = SKILL_BANDS.filter(band => isBandComplete(band));
  const totalArtifacts = SKILL_BANDS.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>🎒 Artifact Collection</h2>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="modal-content">
          
          {/* Knowledge Crystals Display */}
          <div className="crystals-banner">
            <img 
              src="/assets/algebra/KnowledgeCrystal.png" 
              alt="Knowledge Crystal" 
              className="crystal-icon-large"
            />
            <div className="crystal-details">
              <div className="crystal-amount">{progress?.crystals || 0} Knowledge Crystals</div>
              <div className="crystal-subtitle">Earned by solving problems correctly</div>
            </div>
          </div>

          {/* Artifacts Progress */}
          <div className="artifacts-header">
            <h3>Ancient Math Artifacts</h3>
            <div className="artifacts-count">
              {earnedArtifacts.length} / {totalArtifacts} Discovered
            </div>
          </div>

          <p className="artifacts-description">
            Discover powerful artifacts by mastering complete skill bands. Each artifact represents total mastery of a mathematical concept.
          </p>

          {/* Artifacts Grid */}
          <div className="artifacts-grid">
            {SKILL_BANDS.map((band) => {
              const isEarned = isBandComplete(band);
              const completedCount = band.levels.filter(levelNum => 
                completedLevels.includes(`1-${levelNum}`)
              ).length;
              const progress = Math.round((completedCount / band.levels.length) * 100);

              return (
                <div 
                  key={band.id} 
                  className={`artifact-card ${isEarned ? 'earned' : 'locked'}`}
                >
                  <div className="artifact-icon">
                    {isEarned ? (
                      <span className="artifact-emoji">{band.artifact.emoji}</span>
                    ) : (
                      <span className="artifact-locked">🔒</span>
                    )}
                  </div>
                  
                  <div className="artifact-name">{band.artifact.name}</div>
                  <div className="artifact-skill">{band.name}</div>
                  
                  {!isEarned && (
                    <div className="artifact-progress">
                      <div className="artifact-progress-bar">
                        <div 
                          className="artifact-progress-fill" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="artifact-progress-text">
                        {completedCount} / {band.levels.length} levels
                      </div>
                    </div>
                  )}

                  {isEarned && (
                    <div className="artifact-earned-badge">
                      ✓ Mastered
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-modal-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadgeCollection;
