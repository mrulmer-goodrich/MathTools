import React, { useState, useEffect } from 'react';

const IntroSequence = ({ playerData, onComplete, onSkip }) => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [canProgress, setCanProgress] = useState(false);

  useEffect(() => {
    // Allow progression after 2 seconds on each screen
    const timer = setTimeout(() => {
      setCanProgress(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentScreen]);

  const handleNext = () => {
    if (currentScreen === 3) {
      onComplete();
    } else {
      setCurrentScreen(currentScreen + 1);
      setCanProgress(false);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const getColorName = () => {
    return playerData.favoriteColor || 'Red';
  };

  const screens = [
    {
      title: "THE OUTBREAK",
      content: (
        <>
          <p className="za-intro-text">
            It started in downtown {playerData.cityName} on a Tuesday afternoon.
          </p>
          <p className="za-intro-text">
            {playerData.playerName}, you were in {playerData.favoriteSubject || 'class'} when the emergency broadcast began.
          </p>
          <p className="za-intro-text">
            The infection spread fast. Within hours, 80% of the population turned.
          </p>
          <p className="za-intro-text">
            You grabbed {playerData.friendName} and ran.
          </p>
        </>
      )
    },
    {
      title: "THE FACTIONS",
      content: (
        <>
          <p className="za-intro-text">
            Seven survivor factions emerged from the chaos:
          </p>
          <div className="za-faction-list">
            <div className="za-faction za-faction-player">
              <span className="za-faction-icon">◆</span> The {getColorName()} Squad <span className="za-faction-note">(That's you and {playerData.friendName})</span>
            </div>
            <div className="za-faction">
              <span className="za-faction-icon">⚡</span> The Runners <span className="za-faction-note">- Fast but reckless</span>
            </div>
            <div className="za-faction">
              <span className="za-faction-icon">💰</span> The Traders <span className="za-faction-note">- Greedy and cunning</span>
            </div>
            <div className="za-faction">
              <span className="za-faction-icon">🔍</span> The Scavengers <span className="za-faction-note">- Resourceful but desperate</span>
            </div>
            <div className="za-faction">
              <span className="za-faction-icon">🏰</span> The Fortress <span className="za-faction-note">- Strong but inflexible</span>
            </div>
            <div className="za-faction">
              <span className="za-faction-icon">🔧</span> The Engineers <span className="za-faction-note">- Smart but overconfident</span>
            </div>
            <div className="za-faction za-faction-enemy">
              <span className="za-faction-icon">👑</span> The Elites <span className="za-faction-note">- The final threat</span>
            </div>
          </div>
          <p className="za-intro-text za-intro-emphasis">
            Only ONE faction will control the future of {playerData.cityName}.
          </p>
        </>
      )
    },
    {
      title: "THE CHALLENGE",
      content: (
        <>
          <p className="za-intro-text">
            {playerData.friendName} looks at you: "We need to outsmart them all. Every decision counts. Every calculation matters. One mistake and we're zombie food."
          </p>
          <p className="za-intro-text">
            You wanted to be {playerData.dreamJob || 'something great'}. Now you just want to survive.
          </p>
          {playerData.biggestFear && (
            <p className="za-intro-text">
              Your biggest fear was always {playerData.biggestFear}. Now it's everywhere.
            </p>
          )}
          <p className="za-intro-text za-intro-emphasis">
            Are you ready?
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
        <div className="za-intro-screen">
          <h1 className="za-intro-title">{currentScreenData.title}</h1>
          <div className="za-intro-content">
            {currentScreenData.content}
          </div>

          {canProgress && (
            <button 
              className="za-btn-primary za-intro-continue"
              onClick={handleNext}
            >
              {currentScreen === 3 ? 'BEGIN GAME' : 'Continue →'}
            </button>
          )}
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
