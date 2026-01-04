// SuccessOverlay.jsx - Animated gem collection
import React, { useEffect, useState } from 'react';
import '../../styles/algebra.css';

const SuccessOverlay = ({ crystalsEarned = 1 }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 50);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        transform: animate ? 'scale(1)' : 'scale(0.8)',
        opacity: animate ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem',
          animation: 'bounce 0.6s ease-in-out',
          display: 'inline-block'
        }}>
          💎
        </div>
        
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#10B981',
          fontFamily: 'Poppins, sans-serif',
          marginBottom: '0.5rem'
        }}>
          +{crystalsEarned} Knowledge Crystal{crystalsEarned !== 1 ? 's' : ''}
        </div>
        
        <div style={{
          fontSize: '0.875rem',
          color: '#6B7280',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Excellent work!
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default SuccessOverlay;
