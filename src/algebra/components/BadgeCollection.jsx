import React from 'react';
import '../styles/badge-collection.css';

const BADGES = {
  4: { name: 'Backpack', emoji: '🎒', image: '/assets/badges/backpack.png' },
  8: { name: 'Compass', emoji: '🧭', image: '/assets/badges/compass.png' },
  12: { name: 'Camping Gear', emoji: '⛺', image: '/assets/badges/camping-gear.png' },
  16: { name: 'Trail Map', emoji: '🗺️', image: '/assets/badges/trail-map.png' },
  20: { name: 'Binoculars', emoji: '🔭', image: '/assets/badges/binoculars.png' },
  24: { name: 'Climbing Rope', emoji: '🪢', image: '/assets/badges/climbing-rope.png' },
  28: { name: 'Pickaxe', emoji: '⛏️', image: '/assets/badges/pickaxe.png' },
  31: { name: 'Vault Master', emoji: '🏆', image: '/assets/badges/vault-master.png', special: true },
  37: { name: 'Frontier Explorer', emoji: '🌟', image: '/assets/badges/frontier-explorer.png', special: true }
};

const BadgeCollection = ({ completedLevels, isCompact = false }) => {
  const earnedBadges = Object.keys(BADGES)
    .filter(level => completedLevels.includes(parseInt(level)))
    .map(level => ({ level: parseInt(level), ...BADGES[level] }));

  if (isCompact) {
    // Header display - just small icons
    return (
      <div className="badge-collection-compact">
        {earnedBadges.map(badge => (
          <div key={badge.level} className="badge-icon-small" title={badge.name}>
            <img 
              src={badge.image} 
              alt={badge.name}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
            />
            <span className="badge-emoji-fallback">{badge.emoji}</span>
          </div>
        ))}
      </div>
    );
  }

  // Full display
  return (
    <div className="badge-collection-full">
      <h2>Badge Collection</h2>
      <div className="badge-grid">
        {Object.entries(BADGES).map(([level, badge]) => {
          const isEarned = completedLevels.includes(parseInt(level));
          return (
            <div 
              key={level} 
              className={`badge-card ${isEarned ? 'earned' : 'locked'} ${badge.special ? 'special' : ''}`}
            >
              <div className="badge-icon">
                {isEarned ? (
                  <>
                    <img 
                      src={badge.image} 
                      alt={badge.name}
                      onError={(e) => { 
                        e.target.style.display = 'none'; 
                        e.target.nextSibling.style.display = 'block'; 
                      }}
                    />
                    <span className="badge-emoji-fallback">{badge.emoji}</span>
                  </>
                ) : (
                  <span className="badge-locked">🔒</span>
                )}
              </div>
              <div className="badge-name">{badge.name}</div>
              <div className="badge-level">Level {level}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeCollection;
