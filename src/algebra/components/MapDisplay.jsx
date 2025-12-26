import React from 'react';
import '../styles/map-display.css';

const MapDisplay = ({ completedLevels, currentLevel }) => {
  const getRegionProgress = (regionLevels) => {
    const completed = regionLevels.filter(level => 
      completedLevels.includes(level)
    ).length;
    return (completed / regionLevels.length) * 100;
  };

  const module1Levels = Array.from({length: 16}, (_, i) => i + 1);
  const module2Levels = Array.from({length: 15}, (_, i) => i + 17);
  const module3Levels = [32, 33, 34, 35, 36, 37];

  const module1Progress = getRegionProgress(module1Levels);
  const module2Progress = getRegionProgress(module2Levels);
  const module3Progress = getRegionProgress(module3Levels);

  return (
    <div className="map-container">
      <div className="map-background">
        {/* Module 1: Base Camp - Green */}
        <div 
          className="map-region region-1"
          style={{
            opacity: 0.3 + (module1Progress / 100) * 0.7,
            backgroundImage: 'url(/assets/maps/base-camp.png)'
          }}
        >
          <div className="region-label">Base Camp</div>
          <div className="region-progress">{Math.round(module1Progress)}%</div>
          {currentLevel >= 1 && currentLevel <= 16 && (
            <div 
              className="explorer-marker"
              style={{
                backgroundImage: 'url(/assets/ui/explorer-avatar.png)'
              }}
            >
              📍
            </div>
          )}
        </div>

        {/* Module 2: Territory - Brown */}
        <div 
          className="map-region region-2"
          style={{
            opacity: module1Progress === 100 ? 0.3 + (module2Progress / 100) * 0.7 : 0.1,
            backgroundImage: 'url(/assets/maps/river-crossing.png)'
          }}
        >
          <div className="region-label">Territory</div>
          <div className="region-progress">{Math.round(module2Progress)}%</div>
          {currentLevel >= 17 && currentLevel <= 31 && (
            <div className="explorer-marker">📍</div>
          )}
        </div>

        {/* Module 3: Frontier - Gold */}
        <div 
          className="map-region region-3"
          style={{
            opacity: module2Progress === 100 ? 0.3 + (module3Progress / 100) * 0.7 : 0.1,
            backgroundImage: 'url(/assets/maps/frontier-boundary.png)'
          }}
        >
          <div className="region-label">The Frontier</div>
          <div className="region-progress">{Math.round(module3Progress)}%</div>
          {currentLevel >= 32 && (
            <div className="explorer-marker">📍</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapDisplay;
