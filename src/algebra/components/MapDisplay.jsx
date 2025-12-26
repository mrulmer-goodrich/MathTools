import React from 'react';

const MapDisplay = ({ progress, onClose }) => {
  const getModuleStatus = (moduleNum) => {
    if (moduleNum === 1) return 'unlocked';
    return progress.unlockedModules.includes(moduleNum) ? 'unlocked' : 'locked';
  };

  const getModuleCompletion = (moduleNum) => {
    const moduleLevels = {
      1: 15,
      2: 10,
      3: 6
    };
    
    const completed = progress.completedLevels.filter(id => 
      id.startsWith(`${moduleNum}-`)
    ).length;
    
    return Math.round((completed / moduleLevels[moduleNum]) * 100);
  };

  return (
    <div className="map-overlay">
      <div className="map-display">
        <div className="map-header">
          <h2>Expedition Map</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="map-content">
          <div className="map-regions">
            <div className={`map-region module-1 ${getModuleStatus(1)}`}>
              <h3>Module 1: Base Camp Preparations</h3>
              <div className="region-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${getModuleCompletion(1)}%` }}
                  />
                </div>
                <span>{getModuleCompletion(1)}% Complete</span>
              </div>
              <p className="region-description">
                Establish base camp and master foundational skills
              </p>
            </div>

            <div className={`map-region module-2 ${getModuleStatus(2)}`}>
              <h3>Module 2: Charting the Territory</h3>
              <div className="region-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${getModuleCompletion(2)}%` }}
                  />
                </div>
                <span>{getModuleCompletion(2)}% Complete</span>
              </div>
              <p className="region-description">
                Navigate through equation-solving challenges
              </p>
            </div>

            <div className={`map-region module-3 ${getModuleStatus(3)}`}>
              <h3>Module 3: The Frontier</h3>
              <div className="region-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${getModuleCompletion(3)}%` }}
                  />
                </div>
                <span>{getModuleCompletion(3)}% Complete</span>
              </div>
              <p className="region-description">
                Master inequalities at the expedition's edge
              </p>
            </div>
          </div>

          {progress.badges.length > 0 && (
            <div className="map-badges">
              <h3>Badges Earned</h3>
              <div className="badge-collection">
                {progress.badges.map((badge, index) => (
                  <div key={index} className="badge-item">
                    <div className="badge-icon">🏆</div>
                    <div className="badge-name">{badge}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapDisplay;
