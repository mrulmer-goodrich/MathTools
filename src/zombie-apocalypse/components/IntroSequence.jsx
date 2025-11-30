// IntroSequence.jsx
// VERSION: 1.2.1
// Last Updated: November 29, 2024 (by Lumi)
// Changes: Added Principal Garvin story, embellished narrative, click-to-advance

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

  // Check if user selected Math (for Mr. UG reference)
  const isMathStudent = playerData.favoriteSubject === 'Math';

  const screens = [
    {
      title: "THE OUTBREAK",
      content: (
        <>
          <p className="za-intro-text">
            It started at Eastway Middle School on a Tuesday afternoon at 2:47 PM. Principal Garvin's voice crackled over the intercom, urgent and terrified: "All students and staff, shelter in place immediately. Lock your doors. Do NOT go outside. This is NOT a drill."
          </p>
          <p className="za-intro-text">
            {playerData.playerName}, you were in {isMathStudent ? "Mr. UG's" : "your"} {playerData.favoriteSubject || 'class'} when the alarms began. Through the windows, you saw Principal Garvin running across the courtyard, zombies shambling behind her. She didn't make it.
          </p>
          <p className="za-intro-text">
            The infection spread like wildfire through {playerData.cityName}. Whatever caused it—a virus, a chemical spill, something worse—didn't matter anymore. Within the first hour, 80% of the city had turned. The screams... you'll never forget the screams.
          </p>
          <p className="za-intro-text">
            You grabbed {playerData.friendName}, smashed through the back door of Eastway Middle, and ran for your lives. Behind you, the place where you once felt safe became a nightmare. You never looked back.
          </p>
        </>
      )
    },
    {
      title: "THE FACTIONS",
      content: (
        <>
          <p className="za-intro-text">
            In the chaos of the first week, survivors clustered together. Seven distinct factions emerged, each with their own strategy for survival. You and {playerData.friendName} joined the Eastway Jaguars—former students and teachers who refused to give up on what Principal Garvin taught: "Jaguars are strong, smart, and stick together."
          </p>
          <div className="za-faction-list">
            <div className="za-faction za-faction-player">
              <span className="za-faction-icon">🐆</span> The Eastway Jaguars <span className="za-faction-note">(You and {playerData.friendName} - Principal Garvin's legacy lives on)</span>
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
            Resources are scarce. Territory is everything. Only ONE faction will control the future of {playerData.cityName}. For Principal Garvin. For Eastway. It has to be you.
          </p>
        </>
      )
    },
    {
      title: "THE CHALLENGE",
      content: (
        <>
          <p className="za-intro-text">
            {playerData.friendName} pulls you aside after the first faction meeting. "Listen," they whisper urgently, "survival isn't about strength anymore. It's about being smarter than everyone else. {isMathStudent ? "Remember what Mr. UG always said—math is survival." : "We need to calculate every move."} Every trade, every risk, every decision. One wrong percentage and we're dead."
          </p>
          <p className="za-intro-text">
            You think back to Eastway Middle. You wanted to be {playerData.dreamJob || 'something great'}—back when the world made sense, when your biggest worry was {playerData.biggestFear || 'tests and homework'}. Now your only goal is to see another sunrise.
          </p>
          <p className="za-intro-text">
            The other factions are watching. The Elites are already making their move. The dead are closing in. {isMathStudent ? "Mr. UG prepared you for this... sort of." : "You have to be ready."}
          </p>
          <p className="za-intro-text za-intro-emphasis">
            This is it, {playerData.playerName}. For Principal Garvin. For Eastway. For survival. Are you ready to fight?
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

