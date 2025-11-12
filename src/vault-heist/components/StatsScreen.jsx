import React from 'react';
import { problemSets } from '../problems';

const StatsScreen = ({ setTimes, setAlarms, onRestart }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const totalTime = Object.values(setTimes).reduce((sum, time) => sum + time, 0);
  const totalAlarms = Object.values(setAlarms).reduce((sum, alarms) => sum + alarms, 0);
  
  // Get the code for each vault
  const getVaultCode = (vaultNum) => {
    const setData = problemSets[`set${vaultNum}`];
    return setData?.codeSequence?.join('') || 'N/A';
  };
  
  // Mission completion message based on performance
  const getMissionMessage = () => {
    if (totalAlarms === 0) {
      return "🏆 FLAWLESS EXECUTION, AGENT! All vaults cracked without triggering a single alarm. Your skill in scale factor operations is unmatched. The agency is impressed.";
    } else if (totalAlarms <= 3) {
      return "⭐ OUTSTANDING PERFORMANCE! You've successfully extracted all classified data with minimal security breaches. Your expertise in proportional reasoning has served you well.";
    } else if (totalAlarms <= 6) {
      return "✅ MISSION ACCOMPLISHED! Despite some close calls, you've proven your ability to work under pressure. All vault codes have been secured.";
    } else {
      return "✓ OBJECTIVE COMPLETE. The mission was challenging, but you persevered. All six vaults have been cracked and the mathematical secrets are now in your possession.";
    }
  };
  
  return (
    <div className="stats-screen">
      <div className="stats-container">
        <h1 className="stats-title">🎉 ALL VAULTS CRACKED! 🎉</h1>
        
        <div className="mission-complete-message">
          {getMissionMessage()}
        </div>
        
        <div className="stats-grid">
          {[1, 2, 3, 4, 5, 6].map(setNum => (
            <div key={setNum} className="stat-row">
              <div className="stat-label">Vault {setNum}:</div>
              <div className="stat-details">
                <div className="stat-time-alarms">
                  {formatTime(setTimes[setNum])}
                  {setAlarms[setNum] > 0 && (
                    <span className="stat-alarms"> ⚠️ {setAlarms[setNum]}</span>
                  )}
                </div>
                <div className="stat-code">
                  Code: <span className="code-value">{getVaultCode(setNum)}</span>
                </div>
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
        
        <div className="final-transmission">
          <div className="transmission-text">
            █ END TRANSMISSION █
          </div>
        </div>
        
        <button className="restart-button" onClick={onRestart}>
          NEW MISSION
        </button>
      </div>
    </div>
  );
};

export default StatsScreen;
