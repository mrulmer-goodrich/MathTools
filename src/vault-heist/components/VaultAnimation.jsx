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
  
  // Generate MORE cash particles for bigger explosion
  const cashParticles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: 30 + Math.random() * 40,
    delay: Math.random() * 0.8,
    rotation: Math.random() * 360,
    emoji: ['💵', '💰', '💎', '🏆'][Math.floor(Math.random() * 4)]
  }));

  return (
    <div className="vault-animation-container">
      <div className={`vault-door-large phase-${animationPhase}`}>
        
        {/* Vault number at top */}
        <div className="vault-door-number-large">{vaultNumber}</div>
        
        {/* Central lock mechanism */}
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
        
        {/* Cash explosion */}
        {(animationPhase === 'explosion' || animationPhase === 'complete') && (
          <div className="cash-explosion-large">
            {cashParticles.map(particle => (
              <div
                key={particle.id}
                className="cash-particle-large"
                style={{
                  left: `${particle.left}%`,
                  animationDelay: `${particle.delay}s`,
                  '--rotation': `${particle.rotation}deg`
                }}
              >
                {particle.emoji}
              </div>
            ))}
            
            {/* Light rays */}
            <div className="light-ray ray-1"></div>
            <div className="light-ray ray-2"></div>
            <div className="light-ray ray-3"></div>
          </div>
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
    </div>
  );
};

export default VaultAnimation;
