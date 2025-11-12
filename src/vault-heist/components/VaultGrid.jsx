import React from 'react';

const VaultGrid = ({ currentSet, vaultsCompleted }) => {
  const vaults = [1, 2, 3, 4, 5, 6];
  
  const getVaultStatus = (vaultNum) => {
    if (vaultsCompleted.includes(vaultNum)) return 'completed';
    if (currentSet === vaultNum) return 'active';
    return 'locked';
  };

  // SVG Lock Icon Component
  const LockIcon = ({ isActive }) => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <rect 
        x="6" y="11" width="12" height="10" 
        rx="2" 
        fill={isActive ? "#1a4d5a" : "#2c3642"}
        stroke={isActive ? "#00d4ff" : "#556677"}
        strokeWidth="2"
      />
      <path 
        d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" 
        stroke={isActive ? "#00d4ff" : "#556677"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle 
        cx="12" cy="15" r="1.5" 
        fill={isActive ? "#00d4ff" : "#7f8c8d"}
      />
      <rect 
        x="11.5" y="15.5" width="1" height="3" 
        fill={isActive ? "#00d4ff" : "#7f8c8d"}
      />
      {isActive && (
        <circle 
          cx="12" cy="15" r="4" 
          fill="none"
          stroke="#00d4ff"
          strokeWidth="0.5"
          opacity="0.5"
        >
          <animate 
            attributeName="r" 
            from="3" to="6" 
            dur="1.5s" 
            repeatCount="indefinite"
          />
          <animate 
            attributeName="opacity" 
            from="0.5" to="0" 
            dur="1.5s" 
            repeatCount="indefinite"
          />
        </circle>
      )}
    </svg>
  );

  // SVG Dial/Wheel Icon Component
  const DialIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <circle 
        cx="12" cy="12" r="9" 
        fill="#1a4d5a"
        stroke="#00d4ff"
        strokeWidth="2"
      />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <line
          key={i}
          x1="12"
          y1="4"
          x2="12"
          y2="6.5"
          stroke="#00d4ff"
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
      <line 
        x1="12" y1="12" x2="12" y2="6" 
        stroke="#00d4ff"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="3s"
          repeatCount="indefinite"
        />
      </line>
      <circle cx="12" cy="12" r="2" fill="#00d4ff" />
      <circle 
        cx="12" cy="12" r="9" 
        fill="none"
        stroke="#00d4ff"
        strokeWidth="1"
        opacity="0.3"
      >
        <animate 
          attributeName="r" 
          from="9" to="11" 
          dur="2s" 
          repeatCount="indefinite"
        />
        <animate 
          attributeName="opacity" 
          from="0.3" to="0" 
          dur="2s" 
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );

  // Completed Vault - STATIC (no looping animations!)
  const CompletedVault = () => (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* LEFT DOOR - Already open (no animation, just final state) */}
      <div style={{
        position: 'absolute',
        width: '42%',
        height: '90%',
        left: '2%',
        top: '5%',
        background: 'linear-gradient(145deg, #2ecc71, #27ae60)',
        border: '3px solid #229954',
        borderRadius: '8px 0 0 8px',
        transformOrigin: 'left center',
        transformStyle: 'preserve-3d',
        transform: 'perspective(400px) rotateY(-75deg)', // Final static position
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Door handle */}
        <div style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '6px',
          height: '20px',
          background: '#1e8449',
          borderRadius: '3px'
        }} />
      </div>

      {/* RIGHT DOOR - Already open (no animation, just final state) */}
      <div style={{
        position: 'absolute',
        width: '42%',
        height: '90%',
        right: '2%',
        top: '5%',
        background: 'linear-gradient(145deg, #2ecc71, #27ae60)',
        border: '3px solid #229954',
        borderRadius: '0 8px 8px 0',
        transformOrigin: 'right center',
        transformStyle: 'preserve-3d',
        transform: 'perspective(400px) rotateY(75deg)', // Final static position
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Door handle */}
        <div style={{
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '6px',
          height: '20px',
          background: '#1e8449',
          borderRadius: '3px'
        }} />
      </div>

      {/* TREASURE INTERIOR - Static glow */}
      <div style={{
        position: 'absolute',
        width: '65%',
        height: '65%',
        background: 'radial-gradient(circle at center, #ffd700 0%, #f39c12 50%, #e67e22 100%)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.6)'
      }}>
        {/* Treasure SVG - static (no animations) */}
        <svg width="35" height="35" viewBox="0 0 24 24" fill="none">
          {/* Gold bars stacked */}
          <rect x="6" y="13" width="4" height="6" fill="#f1c40f" stroke="#e67e22" strokeWidth="0.5" />
          <rect x="10" y="11" width="4" height="8" fill="#f39c12" stroke="#e67e22" strokeWidth="0.5" />
          <rect x="14" y="13" width="4" height="6" fill="#f1c40f" stroke="#e67e22" strokeWidth="0.5" />
          
          {/* Static sparkles (no animation on completed vaults) */}
          <circle cx="8" cy="9" r="1" fill="#fff" opacity="0.8" />
          <circle cx="16" cy="8" r="1" fill="#fff" opacity="0.6" />
          <circle cx="12" cy="7" r="0.8" fill="#fff" opacity="0.7" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="vault-sidebar">
      {vaults.map(num => {
        const status = getVaultStatus(num);
        return (
          <div 
            key={num}
            className={`vault-simple vault-${status}`}
            style={{
              width: '80px',
              height: '80px',
              background: status === 'completed' 
                ? 'linear-gradient(145deg, #27ae60, #1e8449)' 
                : 'linear-gradient(145deg, #2c3e50, #1a252f)',
              border: status === 'active' 
                ? '3px solid #00d4ff' 
                : status === 'completed'
                ? '3px solid #27ae60'
                : '3px solid #34495e',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: status === 'active'
                ? '0 0 20px rgba(0, 212, 255, 0.6)'
                : status === 'completed'
                ? '0 0 15px rgba(39, 174, 96, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.5)',
              opacity: status === 'locked' ? 0.6 : 1,
              transition: 'all 0.3s ease',
              overflow: 'hidden',
            }}
          >
            {/* Vault number badge */}
            <div 
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: status === 'active' 
                  ? 'rgba(0, 212, 255, 0.2)' 
                  : 'rgba(0, 0, 0, 0.6)',
                color: '#00d4ff',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                border: `2px solid ${status === 'active' ? '#00d4ff' : '#34495e'}`,
                boxShadow: status === 'active' ? '0 0 8px rgba(0, 212, 255, 0.6)' : 'none',
                zIndex: 10,
              }}
            >
              {num}
            </div>
            
            {/* Vault content based on status */}
            {status === 'locked' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LockIcon isActive={false} />
              </div>
            )}
            
            {status === 'active' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DialIcon />
              </div>
            )}
            
            {status === 'completed' && <CompletedVault />}
          </div>
        );
      })}
    </div>
  );
};

export default VaultGrid;
