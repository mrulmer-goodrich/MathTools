// IntroSequence.jsx
// VERSION: 3.1.0
// Last Updated: November 30, 2024
// Changes: Shortened text, centered button, removed fear reference, tighter story

import React, { useState, useEffect } from 'react';

const IntroSequence = ({ playerData, onComplete, onSkip }) => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Scroll to top whenever screen changes
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

  // Check if user selected Math (for Mr. UG reference)
  const isMathStudent = playerData.favoriteSubject === 'Math';
  
  // Get city name (remove ", NC" if present)
  const cityName = (playerData.cityName || 'Charlotte').replace(', NC', '').replace(',NC', '');

  const screens = [
    {
      title: "THE OUTBREAK",
      content: (
        <>
          <p className="za-intro-text">
            Tuesday, 2:47 PM. Principal Garvin's voice crackled over the intercom: <strong>"Shelter in place. Lock your doors. This is NOT a drill."</strong>
          </p>
          <p className="za-intro-text">
            Through the windows of {isMathStudent ? "Mr. UG's class" : `${playerData.favoriteSubject || 'class'}`}, you saw her running across the courtyard. Zombies shambling behind her. She didn't make it.
          </p>
          <p className="za-intro-text">
            Within the first hour, 80% of {cityName} had turned. You grabbed {playerData.friendName} and ran. Eastway Middle became a nightmare. You never looked back.
          </p>
        </>
      )
    },
    {
      title: "THE FACTIONS",
      content: (
        <>
          <p className="za-intro-text">
            Seven factions emerged from the chaos. You and {playerData.friendName} joined the <strong>Eastway Jaguars</strong>—carrying on Principal Garvin's legacy.
          </p>
          <div className="za-faction-list">
            <div className="za-faction za-faction-player">
              <span className="za-faction-icon">🏆</span> <strong>The Eastway Jaguars</strong> <span className="za-faction-note">(You & {playerData.friendName})</span>
            </div>
            <div className="za-faction">
              <span className="za-faction-icon">⚡</span> The Runners <span className="za-faction-note">- Fast but reckless</span>
            </div>
            <div className="za-faction">
              <span className="za-faction-icon">💰</span> The Traders <span className="za-faction-note">- Wealthy but greedy</span>
            </div>
            <div className="za-faction">
              <span className="za-faction-icon">🔍</span> The Scavengers <span className="za-faction-note">- Resourceful but desperate</span>
            </div>
            <div className="za-faction">
              <span className="za-faction-icon">🏰</span> The Fortress <span className="za-faction-note">- Strong but inflexible</span>
            </div>
            <div className="za-faction">
              <span className="za-faction-icon">🔧</span> The Engineers <span className="za-faction-note">- Brilliant but overconfident</span>
            </div>
            <div className="za-faction za-faction-enemy">
              <span className="za-faction-icon">👑</span> The Elites <span className="za-faction-note">- Ruthless & organized</span>
            </div>
          </div>
          <p className="za-intro-text za-intro-emphasis">
            Only ONE faction will control {cityName}. For Principal Garvin. For Eastway. <strong>It has to be you.</strong>
          </p>
        </>
      )
    },
    {
      title: "THE CHALLENGE",
      content: (
        <>
          <p className="za-intro-text">
            {playerData.friendName} pulls you aside. "Survival isn't about strength anymore. It's about being <strong>smarter than everyone else</strong>. {isMathStudent ? "Remember what Mr. UG always said—math is survival." : "We need to calculate every move."}"
          </p>
          <p className="za-intro-text">
            Every trade. Every risk. Every decision. <strong>One wrong percentage and you're dead.</strong>
          </p>
          <p className="za-intro-text">
            You wanted to be {playerData.dreamJob || 'something great'}—back when the world made sense. Now your only goal is to see another sunrise.
          </p>
          <p className="za-intro-text za-intro-emphasis">
            The other factions are watching. The Elites are making their move. The zombies are closing in.
          </p>
          <p className="za-intro-text za-intro-final">
            This is it, {playerData.playerName}. For Principal Garvin. For Eastway. <strong>Are you ready to fight?</strong>
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
