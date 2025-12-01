// IntroSequence.jsx v4.0 - Enhanced Narrative
import React, { useState, useEffect } from 'react';

const IntroSequence = ({ playerData, onComplete, onSkip }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "THE OUTBREAK",
      story: `${playerData.name}, listen carefully. It started in Mr. Peterson's math class. 
      One student... then another... then chaos. Eastway Middle School is now ground zero 
      for something we can't explain.`
    },
    {
      title: "SEVEN FACTIONS",
      story: `The survivors have split into seven groups, each fighting to escape ${playerData.city}. 
      The Eastway Jaguars, The Runners, The Traders, The Scavengers, The Fortress, 
      The Engineers, and The Elites. Each faction has different strengths... and needs YOU.`
    },
    {
      title: "YOUR ROLE",
      story: `Your math skills are the only thing keeping us alive. Every correct calculation 
      earns resources. Every mistake costs us time... and lives. ${playerData.friend} is 
      counting on you. We ALL are.`
    },
    {
      title: "THE MISSION",
      story: `Seven levels. Seven challenges. Calculate percentages, discounts, and ratios 
      to ration supplies and plan our escape. Get the final calculation right, and the 
      rescue helicopter comes. Get it wrong... and we're all infected.`
    },
    {
      title: "EASTWAY'S LAST STAND",
      story: `This isn't just about grades anymore, ${playerData.name}. This is survival. 
      Ready to prove that math can save lives? Then let's move. Time is running out.`
    }
  ];

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleNext();
      }
      if (e.key === 'Escape') {
        onSkip();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="za-intro-sequence">
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1>{slides[currentSlide].title}</h1>
        <p className="za-intro-story" style={{
          fontSize: '15px',
          lineHeight: '1.8',
          color: '#DDD',
          margin: '20px 0',
          textAlign: 'left'
        }}>
          {slides[currentSlide].story}
        </p>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '25px'
      }}>
        {slides.map((_, index) => (
          <div
            key={index}
            style={{
              width: '40px',
              height: '6px',
              background: index === currentSlide ? '#FFD700' : 'rgba(255,255,255,0.2)',
              borderRadius: '3px',
              transition: 'all 0.3s'
            }}
          />
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={onSkip}
          style={{
            flex: '1',
            padding: '10px',
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid #666',
            borderRadius: '6px',
            color: '#AAA',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Skip Intro
        </button>
        <button
          onClick={handleNext}
          style={{
            flex: '2',
            padding: '10px',
            background: 'linear-gradient(135deg, #DC143C, #8B0000)',
            border: 'none',
            borderRadius: '6px',
            color: '#FFF',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textTransform: 'uppercase'
          }}
        >
          {currentSlide < slides.length - 1 ? 'Continue' : 'Start Mission'}
        </button>
      </div>

      <p style={{
        textAlign: 'center',
        color: '#666',
        fontSize: '11px',
        marginTop: '15px'
      }}>
        Press ENTER to continue • ESC to skip
      </p>
    </div>
  );
};

export default IntroSequence;
