// LevelComplete.jsx v4.0 - Celebrate with Visuals
import React from 'react';

const LevelComplete = ({ level, playerData, time, formatTime, moneyEarned, totalPot }) => {
  
  const getLevelMessage = () => {
    const messages = {
      1: `The classroom door holds... for now. ${playerData?.friend || 'Your friend'} nods at you. "Nice work with those percentages. We're not dead yet."`,
      2: `You hear the groans fading. The Eastway Jaguars regroup. "${playerData?.name || 'Survivor'}, your calculations bought us time to barricade. Let's move to the cafeteria."`,
      3: `The Traders unlock their supply room. "You proved yourself," DeShawn says, handing you rations. "The kitchen is next. Stay sharp."`,
      4: `You slam the kitchen door shut just in time. The Runners are already planning the next move. "The hallway," Sofia gasps. "The lockers. That's our path to the roof."`,
      5: `The locker corridor clears. Jake from The Fortress slaps your back. "That percentage work? Flawless. The Engineers say they can get us to the roof. One more push."`,
      6: `Maya grins, holding up a keycard. "The Engineers came through. Roof access is open. But ${playerData?.name}... the final calculation decides everything. Seven factions are counting on you."`,
      7: `Should never see this - Victory screen should trigger`
    };
    return messages[level] || `Level ${level} complete. Keep moving.`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      cursor: 'pointer',
      background: 'radial-gradient(ellipse at center, rgba(76,175,80,0.1) 0%, transparent 70%)'
    }}>
      <div style={{
        maxWidth: '700px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Success indicator */}
        <div style={{
          fontSize: '80px',
          margin: '0 0 20px',
          animation: 'bounce 0.6s ease-in-out'
        }}>
          ✓
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '42px',
          color: '#4CAF50',
          textShadow: '0 0 20px rgba(76,175,80,0.8)',
          margin: '0 0 10px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          LEVEL {level} COMPLETE
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#8BC34A',
          margin: '0 0 40px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Survived
        </p>

        {/* Story box */}
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          border: '2px solid rgba(76,175,80,0.5)',
          borderRadius: '10px',
          padding: '25px',
          marginBottom: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.9)',
          backdropFilter: 'blur(4px)'
        }}>
          <p style={{
            fontSize: '15px',
            color: '#DDD',
            lineHeight: '1.8',
            fontStyle: 'italic',
            margin: 0
          }}>
            {getLevelMessage()}
          </p>
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.7)',
            border: '2px solid rgba(255,215,0,0.5)',
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
              Level Earnings
            </p>
            <p style={{
              fontSize: '32px',
              color: '#FFD700',
              fontWeight: 'bold',
              margin: 0,
              fontFamily: "'Courier New', monospace"
            }}>
              +${moneyEarned.toLocaleString()}
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
              Time Taken
            </p>
            <p style={{
              fontSize: '32px',
              color: '#4CAF50',
              fontWeight: 'bold',
              margin: 0,
              fontFamily: "'Courier New', monospace"
            }}>
              {formatTime(time)}
            </p>
          </div>
        </div>

        {/* Total pot */}
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          border: '2px solid rgba(255,215,0,0.6)',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '30px',
          boxShadow: '0 0 30px rgba(255,215,0,0.2)'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#AAA',
            margin: '0 0 8px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Total Resources Secured
          </p>
          <p style={{
            fontSize: '48px',
            color: '#FFD700',
            fontWeight: 'bold',
            margin: 0,
            fontFamily: "'Courier New', monospace",
            textShadow: '0 0 20px rgba(255,215,0,0.6)'
          }}>
            ${totalPot.toLocaleString()}
          </p>
        </div>

        {/* Continue prompt */}
        <div style={{
          padding: '15px 30px',
          background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
          borderRadius: '8px',
          display: 'inline-block',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <p style={{
            color: '#FFF',
            fontSize: '16px',
            fontWeight: 'bold',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            Click to Continue →
          </p>
        </div>

        <p style={{
          fontSize: '11px',
          color: '#444',
          marginTop: '20px'
        }}>
          Click anywhere • Press SPACE • Press ENTER
        </p>
      </div>

      {/* Coin burst overlay (placeholder for coin_burst_anim.png) */}
      {moneyEarned > 0 && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          backgroundImage: 'url(/zombie/coin_burst_anim.png)',
          backgroundSize: '800% 100%',
          animation: 'coinBurst 0.8s steps(8) 1',
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: 1
        }} />
      )}
    </div>
  );
};

export default LevelComplete;
