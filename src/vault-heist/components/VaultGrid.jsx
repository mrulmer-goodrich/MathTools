import React from 'react';

const VaultGrid = ({ currentSet, vaultsCompleted }) => {
  const vaults = [1, 2, 3, 4, 5, 6];
  
  const getVaultStatus = (vaultNum) => {
    if (vaultsCompleted.includes(vaultNum)) return 'completed';
    if (currentSet === vaultNum) return 'active';
    return 'locked';
  };

  return (
    <div className="vault-sidebar">
      {vaults.map(num => {
        const status = getVaultStatus(num);
        return (
          <div 
            key={num}
            className={`vault-door-icon vault-${status}`}
          >
            {/* Vault door design */}
            <div className="vault-frame">
              <div className="vault-door-front">
                {/* Vault number badge */}
                <div className="vault-number-badge">{num}</div>
                
                {/* LOCKED STATE - Show lock mechanism */}
                {status === 'locked' && (
                  <div className="vault-lock">
                    <div className="lock-circle">
                      <div className="lock-line lock-line-1"></div>
                      <div className="lock-line lock-line-2"></div>
                    </div>
                  </div>
                )}
                
                {/* ACTIVE STATE - Pulsing lock with glow */}
                {status === 'active' && (
                  <div className="vault-lock pulsing">
                    <div className="lock-circle active">
                      <div className="lock-line lock-line-1"></div>
                      <div className="lock-line lock-line-2"></div>
                    </div>
                  </div>
                )}
                
                {/* COMPLETED STATE - Open doors with treasure */}
                {status === 'completed' && (
                  <div className="vault-open">
                    <div className="open-door-left"></div>
                    <div className="open-door-right"></div>
                    <div className="vault-interior">
                      {/* SVG diamond/treasure icon instead of emoji */}
                      <svg 
                        viewBox="0 0 24 24" 
                        width="24" 
                        height="24"
                        className="cash-icon"
                      >
                        <path 
                          fill="#f1c40f" 
                          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                          stroke="#f39c12"
                          strokeWidth="1"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VaultGrid;
