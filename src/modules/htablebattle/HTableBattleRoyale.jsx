import React, { useState, useEffect, useRef } from 'react';
import { generateBattleRoyaleProblem, generateDistractors, buildTokenSet } from '../lib/generator';

const HTableBattleRoyaleApp = () => {
  // State Management
  const [gameState, setGameState] = useState('setup'); // setup, playing, round-end
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
    }
    
    setLockedTeams(prev => ({ ...prev, [team]: true }));
  };

  // Confetti Component
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(100)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            fontSize: `${20 + Math.random() * 30}px`
          }}
        >
          {['🎉', '🎊', '✨', '🏆', '⭐'][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>
  );

  // Render Setup Screen
  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-6xl font-bold text-white text-center mb-4 font-['Poppins']">
            H-TABLE BATTLE ROYALE 
          </h1>
          <p className="text-2xl text-white text-center mb-12">Eastway Middle Edition</p>

          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Game Setup</h2>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-lg font-semibold mb-2">Team 1 Name:</label>
                <input
                  type="text"
                  value={teamNames[0]}
                  onChange={(e) => setTeamNames([e.target.value, teamNames[1]])}
                  className="w-full p-3 border-2 border-blue-300 rounded-xl text-xl"
                  placeholder="Enter team 1 name"
                />
              </div>
              
              <div>
                <label className="block text-lg font-semibold mb-2">Team 2 Name:</label>
                <input
                  type="text"
                  value={teamNames[1]}
                  onChange={(e) => setTeamNames([teamNames[0], e.target.value])}
                  className="w-full p-3 border-2 border-green-300 rounded-xl text-xl"
                  placeholder="Enter team 2 name"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2">Players Per Team:</label>
              <input
                type="number"
                min="4"
                max="12"
                value={playersPerTeam}
                onChange={(e) => setPlayersPerTeam(parseInt(e.target.value))}
                className="w-full p-3 border-2 border-purple-300 rounded-xl text-xl"
              />
            </div>

            <button
              onClick={generateRosters}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-2xl font-bold py-4 px-8 rounded-xl hover:scale-105 transition-transform shadow-lg mb-4"
            >
              🎲 Generate Token Rosters
            </button>

            {teams.team1.length > 0 && (
              <button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-2xl font-bold py-4 px-8 rounded-xl hover:scale-105 transition-transform shadow-lg"
              >
                🚀 START GAME
              </button>
            )}
          </div>

          {teams.team1.length > 0 && (
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-blue-100 rounded-2xl p-6 shadow-xl">
                <h3 className="text-3xl font-bold text-blue-800 mb-4">{teamNames[0]}</h3>
                <div className="grid grid-cols-4 gap-3">
                  {teams.team1.map((token, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 text-center text-3xl shadow">
                      {token}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-100 rounded-2xl p-6 shadow-xl">
                <h3 className="text-3xl font-bold text-green-800 mb-4">{teamNames[1]}</h3>
                <div className="grid grid-cols-4 gap-3">
                  {teams.team2.map((token, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 text-center text-3xl shadow">
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

  // Render Playing Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6">
      {showConfetti && <Confetti />}
      
      {/* Header with Scores and Timer */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-3 gap-6 items-center">
          <div className="bg-blue-100 rounded-2xl p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-blue-800">{teamNames[0]}</h3>
            <p className="text-6xl font-bold text-blue-600">{scores.team1}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
            <p className="text-xl font-semibold text-gray-600">Round {roundNumber}</p>
            <p className="text-5xl font-bold text-purple-600 font-mono">{formatTime(timer)}</p>
          </div>

          <div className="bg-green-100 rounded-2xl p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-green-800">{teamNames[1]}</h3>
            <p className="text-6xl font-bold text-green-600">{scores.team2}</p>
          </div>
        </div>
      </div>

      {/* Problem Display */}
      {currentProblem && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-4">
              <span className="text-8xl">{currentProblem.visual}</span>
            </div>
            <p className="text-3xl font-semibold text-gray-800 text-center leading-relaxed">
              {currentProblem.text}
            </p>
          </div>
        </div>
      )}

      {/* Answer Tiles */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Team 1 Answers */}
          <div>
            <h3 className="text-3xl font-bold text-white mb-4 text-center">{teamNames[0]}</h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {answerOptions.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect('team1', answer)}
                  disabled={lockedTeams.team1}
                  className={`
                    p-6 rounded-xl text-2xl font-bold transition-all shadow-lg
                    ${selectedAnswers.team1 === answer 
                      ? 'bg-blue-500 text-white scale-110 ring-4 ring-blue-300' 
                      : 'bg-white text-gray-800 hover:scale-105'}
                    ${lockedTeams.team1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${lockedTeams.team1 && answer === currentProblem.correctAnswer 
                      ? 'bg-green-400 text-white' 
                      : ''}
                  `}
                >
                  {answer}
                </button>
              ))}
            </div>
            <button
              onClick={() => lockAnswer('team1')}
              disabled={lockedTeams.team1 || !selectedAnswers.team1}
              className={`
                w-full py-4 rounded-xl text-2xl font-bold transition-all shadow-lg
                ${lockedTeams.team1 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 cursor-pointer'}
                text-white
              `}
            >
              {lockedTeams.team1 ? '🔒 LOCKED' : '🔐 LOCK IT IN'}
            </button>
            {lockedTeams.team1 && selectedAnswers.team1 === currentProblem.correctAnswer && (
              <p className="text-green-400 text-3xl font-bold text-center mt-4">✅ CORRECT!</p>
            )}
            {lockedTeams.team1 && selectedAnswers.team1 !== currentProblem.correctAnswer && (
              <p className="text-red-400 text-3xl font-bold text-center mt-4">❌ INCORRECT</p>
            )}
          </div>

          {/* Team 2 Answers */}
          <div>
            <h3 className="text-3xl font-bold text-white mb-4 text-center">{teamNames[1]}</h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {answerOptions.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect('team2', answer)}
                  disabled={lockedTeams.team2}
                  className={`
                    p-6 rounded-xl text-2xl font-bold transition-all shadow-lg
                    ${selectedAnswers.team2 === answer 
                      ? 'bg-green-500 text-white scale-110 ring-4 ring-green-300' 
                      : 'bg-white text-gray-800 hover:scale-105'}
                    ${lockedTeams.team2 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${lockedTeams.team2 && answer === currentProblem.correctAnswer 
                      ? 'bg-green-400 text-white' 
                      : ''}
                  `}
                >
                  {answer}
                </button>
              ))}
            </div>
            <button
              onClick={() => lockAnswer('team2')}
              disabled={lockedTeams.team2 || !selectedAnswers.team2}
              className={`
                w-full py-4 rounded-xl text-2xl font-bold transition-all shadow-lg
                ${lockedTeams.team2 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-green-700 hover:scale-105 cursor-pointer'}
                text-white
              `}
            >
              {lockedTeams.team2 ? '🔒 LOCKED' : '🔐 LOCK IT IN'}
            </button>
            {lockedTeams.team2 && selectedAnswers.team2 === currentProblem.correctAnswer && (
              <p className="text-green-400 text-3xl font-bold text-center mt-4">✅ CORRECT!</p>
            )}
            {lockedTeams.team2 && selectedAnswers.team2 !== currentProblem.correctAnswer && (
              <p className="text-red-400 text-3xl font-bold text-center mt-4">❌ INCORRECT</p>
            )}
          </div>
        </div>
      </div>

      {/* Next Problem Button */}
      {winner && (
        <div className="max-w-7xl mx-auto text-center">
          <button
            onClick={loadNewProblem}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-3xl font-bold py-6 px-12 rounded-2xl hover:scale-110 transition-transform shadow-2xl"
          >
            ⚡ NEXT PROBLEM ⚡
          </button>
        </div>
      )}
    </div>
  );
};

export default HTableBattleRoyaleApp;
