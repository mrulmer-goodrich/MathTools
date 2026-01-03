// FloatingUI.jsx - Stats, Map, and Badges as floating emoji buttons
// Location: src/algebra/components/FloatingUI.jsx

import React from 'react';
import '../styles/algebra.css';

const FloatingUI = ({ 
  onViewStats, 
  onViewMap, 
  badges 
}) => {
  return (
    <>
      {/* Right side: Stats and Map */}
      <div className="floating-ui-container">
        {onViewStats && (
          <button 
            className="floating-btn"
            onClick={onViewStats}
            title="View Statistics"
            aria-label="View Statistics"
          >
            📊
          </button>
        )}
        
        {onViewMap && (
          <button 
            className="floating-btn"
            onClick={onViewMap}
            title="View Map"
            aria-label="View Map"
          >
            🗺️
          </button>
        )}
      </div>

      {/* Left side: Badges */}
      {badges && badges.length > 0 && (
        <div className="floating-badges">
          {badges.map((badge, index) => (
            <div 
              key={index} 
              className="badge-mini-float"
              title={`Badge: ${badge}`}
            >
              {badge}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FloatingUI;
