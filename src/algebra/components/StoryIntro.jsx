// StoryIntro.jsx - Multi-page story intro with skip option
import React, { useState } from 'react';
import '../styles/algebra.css';

const StoryIntro = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const storyPages = [
    {
      title: "Dr. Elena Martinez's Journal",
      subtitle: "Entry 1 - Five Years Ago",
      content: [
        "Tomorrow we depart for the Algebraic Mountains. The legends speak of an ancient vault, hidden deep in the peaks, containing mathematical secrets beyond our imagination.",
        "My calculations suggest the coordinates are accurate. The team is ready."
      ]
    },
    {
      title: "Dr. Elena Martinez's Journal",
      subtitle: "Entry 1 - Five Years Ago (continued)",
      content: [
        "If something goes wrong... if I don't return... I've left clues. Follow the path. Solve the challenges.",
        "The mathematics will guide you.",
        "- Dr. E.M."
      ]
    },
    {
      title: "Present Day",
      subtitle: "",
      content: [
        "You've discovered Dr. Martinez's journal in a dusty archive. She never returned from that expedition. Her team vanished without a trace.",
        "But her notes are clear - the path forward requires mathematical skill.",
        "It's time to retrace her steps and uncover the truth."
      ]
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

  return (
    <div className="base-camp-screen">
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '3rem 2rem',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '1rem',
          padding: '3rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          border: '3px solid #4CAF50'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#2E7D32',
            marginBottom: '0.5rem',
            fontFamily: 'Georgia, serif'
          }}>
            {page.title}
          </h1>

          {page.subtitle && (
            <p style={{
              fontSize: '1rem',
              color: '#6B7280',
              fontStyle: 'italic',
              marginBottom: '2rem',
              fontFamily: 'Inter, sans-serif'
            }}>
              {page.subtitle}
            </p>
          )}

          <div style={{
            fontSize: '1.125rem',
            lineHeight: 1.8,
            color: '#1F2937',
            marginBottom: '2rem',
            fontFamily: 'Inter, sans-serif'
          }}>
            {page.content.map((paragraph, index) => (
              <p key={index} style={{ 
                marginBottom: index === page.content.length - 1 ? 0 : '1.5rem',
                fontStyle: paragraph.startsWith('-') ? 'italic' : 'normal',
                textAlign: paragraph.startsWith('-') ? 'right' : 'left',
                fontWeight: paragraph.startsWith('-') ? 600 : 400
              }}>
                {paragraph}
              </p>
            ))}
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: currentPage === 0 ? 'space-between' : 'center',
            marginTop: '2rem'
          }}>
            {currentPage === 0 && (
              <button
                onClick={handleSkip}
                style={{
                  padding: '0.75rem 2rem',
                  border: '2px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  background: 'white',
                  color: '#6B7280',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Skip Story
              </button>
            )}

            <button
              onClick={handleNext}
              className="base-camp-tile-button"
              style={{
                padding: '0.75rem 2.5rem',
                fontSize: '1.125rem',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {currentPage < storyPages.length - 1 ? 'Continue →' : 'Begin Expedition →'}
            </button>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '1.5rem'
          }}>
            {storyPages.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: index === currentPage ? '#4CAF50' : '#D1D5DB',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryIntro;
