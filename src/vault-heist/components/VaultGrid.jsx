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
      {/* Lock body */}
      <rect 
        x="6" y="11" width="12" height="10" 
        rx="2" 
        fill={isActive ? "#1a4d5a" : "#2c3642"}
        stroke={isActive ? "#00d4ff" : "#556677"}
        strokeWidth="2"
      />
      {/* Lock shackle */}
      <path 
        d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" 
        stroke={isActive ? "#00d4ff" : "#556677"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Keyhole */}
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
      {/* Outer dial circle */}
      <circle 
        cx="12" cy="12" r="9" 
        fill="#1a4d5a"
        stroke="#00d4ff"
        strokeWidth="2"
      />
      {/* Tick marks */}
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
      {/* Center indicator */}
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
      {/* Center hub */}
      <circle cx="12" cy="12" r="2" fill="#00d4ff" />
      {/* Glow effect */}
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

  // SVG Open Vault Icon Component
  const OpenVaultIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
      {/* Open doors - left */}
      <path 
        d="M4 6 L4 18 L9 18 L9 6 Z" 
        fill="#27ae60"
        stroke="#229954"
        strokeWidth="1.5"
        opacity="0.9"
      />
      {/* Open doors - right */}
      <path 
        d="M15 6 L15 18 L20 18 L20 6 Z" 
        fill="#27ae60"
        stroke="#229954"
        strokeWidth="1.5"
        opacity="0.9"
      />
      {/* Interior glow */}
      <rect 
        x="9" y="7" width="6" height="10" 
        fill="url(#goldGradient)"
      />
      {/* Treasure stacks */}
      <rect x="10" y="13" width="1.5" height="3" fill="#f1c40f" opacity="0.9" />
      <rect x="12" y="12" width="1.5" height="4" fill="#f39c12" opacity="0.9" />
      <rect x="14" y="13.5" width="1.5" height="2.5" fill="#f1c40f" opacity="0.9" />
      {/* Sparkle effect */}
      <circle cx="11" cy="10" r="0.5" fill="#fff">
        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="13.5" cy="9" r="0.5" fill="#fff">
        <animate attributeName="opacity" values="0;1;0" dur="2.5s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <defs>
        <radialGradient id="goldGradient">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#f39c12" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#e67e22" stopOpacity="0.4" />
        </radialGradient>
      </defs>
    </svg>
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
            }}
          >
            {/* Vault number badge in top-right */}
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
              }}
            >
              {num}
            </div>
            
            {/* Center icon based on status - NO EMOJIS, pure SVG */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {status === 'locked' && <LockIcon isActive={false} />}
              {status === 'active' && <DialIcon />}
              {status === 'completed' && <OpenVaultIcon />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VaultGrid;
