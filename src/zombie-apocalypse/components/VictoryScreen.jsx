import React, { useState, useEffect } from 'react';

const VictoryScreen = ({ 
  playerData, 
  levelStats, 
  totalDeaths, 
  totalTime, 
  formatTime, 
  onRestart 
}) => {
  const [phase, setPhase] = useState(1); // 1: initial, 2: stats, 3: final message
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    // Phase 1: Victory announcement (3 seconds)
    const timer1 = setTimeout(() => {
      setPhase(2);
      setShowStats(true);
    }, 3000);

    // Phase 2: Stats display (5 seconds)
    const timer2 = setTimeout(() => {
      setPhase(3);
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const calculateTotalLevelTime = () => {
    let total = 0;
    Object.values(levelStats).forEach(stat => {
      if (stat && stat.time) total += stat.time;
    });
    return total;
  };

  return (
    <div className="za-victory-screen">
      <div className="za-victory-particles">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="za-particle" 
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className={`za-victory-content phase-${phase}`}>
        {phase === 1 && (
          <div className="za-victory-phase-1">
            <div className="za-victory-icon-big">🎉</div>
            <h1 className="za-victory-title-big">VICTORY!</h1>
            <p className="za-victory-subtitle">The Elites Have Fallen</p>
          </div>
        )}

        {phase >= 2 && (
          <div className="za-victory-phase-2">
            <h1 className="za-victory-title">YOU SURVIVED THE APOCALYPSE!</h1>
            
            {showStats && (
              <div className="za-victory-stats">
                <div className="za-stat-row">
                  <span className="za-stat-label">Survivor:</span>
                  <span className="za-stat-value">{playerData.playerName}</span>
                </div>
                <div className="za-stat-row">
                  <span className="za-stat-label">Faction:</span>
                  <span className="za-stat-value">The {playerData.favoriteColor || 'Red'} Squad</span>
                </div>
                <div className="za-stat-row">
                  <span className="za-stat-label">Total Time:</span>
                  <span className="za-stat-value">{formatTime(totalTime)}</span>
                </div>
                <div className="za-stat-row">
                  <span className="za-stat-label">Deaths:</span>
                  <span className="za-stat-value">{totalDeaths}</span>
                </div>
                <div className="za-stat-row">
                  <span className="za-stat-label">Territory Secured:</span>
                  <span className="za-stat-value">{playerData.cityName}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === 3 && (
          <div className="za-victory-phase-3">
            <div className="za-victory-final-message">
              <p className="za-victory-text">
                {playerData.playerName}, you've saved {playerData.cityName}!
              </p>
              <p className="za-victory-text">
                You are the <span className="za-victory-highlight">PERCENT MASTER!</span>
              </p>
              <p className="za-victory-text">
                This is what Mr. UG has prepared you for... sort of.
              </p>
              <p className="za-victory-text-small">
                {playerData.friendName} {playerData.biggestFear && `and your fear of ${playerData.biggestFear}`} couldn't stop you.
              </p>
            </div>

            <div className="za-victory-buttons">
              <button className="za-victory-btn" onClick={onRestart}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VictoryScreen;
