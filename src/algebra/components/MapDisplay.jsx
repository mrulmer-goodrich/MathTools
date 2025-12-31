// MapDisplay.jsx - COMPLETE FIX (with close button + cooler design)
// Location: src/algebra/components/MapDisplay.jsx

import React from 'react';
import '../styles/algebra.css';

const MapDisplay = ({ progress, completedLevels, currentLevel, onClose }) => {
  // Define map regions
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
    <div className="map-display-overlay">
      <div className="map-display-container">
        <div className="map-header">
          <h2>🗺️ Expedition Map</h2>
          <button className="btn-close-panel" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="map-content">
          <div className="map-intro">
            <p>Dr. Martinez's journal reveals three distinct regions of the mountain range. Track your progress through each area.</p>
          </div>

          <div className="regions-container">
            {regions.map((region, regionIndex) => (
              <div key={regionIndex} className="region-card">
                <div className="region-header">
                  <div className="region-icon" style={{color: region.color}}>
                    {region.icon}
                  </div>
                  <h3>{region.name}</h3>
                  <div className="region-progress">
                    {getRegionProgress(region)}% Complete
                  </div>
                </div>

                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${getRegionProgress(region)}%`,
                      backgroundColor: region.color
                    }}
                  />
                </div>

                <div className="region-levels">
                  {region.levels.map((levelId, index) => {
                    const levelNum = parseInt(levelId.split('-')[1]);
                    const completed = isLevelCompleted(levelId);
                    const current = isCurrentLevel(levelId);
                    
                    return (
                      <div 
                        key={levelId}
                        className={`map-level-marker ${completed ? 'completed' : ''} ${current ? 'current' : ''}`}
                        title={`Level ${levelNum}`}
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
              <div className="legend-marker completed">✓</div>
              <span>Completed</span>
            </div>
            <div className="legend-item">
              <div className="legend-marker current">●</div>
              <span>Current Level</span>
            </div>
            <div className="legend-item">
              <div className="legend-marker locked">#</div>
              <span>Not Yet Reached</span>
            </div>
          </div>
        </div>

        <div className="map-footer">
          <button className="btn-primary" onClick={onClose}>
            Continue Expedition
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapDisplay;

