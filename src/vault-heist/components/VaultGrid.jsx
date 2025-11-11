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
                <div className="vault-number-badge">{num}</div>
                
                {status === 'locked' && (
                  <div className="vault-lock">
                    <div className="lock-circle">
                      <div className="lock-line lock-line-1"></div>
                      <div className="lock-line lock-line-2"></div>
                    </div>
                  </div>
                )}
                
                {status === 'active' && (
                  <div className="vault-lock pulsing">
                    <div className="lock-circle active">
                      <div className="lock-line lock-line-1"></div>
                      <div className="lock-line lock-line-2"></div>
                    </div>
                  </div>
                )}
                
                {status === 'completed' && (
                  <div className="vault-open">
                    <div className="open-door-left"></div>
                    <div className="open-door-right"></div>
                    <div className="vault-interior">
                      <span className="cash-icon">💰</span>
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
