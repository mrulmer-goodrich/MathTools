// src/modules/htablebattle/HTableBattleRoyaleModule.jsx
import React, { useState, useEffect, useRef } from 'react';

const HTableBattleRoyaleModule = ({ onProblemComplete, registerReset }) => {
  // State Management
  const [gameState, setGameState] = useState('setup'); // setup, ready-check, playing
  const [teamNames, setTeamNames] = useState(['Team Alpha', 'Team Beta']);
  const [playersPerTeam, setPlayersPerTeam] = useState(10);
  const [teams, setTeams] = useState({ team1: [], team2: [] });
  const [selectedTokens, setSelectedTokens] = useState({ team1: [], team2: [] });
  const [scores, setScores] = useState({ team1: 0, team2: 0 });
  const [showResumeOption, setShowResumeOption] = useState(false);
  
  const [gameConstraints, setGameConstraints] = useState(null); // Units and numbers to use
  const [currentProblem, setCurrentProblem] = useState(null);
  const [answerOptions, setAnswerOptions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({ team1: null, team2: null });
  const [lockedTeams, setLockedTeams] = useState({ team1: false, team2: false });
  const [winnerThisRound, setWinnerThisRound] = useState(null);
  
  const [timers, setTimers] = useState({ team1: 0, team2: 0 });
  const [isTimerRunning, setIsTimerRunning] = useState({ team1: false, team2: false });
  const timerRef = useRef({ team1: null, team2: null });
  
  const [showResultOverlay, setShowResultOverlay] = useState({ team1: null, team2: null });
  const [roundNumber, setRoundNumber] = useState(0);
  const [showStartConfirm, setShowStartConfirm] = useState(false);

  // Check for saved game on mount
  useEffect(() => {
    const savedGame = localStorage.getItem('htable-battle-royale-save');
    if (savedGame) {
      setShowResumeOption(true);
      const gameData = JSON.parse(savedGame);
      setTeamNames(gameData.teamNames);
      setPlayersPerTeam(gameData.playersPerTeam);
    }
  }, []);

  // Save game state whenever playing
  useEffect(() => {
    if (gameState === 'playing' && roundNumber > 0) {
      const gameData = {
        teamNames,
        playersPerTeam,
        teams,
        scores,
        roundNumber,
        gameConstraints
      };
      localStorage.setItem('htable-battle-royale-save', JSON.stringify(gameData));
    }
  }, [gameState, scores, roundNumber, teamNames, playersPerTeam, teams, gameConstraints]);

  const resumeGame = () => {
    const savedGame = localStorage.getItem('htable-battle-royale-save');
    if (savedGame) {
      const gameData = JSON.parse(savedGame);
      setTeams(gameData.teams);
      setScores(gameData.scores);
      setRoundNumber(gameData.roundNumber);
      setGameConstraints(gameData.gameConstraints);
      setGameState('playing');
      setTimeout(() => loadNewProblem(), 100);
    }
    setShowResumeOption(false);
  };

  const startNewGame = () => {
    localStorage.removeItem('htable-battle-royale-save');
    setShowResumeOption(false);
    setScores({ team1: 0, team2: 0 });
    setRoundNumber(0);
    setTeams({ team1: [], team2: [] });
    setGameConstraints(null);
  };

  // Register reset function
  useEffect(() => {
    registerReset(() => {
      setGameState('setup');
      setTeamNames(['Team Alpha', 'Team Beta']);
      setPlayersPerTeam(10);
      setTeams({ team1: [], team2: [] });
      setSelectedTokens({ team1: [], team2: [] });
      setScores({ team1: 0, team2: 0 });
      setGameConstraints(null);
      setCurrentProblem(null);
      setAnswerOptions([]);
      setSelectedAnswers({ team1: null, team2: null });
      setLockedTeams({ team1: false, team2: false });
      setWinnerThisRound(null);
      setTimers({ team1: 0, team2: 0 });
      setIsTimerRunning({ team1: false, team2: false });
      setShowResultOverlay({ team1: null, team2: null });
      setRoundNumber(0);
    });
  }, [registerReset]);

  // Timer Logic
  useEffect(() => {
    if (isTimerRunning.team1) {
      timerRef.current.team1 = setInterval(() => {
        setTimers(prev => ({ ...prev, team1: prev.team1 + 10 }));
      }, 10);
    } else {
      if (timerRef.current.team1) clearInterval(timerRef.current.team1);
    }
    return () => {
      if (timerRef.current.team1) clearInterval(timerRef.current.team1);
    };
  }, [isTimerRunning.team1]);

  useEffect(() => {
    if (isTimerRunning.team2) {
      timerRef.current.team2 = setInterval(() => {
        setTimers(prev => ({ ...prev, team2: prev.team2 + 10 }));
      }, 10);
    } else {
      if (timerRef.current.team2) clearInterval(timerRef.current.team2);
    }
    return () => {
      if (timerRef.current.team2) clearInterval(timerRef.current.team2);
    };
  }, [isTimerRunning.team2]);

  const formatTime = (ms) => {
    const centiseconds = Math.floor((ms / 10) % 100);
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor(ms / 60000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
  };

  // Token System
  const STUDENT_NAMES = [
    "Abel", "Alexander", "Anderson", "Brandon", "Britany", "Carlos", 
    "Claritza", "Emmie", "Isaiah", "Jasmin", "Jonathan", "Luis", 
    "Nazlly", "Niang", "Pablo", "Rylan", "Taylor", "Tra'el", 
    "Unique", "Zaid", "Zaliah", "Zoey"
  ];

  const UNIT_POOL = [
    "miles", "hours", "minutes", "dollars", "pounds", "feet", "inches",
    "yards", "days", "weeks", "months", "liters", "gallons", "ounces",
    "students", "people", "points", "shots", "laps", "orders"
  ];

  const NUMBER_POOL = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 21, 24, 25, 27, 30];

  const generateTokensAndConstraints = (perTeam) => {
    const fixed = [
      "Unit or Cross-Multiply",
      "Scale Number or Divide",
      "Human Calculator"
    ];
    
    const remaining = perTeam - 3;
    
    // Just generate number tokens for variety
    // Problems are now contextual and don't use token units
    const shuffledNumbers = [...NUMBER_POOL].sort(() => Math.random() - 0.5);
    const selectedNumbers = shuffledNumbers.slice(0, remaining);
    
    const tokens = [...fixed, ...selectedNumbers.map(n => `${n}`)];
    
    return {
      tokens,
      constraints: {
        numbers: selectedNumbers
      }
    };
  };

  const generateRosters = () => {
    const teamData = generateTokensAndConstraints(playersPerTeam);
    
    // BOTH teams get the SAME tokens
    setTeams({
      team1: teamData.tokens,
      team2: teamData.tokens
    });
    
    setGameConstraints({
      numbers: teamData.constraints.numbers
    });
    
    setGameState('ready-check');
  };

  const toggleToken = (team, tokenIndex) => {
    setSelectedTokens(prev => {
      const current = prev[team];
      if (current.includes(tokenIndex)) {
        return { ...prev, [team]: current.filter(i => i !== tokenIndex) };
      } else {
        return { ...prev, [team]: [...current, tokenIndex] };
      }
    });
  };

  const startGame = () => {
    // Check if either team has selected tokens
    const team1Count = selectedTokens.team1.length;
    const team2Count = selectedTokens.team2.length;
    
    // If both teams have exactly 5, start immediately
    if (team1Count === 5 && team2Count === 5) {
      setGameState('playing');
      loadNewProblem();
      return;
    }
    
    // Otherwise show confirmation
    setShowStartConfirm(true);
  };

  const confirmStart = () => {
    setShowStartConfirm(false);
    setGameState('playing');
    loadNewProblem();
  };

  // Problem Generation - Now uses tokens to constrain the generator
  const generateProblemFromConstraints = () => {
    if (!gameConstraints) return null;
    
    const { numbers } = gameConstraints;
    
    // Generate nice numbers using the token constraints
    const validNumbers = numbers.filter(n => n >= 2 && n <= 20);
    if (validNumbers.length < 2) {
      console.error('Not enough numbers!');
      return null;
    }
    
    // Pick k first (small number, usually 2-10)
    const smallNumbers = validNumbers.filter(n => n <= 10);
    const k = smallNumbers.length > 0 
      ? smallNumbers[Math.floor(Math.random() * smallNumbers.length)]
      : validNumbers[0];
    
    // Pick a multiplier that keeps 'a' reasonable (under 200)
    const maxMultiplier = Math.floor(200 / k);
    const possibleMultipliers = validNumbers.filter(m => m > 1 && m <= maxMultiplier && m !== k);
    const multiplier = possibleMultipliers.length > 0
      ? possibleMultipliers[Math.floor(Math.random() * possibleMultipliers.length)]
      : Math.min(3, maxMultiplier);
    
    const a = k * multiplier;
    
    // Pick c (also keep reasonable)
    const possibleC = validNumbers.filter(n => n !== k && n <= 20);
    const c = possibleC.length > 0
      ? possibleC[Math.floor(Math.random() * possibleC.length)]
      : k * 2;
    
    const answer = (a * c) / k;
    
    // Select random students
    const students = [...STUDENT_NAMES].sort(() => Math.random() - 0.5).slice(0, 2);
    
    // Use contextual problem templates (NO RANDOM UNITS!)
    const templates = [
      `${students[0]} ran ${a} laps around Eastway in ${k} minutes. At this speed, how many laps in ${c} minutes?`,
      `${students[0]} scored ${a} points in ${k} games at the Panthers watch party. At this rate, how many points in ${c} games?`,
      `${students[0]} completed ${a} math problems in ${k} minutes. How many problems in ${c} minutes?`,
      `${students[0]} sent ${a} text messages in ${k} hours. At this rate, how many messages in ${c} hours?`,
      `${students[0]} ate ${a} chicken nuggets in ${k} days at the cafeteria. How many nuggets in ${c} days?`,
      `${students[0]} gained ${a} Instagram followers in ${k} days after posting at Freedom Park. At this rate, how many followers in ${c} days?`,
      `${students[0]} watched ${a} YouTube videos during ${k} hours of homework time. How many videos in ${c} hours?`,
      `${students[0]} made ${a} basketball shots in ${k} games at the Eastway courts. If ${students[0]} plays ${c} games, how many shots will they make?`,
      `${students[0]} rode the light rail ${a} stops in ${k} minutes. At this rate, how many stops in ${c} minutes?`,
      `${students[0]} pressed ${a} buttons at Discovery Place in ${k} minutes. How many buttons in ${c} minutes?`,
      `${students[0]} forgot their Chromebook password ${a} times in ${k} weeks. At this rate, how many times in ${c} weeks?`,
      `${students[0]} asked to go to the bathroom ${a} times during ${k} class periods. How many bathroom trips in ${c} periods?`,
      `${students[0]} said "no cap" ${a} times in ${k} conversations. At this rate, how many times in ${c} conversations?`,
      `${students[0]} dropped their phone ${a} times in ${k} days. At this rate, how many drops in ${c} days?`
    ];
    
    const text = templates[Math.floor(Math.random() * templates.length)];
    
    return { text, correctAnswer: answer, a, k, c };
  };

  const generateDistractors = (correctAnswer) => {
    const distractors = new Set();
    distractors.add(correctAnswer);
    
    while (distractors.size < 8) {
      const strategies = [
        () => correctAnswer + Math.floor(Math.random() * 20) - 10,
        () => Math.floor(correctAnswer * 1.1),
        () => Math.floor(correctAnswer * 0.9),
        () => Math.floor(correctAnswer / 2),
        () => correctAnswer * 2,
        () => correctAnswer + correctAnswer % 10,
      ];
      
      const strategy = strategies[Math.floor(Math.random() * strategies.length)];
      const distractor = strategy();
      
      if (distractor > 0 && distractor !== correctAnswer) {
        distractors.add(distractor);
      }
    }
    
    return Array.from(distractors).sort(() => Math.random() - 0.5).slice(0, 8);
  };

  const loadNewProblem = () => {
    const problem = generateProblemFromConstraints();
    if (!problem) return;
    
    const options = generateDistractors(problem.correctAnswer);
    setCurrentProblem(problem);
    setAnswerOptions(options);
    setSelectedAnswers({ team1: null, team2: null });
    setLockedTeams({ team1: false, team2: false });
    setWinnerThisRound(null);
    setTimers({ team1: 0, team2: 0 });
    setIsTimerRunning({ team1: true, team2: true });
    setShowResultOverlay({ team1: null, team2: null });
    setRoundNumber(prev => prev + 1);
  };

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
    
    // Stop this team's timer
    setIsTimerRunning(prev => ({ ...prev, [team]: false }));
    
    if (isCorrect && !winnerThisRound) {
      setWinnerThisRound(team);
      setScores(prev => ({ ...prev, [team]: prev[team] + 1 }));
      setShowResultOverlay(prev => ({ ...prev, [team]: 'CORRECT' }));
      onProblemComplete();
    } else {
      setShowResultOverlay(prev => ({ ...prev, [team]: isCorrect ? 'CORRECT' : 'INCORRECT' }));
    }
    
    setLockedTeams(prev => ({ ...prev, [team]: true }));
  };

  const handleNextProblem = () => {
    loadNewProblem();
  };

  // ========== SETUP SCREEN ==========
  if (gameState === 'setup') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 'bold', 
            color: 'white', 
            textAlign: 'center', 
            marginBottom: '1rem',
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
            {showResumeOption && (
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
                  Previous game found!
                </h2>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button
                    onClick={resumeGame}
                    className="button primary gradient-button"
                    style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}
                  >
                    Resume Game
                  </button>
                  <button
                    onClick={startNewGame}
                    className="button secondary"
                    style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}
                  >
                    New Game
                  </button>
                </div>
                <hr style={{ margin: '2rem 0', border: 'none', borderTop: '2px solid #e5e7eb' }} />
              </div>
            )}
            
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
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Players Per Team:
              </label>
              <input
                type="number"
                min="6"
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
                fontSize: '1.5rem'
              }}
            >
              Generate Token Rosters
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== READY CHECK SCREEN ==========
  if (gameState === 'ready-check') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: 'white', 
            textAlign: 'center', 
            marginBottom: '2rem'
          }}>
            Tap the item when team member is selected
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            {/* Team 1 */}
            <div style={{ 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
              borderRadius: '1rem', 
              padding: '1.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              position: 'relative'
            }}>
              <h3 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#1e40af', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {teamNames[0]}
              </h3>
              {selectedTokens.team1.length === 5 && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: '#22c55e',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                  zIndex: 10
                }}>
                  ✓ READY!
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {teams.team1.map((token, idx) => {
                  const isSelected = selectedTokens.team1.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleToken('team1', idx)}
                      style={{ 
                        background: isSelected ? '#1e40af' : 'white',
                        color: isSelected ? 'white' : '#1f2937',
                        borderRadius: '0.5rem', 
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '1rem',
                        fontWeight: '600',
                        boxShadow: isSelected ? '0 0 0 4px #60a5fa' : '0 2px 8px rgba(0,0,0,0.1)',
                        border: isSelected ? '3px solid white' : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        transform: isSelected ? 'scale(0.95)' : 'scale(1)',
                        opacity: isSelected ? 1 : 0.7
                      }}
                    >
                      {isSelected && '✓ '}{token}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Team 2 */}
            <div style={{ 
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', 
              borderRadius: '1rem', 
              padding: '1.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              position: 'relative'
            }}>
              <h3 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#065f46', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {teamNames[1]}
              </h3>
              {selectedTokens.team2.length === 5 && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: '#22c55e',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                  zIndex: 10
                }}>
                  ✓ READY!
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {teams.team2.map((token, idx) => {
                  const isSelected = selectedTokens.team2.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleToken('team2', idx)}
                      style={{ 
                        background: isSelected ? '#065f46' : 'white',
                        color: isSelected ? 'white' : '#1f2937',
                        borderRadius: '0.5rem', 
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '1rem',
                        fontWeight: '600',
                        boxShadow: isSelected ? '0 0 0 4px #34d399' : '0 2px 8px rgba(0,0,0,0.1)',
                        border: isSelected ? '3px solid white' : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        transform: isSelected ? 'scale(0.95)' : 'scale(1)',
                        opacity: isSelected ? 1 : 0.7
                      }}
                    >
                      {isSelected && '✓ '}{token}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="button primary gradient-button"
            style={{ 
              width: '100%',
              padding: '1.5rem',
              fontSize: '2rem',
              maxWidth: '600px',
              margin: '0 auto',
              display: 'block'
            }}
          >
            START GAME
          </button>

          {/* Confirmation Modal */}
          {showStartConfirm && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000
            }}>
              <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '500px',
                textAlign: 'center'
              }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1f2937' }}>
                  Are you ready to start?
                </h2>
                <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#6b7280' }}>
                  Team 1 has {selectedTokens.team1.length} tokens selected.<br/>
                  Team 2 has {selectedTokens.team2.length} tokens selected.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button
                    onClick={confirmStart}
                    className="button primary gradient-button"
                    style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}
                  >
                    Yes, Start!
                  </button>
                  <button
                    onClick={() => setShowStartConfirm(false)}
                    className="button secondary"
                    style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}
                  >
                    Go Back
                  </button>
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
      width: '100vw',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'auto'
    }}>
      <style>{`
        .answer-tile {
          padding: 1.25rem;
          border-radius: '0.75rem';
          font-size: 1.5rem;
          font-weight: bold;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          cursor: pointer;
          background: white;
          color: #1f2937;
          border: none;
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
        .answer-tile:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .result-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 4rem;
          font-weight: 900;
          padding: 2rem 4rem;
          border-radius: 1rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          z-index: 100;
          pointer-events: none;
        }
        .result-correct {
          background: #22c55e;
          color: white;
          border: 8px solid white;
        }
        .result-incorrect {
          background: #ef4444;
          color: white;
          border: 8px solid white;
        }
      `}</style>
      
      {/* Problem Display - Takes 50% of visual space */}
      {currentProblem && (
        <div style={{ 
          flex: '0 0 auto',
          marginBottom: '1.5rem',
          background: 'white',
          borderRadius: '1rem',
          padding: '3rem 2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}>
          <p style={{ 
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1f2937',
            lineHeight: '1.4',
            margin: 0
          }}>
            {currentProblem.text}
          </p>
        </div>
      )}

      {/* Answer Tiles - Two columns */}
      <div style={{ 
        flex: '1 1 auto',
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2rem',
        marginBottom: '1.5rem'
      }}>
        {/* Team 1 */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            borderRadius: '1rem 1rem 0 0',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#1e40af',
              margin: 0
            }}>
              {teamNames[0]}
            </h3>
          </div>
          
          <div style={{
            background: 'rgba(219, 234, 254, 0.3)',
            backdropFilter: 'blur(10px)',
            padding: '1.5rem',
            borderRadius: '0 0 1rem 1rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            {showResultOverlay.team1 && (
              <div className={`result-overlay result-${showResultOverlay.team1.toLowerCase()}`}>
                {showResultOverlay.team1}
              </div>
            )}
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '0.75rem', 
              marginBottom: '1rem',
              flex: 1
            }}>
              {answerOptions.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect('team1', answer)}
                  disabled={lockedTeams.team1}
                  className={`answer-tile ${
                    selectedAnswers.team1 === answer ? 'selected-blue' : ''
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
              {lockedTeams.team1 ? 'LOCKED' : 'LOCK IT IN'}
            </button>
          </div>
        </div>

        {/* Team 2 */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            borderRadius: '1rem 1rem 0 0',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#065f46',
              margin: 0
            }}>
              {teamNames[1]}
            </h3>
          </div>
          
          <div style={{
            background: 'rgba(209, 250, 229, 0.3)',
            backdropFilter: 'blur(10px)',
            padding: '1.5rem',
            borderRadius: '0 0 1rem 1rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            {showResultOverlay.team2 && (
              <div className={`result-overlay result-${showResultOverlay.team2.toLowerCase()}`}>
                {showResultOverlay.team2}
              </div>
            )}
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '0.75rem', 
              marginBottom: '1rem',
              flex: 1
            }}>
              {answerOptions.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect('team2', answer)}
                  disabled={lockedTeams.team2}
                  className={`answer-tile ${
                    selectedAnswers.team2 === answer ? 'selected-green' : ''
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
              {lockedTeams.team2 ? 'LOCKED' : 'LOCK IT IN'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section - Scores and Next Button */}
      <div style={{ 
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '2rem'
      }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          padding: '1rem 2rem',
          borderRadius: '1rem',
          flex: '0 0 auto'
        }}>
          <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {teamNames[0]}: {scores.team1}
          </span>
        </div>

        <button
          onClick={handleNextProblem}
          className="button primary gradient-button pulse-animation"
          style={{ 
            padding: '1.25rem 3rem',
            fontSize: '1.75rem',
            flex: '0 0 auto'
          }}
        >
          NEXT PROBLEM
        </button>

        <div style={{ 
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          padding: '1rem 2rem',
          borderRadius: '1rem',
          flex: '0 0 auto'
        }}>
          <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {teamNames[1]}: {scores.team2}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HTableBattleRoyaleModule;
