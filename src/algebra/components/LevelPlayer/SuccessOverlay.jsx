import React from 'react';

const SuccessOverlay = ({ message }) => {
  return (
    <div className="success-overlay">
      <div className="success-content">
        <div className="success-icon">{message.icon}</div>
        <div className="success-message">{message.text}</div>
        <div className="success-submessage">{message.sub}</div>
      </div>
    </div>
  );
};

export default SuccessOverlay;
