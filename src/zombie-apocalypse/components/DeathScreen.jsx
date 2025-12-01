import React from 'react';

const DeathScreen = ({ currentLevel, playerData }) => {
  const getDeathMessage = () => {
    const messages = [
      `A zombie grabs your ankle! ${playerData.friendName} pulls you back just in time. "Focus, ${playerData.playerName}!"`,
      `Your fear of ${playerData.biggestFear || 'the unknown'} made you hesitate. The calculator slips from your hands. Try again!`,
      `The Elites are laughing at your mistake. Prove them wrong!`,
      `Zombies swarm from the shadows! ${playerData.friendName} drags you to safety. "We need to be smarter!"`,
      `You stumbled. The horde closes in. But you're not done yet...`
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="za-death-screen">
      <div className="za-death-content">
        <div className="za-death-icon">☠️</div>
        <div className="za-death-title">ZOMBIE ATTACK!</div>
        <div className="za-death-message">{getDeathMessage()}</div>
        <div className="za-death-subtitle">
          Restarting Level {Math.max(1, currentLevel - 1)}...
        </div>
      </div>
    </div>
  );
};

export default DeathScreen;
