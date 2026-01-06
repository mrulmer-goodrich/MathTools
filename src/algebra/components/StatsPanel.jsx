// StatsPanel.jsx - PROFESSIONAL DATA TABLE VERSION
// Location: src/algebra/components/StatsPanel.jsx

import React, { useMemo } from 'react';
import '../styles/stats-panel.css';

const StatsPanel = ({ stats, progress, playerName, difficulty, onClose }) => {
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'level', direction: 'asc' });
  
  // Avatar selection state
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem('algebra_player_avatar') || '1';
  });

  // Handle column header click for sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle avatar selection
  const handleAvatarChange = (avatarNum) => {
    setSelectedAvatar(avatarNum);
    localStorage.setItem('algebra_player_avatar', avatarNum);
    // Force refresh to update avatar in floating icons
    window.location.reload();
  };

  // Handle clear session
  const handleClearSession = () => {
    if (window.confirm('⚠️ This will delete ALL your progress in Algebra Expedition. Are you sure?')) {
      if (window.confirm('This action cannot be undone. Really delete everything?')) {
        // Clear all algebra localStorage
        localStorage.removeItem('algebra_difficulty');
        localStorage.removeItem('algebra_current_level');
        localStorage.removeItem('algebra_progress');
        localStorage.removeItem('algebra_enhanced_stats');
        localStorage.removeItem('algebra_practice_difficulty');
        localStorage.removeItem('algebra_story_seen');
        
        // Reload to reset everything
        window.location.reload();
      }
    }
  };
  
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
    
    // Apply sorting
    return rows.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [levelStats, diffKey, sortConfig]);

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
                      <th onClick={() => handleSort('level')} style={{ cursor: 'pointer' }}>
                        Level {sortConfig.key === 'level' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('attempted')} style={{ cursor: 'pointer' }}>
                        Attempted {sortConfig.key === 'attempted' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('correct')} style={{ cursor: 'pointer' }}>
                        Right {sortConfig.key === 'correct' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('accuracy')} style={{ cursor: 'pointer' }}>
                        Acc {sortConfig.key === 'accuracy' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('time')} style={{ cursor: 'pointer' }}>
                        Avg Time {sortConfig.key === 'time' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
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

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '0.75rem', 
            marginTop: '1rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setShowAvatarSelector(!showAvatarSelector)}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
              }}
            >
              👤 Change Avatar
            </button>
            
            <button
              onClick={handleClearSession}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
              }}
            >
              🗑️ Clear Session
            </button>
          </div>

          {/* Avatar Selector Grid */}
          {showAvatarSelector && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#F9FAFB',
              borderRadius: '8px',
              border: '2px solid #E5E7EB'
            }}>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#1F2937',
                marginBottom: '0.75rem',
                textAlign: 'center',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Select Your Avatar
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(10, 1fr)',
                gap: '0.5rem'
              }}>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <div
                    key={num}
                    onClick={() => handleAvatarChange(num.toString())}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      border: selectedAvatar === num.toString() ? '3px solid #10B981' : '2px solid #E5E7EB',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: selectedAvatar === num.toString() ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: selectedAvatar === num.toString() 
                        ? '0 4px 12px rgba(16, 185, 129, 0.4)' 
                        : '0 2px 4px rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                      background: '#FFFFFF',
                      backgroundImage: `url(/algebra/avatar-${num}.png)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default StatsPanel;
