// MapDisplay.jsx - REDESIGNED: Unified modal styling, no scroll, polished UI
// Location: src/algebra/components/MapDisplay.jsx

import React from 'react';
import '../styles/map-display.css';

const MapDisplay = ({ progress, completedLevels, currentLevel, onClose }) => {
  // Define map regions matching PracticeMode bands
  const regions = [
    {
      name: "Base Camp",
      levels: Array.from({length: 16}, (_, i) => `1-${i + 1}`),
      icon: "🏕️",
      color: "#8b7355"
    },
    {
      name: "The Territory",
      levels: Array.from({length: 15}, (_, i) => `1-${i + 17}`),
      icon: "🗺️",
      color: "#27ae60"
    },
    {
      name: "The Frontier",
      levels: Array.from({length: 6}, (_, i) => `1-${i + 32}`),
      icon: "⛰️",
      color: "#3498db"
    }
  ];

  const getRegionProgress = (region) => {
    const completed = region.levels.filter(l => completedLevels.includes(l)).length;
    return Math.round((completed / region.levels.length) * 100);
  };

  const isLevelCompleted = (levelId) => completedLevels.includes(levelId);
  const isCurrentLevel = (levelId) => currentLevel === levelId;

  return (
    <div className="algebra-modal-overlay" onClick={onClose}>
      <div className="algebra-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="algebra-modal-header">
          <h2>🗺️ Expedition Map</h2>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="algebra-modal-content">
          <div className="map-intro">
            Dr. Martinez's journal reveals three distinct regions. Track your expedition progress through each area.
          </div>

          <div className="regions-grid">
            {regions.map((region, regionIndex) => (
              <div key={regionIndex} className="region-card">
                <div className="region-header">
                  <span className="region-icon" style={{color: region.color}}>
                    {region.icon}
                  </span>
                  <h3 className="region-name">{region.name}</h3>
                </div>

                <div className="region-progress-bar">
                  <div 
                    className="region-progress-fill" 
                    style={{ 
                      width: `${getRegionProgress(region)}%`,
                      backgroundColor: region.color
                    }}
                  />
                  <span className="region-progress-text">
                    {getRegionProgress(region)}% Complete
                  </span>
                </div>

                <div className="region-levels-grid">
                  {region.levels.map((levelId) => {
                    const levelNum = parseInt(levelId.split('-')[1]);
                    const completed = isLevelCompleted(levelId);
                    const current = isCurrentLevel(levelId);
                    
                    return (
                      <div 
                        key={levelId}
                        className={`level-marker ${completed ? 'completed' : ''} ${current ? 'current' : ''}`}
                        title={`Level ${levelNum}${completed ? ' - Complete' : ''}${current ? ' - Current' : ''}`}
                      >
                        {completed ? '✓' : levelNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="map-legend">
            <div className="legend-item">
              <div className="legend-dot completed"></div>
              <span>Completed</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot current"></div>
              <span>Current Level</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot locked"></div>
              <span>Not Yet Reached</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MapDisplay;
