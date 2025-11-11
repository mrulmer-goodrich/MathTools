import React, { useEffect, useState } from 'react';

const VaultAnimation = ({ vaultNumber, time }) => {
  const [animationPhase, setAnimationPhase] = useState('opening');
  
  useEffect(() => {
    // Opening phase
    setTimeout(() => setAnimationPhase('cash'), 1000);
    
    // Cash explosion phase
    setTimeout(() => setAnimationPhase('complete'), 2000);
  }, []);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Generate random cash particles
  const cashParticles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5
  }));

  return (
    <div className="vault-animation-container">
      <div className={`vault-door ${animationPhase}`}>
        <div className="vault-door-number">{vaultNumber}</div>
        
        {animationPhase === 'opening' && (
          <div className="vault-status">UNLOCKING...</div>
        )}
        
        {animationPhase !== 'opening' && (
          <>
            <div className="cash-explosion">
              {cashParticles.map(particle => (
                <div
                  key={particle.id}
                  className="cash-particle"
                  style={{
                    left: `${particle.left}%`,
                    animationDelay: `${particle.delay}s`
                  }}
                >
                  💵
                </div>
              ))}
            </div>
            
            <div className="vault-complete-message">
              <div className="vault-complete-title">VAULT CRACKED!</div>
              <div className="vault-complete-time">Time: {formatTime(time)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VaultAnimation;
