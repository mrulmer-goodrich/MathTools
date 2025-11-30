import React, { useState } from 'react';

const IntroSequence = ({ playerData, onComplete, onSkip }) => {
  const [currentScreen, setCurrentScreen] = useState(1);

  const handleNext = () => {
    if (currentScreen === 3) {
      onComplete();
    } else {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const screens = [
    {
      title: "THE OUTBREAK",
      content: (
        <>
          <p className="za-intro-text">
            It started in downtown {playerData.cityName} on a Tuesday afternoon at 2:47 PM. The sky turned an eerie green, and the emergency broadcast pierced through every phone, every TV, every radio.
          </p>
          <p className="za-intro-text">
            {playerData.playerName}, you were in {playerData.favoriteSubject || 'class'} when the alarms began. Your teacher's face went pale as she read the message: "SHELTER IN PLACE. DO NOT GO OUTSIDE. THIS IS NOT A DRILL."
          </p>
          <p className="za-intro-text">
            But it was already too late. Through the windows, you saw them—people stumbling, twitching, their eyes vacant and hungry. The infection spread like wildfire. Within the first hour, 80% of {playerData.cityName} had turned.
          </p>
          <p className="za-intro-text">
            You grabbed {playerData.friendName}, smashed through the back door, and ran for your lives. The screams behind you still echo in your nightmares.
          </p>
        </>
      )
    },
    {
      title: "THE FACTIONS",
      content: (
        <>
          <p className="za-intro-text">
            In the chaos of the first week, survivors clustered together. Seven distinct factions emerged, each with their own strategy for survival:
          </p>
          <div className="za-faction-list">
            <div className="za-faction za-faction-player">
              <span className="za-faction-icon">🐆</span> The Eastway Jaguars <span className="za-faction-note">(You and {playerData.friendName} - smart, strategic, determined)</span>
            </div>
            <div className="za-faction">
              <span className="za-faction-icon">⚡</span> The Runners <span className="za-faction-note">- Fast and fearless, but reckless in their speed</span>
            </div>
            <div className="za-faction">
              <span className="za-faction-icon">💰</span> The Traders <span className="za-faction-note">- Wealthy and cunning, but consumed by greed</span>
            </div>
            <div className="za-faction">
              <span className="za-faction-icon">🔍</span> The Scavengers <span className="za-faction-note">- Resourceful scavengers, but growing desperate</span>
            </div>
            <div className="za-faction">
              <span className="za-faction-icon">🏰</span> The Fortress <span className="za-faction-note">- Heavily fortified, but rigid and inflexible</span>
            </div>
            <div className="za-faction">
              <span className="za-faction-icon">🔧</span> The Engineers <span className="za-faction-note">- Brilliant minds, but dangerously overconfident</span>
            </div>
            <div className="za-faction za-faction-enemy">
              <span className="za-faction-icon">👑</span> The Elites <span className="za-faction-note">- Ruthless, organized, and your final threat</span>
            </div>
          </div>
          <p className="za-intro-text za-intro-emphasis">
            Resources are scarce. Territory is everything. Only ONE faction will control the future of {playerData.cityName}... and it has to be you.
          </p>
        </>
      )
    },
    {
      title: "THE CHALLENGE",
      content: (
        <>
          <p className="za-intro-text">
            {playerData.friendName} pulls you aside after the first faction meeting. "Listen," they whisper urgently, "survival isn't about strength anymore. It's about being smarter than everyone else. We need to calculate every move, every trade, every risk. One wrong percentage and we're dead."
          </p>
          <p className="za-intro-text">
            You think back to your old life. You wanted to be {playerData.dreamJob || 'something great'}—back when the world made sense. Now your only goal is to see another sunrise.
          </p>
          {playerData.biggestFear && (
            <p className="za-intro-text">
              Your biggest fear used to be {playerData.biggestFear}. Now it's everywhere, compounded by the very real fear of becoming one of *them*.
            </p>
          )}
          <p className="za-intro-text">
            The other factions are watching. The Elites are already making their move. The dead are closing in.
          </p>
          <p className="za-intro-text za-intro-emphasis">
            This is it, {playerData.playerName}. Are you ready to fight for survival?
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

          <button 
            className="za-btn-primary za-intro-continue"
            onClick={handleNext}
          >
            {currentScreen === 3 ? "I'M READY TO SURVIVE" : 'Continue →'}
          </button>
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
