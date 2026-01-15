// FeedbackModal.jsx - v16 UI FIX: Draggable + click-to-dismiss
// Location: src/algebra/components/FeedbackModal.jsx
// FIX: renderProblemValue now splits equations on = before passing to FractionDisplay
// This fixes "(4+x)/12" displaying incorrectly in step-by-step solutions
// UI FIX #10: Added draggable functionality and click-to-dismiss

import React, { useState, useRef, useEffect } from 'react';
import StackedEquation from '../StackedEquation';
import FractionDisplay from './FractionDisplay';
import '../../styles/algebra.css';

const FeedbackModal = ({ 
  explanation, 
  onContinue, 
  correctAnswer, 
  selectedAnswer,
  problem
}) => {
  // UI FIX #10: Draggable state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef(null);
  const draggedRef = useRef(false);

  useEffect(() => {
    // Reset position when modal opens
    setPosition({ x: 0, y: 0 });
  }, [explanation]);

  const handleMouseDown = (e) => {
    // Only drag if clicking the header area
    if (e.target.closest('.feedback-header-compact')) {
      setIsDragging(true);
      draggedRef.current = false;
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      draggedRef.current = true;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const handleOverlayClick = (e) => {
    // UI FIX #10: Click overlay background to dismiss
    if (e.target.className === 'feedback-modal-overlay') {
      onContinue();
    }
  };
  // SAFETY: Handle explanation as object or string
  const getExplanationContent = () => {
    if (!explanation) {
      return {
        rule: 'Review the problem and try again.',
        hasSteps: false,
        steps: null,
        originalProblem: problem?.problem || problem?.displayProblem || null
      };
    }
    
    // If explanation is a string, return it as rule
    if (typeof explanation === 'string') {
      return {
        rule: explanation,
        hasSteps: false,
        steps: null,
        originalProblem: problem?.problem || problem?.displayProblem || null
      };
    }
    
    // If explanation is an object, extract rule and steps
    const rule = explanation.rule || 'Check your work and try again.';
    const steps = explanation.steps && Array.isArray(explanation.steps) && explanation.steps.length > 0
      ? explanation.steps
      : null;
    const originalProblem = explanation.originalProblem || problem?.problem || problem?.displayProblem || null;
    
    return {
      rule,
      hasSteps: !!steps,
      steps,
      originalProblem
    };
  };

  const { rule, hasSteps, steps, originalProblem } = getExplanationContent();

  // Determine if we should show answer comparison
  const showAnswerComparison = correctAnswer !== null && correctAnswer !== undefined;
  const showSelectedAnswer = selectedAnswer !== null && selectedAnswer !== undefined;

  // FIXED v14: Helper to render answer with fractions
  const renderAnswerValue = (value) => {
    if (!value) return null;
    const strValue = String(value);
    
    // Check if value contains fraction notation
    if (strValue.includes('/')) {
      return <FractionDisplay expression={strValue} />;
    }
    
    return strValue;
  };

  // FIXED v15: Helper to render problem with fractions - HANDLES EQUATIONS
  const renderProblemValue = (value) => {
    if (!value) return null;
    const strValue = String(value);
    
    // CRITICAL FIX: Check if this is an equation (contains =)
    // Must split equation BEFORE passing to FractionDisplay
    // Bug: "(4+x)/12" in equation "8 = (4+x)/12" was being passed as whole string
    if (strValue.includes('=')) {
      const parts = strValue.split('=');
      if (parts.length === 2) {
        const left = parts[0].trim();
        const right = parts[1].trim();
        return (
          <>
            {left.includes('/') ? <FractionDisplay expression={left} /> : left}
            {' = '}
            {right.includes('/') ? <FractionDisplay expression={right} /> : right}
          </>
        );
      }
    }
    
    // Single expression (no equals) - check for fraction notation
    if (strValue.includes('/')) {
      return <FractionDisplay expression={strValue} />;
    }
    
    return strValue;
  };

  return (
    <div className="feedback-modal-overlay" onClick={handleOverlayClick}>
      <div 
        ref={modalRef}
        className="feedback-modal-content-compact"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default',
          transition: isDragging ? 'none' : 'transform 0.2s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - MINIMAL + Draggable */}
        <div 
          className="feedback-header-compact"
          onMouseDown={handleMouseDown}
          style={{ cursor: 'grab', userSelect: 'none' }}
        >
          <h2 className="feedback-title-compact">Not Quite!</h2>
          <span style={{ 
            fontSize: '0.75rem', 
            opacity: 0.6,
            marginLeft: '0.5rem'
          }}>
            (drag to move)
          </span>
        </div>

        {/* Original Problem - COMPACT with fractions */}
        {originalProblem && (
          <div className="feedback-section-compact feedback-original">
            <div className="feedback-section-label">ORIGINAL PROBLEM</div>
            <div className="feedback-section-value">
              {renderProblemValue(originalProblem)}
            </div>
          </div>
        )}

        {/* Answer Comparison - COMPACT GRID with fractions */}
        {showAnswerComparison && (
          <div className={`feedback-answers-grid ${showSelectedAnswer ? 'two-col' : 'one-col'}`}>
            {showSelectedAnswer && (
              <div className="feedback-answer-box feedback-wrong">
                <div className="feedback-answer-label">YOUR ANSWER</div>
                <div className="feedback-answer-value">
                  {renderAnswerValue(selectedAnswer)}
                </div>
              </div>
            )}

            <div className={`feedback-answer-box feedback-correct ${!showSelectedAnswer ? 'full-width' : ''}`}>
              <div className="feedback-answer-label">CORRECT ANSWER</div>
              <div className="feedback-answer-value">
                {renderAnswerValue(correctAnswer)}
              </div>
            </div>
          </div>
        )}

        {/* Rule Section - COMPACT */}
        <div className="feedback-section-compact feedback-rule">
          <div className="feedback-section-icon-label">
            <span>📖</span>
            <span>KEY RULE</span>
          </div>
          <div className="feedback-section-text">{rule}</div>
        </div>

        {/* Steps Section - COMPACT */}
        {hasSteps && (
          <div className="feedback-section-compact feedback-steps">
            <div className="feedback-section-icon-label">
              <span>🔢</span>
              <span>STEP-BY-STEP SOLUTION</span>
            </div>
            <StackedEquation steps={steps} />
          </div>
        )}

        {/* Continue Button - COMPACT */}
        <button
          onClick={onContinue}
          className="feedback-continue-btn-compact"
        >
          Try Again →
        </button>
      </div>
    </div>
  );
};

export default FeedbackModal;
