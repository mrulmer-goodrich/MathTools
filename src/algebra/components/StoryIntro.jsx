// StoryIntro.jsx - CREATIVE AMP UP: Enhanced storytelling, visuals, engagement
// Location: src/algebra/components/StoryIntro.jsx

import React, { useState } from 'react';
import '../styles/algebra.css';

const StoryIntro = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const storyPages = [
    {
      title: "Five Years Ago...",
      icon: "📜",
      content: [
        "Dr. Elena Martinez stood at the edge of the Algebraic Mountains, her journal clutched tightly against the biting wind.",
        "\"Tomorrow, we depart,\" she wrote by lantern light. \"The legends speak of an ancient vault, hidden deep in the peaks—a repository of mathematical secrets beyond our wildest imagination.\"",
        "\"My calculations are precise. The coordinates are accurate. The team is ready.\""
      ],
      mood: "anticipation"
    },
    {
      title: "The Final Entry",
      icon: "✒️",
      content: [
        "The journal's pages become hurried, almost frantic:",
        "\"If something goes wrong... if I don't return... I've left clues. The path forward requires more than courage—it demands mathematical precision.\"",
        "\"Follow the trail. Solve the challenges. The mathematics will guide you.\"",
        "The entry ends abruptly, signed only: — E.M."
      ],
      mood: "mystery"
    },
    {
      title: "Present Day",
      icon: "🔍",
      content: [
        "You discovered Dr. Martinez's journal in a dusty university archive. She never returned from that expedition. Her entire team vanished without a trace.",
        "But her notes are remarkably clear. Each page contains mathematical puzzles—operations, distributions, equations—growing more complex as she ventured deeper into the mountains.",
        "The final page shows a hand-drawn map with a single word circled: VAULT."
      ],
      mood: "discovery"
    },
    {
      title: "Your Mission",
      icon: "🎯",
      content: [
        "You stand at the same base camp where Dr. Martinez began her journey. The Algebraic Mountains loom before you, their peaks shrouded in mist.",
        "Her journal is your guide. Her mathematics, your key.",
        "The vault awaits. The truth awaits.",
        "Are you ready to retrace her steps and uncover what lies hidden in the mountains?"
      ],
      mood: "determination"
    }
  ];

  const handleNext = () => {
    if (currentPage < storyPages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const page = storyPages[currentPage];

  // Mood-based styling
  const getMoodColors = (mood) => {
    switch(mood) {
      case 'anticipation':
        return { border: '#F59E0B', bg: 'rgba(251, 191, 36, 0.1)', icon: '🏔️' };
      case 'mystery':
        return { border: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)', icon: '❓' };
      case 'discovery':
        return { border: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', icon: '💡' };
      case 'determination':
        return { border: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', icon: '⚡' };
      default:
        return { border: '#4CAF50', bg: 'rgba(76, 175, 80, 0.1)', icon: '📖' };
    }
  };

  const moodStyle = getMoodColors(page.mood);

  return (
    <div className="base-camp-screen" style={{
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
      <div style={{
        maxWidth: '800px',
        width: '90%',
        padding: '1rem',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative'
      }}>

        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '1rem',
          padding: '1.5rem 2rem',
          boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
          border: `4px solid ${moodStyle.border}`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative corner accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: moodStyle.bg,
            clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
            opacity: 0.6
          }} />

          {/* Page icon */}
          <div style={{
            fontSize: '2.5rem',
            textAlign: 'center',
            marginBottom: '0.75rem',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }}>
            {page.icon}
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#1F2937',
            marginBottom: '1.25rem',
            textAlign: 'center',
            fontFamily: 'Poppins, sans-serif',
            textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
          }}>
            {page.title}
          </h1>

          <div style={{
            fontSize: '1rem',
            lineHeight: 1.6,
            color: '#374151',
            marginBottom: '1.5rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            {page.content.map((paragraph, index) => (
              <p key={index} style={{ 
                marginBottom: index === page.content.length - 1 ? 0 : '1rem',
                fontStyle: paragraph.startsWith('"') || paragraph.startsWith('\"') ? 'italic' : 'normal',
                color: paragraph.startsWith('"') || paragraph.startsWith('\"') ? '#059669' : '#374151',
                fontWeight: paragraph.includes('—') ? 600 : 400,
                paddingLeft: paragraph.startsWith('"') || paragraph.startsWith('\"') ? '1.5rem' : 0,
                borderLeft: paragraph.startsWith('"') || paragraph.startsWith('\"') ? '3px solid #10B981' : 'none'
              }}>
                {paragraph}
              </p>
            ))}
          </div>

          {/* Navigation */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: currentPage === 0 ? 'space-between' : 'center',
            alignItems: 'center'
          }}>
            {currentPage === 0 && (
              <button
                onClick={handleSkip}
                style={{
                  padding: '0.75rem 2rem',
                  border: '2px solid #D1D5DB',
                  borderRadius: '0.75rem',
                  background: 'white',
                  color: '#6B7280',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#9CA3AF';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Skip Story
              </button>
            )}

            <button
              onClick={handleNext}
              className="base-camp-tile-button"
              style={{
                padding: '0.875rem 2.5rem',
                fontSize: '1.125rem',
                fontFamily: 'Poppins, sans-serif',
                borderColor: moodStyle.border,
                boxShadow: `0 4px 12px ${moodStyle.bg}`
              }}
            >
              {currentPage < storyPages.length - 1 ? 'Continue →' : 'Begin Expedition →'}
            </button>
          </div>

          {/* Page indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            marginTop: '2rem'
          }}>
            {storyPages.map((_, index) => (
              <div
                key={index}
                style={{
                  width: index === currentPage ? '32px' : '12px',
                  height: '12px',
                  borderRadius: '6px',
                  background: index === currentPage ? moodStyle.border : '#D1D5DB',
                  transition: 'all 0.3s ease',
                  boxShadow: index === currentPage ? `0 0 8px ${moodStyle.bg}` : 'none'
                }}
              />
            ))}
          </div>
        </div>

        {/* Decorative page number */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          fontSize: '0.875rem',
          color: '#9CA3AF',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600
        }}>
          Page {currentPage + 1} of {storyPages.length}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default StoryIntro;
