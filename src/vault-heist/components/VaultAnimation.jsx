import React, { useEffect, useState } from 'react';

const VaultAnimation = ({ vaultNumber, time }) => {
  const [animationPhase, setAnimationPhase] = useState('unlocking');
  
  useEffect(() => {
    // Phase 1: Unlocking (spinning lock)
    setTimeout(() => setAnimationPhase('cracking'), 2000);
    
    // Phase 2: Cracking (shake and glow)
    setTimeout(() => setAnimationPhase('opening'), 4000);
    
    // Phase 3: Doors opening
    setTimeout(() => setAnimationPhase('explosion'), 6000);
    
    // Phase 4: Cash explosion
    setTimeout(() => setAnimationPhase('complete'), 8000);
  }, []);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Generate MORE cash particles for FULL SCREEN explosion
  const cashParticles = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100, // Full width 0-100%
    delay: Math.random() * 1.2,
    rotation: Math.random() * 360,
    emoji: ['💵', '💰', '💎', '🏆', '💸', '🪙'][Math.floor(Math.random() * 6)]
  }));

  return (
    <div className="vault-animation-container">
      <div className={`vault-door-large phase-${animationPhase}`}>
        
        {/* Vault number at top */}
        <div className="vault-door-number-large">{vaultNumber}</div>
        
        {/* Central lock mechanism - REMOVE dark circle overlay */}
        <div className="vault-lock-mechanism">
          {animationPhase === 'unlocking' && (
            <>
              <div className="lock-wheel spinning">
                <div className="wheel-spoke"></div>
                <div className="wheel-spoke"></div>
                <div className="wheel-spoke"></div>
                <div className="wheel-spoke"></div>
              </div>
              <div className="unlock-text pulsing">CRACKING CODE...</div>
            </>
          )}
          
          {animationPhase === 'cracking' && (
            <>
              <div className="lock-wheel shaking glowing">
                <div className="wheel-spoke"></div>
                <div className="wheel-spoke"></div>
                <div className="wheel-spoke"></div>
                <div className="wheel-spoke"></div>
              </div>
              <div className="unlock-text rapid-pulse">ACCESS GRANTED!</div>
            </>
          )}
        </div>
        
        {/* Vault doors (appear during opening phase) */}
        {(animationPhase === 'opening' || animationPhase === 'explosion' || animationPhase === 'complete') && (
          <>
            <div className="vault-door-left"></div>
            <div className="vault-door-right"></div>
          </>
        )}
        
        {/* Success message */}
        {animationPhase === 'complete' && (
          <div className="vault-complete-message-large">
            <div className="vault-complete-title-large">🎉 VAULT CRACKED! 🎉</div>
            <div className="vault-complete-time-large">⏱️ {formatTime(time)}</div>
            <div className="vault-complete-subtitle">MOVING TO NEXT VAULT...</div>
          </div>
        )}
      </div>
      
      {/* FULL SCREEN Cash explosion - outside the vault container! */}
      {(animationPhase === 'explosion' || animationPhase === 'complete') && (
        <div className="cash-explosion-fullscreen">
          {cashParticles.map(particle => (
            <div
              key={particle.id}
              className="cash-particle-fullscreen"
              style={{
                left: `${particle.left}%`,
                animationDelay: `${particle.delay}s`,
                '--rotation': `${particle.rotation}deg`
              }}
            >
              {particle.emoji}
            </div>
          ))}
          
          {/* Full screen light rays */}
          <div className="light-ray-fullscreen ray-1"></div>
          <div className="light-ray-fullscreen ray-2"></div>
          <div className="light-ray-fullscreen ray-3"></div>
        </div>
      )}
    </div>
  );
};

export default VaultAnimation;
