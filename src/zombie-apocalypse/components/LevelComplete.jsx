import React from 'react';

const LevelComplete = ({ level, playerData, time, formatTime }) => {
  const messages = {
    1: `The Eastway Jaguars prove their worth. You and ${playerData.friendName} can convert percents faster than lightning strikes. The Runners, overconfident in their speed, couldn't keep up with the mental math. They sprinted straight into a zombie horde. Six factions remain, and the others are watching you nervously.`,
    
    2: `Your understanding of increase and decrease saves lives. The Traders, blinded by greed, couldn't tell if their deals were helping or hurting them. They argued over a "discount" that was actually a markup—and while they bickered, the zombies surrounded them. Five factions left. The Elites are taking notes.`,
    
    3: `Precision is survival. The Scavengers miscalculated how much food they needed for winter. They thought they had enough... they were wrong. Starvation weakened them, and the horde finished the job. Four factions remain. ${playerData.friendName} grips your shoulder: "We're halfway there."`,
    
    4: `${playerData.friendName} nods approvingly as you nail another calculation. The Fortress had walls, weapons, and supplies—but they couldn't handle multi-step thinking. When they miscalculated the cost of reinforcements PLUS tax, their defenses fell apart. Three factions left. You, The Engineers, and The Elites. This is getting real.`,
    
    5: `Two-step problems? Child's play for the Eastway Jaguars. The Engineers were brilliant—probably the smartest people left in ${playerData.cityName}. But brilliance isn't the same as wisdom. They worked backwards on a forward problem, convinced they were right even as their calculations spelled doom. Two factions remain. Just you... and The Elites.`,
    
    6: `Working backwards comes naturally to you now. Every other faction has fallen. The streets of ${playerData.cityName} are littered with the mistakes of those who weren't good enough, smart enough, or lucky enough to survive. The Elites stand between you and total control of the city. One final challenge awaits...`
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
