// LevelPlayer.jsx - Fixed and cleaned
import React, { useState, useEffect } from 'react';
import LevelIntro from './LevelIntro';
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
  onReturnToMenu 
}) => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [levelComplete, setLevelComplete] = useState(false);

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
    } else {
      console.error(`No generator found for level ${levelId}`);
    }
  };

  const getSuccessMessage = () => {
    const messages = [
      { icon: "🎯", text: "Perfect Shot!", sub: "You're navigating well!" },
      { icon: "⛰️", text: "Summit Reached!", sub: "Onward to the next peak!" },
      { icon: "🧭", text: "True North!", sub: "Your calculations are precise!" },
      { icon: "🏕️", text: "Camp Secured!", sub: "Another challenge conquered!" },
      { icon: "🗺️", text: "Territory Mapped!", sub: "The path is clear!" },
      { icon: "⭐", text: "Stellar Work!", sub: "Dr. Martinez would be proud!" },
      { icon: "🔥", text: "On Fire!", sub: "Keep blazing this trail!" },
      { icon: "💎", text: "Gem Found!", sub: "Mathematical excellence!" }
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleProblemComplete = () => {
    setStats(prev => ({
      ...prev,
      problemsAttempted: prev.problemsAttempted + 1,
      problemsCorrect: prev.problemsCorrect + 1,
      currentStreak: prev.currentStreak + 1
    }));

    const newStreak = correctStreak + 1;
    setCorrectStreak(newStreak);
    
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      
      if (newStreak >= level.problemsRequired) {
        setLevelComplete(true);
      } else {
        generateNewProblem();
      }
    }, 1000);
  };

  const handleProblemWrong = () => {
    setStats(prev => ({
      ...prev,
      problemsAttempted: prev.problemsAttempted + 1,
      currentStreak: 0
    }));

    setCorrectStreak(0);
    setShowFeedback(true);
  };

  const handleAnswerSubmit = (answer) => {
    setSelectedAnswer(answer);
    const correct = answer === currentProblem.answer;
    setIsCorrect(correct);

    setStats(prev => ({
      ...prev,
      problemsAttempted: prev.problemsAttempted + 1,
      problemsCorrect: correct ? prev.problemsCorrect + 1 : prev.problemsCorrect,
      currentStreak: correct ? prev.currentStreak + 1 : 0
    }));

    if (correct) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        
        if (newStreak >= level.problemsRequired) {
          setLevelComplete(true);
        } else {
          generateNewProblem();
        }
      }, 1000);
    } else {
      setCorrectStreak(0);
      setShowFeedback(true);
    }
  };

  const handleContinueFromFeedback = () => {
    setShowFeedback(false);
    generateNewProblem();
  };

  const handleContinueFromComplete = () => {
    const badge = level.badge || level.moduleBadge;
    onLevelComplete(levelId, badge);
    onReturnToMenu();
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
    return (
      <div className="level-player" data-region={region}>
        <div className="level-content">
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '1rem',
            padding: '3rem',
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: '3px solid #10B981'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: 700, 
              marginBottom: '0.5rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Level Complete!
            </h2>
            <h3 style={{ 
              fontSize: '1.5rem', 
              color: '#6B7280', 
              marginBottom: '2rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {level.name}
            </h3>
            
            {level.badge && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '2px solid #F59E0B',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <p style={{ 
                  fontWeight: 700, 
                  marginBottom: '0.5rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Badge Earned!
                </p>
                <div style={{ fontSize: '3rem' }}>🏆</div>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: '#F9FAFB',
                borderRadius: '0.5rem',
                padding: '1rem'
              }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 700, 
                  color: '#10B981',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {level.problemsRequired}
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: '#6B7280',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Problems Solved
                </div>
              </div>
              <div style={{
                background: '#F9FAFB',
                borderRadius: '0.5rem',
                padding: '1rem'
              }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 700, 
                  color: '#10B981',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {correctStreak}
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: '#6B7280',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Final Streak
                </div>
              </div>
            </div>

            <button 
              className="base-camp-tile-button"
              onClick={handleContinueFromComplete}
              style={{ 
                width: '100%', 
                padding: '1rem',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              {playMode === 'practice' ? 'Back to Practice →' : 'Continue Expedition →'}
            </button>
          </div>
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
        <SuccessOverlay message={getSuccessMessage()} />
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
