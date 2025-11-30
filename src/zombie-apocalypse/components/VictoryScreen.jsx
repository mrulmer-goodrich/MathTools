// VictoryScreen.jsx
// VERSION: 3.0.0
// Last Updated: November 30, 2024
// Changes: EPIC FINALE - Ride or Die theme, bigger graphics, removed Mr. UG/fear references, fixed "Eastway Jaguars"

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
    // Phase 1: VICTORY ROAR (4 seconds)
    const timer1 = setTimeout(() => {
      setPhase(2);
      setShowStats(true);
    }, 4000);

    // Phase 2: Stats display (6 seconds)
    const timer2 = setTimeout(() => {
      setPhase(3);
    }, 10000);

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
      {/* Massive particle effects */}
      <div className="za-victory-particles">
        {[...Array(100)].map((_, i) => (
          <div 
            key={i} 
            className="za-particle" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
              opacity: 0.3 + Math.random() * 0.7
            }}
          />
        ))}
      </div>

      {/* Zombie defeat icons scattered */}
      <div className="za-zombie-defeat">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="za-zombie-icon"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              animationDelay: `${Math.random() * 2}s`,
              fontSize: `${20 + Math.random() * 40}px`
            }}
          >
            🧟💀
          </div>
        ))}
      </div>

      <div className={`za-victory-content phase-${phase}`}>
        {phase === 1 && (
          <div className="za-victory-phase-1">
            <div className="za-victory-icon-massive">🎯🔥⚔️</div>
            <h1 className="za-victory-title-massive">SURVIVORS!</h1>
            <p className="za-victory-subtitle-big">THE APOCALYPSE IS OVER</p>
            <div className="za-victory-tagline">You and {playerData.friendName} Are the Last Standing</div>
          </div>
        )}

        {phase >= 2 && (
          <div className="za-victory-phase-2">
            <h1 className="za-victory-title-epic">🏆 EASTWAY JAGUARS REIGN SUPREME! 🏆</h1>
            
            {showStats && (
              <div className="za-victory-stats-epic">
                <div className="za-stat-epic">
                  <span className="za-stat-icon">👤</span>
                  <div className="za-stat-content">
                    <div className="za-stat-label">Survivors</div>
                    <div className="za-stat-value-big">{playerData.playerName} & {playerData.friendName}</div>
                  </div>
                </div>
                
                <div className="za-stat-epic">
                  <span className="za-stat-icon">🏆</span>
                  <div className="za-stat-content">
                    <div className="za-stat-label">Squad</div>
                    <div className="za-stat-value-big">Eastway Jaguars</div>
                  </div>
                </div>
                
                <div className="za-stat-epic">
                  <span className="za-stat-icon">⏱️</span>
                  <div className="za-stat-content">
                    <div className="za-stat-label">Survival Time</div>
                    <div className="za-stat-value-big">{formatTime(totalTime)}</div>
                  </div>
                </div>
                
                <div className="za-stat-epic">
                  <span className="za-stat-icon">{totalDeaths === 0 ? '🌟' : '💀'}</span>
                  <div className="za-stat-content">
                    <div className="za-stat-label">Deaths</div>
                    <div className="za-stat-value-big">{totalDeaths === 0 ? 'PERFECT RUN!' : totalDeaths}</div>
                  </div>
                </div>
                
                <div className="za-stat-epic">
                  <span className="za-stat-icon">🏙️</span>
                  <div className="za-stat-content">
                    <div className="za-stat-label">Territory Secured</div>
                    <div className="za-stat-value-big">{playerData.cityName}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === 3 && (
          <div className="za-victory-phase-3">
            <div className="za-victory-final-message-epic">
              <div className="za-victory-banner">
                <span className="za-banner-icon">⚔️</span>
                RIDE OR DIE
                <span className="za-banner-icon">⚔️</span>
              </div>
              
              <p className="za-victory-text-epic">
                <span className="za-highlight-massive">{playerData.playerName}</span>, you and <span className="za-highlight-massive">{playerData.friendName}</span> fought together.
              </p>
              
              <p className="za-victory-text-epic">
                Seven levels. Seven trials. One wrong move would have killed you both.
              </p>
              
              <p className="za-victory-text-epic">
                But you <span className="za-highlight-gold">CALCULATED</span> your way to victory.
              </p>
              
              <p className="za-victory-text-epic">
                The other factions fell because they couldn't master percents.
              </p>
              
              <p className="za-victory-text-epic za-final-line">
                You survived because <span className="za-highlight-massive">MATH SAVES LIVES.</span>
              </p>

              <div className="za-survivors-count">
                Final Survivors in {playerData.cityName}: <span className="za-count-big">2</span>
              </div>

              <div className="za-victory-achievement">
                🏆 ACHIEVEMENT UNLOCKED 🏆
                <div className="za-achievement-title">PERCENT MASTER</div>
                <div className="za-achievement-subtitle">Survived the Mathematical Apocalypse</div>
              </div>
            </div>

            <div className="za-victory-buttons">
              <button className="za-victory-btn-epic" onClick={onRestart}>
                🔄 Face the Apocalypse Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VictoryScreen;
