// LevelComplete.jsx
// Version: 3.3.0
// Last Updated: November 30, 2024 - 11:45 PM
// Changes: Shortened interludes, cohesive story arc with avengement theme

import React from 'react';

const LevelComplete = ({ level, playerData, time, formatTime }) => {
  const messages = {
    1: `You converted percents faster than The Runners could sprint. They couldn't keep up with the math. The horde got them. Six factions remain. You and ${playerData.friendName} are one step closer to avenging Principal Garvin.`,
    
    2: `The Traders died arguing over a "discount" that was actually a markup. Greed killed them. Five factions left. ${playerData.friendName} nods: "Principal Garvin would be proud."`,
    
    3: `The Scavengers miscalculated their supplies. Starvation weakened them. The zombies finished it. Four factions remain. You're fighting for Garvin's legacy now.`,
    
    4: `The Fortress couldn't handle multi-step math. Their defenses collapsed. Three factions left: You, The Engineers, and The Elites. ${playerData.friendName}: "We're doing this for her."`,
    
    5: `The Engineers were brilliant but overconfident. They worked backwards on a forward problem. Fatal mistake. Two factions remain. Just you versus The Elites. This is for Principal Garvin.`,
    
    6: `Every faction has fallen. The Elites are all that's left between you and victory. ${playerData.friendName} grips your shoulder: "One more level. We avenge Garvin. We take back ${playerData.cityName}. Let's finish this."`
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
        <div className="za-level-complete-note">
          Click anywhere to continue...
        </div>
      </div>
    </div>
  );
};

export default LevelComplete;
