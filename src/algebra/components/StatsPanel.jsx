// StatsPanel.jsx - PROFESSIONAL DATA TABLE VERSION
// Location: src/algebra/components/StatsPanel.jsx

import React, { useMemo } from 'react';
import '../styles/stats-panel.css';

const StatsPanel = ({ stats, progress, playerName, difficulty, onClose }) => {
  
  // Calculate overall stats
  const totalAttempted = stats?.problemsAttempted || 0;
  const totalCorrect = stats?.problemsCorrect || 0;
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Calculate active time (sum of problem times)
  const levelStats = stats?.levelStats || {};
  const activeTime = useMemo(() => {
    let totalSeconds = 0;
    Object.values(levelStats).forEach(level => {
      totalSeconds += level.totalTime || 0;
    });
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.round(totalSeconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }, [levelStats]);

  // Calculate first-try percentage
  const firstTryPercentage = useMemo(() => {
    let totalSolved = 0;
    let firstTryCorrect = 0;
    Object.values(levelStats).forEach(level => {
      totalSolved += level.totalSolved || 0;
      firstTryCorrect += level.firstTryCorrect || 0;
    });
    return totalSolved > 0 ? Math.round((firstTryCorrect / totalSolved) * 100) : 0;
  }, [levelStats]);

  // Get level performance data as table rows
  const diffKey = difficulty || 'easy';
  const levelPerformanceData = useMemo(() => {
    const rows = [];
    Object.entries(levelStats)
      .filter(([key]) => key.endsWith(`-${diffKey}`))
      .forEach(([key, data]) => {
        const levelId = key.replace(`-${diffKey}`, '');
        const levelNum = levelId.split('-')[1];
        const levelAccuracy = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;
        const avgTime = data.correct > 0 ? Math.round(data.totalTime / data.correct) : 0;
        
        rows.push({
          level: parseInt(levelNum),
          attempted: data.attempted,
          correct: data.correct,
          accuracy: levelAccuracy,
          time: avgTime
        });
      });
    
    // Sort by level number
    return rows.sort((a, b) => a.level - b.level);
  }, [levelStats, diffKey]);

  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '-';
    return `${seconds}s`;
  };

  return (
    <div className="algebra-modal-overlay" onClick={onClose}>
      <div className="algebra-modal-container stats-professional" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="algebra-modal-header">
          <h2>📊 {playerName}'s Statistics</h2>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="algebra-modal-content">
          
          {/* Crystals at Top */}
          <div className="crystals-display-top">
            <img 
              src="/algebra/KnowledgeCrystal.png" 
              alt="Knowledge Crystal" 
              className="crystal-icon-small"
            />
            <div className="crystal-count-top">{progress?.crystals || 0} Knowledge Crystals</div>
          </div>

          {/* Summary Stats */}
          <div className="stats-summary-row">
            <div className="summary-stat">
              <div className="summary-value">{totalAttempted}</div>
              <div className="summary-label">Attempted</div>
            </div>
            <div className="summary-stat">
              <div className="summary-value">{accuracy}%</div>
              <div className="summary-label">Accuracy</div>
            </div>
            <div className="summary-stat">
              <div className="summary-value">{firstTryPercentage}%</div>
              <div className="summary-label">First Try</div>
            </div>
            <div className="summary-stat">
              <div className="summary-value">{activeTime}</div>
              <div className="summary-label">Active Time</div>
            </div>
          </div>

          {/* Level Performance Table */}
          <div className="stats-section-pro">
            <h3>Level Performance ({difficulty === 'easy' ? 'Standard' : 'Advanced'} Route)</h3>
            
            {levelPerformanceData.length > 0 ? (
              <div className="stats-table-container">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Level</th>
                      <th>Tried</th>
                      <th>Right</th>
                      <th>Acc</th>
                      <th>Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelPerformanceData.map((row) => (
                      <tr key={row.level}>
                        <td className="level-cell">{row.level}</td>
                        <td>{row.attempted}</td>
                        <td>{row.correct}</td>
                        <td className={row.accuracy >= 70 ? 'acc-good' : row.accuracy >= 50 ? 'acc-ok' : 'acc-poor'}>
                          {row.accuracy}%
                        </td>
                        <td>{formatTime(row.time)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data-pro">
                No level data yet for this route. Start playing to see your stats!
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default StatsPanel;
