// PersonalizationForm.jsx v4.1 - FIXED
import React, { useState } from 'react';

const PersonalizationForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    friend: '',
    city: 'Charlotte'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.friend) {
      onComplete(formData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="za-personalization-form">
      <h1>ZOMBIE APOCALYPSE</h1>
      <h2>Percent Survival</h2>
      
      <p style={{
        textAlign: 'center',
        color: '#DC143C',
        fontSize: '14px',
        marginBottom: '20px',
        lineHeight: '1.6',
        fontStyle: 'italic'
      }}>
        The outbreak started during Mr. UG's 2nd block. Before we barricade ourselves in, 
        tell me who you are...
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '18px' }}>
          <label style={{
            display: 'block',
            color: '#FFF',
            fontSize: '13px',
            marginBottom: '6px',
            fontWeight: 'bold'
          }}>
            Your Name (First name only) *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your first name"
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '15px',
              background: 'rgba(0,0,0,0.6)',
              border: '2px solid #FFD700',
              borderRadius: '6px',
              color: '#FFD700',
              fontWeight: 'bold'
            }}
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={{
            display: 'block',
            color: '#FFF',
            fontSize: '13px',
            marginBottom: '6px',
            fontWeight: 'bold'
          }}>
            Your Best Friend's Name *
          </label>
          <input
            type="text"
            name="friend"
            value={formData.friend}
            onChange={handleChange}
            placeholder="Who will survive with you?"
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '15px',
              background: 'rgba(0,0,0,0.6)',
              border: '2px solid #FFD700',
              borderRadius: '6px',
              color: '#FFD700',
              fontWeight: 'bold'
            }}
          />
        </div>

        <div style={{ marginBottom: '22px' }}>
          <label style={{
            display: 'block',
            color: '#FFF',
            fontSize: '13px',
            marginBottom: '6px',
            fontWeight: 'bold'
          }}>
            Your City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Charlotte"
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '15px',
              background: 'rgba(0,0,0,0.6)',
              border: '2px solid #FFD700',
              borderRadius: '6px',
              color: '#FFD700',
              fontWeight: 'bold'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!formData.name || !formData.friend}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #DC143C, #8B0000)',
            border: 'none',
            borderRadius: '8px',
            color: '#FFF',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: formData.name && formData.friend ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: formData.name && formData.friend ? 1 : 0.5
          }}
        >
          ATTEMPT TO SURVIVE
        </button>
      </form>
    </div>
  );
};

export default PersonalizationForm;
