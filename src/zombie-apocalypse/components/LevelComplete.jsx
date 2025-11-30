import React from 'react';

const LevelComplete = ({ level, playerData, time, formatTime }) => {
  const messages = {
    1: `The ${playerData.favoriteColor || 'Red'} Squad can convert percents. The Runners couldn't keep up. 6 factions remain.`,
    2: `You understand the basics. The Traders couldn't tell increase from decrease. Zombies got them. 5 factions remain.`,
    3: `The calculations came easy. The Scavengers miscalculated their supplies. They didn't make it. 4 factions remain.`,
    4: `${playerData.friendName} nods approvingly. The Fortress couldn't handle multi-step thinking. Overrun. 3 factions remain.`,
    5: `Two-step problems? No sweat. The Engineers were brilliant... but they worked backwards on a forward problem. Fatal. 2 factions remain.`,
    6: `Working backwards is your specialty. It's just you and The Elites now. One final challenge awaits...`
  };

  return (
    <div className="za-level-complete">
      <div className="za-level-complete-content">
        <div className="za-level-complete-icon">✓</div>
        <h1 className="za-level-complete-title">LEVEL {level} COMPLETE</h1>
        <div className="za-level-complete-time">Time: {formatTime(time)}</div>
        <div className="za-level-complete-message">
          {messages[level] || 'Level Complete!'}
        </div>
        <div className="za-level-complete-continue">
          Preparing next challenge...
        </div>
      </div>
    </div>
  );
};

export default LevelComplete;
