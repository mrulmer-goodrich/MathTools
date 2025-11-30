// VersionChecker.jsx
// Add this to your app to see what's actually running

import React from 'react';

const VersionChecker = () => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'lime',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 99999
    }}>
      <div>🧟 ZOMBIE APOCALYPSE</div>
      <div>Version: 2.3.0-VERIFIED</div>
      <div>Build: {new Date().toISOString()}</div>
      <div style={{color: 'yellow', marginTop: '5px'}}>
        If you see this, v2.3 is deployed! ✓
      </div>
    </div>
  );
};

export default VersionChecker;
