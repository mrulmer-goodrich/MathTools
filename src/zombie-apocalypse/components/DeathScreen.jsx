// DeathScreen.jsx v4.1 - FIXED
import React, { useEffect, useState } from 'react';

const DeathScreen = ({ currentLevel, playerData, onRestartLevel }) => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  const getDeathMessage = () => {
    const messages = {
      1: `The classroom door splintered. ${playerData?.friend || 'Your friend'} screamed your name, but the numbers... the numbers didn't add up in time.`,
      2: `You tried. ${playerData?.name || 'Survivor'}, you really tried. But when the calculations failed, so did our defenses. The Eastway Jaguars... scattered.`,
      3: `The Traders closed their doors. No supplies. No help. The cafeteria became a tomb, and your mistakes... they cost us everything.`,
      4: `The kitchen breach was too fast. Too many. Your miscalculations meant we couldn't ration properly. Starvation or infection - we never got to choose.`,
      5: `The hallway of lockers became a hallway of horrors. Wrong answers echoed like gunshots. Each mistake brought them closer. You fought well, but math... math doesn't forgive.`,
      6: `So close to the roof. The Engineers had the code ready. But your calculations... one wrong number and the door stayed locked. They came from behind.`,
      7: `All seven factions pooled their hope into you, ${playerData?.name || 'survivor'}. The helicopter was in the air. But the final percentage... you got it wrong. The pilot turned back. We never stood a chance.`
    };
    return messages[currentLevel] || `The outbreak claimed another victim. ${playerData?.name || 'Survivor'} fought bravely, but the math... the math was unforgiving.`;
  };

  const handleTryAgain = () => {
    if (onRestartLevel) {
      onRestartLevel();
    } else {
      // Fallback to reload if onRestartLevel not provided
      window.location.reload();
    }
  };

  return (
    <div 
      className="za-death-screen"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(80,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 2s ease-in',
        padding: '20px'
      }}
    >
      {/* Overrun classroom background (placeholder for death_overrun.png) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/zombie/death_overrun.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.2,
        filter: 'grayscale(100%)'
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        maxWidth: '700px',
        textAlign: 'center',
        zIndex: 1
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '64px',
          color: '#DC143C',
          textShadow: '0 0 30px rgba(220,20,60,1), 0 0 60px rgba(220,20,60,0.8)',
          margin: '0 0 40px',
          fontWeight: 'bold',
          letterSpacing: '4px',
          animation: 'pulseRed 2s ease-in-out infinite'
        }}>
          INFECTED
        </h1>

        {/* Level indicator */}
        <p style={{
          fontSize: '18px',
          color: '#999',
          margin: '0 0 30px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Fell at Level {currentLevel}
        </p>

        {/* Story box */}
        <div style={{
          background: 'rgba(0,0,0,0.85)',
          border: '2px solid rgba(139,0,0,0.6)',
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '40px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.9)',
          backdropFilter: 'blur(4px)'
        }}>
          <p style={{
            fontSize: '16px',
            color: '#DDD',
            lineHeight: '1.8',
            fontStyle: 'italic',
            margin: 0
          }}>
            {getDeathMessage()}
          </p>
        </div>

        {/* Epitaph */}
        <p style={{
          fontSize: '14px',
          color: '#666',
          margin: '0 0 40px',
          lineHeight: '1.6'
        }}>
          {playerData?.name || 'Survivor'} - Eastway Middle School<br/>
          "They tried to calculate their way out.<br/>
          The numbers didn't lie... but they ran out of time."
        </p>

        {/* Restart button */}
        <button
          onClick={handleTryAgain}
          style={{
            padding: '15px 40px',
            background: 'linear-gradient(135deg, #DC143C, #8B0000)',
            border: 'none',
            borderRadius: '8px',
            color: '#FFF',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            boxShadow: '0 4px 20px rgba(220,20,60,0.6)'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 8px 30px rgba(220,20,60,0.8)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 20px rgba(220,20,60,0.6)';
          }}
        >
          Try Again
        </button>
      </div>

      {/* Ambient zombie shadows */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '200px',
        backgroundImage: 'url(/zombie/zombie_horde_bg_1.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'bottom',
        opacity: 0.3,
        filter: 'blur(2px)'
      }} />
    </div>
  );
};

export default DeathScreen;
