// VictoryScreen.jsx v4.0 - Cinematic Victory Sequence 
import React, { useEffect, useState } from 'react';

const VictoryScreen = ({ playerData, totalTime, formatTime, finalMoney, onRestart }) => {
  const [fadeIn, setFadeIn] = useState(false);
  const [showHelicopter, setShowHelicopter] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
    setTimeout(() => setShowHelicopter(true), 1500);
  }, []);

  // Calculate grade based on performance
  const getGrade = () => {
    if (finalMoney >= 400000) return { grade: 'S', color: '#FFD700', text: 'LEGENDARY' };
    if (finalMoney >= 300000) return { grade: 'A+', color: '#4CAF50', text: 'EXCELLENT' };
    if (finalMoney >= 200000) return { grade: 'A', color: '#8BC34A', text: 'GREAT' };
    if (finalMoney >= 150000) return { grade: 'B', color: '#FFC107', text: 'GOOD' };
    return { grade: 'C', color: '#FF9800', text: 'SURVIVED' };
  };

  const performance = getGrade();

  return (
    <div 
      className="za-victory-screen"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(255,140,0,0.2) 0%, rgba(0,0,0,0.95) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 2s ease-in',
        padding: '20px',
        overflow: 'hidden'
      }}
    >
      {/* Sunrise background (placeholder for victory_sunrise.png) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/zombie/victory_sunrise.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.4
      }} />

      {/* Helicopter animation (placeholder for victory_helicopter_anim.png) */}
      {showHelicopter && (
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '200px',
          height: '200px',
          backgroundImage: 'url(/zombie/victory_helicopter_anim.png)',
          backgroundSize: '800% 100%',
          animation: 'helicopterRotor 0.6s steps(8) infinite, helicopterLand 4s ease-in-out',
          filter: 'drop-shadow(0 0 20px rgba(255,140,0,0.6))',
          opacity: showHelicopter ? 1 : 0,
          transition: 'opacity 1s'
        }} />
      )}

      {/* Content */}
      <div style={{
        position: 'relative',
        maxWidth: '800px',
        textAlign: 'center',
        zIndex: 1
      }}>
        {/* Performance Grade */}
        <div style={{
          fontSize: '120px',
          fontWeight: 'bold',
          color: performance.color,
          textShadow: `0 0 40px ${performance.color}, 0 0 80px ${performance.color}`,
          margin: '0 0 10px',
          animation: 'pulseGlow 2s ease-in-out infinite'
        }}>
          {performance.grade}
        </div>

        <p style={{
          fontSize: '24px',
          color: performance.color,
          margin: '0 0 40px',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          fontWeight: 'bold'
        }}>
          {performance.text}
        </p>

        {/* Title */}
        <h1 style={{
          fontSize: '48px',
          color: '#FFD700',
          textShadow: '0 0 30px rgba(255,215,0,1), 0 0 60px rgba(255,215,0,0.6)',
          margin: '0 0 20px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '3px'
        }}>
          EASTWAY SURVIVES
        </h1>

        {/* Story */}
        <div style={{
          background: 'rgba(0,0,0,0.85)',
          border: '2px solid rgba(255,215,0,0.5)',
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.9)',
          backdropFilter: 'blur(4px)'
        }}>
          <p style={{
            fontSize: '16px',
            color: '#DDD',
            lineHeight: '1.8',
            margin: '0 0 20px',
            fontStyle: 'italic'
          }}>
            You did it, {playerData?.name || 'survivor'}! The helicopter just touched down 
            on the roof. All seven factions survived because you kept your head when everyone 
            else was losing theirs. {playerData?.friend || 'Your friend'} is safe. The Eastway 
            Jaguars are boarding now.
          </p>
          <p style={{
            fontSize: '14px',
            color: '#999',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Charlotte's streets may be lost, but Eastway Middle School will remember this day. 
            When math became the difference between life and death, you calculated perfectly.
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.7)',
            border: '2px solid rgba(76,175,80,0.5)',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#888',
              margin: '0 0 8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Final Resources
            </p>
            <p style={{
              fontSize: '28px',
              color: '#FFD700',
              fontWeight: 'bold',
              margin: 0,
              fontFamily: "'Courier New', monospace"
            }}>
              ${finalMoney.toLocaleString()}
            </p>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.7)',
            border: '2px solid rgba(76,175,80,0.5)',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#888',
              margin: '0 0 8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Survival Time
            </p>
            <p style={{
              fontSize: '28px',
              color: '#4CAF50',
              fontWeight: 'bold',
              margin: 0,
              fontFamily: "'Courier New', monospace"
            }}>
              {formatTime(totalTime)}
            </p>
          </div>
        </div>

        {/* Faction Summary */}
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          border: '2px solid rgba(255,215,0,0.3)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#FFD700',
            margin: '0 0 15px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            letterSpacing: '2px'
          }}>
            All Seven Factions Rescued
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            {[
              '🐆 Jaguars', '⚡ Runners', '💰 Traders', '🔍 Scavengers',
              '🏰 Fortress', '⚙️ Engineers', '👑 Elites'
            ].map((faction, i) => (
              <span key={i} style={{
                fontSize: '13px',
                color: '#4CAF50',
                padding: '6px 12px',
                background: 'rgba(76,175,80,0.1)',
                borderRadius: '4px',
                border: '1px solid rgba(76,175,80,0.3)'
              }}>
                {faction} ✓
              </span>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onRestart}
            style={{
              padding: '15px 35px',
              background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
              border: 'none',
              borderRadius: '8px',
              color: '#FFF',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              boxShadow: '0 4px 20px rgba(76,175,80,0.6)'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 8px 30px rgba(76,175,80,0.8)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 20px rgba(76,175,80,0.6)';
            }}
          >
            Play Again
          </button>

          <a
            href="/"
            style={{
              padding: '15px 35px',
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid #666',
              borderRadius: '8px',
              color: '#AAA',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Home
          </a>
        </div>

        <p style={{
          fontSize: '11px',
          color: '#444',
          marginTop: '20px'
        }}>
          Press R to play again • H for home
        </p>
      </div>

      {/* Group photo overlay (placeholder for victory_group_photo.png) */}
      <div style={{
        position: 'absolute',
        bottom: '-50px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        maxWidth: '1000px',
        height: '300px',
        backgroundImage: 'url(/zombie/victory_group_photo.png)',
        backgroundSize: 'contain',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat',
        opacity: 0.6,
        filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.4))'
      }} />
    </div>
  );
};

export default VictoryScreen;
