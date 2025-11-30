// IntroSequence.jsx
// Version: 3.3.0
// Last Updated: November 30, 2024 - 11:45 PM
// Changes: Shortened text, cohesive story arc, removed wordy descriptions

import React, { useState, useEffect } from 'react';

const IntroSequence = ({ playerData, onComplete, onSkip }) => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentScreen]);

  const handleNext = () => {
    if (currentScreen === 3) {
      onComplete();
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentScreen(currentScreen + 1);
        setIsTransitioning(false);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 400);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const isMathStudent = playerData.favoriteSubject === 'Math';
  const cityName = (playerData.cityName || 'Charlotte').replace(', NC', '').replace(',NC', '');

  const screens = [
    {
      title: "THE OUTBREAK",
      content: (
        <>
          <p className="za-intro-text">
            Tuesday, 2:47 PM. Principal Garvin's voice: <strong>"Shelter in place. Lock your doors. NOT a drill."</strong>
          </p>
          <p className="za-intro-text">
            Through the classroom window, you saw her running. Zombies behind her. She didn't make it.
          </p>
          <p className="za-intro-text">
            You grabbed {playerData.friendName}. Eastway Middle became hell. You ran.
          </p>
        </>
      )
    },
    {
      title: "SURVIVAL",
      content: (
        <>
          <p className="za-intro-text">
            Seven factions formed. You chose the <strong>Eastway Jaguars</strong>—Principal Garvin's legacy.
          </p>
          <div className="za-faction-list-compact">
            <div className="za-faction-item">🏆 Eastway Jaguars (You & {playerData.friendName})</div>
            <div className="za-faction-item">⚡ The Runners | 💰 The Traders | 🔍 The Scavengers</div>
            <div className="za-faction-item">🏰 The Fortress | 🔧 The Engineers | 👑 The Elites</div>
          </div>
          <p className="za-intro-text">
            Only ONE faction survives.
          </p>
          <p className="za-intro-text">
            For Principal Garvin.
          </p>
          <p className="za-intro-text">
            For Eastway.
          </p>
          <p className="za-intro-text za-intro-emphasis">
            <strong>It has to be you.</strong>
          </p>
        </>
      )
    },
    {
      title: "THE CHALLENGE",
      content: (
        <>
          <p className="za-intro-text">
            {playerData.friendName}: <em>"Math is survival now. One wrong calculation and we're dead."</em>
          </p>
          <p className="za-intro-text">
            {isMathStudent ? "Mr. UG prepared you for this." : "You're ready."} Every percent matters.
          </p>
          <p className="za-intro-text">
            The Elites are moving. The dead are closing in.
          </p>
          <p className="za-intro-text za-intro-final">
            This is it, {playerData.playerName}.
          </p>
          <p className="za-intro-text za-intro-final">
            For Principal Garvin.
          </p>
          <p className="za-intro-text za-intro-final">
            For Eastway.
          </p>
          <p className="za-intro-text za-intro-final">
            <strong>Are you ready?</strong>
          </p>
        </>
      )
    }
  ];

  const currentScreenData = screens[currentScreen - 1];

  return (
    <div className="za-intro-sequence">
      <button className="za-skip-btn" onClick={handleSkip}>
        Skip Intro →
      </button>

      <div className="za-intro-container">
        <div className={`za-intro-screen ${isTransitioning ? 'za-transitioning' : ''}`} key={currentScreen}>
          <h1 className="za-intro-title">{currentScreenData.title}</h1>
          <div className="za-intro-content">
            {currentScreenData.content}
          </div>

          <div className="za-intro-buttons">
            <button 
              className="za-btn-primary za-intro-continue"
              onClick={handleNext}
              disabled={isTransitioning}
            >
              {currentScreen === 3 ? "I'M READY TO SURVIVE" : 'Continue →'}
            </button>
          </div>
        </div>

        <div className="za-intro-progress">
          {[1, 2, 3].map(num => (
            <span 
              key={num} 
              className={`za-progress-dot ${num === currentScreen ? 'active' : ''} ${num < currentScreen ? 'complete' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntroSequence;
