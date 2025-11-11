import React from 'react';

const VaultGrid = ({ currentSet, vaultsCompleted }) => {
  const vaults = [1, 2, 3, 4, 5, 6];
  
  const getVaultClass = (vaultNum) => {
    if (vaultsCompleted.includes(vaultNum)) return 'vault-completed';
    if (currentSet === vaultNum) return 'vault-active';
    return 'vault-locked';
  };
  
  const getVaultSize = (vaultNum) => {
    // Vaults get progressively larger
    return 40 + (vaultNum * 8);
  };

  return (
    <div className="vault-grid">
      {vaults.map(num => (
        <div 
          key={num}
          className={`vault-icon ${getVaultClass(num)}`}
          style={{ 
            width: `${getVaultSize(num)}px`,
            height: `${getVaultSize(num)}px`
          }}
        >
          <div className="vault-number">{num}</div>
          {vaultsCompleted.includes(num) && (
            <div className="vault-check">✓</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VaultGrid;
