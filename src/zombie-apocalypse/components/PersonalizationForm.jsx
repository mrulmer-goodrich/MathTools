import React, { useState } from 'react';

const PersonalizationForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    playerName: '',
    friendName: '',
    cityName: 'Charlotte, NC',
    favoriteColor: '',
    favoriteSubject: '',
    dreamJob: '',
    biggestFear: '',
    favoriteFood: ''
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
      alert('Please enter your name and your best friend\'s name!');
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
          <p className="za-form-intro">Before the apocalypse, tell us about yourself...</p>
        </div>

        <form onSubmit={handleSubmit} className="za-form">
          <div className="za-form-group">
            <label htmlFor="playerName">Your Name: *</label>
            <input
              type="text"
              id="playerName"
              name="playerName"
              value={formData.playerName}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="za-form-group">
            <label htmlFor="friendName">Your Best Friend: *</label>
            <input
              type="text"
              id="friendName"
              name="friendName"
              value={formData.friendName}
              onChange={handleChange}
              placeholder="Enter your best friend's name"
              required
            />
          </div>

          <div className="za-form-group">
            <label htmlFor="cityName">Your City:</label>
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
            <label htmlFor="favoriteColor">Favorite Color:</label>
            <input
              type="text"
              id="favoriteColor"
              name="favoriteColor"
              value={formData.favoriteColor}
              onChange={handleChange}
              placeholder="e.g., Blue, Green, Red"
            />
          </div>

          <div className="za-form-group">
            <label htmlFor="favoriteSubject">Favorite School Subject:</label>
            <select
              id="favoriteSubject"
              name="favoriteSubject"
              value={formData.favoriteSubject}
              onChange={handleChange}
            >
              <option value="">-- Select --</option>
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
            <label htmlFor="dreamJob">Dream Job:</label>
            <input
              type="text"
              id="dreamJob"
              name="dreamJob"
              value={formData.dreamJob}
              onChange={handleChange}
              placeholder="e.g., Doctor, Athlete, YouTuber"
            />
          </div>

          <div className="za-form-group">
            <label htmlFor="biggestFear">Biggest Fear:</label>
            <input
              type="text"
              id="biggestFear"
              name="biggestFear"
              value={formData.biggestFear}
              onChange={handleChange}
              placeholder="e.g., Heights, Spiders, Dark"
            />
          </div>

          <div className="za-form-group">
            <label htmlFor="favoriteFood">Favorite Food:</label>
            <input
              type="text"
              id="favoriteFood"
              name="favoriteFood"
              value={formData.favoriteFood}
              onChange={handleChange}
              placeholder="e.g., Pizza, Tacos, Burgers"
            />
          </div>

          <button type="submit" className="za-btn-primary">
            BEGIN APOCALYPSE
          </button>
        </form>
      </div>
    </div>
  );
};

export default PersonalizationForm;
