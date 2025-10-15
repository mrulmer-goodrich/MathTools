// src/modules/htable/HTableBattleRoyaleModule.jsx
import React, { useState, useEffect, useRef } from 'react';
import { generateBattleRoyaleProblem, generateDistractors, buildTokenSet } from '../../lib/generator';

const HTableBattleRoyaleModule = ({ onProblemComplete, registerReset }) => {
  // State Management
  const [gameState, setGameState] = useState('setup'); // setup, playing
  const [teamNames, setTeamNames] = useState(['Team Alpha', 'Team Beta']);
  const [playersPerTeam, setPlayersPerTeam] = useState(8);
  const [teams, setTeams] = useState({ team1: [], team2: [] });
  const [scores, setScores] = useState({ team1: 0, team2: 0 });
  
  const [currentProblem, setCurrentProblem] = useState(null);
  const [answerOptions, setAnswerOptions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({ team1: null, team2: null });
  const [lockedTeams, setLockedTeams] = useState({ team1: false, team2: false });
  const [winner, setWinner] = useState(null);
  
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [roundNumber, setRoundNumber] = useState(0);

  // Register reset function with parent
  useEffect(() => {
    registerReset(() => {
      // Reset everything to initial state
      setGameState('setup');
      setTeamNames(['Team Alpha', 'Team Beta']);
      setPlayersPerTeam(8);
      setTeams({ team1: [], team2: [] });
      setScores({ team1: 0, team2: 0 });
      setCurrentProblem(null);
      setAnswerOptions([]);
      setSelectedAnswers({ team1: null, team2: null });
      setLockedTeams({ team1: false, team2: false });
      setWinner(null);
      setTimer(0);
      setIsTimerRunning(false);
      setShowConfetti(false);
      setRoundNumber(0);
    });
  }, [registerReset]);

  // Timer Logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 10);
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTime = (ms) => {
    const centiseconds = Math.floor((ms / 10) % 100);
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor(ms / 60000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
  };

  // Setup Functions
  const generateRosters = () => {
    const tokens1 = buildTokenSet(playersPerTeam);
    const tokens2 = buildTokenSet(playersPerTeam);
    setTeams({
      team1: ['👑 CAPTAIN', ...tokens1.slice(0, playersPerTeam - 1)],
      team2: ['👑 CAPTAIN', ...tokens2.slice(0, playersPerTeam - 1)]
    });
  };

  const startGame = () => {
    if (teams.team1.length === 0) {
      alert('Generate rosters first!');
      return;
    }
    setGameState('playing');
    loadNewProblem();
  };

  const loadNewProblem = () => {
    const problem = generateBattleRoyaleProblem();
    const options = generateDistractors(problem.correctAnswer);
    setCurrentProblem(problem);
    setAnswerOptions(options);
    setSelectedAnswers({ team1: null, team2: null });
    setLockedTeams({ team1: false, team2: false });
    setWinner(null);
    setTimer(0);
    setIsTimerRunning(true);
    setRoundNumber(prev => prev + 1);
  };

  // Answer Selection
  const handleAnswerSelect = (team, answer) => {
    if (lockedTeams[team]) return;
    setSelectedAnswers(prev => ({ ...prev, [team]: answer }));
  };

  const lockAnswer = (team) => {
    if (!selectedAnswers[team]) {
      alert('Select an answer first!');
      return;
    }
    
    const isCorrect = selectedAnswers[team] === currentProblem.correctAnswer;
    
    if (isCorrect && !winner) {
      // First correct answer!
      setWinner(team);
      setScores(prev => ({ ...prev, [team]: prev[team] + 1 }));
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setIsTimerRunning(false);
      onProblemComplete(); // Notify parent
    }
    
    setLockedTeams(prev => ({ ...prev, [team]: true }));
  };

  // Confetti Component
  const Confetti = () => (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {[...Array(100)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: '-20px',
            animation: `fall ${2 + Math.random() * 2}s linear infinite`,
            animationDelay: `${Math.random() * 0.5}s`,
            fontSize: `${20 + Math.random() * 30}px`
          }}
        >
          {['🎉', '🎊', '✨', '🏆', '⭐'][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>
  );

  // ========== SETUP SCREEN ==========
  if (gameState === 'setup') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}>
        <style>{`
          @keyframes fall {
            to { transform: translateY(100vh) rotate(360deg); }
          }
        `}</style>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: 'bold', 
            color: 'white', 
            textAlign: 'center', 
            marginBottom: '1rem',
            fontFamily: 'Poppins, sans-serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            H-TABLE BATTLE ROYALE 
          </h1>
          <p style={{ 
            fontSize: '1.5rem', 
            color: 'white', 
            textAlign: 'center', 
            marginBottom: '3rem' 
          }}>
            Eastway Middle Edition
          </p>

          <div style={{ 
            background: 'white', 
            borderRadius: '1rem', 
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', 
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Game Setup</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Team 1 Name:
                </label>
                <input
                  type="text"
                  value={teamNames[0]}
                  onChange={(e) => setTeamNames([e.target.value, teamNames[1]])}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: '2px solid #60a5fa', 
                    borderRadius: '0.5rem',
                    fontSize: '1.25rem'
                  }}
                  placeholder="Enter team 1 name"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Team 2 Name:
                </label>
                <input
                  type="text"
                  value={teamNames[1]}
                  onChange={(e) => setTeamNames([teamNames[0], e.target.value])}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: '2px solid #34d399', 
                    borderRadius: '0.5rem',
                    fontSize: '1.25rem'
                  }}
                  placeholder="Enter team 2 name"
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Players Per Team:
              </label>
              <input
                type="number"
                min="4"
                max="12"
                value={playersPerTeam}
                onChange={(e) => setPlayersPerTeam(parseInt(e.target.value))}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #a78bfa', 
                  borderRadius: '0.5rem',
                  fontSize: '1.25rem'
                }}
              />
            </div>

            <button
              onClick={generateRosters}
              className="button primary gradient-button"
              style={{ 
                width: '100%',
                padding: '1rem',
                fontSize: '1.5rem',
                marginBottom: '1rem'
              }}
            >
              🎲 Generate Token Rosters
            </button>

            {teams.team1.length > 0 && (
              <button
                onClick={startGame}
                className="button primary gradient-button"
                style={{ 
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.5rem'
                }}
              >
                🚀 START GAME
              </button>
            )}
          </div>

          {teams.team1.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
                borderRadius: '1rem', 
                padding: '1.5rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '1rem' }}>
                  {teamNames[0]}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {teams.team1.map((token, idx) => (
                    <div key={idx} style={{ 
                      background: 'white', 
                      borderRadius: '0.5rem', 
                      padding: '1rem',
                      textAlign: 'center',
                      fontSize: '2rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {token}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ 
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', 
                borderRadius: '1rem', 
                padding: '1.5rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#065f46', marginBottom: '1rem' }}>
                  {teamNames[1]}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {teams.team2.map((token, idx) => (
                    <div key={idx} style={{ 
                      background: 'white', 
                      borderRadius: '0.5rem', 
                      padding: '1rem',
                      textAlign: 'center',
                      fontSize: '2rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {token}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== PLAYING SCREEN ==========
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1.5rem'
    }}>
      <style>{`
        @keyframes fall {
          to { transform: translateY(100vh) rotate(360deg); }
        }
        .answer-tile {
          padding: 1.5rem;
          border-radius: 0.75rem;
          font-size: 1.5rem;
          font-weight: bold;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          cursor: pointer;
          background: white;
          color: #1f2937;
        }
        .answer-tile:hover:not(:disabled) {
          transform: scale(1.05);
        }
        .answer-tile.selected-blue {
          background: #3b82f6;
          color: white;
          transform: scale(1.1);
          box-shadow: 0 0 0 4px #93c5fd;
        }
        .answer-tile.selected-green {
          background: #10b981;
          color: white;
          transform: scale(1.1);
          box-shadow: 0 0 0 4px #6ee7b7;
        }
        .answer-tile.correct {
          background: #22c55e;
          color: white;
        }
        .answer-tile:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      
      {showConfetti && <Confetti />}
      
      {/* Header with Scores and Timer */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
            borderRadius: '1rem', 
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>{teamNames[0]}</h3>
            <p style={{ fontSize: '4rem', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>{scores.team1}</p>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: '1rem', 
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#6b7280', margin: 0 }}>
              Round {roundNumber}
            </p>
            <p style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              color: '#8b5cf6',
              fontFamily: 'monospace',
              margin: 0
            }}>
              {formatTime(timer)}
            </p>
          </div>

          <div style={{ 
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', 
            borderRadius: '1rem', 
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#065f46' }}>{teamNames[1]}</h3>
            <p style={{ fontSize: '4rem', fontWeight: 'bold', color: '#059669', margin: 0 }}>{scores.team2}</p>
          </div>
        </div>
      </div>

      {/* Problem Display */}
      {currentProblem && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '1.5rem' }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '1rem', 
            padding: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '5rem' }}>{currentProblem.visual}</span>
            </div>
            <p style={{ 
              fontSize: '2rem', 
              fontWeight: '600', 
              color: '#1f2937',
              textAlign: 'center',
              lineHeight: '1.5',
              margin: 0
            }}>
              {currentProblem.text}
            </p>
          </div>
        </div>
      )}

      {/* Answer Tiles */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Team 1 Answers */}
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
              {teamNames[0]}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              {answerOptions.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect('team1', answer)}
                  disabled={lockedTeams.team1}
                  className={`answer-tile ${
                    selectedAnswers.team1 === answer ? 'selected-blue' : ''
                  } ${
                    lockedTeams.team1 && answer === currentProblem.correctAnswer ? 'correct' : ''
                  }`}
                >
                  {answer}
                </button>
              ))}
            </div>
            <button
              onClick={() => lockAnswer('team1')}
              disabled={lockedTeams.team1 || !selectedAnswers.team1}
              className="button primary gradient-button"
              style={{ 
                width: '100%',
                padding: '1rem',
                fontSize: '1.5rem',
                opacity: (lockedTeams.team1 || !selectedAnswers.team1) ? 0.5 : 1
              }}
            >
              {lockedTeams.team1 ? '🔒 LOCKED' : '🔐 LOCK IT IN'}
            </button>
            {lockedTeams.team1 && selectedAnswers.team1 === currentProblem.correctAnswer && (
              <p style={{ color: '#22c55e', fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginTop: '1rem' }}>
                ✅ CORRECT!
              </p>
            )}
            {lockedTeams.team1 && selectedAnswers.team1 !== currentProblem.correctAnswer && (
              <p style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginTop: '1rem' }}>
                ❌ INCORRECT
              </p>
            )}
          </div>

          {/* Team 2 Answers */}
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
              {teamNames[1]}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              {answerOptions.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect('team2', answer)}
                  disabled={lockedTeams.team2}
                  className={`answer-tile ${
                    selectedAnswers.team2 === answer ? 'selected-green' : ''
                  } ${
                    lockedTeams.team2 && answer === currentProblem.correctAnswer ? 'correct' : ''
                  }`}
                >
                  {answer}
                </button>
              ))}
            </div>
            <button
              onClick={() => lockAnswer('team2')}
              disabled={lockedTeams.team2 || !selectedAnswers.team2}
              className="button primary gradient-button"
              style={{ 
                width: '100%',
                padding: '1rem',
                fontSize: '1.5rem',
                opacity: (lockedTeams.team2 || !selectedAnswers.team2) ? 0.5 : 1
              }}
            >
              {lockedTeams.team2 ? '🔒 LOCKED' : '🔐 LOCK IT IN'}
            </button>
            {lockedTeams.team2 && selectedAnswers.team2 === currentProblem.correctAnswer && (
              <p style={{ color: '#22c55e', fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginTop: '1rem' }}>
                ✅ CORRECT!
              </p>
            )}
            {lockedTeams.team2 && selectedAnswers.team2 !== currentProblem.correctAnswer && (
              <p style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginTop: '1rem' }}>
                ❌ INCORRECT
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Next Problem Button */}
      {winner && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <button
            onClick={loadNewProblem}
            className="button primary gradient-button pulse-animation"
            style={{ 
              padding: '1.5rem 3rem',
              fontSize: '2rem'
            }}
          >
            ⚡ NEXT PROBLEM ⚡
          </button>
        </div>
      )}
    </div>
  );
};

export default HTableBattleRoyaleModule;
