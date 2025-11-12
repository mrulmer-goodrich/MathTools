import React from 'react';

const VaultGrid = ({ currentSet, vaultsCompleted }) => {
  const vaults = [1, 2, 3, 4, 5, 6];
  
  const getVaultStatus = (vaultNum) => {
    if (vaultsCompleted.includes(vaultNum)) return 'completed';
    if (currentSet === vaultNum) return 'active';
    return 'locked';
  };
  
  const getVaultIcon = (status) => {
    if (status === 'completed') return '✅';
    if (status === 'active') return '🔓';
    return '🔒';
  };

  return (
    <div className="vault-sidebar">
      {vaults.map(num => {
        const status = getVaultStatus(num);
        return (
          <div 
            key={num}
            className={`vault-simple vault-${status}`}
          >
            <div className="vault-number-simple">{num}</div>
            <div className="vault-icon-simple">{getVaultIcon(status)}</div>
          </div>
        );
      })}
    </div>
  );
};

export default VaultGrid;
