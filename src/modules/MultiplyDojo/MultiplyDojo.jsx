import React, { useState, useEffect, useRef } from 'react';
import './DojoStyles.css';

// ============================================================================
// MULTIPLICATION DOJO - Complete Component
// ============================================================================

const MultiplicationDojo = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [screen, setScreen] = useState('main-menu'); // main-menu, diagnostic, report, practice-select, practice, belt-test, results
  const [studentName, setStudentName] = useState('');
  const [currentBelt, setCurrentBelt] = useState('white');
  const [masteredTables, setMasteredTables] = useState([]);
  
  // Test/Practice state
  const [problems, setProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showFeedback, setShowFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  
  // Practice-specific state
  const [practiceTable, setPracticeTable] = useState(null);
  const [practicePhase, setPracticePhase] = useState('accuracy'); // accuracy, speed, mastery
  const [practiceAttempts, setPracticeAttempts] = useState(0);
  const [speedGoal, setSpeedGoal] = useState(45); // seconds
  
  // Diagnostic/Report state
  const [diagnosticData, setDiagnosticData] = useState(null);
  
  // Belt test state
  const [beltTestType, setBeltTestType] = useState(null); // yellow, orange, green, blue, black
  
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  
  // ============================================================================
  // CONSTANTS
  // ============================================================================
  
  const BELT_REQUIREMENTS = {
    yellow: { problems: 40, timeGoal: 180, accuracy: 0.75, tablesNeeded: 5 },
    orange: { problems: 50, timeGoal: 180, accuracy: 0.80, tablesNeeded: 7 },
    green: { problems: 75, timeGoal: 210, accuracy: 0.85, tablesNeeded: 9 },
    blue: { problems: 100, timeGoal: 210, accuracy: 0.90, tablesNeeded: 11 },
    black: { problems: 100, timeGoal: 150, accuracy: 0.95, tablesNeeded: 13 }
  };
  
  const BELT_ORDER = ['white', 'yellow', 'orange', 'green', 'blue', 'black'];
  
  const TABLE_DIFFICULTY = {
    easy: [0, 1, 2, 5, 10],
    medium: [3, 4, 6, 11],
    hard: [7, 8, 9, 12]
  };
  
  // ============================================================================
  // PROBLEM GENERATION
  // ============================================================================
  
  const generateDiagnosticProblems = () => {
    const problems = [];
    const used = new Set();
    
    // Ensure each table 0-12 appears at least twice
    for (let table = 0; table <= 12; table++) {
      for (let i = 0; i < 2; i++) {
        const multiplier = Math.floor(Math.random() * 13);
        const a = i === 0 ? table : multiplier;
        const b = i === 0 ? multiplier : table;
        const key = `${a}x${b}`;
        
        if (!used.has(key)) {
          problems.push({ a, b, answer: a * b });
          used.add(key);
        }
      }
    }
    
    // Fill remaining slots with strategic problems (known trouble spots)
    const troubleSpots = [
      [7, 8], [8, 7], [6, 7], [7, 6], [8, 9], [9, 8],
      [6, 8], [8, 6], [9, 6], [6, 9], [7, 9], [9, 7]
    ];
    
    while (problems.length < 40 && troubleSpots.length > 0) {
      const spot = troubleSpots.shift();
      const key = `${spot[0]}x${spot[1]}`;
      if (!used.has(key)) {
        problems.push({ a: spot[0], b: spot[1], answer: spot[0] * spot[1] });
        used.add(key);
      }
    }
    
    // Shuffle
    return problems.sort(() => Math.random() - 0.5).slice(0, 40);
  };
  
  const generatePracticeProblems = (table, count = 10) => {
    const problems = [];
    const multipliers = [...Array(13).keys()]; // 0-12
    
    // Shuffle multipliers
    const shuffled = multipliers.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < count; i++) {
      const multiplier = shuffled[i % shuffled.length];
      // Randomly choose order
      const useTableFirst = Math.random() > 0.5;
      const a = useTableFirst ? table : multiplier;
      const b = useTableFirst ? multiplier : table;
      problems.push({ a, b, answer: a * b });
    }
    
    return problems;
  };
  
  const generateBeltTestProblems = (beltType) => {
    const req = BELT_REQUIREMENTS[beltType];
    const problems = [];
    const used = new Set();
    
    for (let i = 0; i < req.problems; i++) {
      let a, b, key;
      let attempts = 0;
      
      do {
        a = Math.floor(Math.random() * 13);
        b = Math.floor(Math.random() * 13);
        key = `${a}x${b}`;
        attempts++;
      } while (used.has(key) && attempts < 50);
      
      problems.push({ a, b, answer: a * b });
      used.add(key);
    }
    
    return problems;
  };
  
  const generateMixedProblems = (count = 20) => {
    const problems = [];
    const used = new Set();
    
    for (let i = 0; i < count; i++) {
      let a, b, key;
      let attempts = 0;
      
      do {
        a = Math.floor(Math.random() * 13);
        b = Math.floor(Math.random() * 13);
        key = `${a}x${b}`;
        attempts++;
      } while (used.has(key) && attempts < 50);
      
      problems.push({ a, b, answer: a * b });
      used.add(key);
    }
    
    return problems;
  };
  
  // ============================================================================
  // ANALYSIS FUNCTIONS
  // ============================================================================
  
  const analyzeResults = (problems, answers) => {
    const tableStats = {};
    const commutativeGaps = [];
    
    // Initialize table stats
    for (let i = 0; i <= 12; i++) {
      tableStats[i] = { correct: 0, total: 0, problems: [] };
    }
    
    // Analyze each answer
    problems.forEach((problem, idx) => {
      const userAns = answers[idx];
      const isCorrect = userAns === problem.answer;
      
      // Track for both factors
      [problem.a, problem.b].forEach(factor => {
        tableStats[factor].total++;
        if (isCorrect) tableStats[factor].correct++;
        tableStats[factor].problems.push({
          problem: `${problem.a} × ${problem.b}`,
          correct: isCorrect,
          userAnswer: userAns
        });
      });
    });
    
    // Find mastered tables (100% correct)
    const mastered = [];
    const needsWork = [];
    
    Object.keys(tableStats).forEach(table => {
      const stats = tableStats[table];
      if (stats.total > 0) {
        const accuracy = stats.correct / stats.total;
        if (accuracy === 1.0 && stats.total >= 2) {
          mastered.push(parseInt(table));
        } else if (accuracy < 0.7) {
          needsWork.push(parseInt(table));
        }
      }
    });
    
    // Find commutative gaps (a×b correct but b×a wrong)
    const problemMap = {};
    problems.forEach((problem, idx) => {
      const key1 = `${problem.a}-${problem.b}`;
      const key2 = `${problem.b}-${problem.a}`;
      const isCorrect = answers[idx] === problem.answer;
      
      problemMap[key1] = isCorrect;
      
      if (problemMap[key2] !== undefined && problemMap[key2] !== isCorrect) {
        if (isCorrect) {
          commutativeGaps.push(`${problem.b} × ${problem.a}`);
        } else {
          commutativeGaps.push(`${problem.a} × ${problem.b}`);
        }
      }
    });
    
    return {
      tableStats,
      mastered: mastered.sort((a, b) => a - b),
      needsWork: needsWork.sort((a, b) => a - b),
      commutativeGaps: [...new Set(commutativeGaps)].slice(0, 3)
    };
  };
  
  const getRecommendedTable = (needsWork) => {
    // Find easiest table that needs work
    for (const table of TABLE_DIFFICULTY.easy) {
      if (needsWork.includes(table)) return table;
    }
    for (const table of TABLE_DIFFICULTY.medium) {
      if (needsWork.includes(table)) return table;
    }
    for (const table of TABLE_DIFFICULTY.hard) {
      if (needsWork.includes(table)) return table;
    }
    return needsWork[0];
  };
  
  // ============================================================================
  // TIMER FUNCTIONS
  // ============================================================================
  
  useEffect(() => {
    if (startTime && !showFeedback) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime, showFeedback]);
  
  // ============================================================================
  // ANSWER SUBMISSION
  // ============================================================================
  
  const handleSubmitAnswer = () => {
    const problem = problems[currentProblemIndex];
    const userAns = parseInt(userAnswer);
    const isCorrect = userAns === problem.answer;
    
    // Record answer
    const newAnswers = [...answers, userAns];
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setStreak(streak + 1);
      setShowFeedback({ type: 'correct', message: '✓' });
      
      setTimeout(() => {
        setShowFeedback(null);
        setUserAnswer('');
        
        if (currentProblemIndex + 1 < problems.length) {
          setCurrentProblemIndex(currentProblemIndex + 1);
        } else {
          finishTest(newAnswers);
        }
      }, 400);
    } else {
      setStreak(0);
      setShowFeedback({ 
        type: 'incorrect', 
        message: `✗  ${problem.a} × ${problem.b} = ${problem.answer}` 
      });
      
      setTimeout(() => {
        setShowFeedback(null);
        setUserAnswer('');
        
        // In practice mode, add problem back to queue
        if (screen === 'practice' && practicePhase !== 'mastery') {
          const newProblems = [...problems];
          newProblems.splice(currentProblemIndex + 3, 0, problem);
          setProblems(newProblems);
        }
        
        if (currentProblemIndex + 1 < problems.length) {
          setCurrentProblemIndex(currentProblemIndex + 1);
        } else {
          finishTest(newAnswers);
        }
      }, 1500);
    }
  };
  
  const finishTest = (finalAnswers) => {
    // Stop the timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const correctCount = finalAnswers.filter((ans, idx) => ans === problems[idx].answer).length;
    const accuracy = correctCount / problems.length;
    
    if (screen === 'diagnostic') {
      const analysis = analyzeResults(problems, finalAnswers);
      
      setDiagnosticData({
        problems: problems.length,
        correct: correctCount,
        accuracy,
        time: totalTime,
        problemsPerMin: (problems.length / totalTime * 60).toFixed(1),
        analysis
      });
      
      setScreen('report');
    } else if (screen === 'practice') {
      handlePracticeComplete(correctCount, accuracy, totalTime);
    } else if (screen === 'belt-test') {
      handleBeltTestComplete(correctCount, accuracy, totalTime);
    }
  };
  
  const handlePracticeComplete = (correctCount, accuracy, totalTime) => {
    if (practicePhase === 'accuracy') {
      if (accuracy >= 0.9) {
        setPracticePhase('speed');
        setScreen('results');
      } else {
        setPracticeAttempts(practiceAttempts + 1);
        setScreen('results');
      }
    } else if (practicePhase === 'speed') {
      const passedAccuracy = accuracy >= 0.9;
      const passedTime = totalTime <= speedGoal;
      
      if (passedAccuracy && passedTime) {
        setPracticePhase('mastery');
        setScreen('results');
      } else {
        setPracticeAttempts(practiceAttempts + 1);
        setScreen('results');
      }
    } else if (practicePhase === 'mastery') {
      if (accuracy >= 0.93) {
        // Table mastered!
        setMasteredTables([...masteredTables, practiceTable]);
        setScreen('results');
      } else {
        setPracticePhase('accuracy');
        setPracticeAttempts(0);
        setScreen('results');
      }
    }
  };
  
  const handleBeltTestComplete = (correctCount, accuracy, totalTime) => {
    const req = BELT_REQUIREMENTS[beltTestType];
    const passedAccuracy = accuracy >= req.accuracy;
    const passedTime = totalTime <= req.timeGoal;
    
    setDiagnosticData({
      beltTest: true,
      beltType: beltTestType,
      passed: passedAccuracy && passedTime,
      problems: problems.length,
      correct: correctCount,
      accuracy,
      time: totalTime,
      requiredAccuracy: req.accuracy,
      requiredTime: req.timeGoal,
      analysis: analyzeResults(problems, answers)
    });
    
    if (passedAccuracy && passedTime) {
      const currentIndex = BELT_ORDER.indexOf(currentBelt);
      const newBeltIndex = BELT_ORDER.indexOf(beltTestType);
      if (newBeltIndex > currentIndex) {
        setCurrentBelt(beltTestType);
      }
    }
    
    setScreen('report');
  };
  
  // ============================================================================
  // START FUNCTIONS
  // ============================================================================
  
  const startDiagnostic = () => {
    const probs = generateDiagnosticProblems();
    setProblems(probs);
    setCurrentProblemIndex(0);
    setAnswers([]);
    setUserAnswer('');
    setStartTime(Date.now());
    setElapsedTime(0);
    setStreak(0);
    setShowFeedback(null);
    setScreen('diagnostic');
  };
  
  const startPractice = (table) => {
    setPracticeTable(table);
    setPracticePhase('accuracy');
    setPracticeAttempts(0);
    setScreen('table-preview');
    
    // After 3 seconds of animation, start the actual practice
    setTimeout(() => {
      const probs = generatePracticeProblems(table, 10);
      setProblems(probs);
      setCurrentProblemIndex(0);
      setAnswers([]);
      setUserAnswer('');
      setStartTime(Date.now());
      setElapsedTime(0);
      setStreak(0);
      setShowFeedback(null);
      setScreen('practice');
    }, 3500);
  };
  
  const startBeltTest = (beltType) => {
    setBeltTestType(beltType);
    const probs = generateBeltTestProblems(beltType);
    setProblems(probs);
    setCurrentProblemIndex(0);
    setAnswers([]);
    setUserAnswer('');
    setStartTime(Date.now());
    setElapsedTime(0);
    setStreak(0);
    setShowFeedback(null);
    setScreen('belt-test');
  };
  
  const continueToNextPhase = () => {
    if (practicePhase === 'accuracy') {
      const probs = generatePracticeProblems(practiceTable, 10);
      setProblems(probs);
      setCurrentProblemIndex(0);
      setAnswers([]);
      setUserAnswer('');
      setStartTime(Date.now());
      setElapsedTime(0);
      setStreak(0);
      setShowFeedback(null);
      setScreen('practice');
    } else if (practicePhase === 'speed') {
      // Mastery test: mix this table with mastered tables
      const masteryProblems = [];
      
      // 10 problems from current table
      masteryProblems.push(...generatePracticeProblems(practiceTable, 10));
      
      // 5 problems from random mastered tables
      if (masteredTables.length > 0) {
        for (let i = 0; i < 5; i++) {
          const randomTable = masteredTables[Math.floor(Math.random() * masteredTables.length)];
          masteryProblems.push(...generatePracticeProblems(randomTable, 1));
        }
      }
      
      setProblems(masteryProblems.sort(() => Math.random() - 0.5).slice(0, 15));
      setCurrentProblemIndex(0);
      setAnswers([]);
      setUserAnswer('');
      setStartTime(Date.now());
      setElapsedTime(0);
      setStreak(0);
      setShowFeedback(null);
      setScreen('practice');
    }
  };
  
  // ============================================================================
  // AUTO-FOCUS INPUT
  // ============================================================================
  
  useEffect(() => {
    if (inputRef.current && (screen === 'diagnostic' || screen === 'practice' || screen === 'belt-test')) {
      inputRef.current.focus();
    }
  }, [screen, currentProblemIndex, showFeedback]);
  
  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getNextBelt = () => {
    const currentIndex = BELT_ORDER.indexOf(currentBelt);
    return BELT_ORDER[currentIndex + 1] || 'black';
  };
  
  const canTakeBeltTest = (beltType) => {
    const req = BELT_REQUIREMENTS[beltType];
    return masteredTables.length >= req.tablesNeeded;
  };
  
  // ============================================================================
  // RENDER SCREENS
  // ============================================================================
  
  const renderMainMenu = () => (
    <div className="dojo-main-menu">
      <div className="dojo-header">
        <div className="dojo-logo">
          <div className="belt-icon" data-belt={currentBelt}></div>
          <h1>MULTIPLICATION DOJO</h1>
        </div>
        <div className="current-rank">
          <span className="rank-label">Current Rank:</span>
          <span className="rank-value">{currentBelt.toUpperCase()} BELT</span>
        </div>
      </div>
      
      <div className="menu-options">
        <button className="menu-btn primary" onClick={startDiagnostic}>
          <span className="btn-icon">📋</span>
          <span className="btn-content">
            <span className="btn-title">Take Diagnostic Test</span>
            <span className="btn-desc">See where you stand across all tables</span>
          </span>
        </button>
        
        <button className="menu-btn" onClick={() => setScreen('practice-select')}>
          <span className="btn-icon">🎯</span>
          <span className="btn-content">
            <span className="btn-title">Practice Specific Tables</span>
            <span className="btn-desc">Choose which facts to work on</span>
          </span>
        </button>
        
        <button 
          className="menu-btn" 
          onClick={() => setScreen('belt-select')}
          disabled={currentBelt === 'black'}
        >
          <span className="btn-icon">🥋</span>
          <span className="btn-content">
            <span className="btn-title">Belt Test - {getNextBelt().toUpperCase()}</span>
            <span className="btn-desc">Test for your next belt rank</span>
          </span>
        </button>
        
        <button 
          className="menu-btn black-belt" 
          onClick={() => startBeltTest('black')}
        >
          <span className="btn-icon">⚡</span>
          <span className="btn-content">
            <span className="btn-title">Black Belt Challenge</span>
            <span className="btn-desc">The ultimate 100-problem speed test</span>
          </span>
        </button>
      </div>
      
      {masteredTables.length > 0 && (
        <div className="mastered-display">
          <h3>Mastered Tables</h3>
          <div className="mastered-badges">
            {masteredTables.map(table => (
              <span key={table} className="mastered-badge">×{table}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  const renderPracticeSelect = () => (
    <div className="practice-select">
      <h2>SELECT YOUR TRAINING TABLE</h2>
      
      <div className="table-category">
        <h3>Easy Tables</h3>
        <div className="table-grid">
          {TABLE_DIFFICULTY.easy.map(table => (
            <button
              key={table}
              className={`table-btn ${masteredTables.includes(table) ? 'mastered' : ''}`}
              onClick={() => startPractice(table)}
            >
              ×{table}
              {masteredTables.includes(table) && <span className="check">✓</span>}
            </button>
          ))}
        </div>
      </div>
      
      <div className="table-category">
        <h3>Medium Tables</h3>
        <div className="table-grid">
          {TABLE_DIFFICULTY.medium.map(table => (
            <button
              key={table}
              className={`table-btn ${masteredTables.includes(table) ? 'mastered' : ''}`}
              onClick={() => startPractice(table)}
            >
              ×{table}
              {masteredTables.includes(table) && <span className="check">✓</span>}
            </button>
          ))}
        </div>
      </div>
      
      <div className="table-category">
        <h3>Hard Tables</h3>
        <div className="table-grid">
          {TABLE_DIFFICULTY.hard.map(table => (
            <button
              key={table}
              className={`table-btn ${masteredTables.includes(table) ? 'mastered' : ''}`}
              onClick={() => startPractice(table)}
            >
              ×{table}
              {masteredTables.includes(table) && <span className="check">✓</span>}
            </button>
          ))}
        </div>
      </div>
      
      <button className="back-btn" onClick={() => setScreen('main-menu')}>
        ← Back to Main Menu
      </button>
    </div>
  );
  
  const renderBeltSelect = () => {
    const nextBelt = getNextBelt();
    const req = BELT_REQUIREMENTS[nextBelt];
    const canTake = canTakeBeltTest(nextBelt);
    
    return (
      <div className="belt-select">
        <h2>{nextBelt.toUpperCase()} BELT TEST</h2>
        
        <div className="belt-requirements">
          <div className="req-item">
            <span className="req-label">Problems:</span>
            <span className="req-value">{req.problems}</span>
          </div>
          <div className="req-item">
            <span className="req-label">Time Goal:</span>
            <span className="req-value">{formatTime(req.timeGoal)}</span>
          </div>
          <div className="req-item">
            <span className="req-label">Accuracy:</span>
            <span className="req-value">{(req.accuracy * 100).toFixed(0)}%</span>
          </div>
          <div className="req-item">
            <span className="req-label">Tables Mastered:</span>
            <span className={`req-value ${canTake ? 'met' : 'not-met'}`}>
              {masteredTables.length}/{req.tablesNeeded}
            </span>
          </div>
        </div>
        
        {!canTake && (
          <div className="warning">
            ⚠ You need to master at least {req.tablesNeeded} tables before taking this belt test.
            Practice more tables first!
          </div>
        )}
        
        <div className="belt-actions">
          <button 
            className="start-btn" 
            onClick={() => startBeltTest(nextBelt)}
            disabled={!canTake}
          >
            Begin Belt Test
          </button>
          <button className="back-btn" onClick={() => setScreen('main-menu')}>
            ← Back to Main Menu
          </button>
        </div>
      </div>
    );
  };
  
  const renderTestScreen = () => {
    const problem = problems[currentProblemIndex];
    const progress = ((currentProblemIndex + 1) / problems.length) * 100;
    const timeLimit = screen === 'belt-test' ? BELT_REQUIREMENTS[beltTestType].timeGoal : null;
    const isWarning = timeLimit && elapsedTime > timeLimit * 0.7;
    const isCritical = timeLimit && elapsedTime > timeLimit * 0.9;
    
    // Calculate current score
    const currentCorrect = answers.filter((ans, idx) => ans === problems[idx].answer).length;
    const currentAccuracy = answers.length > 0 ? ((currentCorrect / answers.length) * 100).toFixed(0) : 0;
    
    let title = 'DIAGNOSTIC TEST';
    if (screen === 'practice') {
      if (practicePhase === 'accuracy') {
        title = `TRAINING: ×${practiceTable} Table - Accuracy Phase`;
      } else if (practicePhase === 'speed') {
        title = `TRAINING: ×${practiceTable} Table - Speed Phase`;
      } else {
        title = `MASTERY TEST: ×${practiceTable} Table`;
      }
    } else if (screen === 'belt-test') {
      title = `${beltTestType.toUpperCase()} BELT TEST`;
    }
    
    return (
      <div className="test-screen">
        <div className="test-header">
          <h2>{title}</h2>
          <div className="test-stats">
            <div className={`timer ${isWarning ? 'warning' : ''} ${isCritical ? 'critical' : ''}`}>
              Time: {formatTime(elapsedTime)}
              {timeLimit && ` / ${formatTime(timeLimit)}`}
            </div>
            <div className="progress-label">
              {currentProblemIndex + 1} of {problems.length}
            </div>
            {answers.length > 0 && (
              <div className="current-score-header">
                {currentCorrect}/{answers.length} ({currentAccuracy}%)
              </div>
            )}
          </div>
        </div>
        
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="problem-area">
          <div className="problem-display">
            {problem.a} × {problem.b}
          </div>
          
          <div className="answer-input-area">
            <input
              ref={inputRef}
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && userAnswer !== '' && !showFeedback) {
                  handleSubmitAnswer();
                }
              }}
              disabled={!!showFeedback}
              placeholder="Type answer"
              min="0"
              max="144"
            />
            <button 
              onClick={handleSubmitAnswer}
              disabled={userAnswer === '' || !!showFeedback}
            >
              Submit
            </button>
          </div>
          
          {showFeedback && (
            <div className={`feedback ${showFeedback.type}`}>
              {showFeedback.message}
            </div>
          )}
          
          {streak >= 5 && !showFeedback && (
            <div className="streak-display">
              {streak} in a row! 🔥
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderReport = () => {
    if (!diagnosticData) return null;
    
    if (diagnosticData.beltTest) {
      return renderBeltTestReport();
    }
    
    const { problems, correct, accuracy, time, problemsPerMin, analysis } = diagnosticData;
    const recommendedTable = getRecommendedTable(analysis.needsWork);
    
    return (
      <div className="report-screen">
        <div className="report-container">
          <div className="report-header">
            <h2>MULTIPLICATION DOJO REPORT</h2>
          </div>
          
          <div className="report-section">
            <h3>DIAGNOSTIC RESULTS</h3>
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-label">Accuracy:</span>
                <span className="stat-value">{correct}/{problems} ({(accuracy * 100).toFixed(0)}%)</span>
              </div>
              <div className="stat">
                <span className="stat-label">Time:</span>
                <span className="stat-value">{formatTime(time)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Speed:</span>
                <span className="stat-value">{problemsPerMin} problems/min</span>
              </div>
              <div className="stat">
                <span className="stat-label">Current Rank:</span>
                <span className="stat-value belt-display" data-belt={currentBelt}>
                  {currentBelt.toUpperCase()} BELT
                </span>
              </div>
            </div>
          </div>
          
          {analysis.mastered.length > 0 && (
            <div className="report-section">
              <h3>MASTERED TABLES ✓</h3>
              <div className="table-list">
                {analysis.mastered.map(table => (
                  <span key={table} className="table-badge mastered">×{table}</span>
                ))}
              </div>
            </div>
          )}
          
          {analysis.needsWork.length > 0 && (
            <div className="report-section">
              <h3>NEEDS WORK ⚠</h3>
              <div className="table-list">
                {analysis.needsWork.map(table => (
                  <span key={table} className="table-badge needs-work">×{table}</span>
                ))}
              </div>
            </div>
          )}
          
          {analysis.commutativeGaps.length > 0 && (
            <div className="report-section">
              <h3>COMMUTATIVE GAPS</h3>
              <ul className="gap-list">
                {analysis.commutativeGaps.map((gap, idx) => (
                  <li key={idx}>
                    You missed {gap} but got the reverse correct
                    <br />
                    <span className="tip">💡 Remember: {gap.split(' × ').join(' × ')} = {gap.split(' × ').reverse().join(' × ')} (same answer!)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {recommendedTable !== undefined && (
            <div className="report-section recommended">
              <h3>RECOMMENDED TRAINING</h3>
              <p>Start with: <strong>×{recommendedTable} table</strong> (easiest to master)</p>
              <button 
                className="practice-btn"
                onClick={() => startPractice(recommendedTable)}
              >
                Begin Training: ×{recommendedTable}
              </button>
            </div>
          )}
          
          <div className="report-actions">
            <button className="action-btn secondary" onClick={startDiagnostic}>
              Retake Diagnostic
            </button>
            <button className="action-btn primary" onClick={() => setScreen('main-menu')}>
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderBeltTestReport = () => {
    const { beltType, passed, correct, problems, accuracy, time, requiredAccuracy, requiredTime, analysis } = diagnosticData;
    
    return (
      <div className="report-screen">
        <div className="report-container">
          <div className="report-header">
            <h2>{beltType.toUpperCase()} BELT TEST - {passed ? 'PASSED!' : 'NOT PASSED'}</h2>
          </div>
          
          <div className={`test-result ${passed ? 'passed' : 'failed'}`}>
            {passed ? (
              <>
                <div className="result-icon">🏆</div>
                <h3>Congratulations! You earned your {beltType.toUpperCase()} BELT!</h3>
              </>
            ) : (
              <>
                <div className="result-icon">📊</div>
                <h3>Keep practicing! You're getting closer.</h3>
              </>
            )}
          </div>
          
          <div className="report-section">
            <h3>TEST RESULTS</h3>
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-label">Accuracy:</span>
                <span className={`stat-value ${accuracy >= requiredAccuracy ? 'pass' : 'fail'}`}>
                  {correct}/{problems} ({(accuracy * 100).toFixed(0)}%)
                  {accuracy >= requiredAccuracy ? ' ✓' : ` (Need ${(requiredAccuracy * 100).toFixed(0)}%)`}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Time:</span>
                <span className={`stat-value ${time <= requiredTime ? 'pass' : 'fail'}`}>
                  {formatTime(time)}
                  {time <= requiredTime ? ' ✓' : ` (Goal: ${formatTime(requiredTime)})`}
                </span>
              </div>
            </div>
          </div>
          
          {!passed && analysis.needsWork.length > 0 && (
            <div className="report-section">
              <h3>FOCUS AREAS</h3>
              <p>These tables caused the most trouble:</p>
              <div className="table-list">
                {analysis.needsWork.map(table => (
                  <span key={table} className="table-badge needs-work">×{table}</span>
                ))}
              </div>
              <div className="practice-options">
                {analysis.needsWork.slice(0, 2).map(table => (
                  <button 
                    key={table}
                    className="practice-btn small"
                    onClick={() => startPractice(table)}
                  >
                    Practice ×{table}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="report-actions">
            {!passed && (
              <button className="action-btn secondary" onClick={() => startBeltTest(beltType)}>
                Retry Belt Test
              </button>
            )}
            <button className="action-btn primary" onClick={() => setScreen('main-menu')}>
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderResults = () => {
    const correctCount = answers.filter((ans, idx) => ans === problems[idx].answer).length;
    const accuracy = correctCount / problems.length;
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    
    let title, message, nextAction;
    
    if (practicePhase === 'accuracy') {
      if (accuracy >= 0.9) {
        title = 'Accuracy Phase Complete!';
        message = `Great job! You got ${correctCount}/${problems.length} correct. Ready for speed training?`;
        nextAction = (
          <button className="action-btn primary" onClick={continueToNextPhase}>
            Start Speed Training
          </button>
        );
      } else {
        title = 'Keep Practicing';
        message = `You got ${correctCount}/${problems.length}. You need 9/10 to advance. Try again!`;
        nextAction = (
          <button className="action-btn primary" onClick={() => startPractice(practiceTable)}>
            Retry Accuracy Phase
          </button>
        );
      }
    } else if (practicePhase === 'speed') {
      const passedAccuracy = accuracy >= 0.9;
      const passedTime = totalTime <= speedGoal;
      
      if (passedAccuracy && passedTime) {
        title = 'Speed Training Complete!';
        message = `Excellent! ${correctCount}/${problems.length} in ${formatTime(totalTime)}. Ready for the mastery test?`;
        nextAction = (
          <button className="action-btn primary" onClick={continueToNextPhase}>
            Take Mastery Test
          </button>
        );
      } else {
        title = 'Try Again';
        message = `You got ${correctCount}/${problems.length} in ${formatTime(totalTime)}. `;
        message += !passedAccuracy ? 'Need better accuracy (9/10). ' : '';
        message += !passedTime ? `Need to be faster (goal: ${formatTime(speedGoal)}). ` : '';
        nextAction = (
          <button className="action-btn primary" onClick={() => {
            setCurrentProblemIndex(0);
            setAnswers([]);
            setUserAnswer('');
            setStartTime(Date.now());
            setElapsedTime(0);
            setStreak(0);
            setShowFeedback(null);
            setScreen('practice');
          }}>
            Retry Speed Phase
          </button>
        );
      }
    } else if (practicePhase === 'mastery') {
      if (accuracy >= 0.93) {
        title = `×${practiceTable} TABLE MASTERED! 🎉`;
        message = `Outstanding! You've mastered the ×${practiceTable} table!`;
        nextAction = (
          <>
            <button className="action-btn primary" onClick={() => setScreen('main-menu')}>
              Back to Main Menu
            </button>
            <button className="action-btn secondary" onClick={() => setScreen('practice-select')}>
              Master Another Table
            </button>
          </>
        );
      } else {
        title = 'Not Quite There';
        message = `You got ${correctCount}/${problems.length}. Need 14/15 to master. Let's go back to accuracy training.`;
        nextAction = (
          <button className="action-btn primary" onClick={() => {
            setPracticePhase('accuracy');
            startPractice(practiceTable);
          }}>
            Return to Accuracy Training
          </button>
        );
      }
    }
    
    return (
      <div className="results-screen">
        <div className="results-container">
          <h2>{title}</h2>
          <p>{message}</p>
          
          <div className="results-stats">
            <div className="stat">
              <span className="stat-label">Score:</span>
              <span className="stat-value">{correctCount}/{problems.length} ({(accuracy * 100).toFixed(0)}%)</span>
            </div>
            <div className="stat">
              <span className="stat-label">Time:</span>
              <span className="stat-value">{formatTime(totalTime)}</span>
            </div>
          </div>
          
          <div className="results-actions">
            {nextAction}
            <button className="action-btn secondary" onClick={() => setScreen('main-menu')}>
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderTablePreview = () => {
    const tableData = [];
    for (let i = 0; i <= 12; i++) {
      tableData.push({
        problem: `${practiceTable} × ${i}`,
        answer: practiceTable * i
      });
    }
    
    return (
      <div className="table-preview-screen">
        <h2>TRAINING: ×{practiceTable} TABLE</h2>
        <p className="preview-subtitle">Study these facts - practice starts in a moment...</p>
        
        <div className="table-facts-container">
          {tableData.map((fact, index) => (
            <div 
              key={index} 
              className="table-fact"
              style={{
                animationDelay: `${index * 0.25}s`
              }}
            >
              <span className="fact-problem">{fact.problem}</span>
              <span className="fact-equals">=</span>
              <span className="fact-answer">{fact.answer}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className="multiplication-dojo">
      {screen === 'main-menu' && renderMainMenu()}
      {screen === 'practice-select' && renderPracticeSelect()}
      {screen === 'belt-select' && renderBeltSelect()}
      {screen === 'table-preview' && renderTablePreview()}
      {(screen === 'diagnostic' || screen === 'practice' || screen === 'belt-test') && renderTestScreen()}
      {screen === 'report' && renderReport()}
      {screen === 'results' && renderResults()}
    </div>
  );
};

export default MultiplicationDojo;
