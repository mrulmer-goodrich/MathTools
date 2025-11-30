import React from 'react';

const FactionTracker = ({ currentLevel }) => {
  const factions = [
    { name: 'The Eastway Jaguars', icon: '🐆', status: 'player', eliminatedLevel: null },
    { name: 'The Runners', icon: '⚡', status: 'normal', eliminatedLevel: 2 },
    { name: 'The Traders', icon: '💰', status: 'normal', eliminatedLevel: 3 },
    { name: 'The Scavengers', icon: '🔍', status: 'normal', eliminatedLevel: 4 },
    { name: 'The Fortress', icon: '🏰', status: 'normal', eliminatedLevel: 5 },
    { name: 'The Engineers', icon: '🔧', status: 'normal', eliminatedLevel: 6 },
    { name: 'The Elites', icon: '👑', status: 'enemy', eliminatedLevel: 7 }
  ];

  return (
    <div className="za-faction-tracker-vertical">
      <div className="za-faction-tracker-title">FACTIONS</div>
      {factions.map((faction, index) => {
        const isEliminated = faction.eliminatedLevel && currentLevel >= faction.eliminatedLevel;
        const isPlayer = faction.status === 'player';
        const isEnemy = faction.status === 'enemy';
        
        return (
          <div 
            key={index}
            className={`za-faction-item-vertical ${isEliminated ? 'eliminated' : 'alive'} ${isPlayer ? 'player' : ''} ${isEnemy ? 'enemy' : ''}`}
          >
            <span className="za-faction-icon-vert">{faction.icon}</span>
            <span className="za-faction-name-vert">{faction.name}</span>
            {isEliminated && <span className="za-eliminated-marker-vert">✕</span>}
          </div>
        );
      })}
    </div>
  );
};

export default FactionTracker;
