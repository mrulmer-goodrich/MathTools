// PersonalizationForm.jsx
// Version: 3.3.0
// Last Updated: November 30, 2024 - 11:45 PM
// Changes: Removed favoriteColor, changed cityName default to Charlotte

import React, { useState } from 'react';

const PersonalizationForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    playerName: '',
    friendName: '',
    cityName: 'Charlotte',
    favoriteSubject: '',
    dreamJob: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.playerName.trim() || !formData.friendName.trim()) {
      alert('Please enter your name and your friend\'s name!');
      return;
    }
    
    onComplete(formData);
  };

  return (
    <div className="za-personalization">
      <div className="za-form-container">
        <div className="za-form-header">
          <h1 className="za-form-title">ZOMBIE APOCALYPSE</h1>
          <h2 className="za-form-subtitle">Percent Survival</h2>
          <p className="za-form-intro">
            Before we begin, let's personalize your survival story...
          </p>
        </div>

        <form className="za-form" onSubmit={handleSubmit}>
          <div className="za-form-group">
            <label htmlFor="playerName">Your Name (First name only) *</label>
            <input
              type="text"
              id="playerName"
              name="playerName"
              value={formData.playerName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="za-form-group">
            <label htmlFor="friendName">Your Best Friend's Name *</label>
            <input
              type="text"
              id="friendName"
              name="friendName"
              value={formData.friendName}
              onChange={handleChange}
              placeholder="Who will survive with you?"
              required
            />
          </div>

          <div className="za-form-group">
            <label htmlFor="cityName">Your City</label>
            <input
              type="text"
              id="cityName"
              name="cityName"
              value={formData.cityName}
              onChange={handleChange}
              placeholder="Charlotte, NC"
            />
          </div>

          <div className="za-form-group">
            <label htmlFor="favoriteSubject">Favorite Subject</label>
            <select
              id="favoriteSubject"
              name="favoriteSubject"
              value={formData.favoriteSubject}
              onChange={handleChange}
            >
              <option value="">Select...</option>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="Art">Art</option>
              <option value="PE">PE</option>
              <option value="Music">Music</option>
            </select>
          </div>

          <div className="za-form-group">
            <label htmlFor="dreamJob">Dream Job (before the apocalypse)</label>
            <input
              type="text"
              id="dreamJob"
              name="dreamJob"
              value={formData.dreamJob}
              onChange={handleChange}
              placeholder="Doctor, Engineer, Teacher, etc."
            />
          </div>

          <button type="submit" className="za-btn-primary">
            BEGIN SURVIVAL
          </button>
        </form>
      </div>
    </div>
  );
};

export default PersonalizationForm;
