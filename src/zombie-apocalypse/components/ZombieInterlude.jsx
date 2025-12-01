// ZombieInterlude.jsx
// Version: 4.0
// Zombie clicking mini-game between levels

import React, { useState, useEffect, useRef } from 'react';

const ZombieInterlude = ({ onComplete, playerData }) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [zombiesKilled, setZombiesKilled] = useState(0);
  const [moneyEarned, setMoneyEarned] = useState(0);
  const [zombies, setZombies] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [bittenOverlay, setBittenOverlay] = useState(false);
  const containerRef = useRef(null);
  const zombieIdCounter = useRef(0);

  // Spawn zombies continuously
  useEffect(() => {
    if (gameOver) return;

    const spawnInterval = setInterval(() => {
      if (timeLeft > 0 && zombies.length < 8) {
        spawnZombie();
      }
    }, 800); // Spawn every 0.8 seconds

    return () => clearInterval(spawnInterval);
  }, [timeLeft, zombies.length, gameOver]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameOver]);

  // Check if first zombie reaches end (10 seconds = they arrive)
  useEffect(() => {
    if (timeLeft <= 5 && !bittenOverlay) {
      // If zombies reach the "player" without being clicked
      const reachedZombies = zombies.filter(z => z.progress >= 95);
      if (reachedZombies.length > 0) {
        setBittenOverlay(true);
        setTimeout(() => {
          endGame();
        }, 1500);
      }
    }
  }, [zombies, timeLeft]);

  // Update zombie positions
  useEffect(() => {
    if (gameOver) return;

    const moveInterval = setInterval(() => {
      setZombies(prevZombies => 
        prevZombies.map(zombie => ({
          ...zombie,
          progress: zombie.progress + zombie.speed,
          size: 60 + (zombie.progress * 1.5) // Grow as they approach
        }))
      );
    }, 50);

    return () => clearInterval(moveInterval);
  }, [gameOver]);

  const spawnZombie = () => {
    const newZombie = {
      id: zombieIdCounter.current++,
      lane: Math.floor(Math.random() * 5), // 5 horizontal lanes
      speed: 0.8 + Math.random() * 1.2, // Random speed 0.8-2.0
      progress: 0,
      size: 60,
      zigzag: Math.random() > 0.5, // Some zigzag
      zigzagOffset: 0
    };

    setZombies(prev => [...prev, newZombie]);
  };

  const clickZombie = (zombieId) => {
    setZombies(prev => prev.filter(z => z.id !== zombieId));
    setZombiesKilled(prev => prev + 1);
    setMoneyEarned(prev => prev + 250);
    
    // Play click sound (placeholder)
    // playSound('zombieHit');
  };

  const endGame = () => {
    setGameOver(true);
    setTimeout(() => {
      onComplete(moneyEarned);
    }, 2000);
  };

  return (
    <div className="za-interlude-container" ref={containerRef}>
      {/* Story text */}
      <div className="za-interlude-header">
        <h2 className="za-interlude-title">⚠️ BREACH ALERT ⚠️</h2>
        <p className="za-interlude-story">
          They're coming through the windows, {playerData.name}! 
          Click them before they reach you!
        </p>
      </div>

      {/* Stats */}
      <div className="za-interlude-stats">
        <div className="za-interlude-stat">
          <span className="za-stat-label">Time:</span>
          <span className="za-stat-value">{timeLeft}s</span>
        </div>
        <div className="za-interlude-stat">
          <span className="za-stat-label">Eliminated:</span>
          <span className="za-stat-value">{zombiesKilled} 🧟</span>
        </div>
        <div className="za-interlude-stat">
          <span className="za-stat-label">Earned:</span>
          <span className="za-stat-value">${moneyEarned}</span>
        </div>
      </div>

      {/* Game area */}
      <div className="za-interlude-game-area">
        {/* Render zombies */}
        {zombies.map(zombie => {
          const laneHeight = 20; // Percentage of height per lane
          const baseTop = 20 + (zombie.lane * laneHeight);
          const zigzagAmount = zombie.zigzag ? Math.sin(zombie.progress / 10) * 5 : 0;
          
          return (
            <div
              key={zombie.id}
              className="za-interlude-zombie"
              style={{
                left: `${zombie.progress}%`,
                top: `${baseTop + zigzagAmount}%`,
                width: `${zombie.size}px`,
                height: `${zombie.size}px`,
                cursor: 'crosshair'
              }}
              onClick={() => clickZombie(zombie.id)}
            >
              {/* Placeholder: Will use sprite animation */}
              <div className="za-zombie-sprite" />
            </div>
          );
        })}

        {/* Player position indicator (right side) */}
        <div className="za-player-position">
          <span style={{ fontSize: '48px' }}>🛡️</span>
        </div>
      </div>

      {/* Bitten overlay */}
      {bittenOverlay && (
        <div className="za-bitten-overlay">
          <div className="za-bite-effect">
            💀 TOO SLOW! 💀
          </div>
        </div>
      )}

      {/* Game over message */}
      {gameOver && !bittenOverlay && (
        <div className="za-interlude-complete">
          <h3>SURVIVED!</h3>
          <p>{zombiesKilled} zombies eliminated</p>
          <p className="za-money-big">+${moneyEarned}</p>
        </div>
      )}
    </div>
  );
};

export default ZombieInterlude;
