// StatsPanel.jsx - ENHANCED: Per-level stats, first-try success, difficulty tracking
// Location: src/algebra/components/StatsPanel.jsx

import React from 'react';
import '../styles/stats-panel.css';

const StatsPanel = ({ stats, progress, playerName, difficulty, onClose }) => {
  const sessionTime = stats?.sessionStart ? Math.floor((Date.now() - stats.sessionStart) / 60000) : 0;
  const accuracy = stats?.problemsAttempted > 0 
    ? Math.round((stats.problemsCorrect / stats.problemsAttempted) * 100) 
    : 0;

  // Calculate practice vs game stats
  const practiceProblems = stats?.practiceProblems || 0;
  const gameProblems = stats?.gameProblems || 0;
  const totalProblems = stats?.problemsAttempted || 0;

  // Get level-by-level stats grouped by difficulty
  const levelStats = stats?.levelStats || {};
  
  // Calculate first-try success rate
  const calculateFirstTryRate = () => {
    let totalFirstTry = 0;
    let totalAttempts = 0;
    Object.values(levelStats).forEach(level => {
      totalFirstTry += level.firstTrySuccess || 0;
      totalAttempts += level.firstTryAttempts || 0;
    });
    return totalAttempts > 0 ? Math.round((totalFirstTry / totalAttempts) * 100) : 0;
  };

  const firstTryRate = calculateFirstTryRate();

  // Group stats by skill areas (Levels 1-4, 5-8, 9-12, 13-16, etc.)
  const skillAreas = [
    { name: 'Operations with Integers', levels: ['1-1', '1-2', '1-3', '1-4'], emoji: '🔢' },
    { name: 'Distribution', levels: ['1-5', '1-6', '1-7', '1-8'], emoji: '📦' },
    { name: 'Combining Like Terms', levels: ['1-9', '1-10', '1-11', '1-12'], emoji: '🧮' },
    { name: 'Distribute Then Combine', levels: ['1-13', '1-14', '1-15', '1-16'], emoji: '⛺' },
    { name: 'One-Step Equations', levels: ['1-17', '1-18', '1-19', '1-20'], emoji: '🌊' },
    { name: 'Two-Step Equations', levels: ['1-21', '1-22', '1-23'], emoji: '⛰️' },
    { name: 'Multi-Step Equations', levels: ['1-24', '1-25'], emoji: '🏔️' },
    { name: 'Variables on Both Sides', levels: ['1-26', '1-27', '1-28', '1-29', '1-30'], emoji: '🗝️' },
    { name: 'Ultimate Challenges', levels: ['1-31', '1-32'], emoji: '🏆' },
    { name: 'Inequalities', levels: ['1-33', '1-34', '1-35', '1-36', '1-37'], emoji: '⚖️' }
  ];

  // Calculate stats for each skill area
  const getSkillAreaStats = () => {
    const diffKey = difficulty || 'easy';
    return skillAreas.map(area => {
      let totalProblems = 0;
      let totalCorrect = 0;
      let totalTime = 0;
      let levelsStarted = 0;

      area.levels.forEach(levelId => {
        const key = `${levelId}-${diffKey}`;
        const levelData = levelStats[key];
        if (levelData && levelData.attempted > 0) {
          levelsStarted++;
          totalProblems += levelData.attempted;
          totalCorrect += levelData.correct;
          totalTime += levelData.totalTime || 0;
        }
      });

      const accuracy = totalProblems > 0 ? Math.round((totalCorrect / totalProblems) * 100) : 0;
      const avgTime = totalProblems > 0 ? Math.round(totalTime / totalProblems) : 0;

      return {
        ...area,
        levelsStarted,
        totalLevels: area.levels.length,
        totalProblems,
        accuracy,
        avgTime
      };
    }).filter(area => area.levelsStarted > 0); // Only show started areas
  };

  const skillAreaStats = getSkillAreaStats();

  // Get top performing levels
  const getTopPerformers = () => {
    const diffKey = difficulty || 'easy';
    const performers = Object.entries(levelStats)
      .filter(([key]) => key.endsWith(`-${diffKey}`))
      .map(([key, data]) => {
        const levelId = key.replace(`-${diffKey}`, '');
        const levelNum = levelId.split('-')[1];
        const accuracy = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;
        const avgTime = data.attempted > 0 ? Math.round(data.totalTime / data.attempted) : 0;
        return { levelNum, accuracy, avgTime, attempted: data.attempted };
      })
      .filter(level => level.attempted > 0)
      .sort((a, b) => {
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return a.avgTime - b.avgTime; // Faster is better
      })
      .slice(0, 5);
    
    return performers;
  };

  const topPerformers = getTopPerformers();

  // Get areas for improvement
  const getAreasForImprovement = () => {
    const diffKey = difficulty || 'easy';
    return Object.entries(levelStats)
      .filter(([key]) => key.endsWith(`-${diffKey}`))
      .map(([key, data]) => {
        const levelId = key.replace(`-${diffKey}`, '');
        const levelNum = levelId.split('-')[1];
        const accuracy = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;
        return { levelNum, accuracy, attempted: data.attempted };
      })
      .filter(level => level.attempted >= 3 && level.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);
  };

  const areasForImprovement = getAreasForImprovement();

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="algebra-modal-overlay" onClick={onClose}>
      <div className="algebra-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="algebra-modal-header">
          <h2>📊 {playerName}'s Statistics</h2>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="algebra-modal-content">
          
          {/* Top Stats Grid */}
          <div className="stats-grid-top">
            <div className="stat-card green">
              <div className="stat-icon">✓</div>
              <div className="stat-value">{stats?.problemsCorrect || 0}</div>
              <div className="stat-label">Solved</div>
            </div>

            <div className="stat-card orange">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>

            <div className="stat-card blue">
              <div className="stat-icon">⚡</div>
              <div className="stat-value">{firstTryRate}%</div>
              <div className="stat-label">First Try</div>
            </div>

            <div className="stat-card purple">
              <div className="stat-icon">⏱️</div>
              <div className="stat-value">{sessionTime}</div>
              <div className="stat-label">Minutes</div>
            </div>
          </div>

          {/* Mode Breakdown */}
          <div className="stats-section">
            <h3>Mode Breakdown</h3>
            <div className="mode-stats">
              <div className="mode-item">
                <div className="mode-label">🎮 Game Mode</div>
                <div className="mode-bar-container">
                  <div 
                    className="mode-bar game" 
                    style={{ width: totalProblems > 0 ? `${(gameProblems / totalProblems) * 100}%` : '0%' }}
                  >
                    <span className="mode-count">{gameProblems}</span>
                  </div>
                </div>
              </div>
              <div className="mode-item">
                <div className="mode-label">📝 Practice Mode</div>
                <div className="mode-bar-container">
                  <div 
                    className="mode-bar practice" 
                    style={{ width: totalProblems > 0 ? `${(practiceProblems / totalProblems) * 100}%` : '0%' }}
                  >
                    <span className="mode-count">{practiceProblems}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance by Skill Area */}
          {skillAreaStats.length > 0 && (
            <div className="stats-section">
              <h3>📈 Performance by Skill Area</h3>
              <div className="skill-areas-list">
                {skillAreaStats.map((area, idx) => (
                  <div key={idx} className="skill-area-card">
                    <div className="skill-area-header">
                      <span className="skill-emoji">{area.emoji}</span>
                      <span className="skill-name">{area.name}</span>
                    </div>
                    <div className="skill-stats">
                      <span className="skill-stat">{area.levelsStarted}/{area.totalLevels} levels</span>
                      <span className="skill-stat">•</span>
                      <span className="skill-stat">{area.totalProblems} problems</span>
                      <span className="skill-stat">•</span>
                      <span className="skill-stat">{area.accuracy}%</span>
                      {area.avgTime > 0 && (
                        <>
                          <span className="skill-stat">•</span>
                          <span className="skill-stat">{area.avgTime}s avg</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top 5 Best Performance */}
          {topPerformers.length > 0 && (
            <div className="stats-section">
              <h3>🏆 Top Performance</h3>
              <div className="top-performers-list">
                {topPerformers.map((level, idx) => (
                  <div key={idx} className="performer-row">
                    <span className="rank">{idx + 1}.</span>
                    <span className="level-info">Level {level.levelNum}</span>
                    <span className="performer-stats">
                      {level.accuracy}% • {level.avgTime}s avg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Areas for Improvement */}
          {areasForImprovement.length > 0 && (
            <div className="stats-section">
              <h3>⚠️ Areas for Improvement</h3>
              <div className="improvement-list">
                {areasForImprovement.map((level, idx) => (
                  <div key={idx} className="improvement-row">
                    <span className="level-info">Level {level.levelNum}</span>
                    <span className="improvement-stats">{level.accuracy}% • Needs review</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Knowledge Crystals */}
          <div className="crystals-display">
            <img 
              src="/algebra/KnowledgeCrystal.png" 
              alt="Knowledge Crystal" 
              className="crystal-icon"
            />
            <div className="crystal-info">
              <div className="crystal-count">{progress?.crystals || 0} Knowledge Crystals</div>
              <div className="crystal-subtext">Earned by solving problems correctly</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StatsPanel;
