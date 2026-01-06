// LevelPlayer.jsx - FIXED: Proper stats, Poppins font, no scroll
// Location: src/algebra/components/LevelPlayer/LevelPlayer.jsx

import React, { useState, useEffect } from 'react';
import LevelIntro from '../LevelIntro';
import ProblemDisplay from './ProblemDisplay';
import ClickToSelect from './InputMethods/ClickToSelect';
import MathWorksheet from './MathWorksheet';
import FeedbackModal from './FeedbackModal';
import SuccessOverlay from './SuccessOverlay';
import ProgressTracker from './ProgressTracker';
import levels from '../../data/levelData';
import { problemGenerators } from '../../data/problemGenerators';

const LevelPlayer = ({ 
  levelId, 
  difficulty, 
  playMode,
  stats,
  setStats,
  progress,
  onLevelComplete,
  onReturnToMenu,
  onProblemSolved
}) => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [levelComplete, setLevelComplete] = useState(false);
  const [levelStartTime, setLevelStartTime] = useState(null);
  const [levelStats, setLevelStats] = useState({
    attempted: 0,
    correct: 0
  });
  const [problemStartTime, setProblemStartTime] = useState(null);
  const [problemAttempts, setProblemAttempts] = useState(0);

  const level = levels[levelId];

  const getRegion = (levelId) => {
    const num = parseInt(levelId.split('-')[1]);
    if (num <= 16) return 'base-camp';
    if (num <= 31) return 'territory';
    return 'frontier';
  };

  const region = getRegion(levelId);

  useEffect(() => {
    setShowIntro(true);
    setCorrectStreak(0);
    setLevelComplete(false);
    setLevelStats({ attempted: 0, correct: 0 });
    setLevelStartTime(Date.now());
  }, [levelId]);

  useEffect(() => {
    if (!showIntro) {
      generateNewProblem();
    }
  }, [showIntro]);

  const generateNewProblem = () => {
    const generator = problemGenerators[levelId];
    if (generator) {
      const problem = generator(difficulty);
      setCurrentProblem(problem);
      setShowFeedback(false);
      setShowSuccess(false);
      setSelectedAnswer(null);
      setProblemStartTime(Date.now()); // Start timer
      setProblemAttempts(0); // Reset attempts for new problem
    } else {
      console.error(`No generator found for level ${levelId}`);
    }
  };

  const handleProblemComplete = () => {
    const problemEndTime = Date.now();
    const timeSpent = problemStartTime ? (problemEndTime - problemStartTime) / 1000 : 0;
    const isFirstTry = problemAttempts === 0;

    setStats(prev => ({
      ...prev,
      problemsAttempted: prev.problemsAttempted + 1,
      problemsCorrect: prev.problemsCorrect + 1,
      currentStreak: prev.currentStreak + 1
    }));

    setLevelStats(prev => ({
      attempted: prev.attempted + 1,
      correct: prev.correct + 1
    }));

    const newStreak = correctStreak + 1;
    setCorrectStreak(newStreak);
    
    setShowSuccess(true);

    // Award crystal and track enhanced stats
    if (onProblemSolved) {
      onProblemSolved(1, levelId, isFirstTry, timeSpent);
    }
    
    setTimeout(() => {
      setShowSuccess(false);
      
      if (newStreak >= level.problemsRequired) {
        setLevelComplete(true);
      } else {
        generateNewProblem();
      }
    }, 1500);
  };

  const handleProblemWrong = () => {
    setProblemAttempts(prev => prev + 1); // Track attempts for first-try calculation

    setStats(prev => ({
      ...prev,
      problemsAttempted: prev.problemsAttempted + 1,
      currentStreak: 0
    }));

    setLevelStats(prev => ({
      ...prev,
      attempted: prev.attempted + 1
    }));

    setCorrectStreak(0);
    setShowFeedback(true);
  };

  const handleAnswerSubmit = (answer) => {
    setSelectedAnswer(answer);
    const correct = answer === currentProblem.answer;
    setIsCorrect(correct);

    if (correct) {
      handleProblemComplete();
    } else {
      handleProblemWrong();
    }
  };

  const handleContinueFromFeedback = () => {
    setShowFeedback(false);
    generateNewProblem();
  };

  const handleContinueFromComplete = () => {
    const artifact = level.artifact || level.moduleArtifact;
    onLevelComplete(levelId, artifact);
  };

  // Calculate time spent
  const getTimeSpent = () => {
    if (!levelStartTime) return 0;
    const seconds = Math.floor((Date.now() - levelStartTime) / 1000);
    return seconds;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Show intro first
  if (showIntro) {
    return (
      <LevelIntro
        levelData={{ id: levelId, name: level.name }}
        onContinue={() => setShowIntro(false)}
      />
    );
  }

  if (!currentProblem) {
    return <div className="loading">Generating problem...</div>;
  }

  if (levelComplete) {
    const timeSpent = getTimeSpent();
    const percentage = levelStats.attempted > 0 
      ? Math.round((levelStats.correct / levelStats.attempted) * 100)
      : 0;

    return (
      <div className="level-player" data-region={region} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="level-complete-container">
          <div className="level-complete-icon" style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
          <h2 className="level-complete-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Level Complete!
          </h2>
          <h3 className="level-complete-subtitle" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
            {level.name}
          </h3>
          
          {level.artifact && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '2px solid #F59E0B',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <p style={{ 
                fontWeight: 700, 
                marginBottom: '0.25rem',
                fontSize: '0.875rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Artifact Discovered!
              </p>
              <div style={{ fontSize: '2rem' }}>🔮</div>
            </div>
          )}

          <div className="level-complete-stats" style={{ marginBottom: '1.25rem', gap: '0.75rem' }}>
            <div className="stat-box">
              <div className="stat-value">{levelStats.attempted}</div>
              <div className="stat-label">Attempted</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{levelStats.correct}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{percentage}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{formatTime(timeSpent)}</div>
              <div className="stat-label">Time</div>
            </div>
          </div>

          <button 
            className="base-camp-tile-button"
            onClick={handleContinueFromComplete}
            style={{ 
              width: '100%', 
              padding: '0.875rem',
              fontSize: '1rem',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            {playMode === 'practice' ? 'Back to Practice →' : 'Continue Expedition →'}
          </button>
        </div>
      </div>
    );
  }

  const isStaged = currentProblem.staged && currentProblem.staged.rows;

  return (
    <div className="level-player" data-region={region}>
      <button className="btn-back-base" onClick={onReturnToMenu}>
        ← Back to Base Camp
      </button>

      <div className="level-content">
        <ProgressTracker 
  current={correctStreak} 
  required={level.problemsRequired}
  levelId={levelId}
  levelName={level.name}
  difficulty={difficulty}
/>


        {isStaged ? (
          <MathWorksheet
            problem={currentProblem}
            onComplete={handleProblemComplete}
            onWrongAnswer={handleProblemWrong}
          />
        ) : (
          <>
            <ProblemDisplay problem={currentProblem} />
            {level.inputMethod === 'clickToSelect' && (
              <ClickToSelect
                choices={currentProblem.choices}
                onSubmit={handleAnswerSubmit}
                disabled={showFeedback || showSuccess}
                selectedAnswer={selectedAnswer}
              />
            )}
          </>
        )}
      </div>

      {showSuccess && (
        <SuccessOverlay crystalsEarned={1} />
      )}

      {showFeedback && (
        <FeedbackModal
          explanation={currentProblem.explanation}
          onContinue={handleContinueFromFeedback}
          correctAnswer={currentProblem.answer}
          selectedAnswer={selectedAnswer}
        />
      )}
    </div>
  );
};

export default LevelPlayer;
