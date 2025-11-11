import React from 'react';

const StatsScreen = ({ setTimes, setAlarms, onRestart }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const totalTime = Object.values(setTimes).reduce((sum, time) => sum + time, 0);
  const totalAlarms = Object.values(setAlarms).reduce((sum, alarms) => sum + alarms, 0);
  
  return (
    <div className="stats-screen">
      <div className="stats-container">
        <h1 className="stats-title">🎉 ALL VAULTS CRACKED! 🎉</h1>
        
        <div className="stats-grid">
          {[1, 2, 3, 4, 5, 6].map(setNum => (
            <div key={setNum} className="stat-row">
              <div className="stat-label">Vault {setNum}:</div>
              <div className="stat-value">
                {formatTime(setTimes[setNum])}
                {setAlarms[setNum] > 0 && (
                  <span className="stat-alarms"> ⚠️ {setAlarms[setNum]}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="stats-totals">
          <div className="total-row">
            <div className="total-label">TOTAL TIME:</div>
            <div className="total-value">{formatTime(totalTime)}</div>
          </div>
          <div className="total-row">
            <div className="total-label">TOTAL ALARMS:</div>
            <div className="total-value">{totalAlarms}</div>
          </div>
        </div>
        
        <div className="stats-grade">
          {totalAlarms === 0 && (
            <div className="grade-message perfect">
              PERFECT RUN - NO ALARMS! 🏆
            </div>
          )}
          {totalAlarms > 0 && totalAlarms <= 3 && (
            <div className="grade-message excellent">
              EXCELLENT WORK! 🌟
            </div>
          )}
          {totalAlarms > 3 && totalAlarms <= 6 && (
            <div className="grade-message good">
              NICE JOB! 👍
            </div>
          )}
          {totalAlarms > 6 && (
            <div className="grade-message completed">
              MISSION COMPLETE! ✓
            </div>
          )}
        </div>
        
        <button className="restart-button" onClick={onRestart}>
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
};

export default StatsScreen;
