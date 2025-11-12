import React, { useState } from 'react';

const VaultCodeStorage = ({ unlockedCodes }) => {
  const [isOpen, setIsOpen] = useState(false);

  const vaultCodes = {
    1: '1h3@rtm@th',
    2: 'R.U.hAppY?',
    3: 'P3rs3v3r3!',
    4: 'm@thisc00l',
    5: 'B3li3v3-NU',
    6: 'UGl0v3sy0u'
  };

  const copyAllCodes = () => {
    const codes = Object.keys(unlockedCodes)
      .filter(key => unlockedCodes[key])
      .map(key => `Vault ${key}: ${vaultCodes[key]}`)
      .join('\n');
    
    navigator.clipboard.writeText(codes).then(() => {
      alert('All codes copied to clipboard!');
    });
  };

  return (
    <>
      {/* Floating Icon Button */}
      <button 
        className="vault-code-icon"
        onClick={() => setIsOpen(!isOpen)}
        title="View Collected Vault Codes"
      >
        🔐
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="vault-code-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="vault-code-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vault-code-header">
              <h2>🔐 Collected Vault Codes</h2>
              <button className="close-button" onClick={() => setIsOpen(false)}>✕</button>
            </div>
            
            <div className="vault-code-list">
              {[1, 2, 3, 4, 5, 6].map(vaultNum => (
                <div key={vaultNum} className="vault-code-item">
                  <div className="vault-label">Vault {vaultNum}:</div>
                  <div className="vault-code">
                    {unlockedCodes[vaultNum] ? (
                      <span className="code-unlocked">{vaultCodes[vaultNum]}</span>
                    ) : (
                      <span className="code-locked">🔒 LOCKED</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {Object.values(unlockedCodes).some(val => val) && (
              <button className="copy-all-button" onClick={copyAllCodes}>
                📋 Copy All Unlocked Codes
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .vault-code-icon {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 3px solid #fff;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          font-size: 28px;
          cursor: pointer;
          z-index: 1000;
          transition: transform 0.2s;
        }

        .vault-code-icon:hover {
          transform: scale(1.1);
        }

        .vault-code-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }

        .vault-code-modal {
          background: #1a1a2e;
          border-radius: 15px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }

        .vault-code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #667eea;
        }

        .vault-code-header h2 {
          color: #fff;
          margin: 0;
          font-size: 24px;
        }

        .close-button {
          background: none;
          border: none;
          color: #fff;
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          line-height: 1;
        }

        .close-button:hover {
          color: #ff6b6b;
        }

        .vault-code-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .vault-code-item {
          background: #16213e;
          padding: 15px 20px;
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .vault-label {
          color: #94a3b8;
          font-weight: 600;
          font-size: 16px;
        }

        .vault-code {
          font-family: 'Courier New', monospace;
          font-size: 18px;
          font-weight: bold;
        }

        .code-unlocked {
          color: #4ade80;
          text-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
        }

        .code-locked {
          color: #64748b;
          font-size: 16px;
        }

        .copy-all-button {
          width: 100%;
          margin-top: 20px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .copy-all-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
      `}</style>
    </>
  );
};

export default VaultCodeStorage;
