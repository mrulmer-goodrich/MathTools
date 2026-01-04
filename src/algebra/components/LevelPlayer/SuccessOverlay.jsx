// SuccessOverlay.jsx - EPIC: Gem rain + particles + sparkles + glow
// Location: src/algebra/components/SuccessOverlay.jsx

import React, { useEffect, useState } from 'react';
import '../../styles/algebra.css';

const SuccessOverlay = ({ crystalsEarned = 1 }) => {
  const [animate, setAnimate] = useState(false);
  const [particles, setParticles] = useState([]);
  const [gems, setGems] = useState([]);

  useEffect(() => {
    // Trigger main animation
    setTimeout(() => setAnimate(true), 50);

    // Generate falling gems
    const gemArray = [];
    for (let i = 0; i < 12; i++) {
      gemArray.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 1.5 + Math.random() * 1,
        rotation: Math.random() * 360
      });
    }
    setGems(gemArray);

    // Generate sparkle particles
    const particleArray = [];
    for (let i = 0; i < 30; i++) {
      particleArray.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 40,
        y: 50 + (Math.random() - 0.5) * 40,
        delay: Math.random() * 0.5,
        duration: 0.8 + Math.random() * 0.7
      });
    }
    setParticles(particleArray);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out',
      overflow: 'hidden'
    }}>
      {/* Falling Gems */}
      {gems.map((gem) => (
        <div
          key={gem.id}
          style={{
            position: 'absolute',
            left: `${gem.left}%`,
            top: '-10%',
            fontSize: '2.5rem',
            animation: `gemFall ${gem.duration}s ease-in ${gem.delay}s forwards`,
            transform: `rotate(${gem.rotation}deg)`,
            filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))',
            pointerEvents: 'none'
          }}
        >
          💎
        </div>
      ))}

      {/* Sparkle Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #FFF 0%, #10B981 50%, transparent 100%)',
            animation: `sparkle ${particle.duration}s ease-out ${particle.delay}s`,
            pointerEvents: 'none',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
          }}
        />
      ))}

      {/* Main Success Card */}
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        padding: '3rem 2.5rem',
        textAlign: 'center',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        transform: animate ? 'scale(1)' : 'scale(0.7)',
        opacity: animate ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
        overflow: 'visible',
        border: '4px solid #10B981',
        maxWidth: '400px'
      }}>
        {/* Glowing ring effect */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
          animation: 'pulse 2s ease-in-out infinite',
          pointerEvents: 'none'
        }} />

        {/* Main gem */}
        <div style={{
          fontSize: '5rem',
          marginBottom: '1rem',
          animation: 'bounce 0.6s ease-in-out, glow 2s ease-in-out infinite',
          display: 'inline-block',
          filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.8))',
          position: 'relative',
          zIndex: 1
        }}>
          💎
        </div>

        {/* Success text */}
        <div style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#10B981',
          fontFamily: 'Poppins, sans-serif',
          marginBottom: '0.5rem',
          textShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
          animation: 'slideInUp 0.5s ease-out 0.2s backwards'
        }}>
          +{crystalsEarned} Knowledge Crystal{crystalsEarned !== 1 ? 's' : ''}
        </div>
        
        <div style={{
          fontSize: '1rem',
          color: '#6B7280',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 500,
          animation: 'slideInUp 0.5s ease-out 0.3s backwards'
        }}>
          Excellent work!
        </div>

        {/* Corner sparkles */}
        {[
          { top: '10px', left: '10px', delay: 0 },
          { top: '10px', right: '10px', delay: 0.1 },
          { bottom: '10px', left: '10px', delay: 0.2 },
          { bottom: '10px', right: '10px', delay: 0.3 }
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              ...pos,
              fontSize: '1.5rem',
              animation: `twinkle 1.5s ease-in-out ${pos.delay}s infinite`,
              filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))'
            }}
          >
            ✨
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounce {
          0%, 100% { 
            transform: translateY(0) scale(1); 
          }
          25% { 
            transform: translateY(-30px) scale(1.15); 
          }
          50% { 
            transform: translateY(-10px) scale(1.05); 
          }
          75% { 
            transform: translateY(-20px) scale(1.1); 
          }
        }

        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.8));
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(16, 185, 129, 1));
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }

        @keyframes gemFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes sparkle {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(4) rotate(180deg);
            opacity: 0;
          }
        }

        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SuccessOverlay;
