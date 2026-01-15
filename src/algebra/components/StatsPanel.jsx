// StatsPanel.jsx - COMPLETE FIX: All morning notes addressed
// VERSION: 2025-01-14_03 (Mode key parsing, nuclear clear)
// Location: src/algebra/components/StatsPanel.jsx

import React, { useMemo, useState } from 'react';
import '../styles/stats-panel.css';

const StatsPanel = ({ stats, progress, playerName, difficulty, onClose }) => {
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'level', direction: 'asc' });
  
  // Avatar selection state
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem('algebra_player_avatar') || '1';
  });
  
  // UI FIX #11: Name change state
  const [newPlayerName, setNewPlayerName] = useState(playerName || '');

  // Handle column header click for sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle avatar selection WITHOUT page reload
  const handleAvatarChange = (avatarNum) => {
    setSelectedAvatar(avatarNum);
    localStorage.setItem('algebra_player_avatar', avatarNum);
    setShowAvatarSelector(false);
    // Trigger storage event so FloatingIcons updates
    window.dispatchEvent(new Event('storage'));
  };
  
  // UI FIX #11: Handle name change
  const handleNameChange = () => {
    if (newPlayerName.trim()) {
      localStorage.setItem('algebra_player_name', newPlayerName.trim());
      // Trigger reload to update name everywhere
      window.location.reload();
    }
  };

  // Handle clear session
  const handleClearSession = () => {
    if (window.confirm('⚠️ This will delete ALL your progress in Algebra Expedition. Are you sure?')) {
      if (window.confirm('This action cannot be undone. Really delete everything?')) {
        localStorage.removeItem('algebra_difficulty');
        localStorage.removeItem('algebra_current_level');
        localStorage.removeItem('algebra_progress');
        localStorage.removeItem('algebra_enhanced_stats');
        localStorage.removeItem('algebra_practice_difficulty');
        localStorage.removeItem('algebra_story_seen');
        window.location.reload();
      }
    }
  };
  
  // Calculate overall stats from levelStats (ACCURATE)
  const levelStats = stats?.levelStats || {};
  
  const totalAttempted = useMemo(() => {
    let total = 0;
    Object.values(levelStats).forEach(level => {
      total += level.attempted || 0;
    });
    return total;
  }, [levelStats]);
  
  const totalCorrect = useMemo(() => {
    let total = 0;
    Object.values(levelStats).forEach(level => {
      total += level.correct || 0;
    });
    return total;
  }, [levelStats]);
  
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Calculate active time (sum of problem times)
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

  // Get COMBINED level performance data (both Standard and Advanced)
  const levelPerformanceData = useMemo(() => {
    const rows = [];
    const processedLevels = new Set();
    
    Object.entries(levelStats).forEach(([key, data]) => {
      // NEW KEY FORMAT: "1-1-easy-play" = level-number-difficulty-mode
      // OLD KEY FORMAT: "1-1-easy" = level-number-difficulty
      const parts = key.split('-');
      
      let levelNum, diffSuffix, modeSuffix;
      
      if (parts.length === 4) {
        // NEW FORMAT: ["1", "1", "easy", "play"]
        levelNum = parts[1];
        diffSuffix = parts[2];
        modeSuffix = parts[3];
      } else if (parts.length === 3) {
        // OLD FORMAT (backward compatibility): ["1", "1", "easy"]
        levelNum = parts[1];
        diffSuffix = parts[2];
        modeSuffix = data.mode || 'unknown';
      } else {
        console.warn('Unexpected levelStats key format:', key);
        return;
      }
      
      // Create unique key for this level (including mode now)
      const levelKey = `${levelNum}-${diffSuffix}-${modeSuffix}`;
      
      if (processedLevels.has(levelKey)) return;
      processedLevels.add(levelKey);
      
      const levelAccuracy = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;
      const avgTime = data.correct > 0 ? Math.round(data.totalTime / data.correct) : 0;
      
      rows.push({
        level: parseInt(levelNum),
        difficulty: diffSuffix === 'easy' ? 'Standard' : 'Advanced',
        attempted: data.attempted,
        correct: data.correct,
        accuracy: levelAccuracy,
        time: avgTime,
        mode: modeSuffix  // Include mode
      });
    });
    
    // Apply sorting
    return rows.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // For difficulty, use string comparison
      if (sortConfig.key === 'difficulty') {
        return sortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      // For numbers
      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [levelStats, sortConfig]);

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

          {/* Level Performance Table - COMBINED VIEW */}
          <div className="stats-section-pro">
            <h3>Level Performance (All Routes)</h3>
            
            {levelPerformanceData.length > 0 ? (
              <div className="stats-table-container">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('level')} style={{ cursor: 'pointer' }}>
                        Level {sortConfig.key === 'level' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('difficulty')} style={{ cursor: 'pointer' }}>
                        Route {sortConfig.key === 'difficulty' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('attempted')} style={{ cursor: 'pointer' }}>
                        Attempted {sortConfig.key === 'attempted' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('correct')} style={{ cursor: 'pointer' }}>
                        Correct {sortConfig.key === 'correct' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('accuracy')} style={{ cursor: 'pointer' }}>
                        Accuracy % {sortConfig.key === 'accuracy' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('time')} style={{ cursor: 'pointer' }}>
                        Avg Time {sortConfig.key === 'time' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelPerformanceData.map((row, index) => (
                      <tr key={`${row.level}-${row.difficulty}-${index}`}>
                        <td className="level-cell">{row.level}</td>
                        <td className="difficulty-cell">{row.difficulty}</td>
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
                No level data yet. Start playing to see your stats!
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
              👤 Change Avatar & Name
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
              
              {/* UI FIX #11: Name Change Field */}
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#1F2937',
                  marginBottom: '0.5rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Change Your Name
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder={playerName}
                    maxLength={20}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      border: '2px solid #E5E7EB',
                      borderRadius: '6px',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600
                    }}
                  />
                  <button
                    onClick={handleNameChange}
                    disabled={!newPlayerName.trim() || newPlayerName.trim() === playerName}
                    style={{
                      padding: '0.5rem 1rem',
                      background: newPlayerName.trim() && newPlayerName.trim() !== playerName
                        ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                        : '#E5E7EB',
                      color: newPlayerName.trim() && newPlayerName.trim() !== playerName
                        ? 'white'
                        : '#9CA3AF',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      fontFamily: 'Poppins, sans-serif',
                      cursor: newPlayerName.trim() && newPlayerName.trim() !== playerName
                        ? 'pointer'
                        : 'not-allowed',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default StatsPanel;
