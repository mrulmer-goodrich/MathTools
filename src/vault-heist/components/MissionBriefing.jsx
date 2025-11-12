import React, { useState, useEffect, useRef } from 'react';

const MissionBriefing = ({ onAccept, onSkip }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const dossierRef = useRef(null);

  const briefingSections = [
    {
      id: 'header',
      content: '█ OPERATION: VAULT HEIST █',
      className: 'briefing-header',
      delay: 0
    },
    {
      id: 'classified',
      content: '⚠️ CLASSIFIED - EYES ONLY ⚠️',
      className: 'briefing-classified',
      delay: 800
    },
    {
      id: 'mission',
      content: 'MISSION OBJECTIVE:',
      className: 'briefing-section-title',
      delay: 1500
    },
    {
      id: 'objective-text',
      content: 'Intelligence indicates that six heavily secured vaults contain classified mathematical secrets. Your mission: crack all six vaults using your knowledge of scale factors to unlock the codes.',
      className: 'briefing-text',
      delay: 2000,
      typewriter: true
    },
    {
      id: 'intel',
      content: 'CRITICAL INTEL:',
      className: 'briefing-section-title',
      delay: 4500
    },
    {
      id: 'intel-formula',
      content: '• Scale Factor = Copy ÷ Original',
      className: 'briefing-intel-important',
      delay: 5000,
      typewriter: true
    },
    {
      id: 'intel-1',
      content: '• Scale Factor > 1 = Image is LARGER than original (enlargement)',
      className: 'briefing-intel',
      delay: 6000,
      typewriter: true
    },
    {
      id: 'intel-2',
      content: '• Scale Factor < 1 = Image is SMALLER than original (reduction)',
      className: 'briefing-intel',
      delay: 7000,
      typewriter: true
    },
    {
      id: 'intel-3',
      content: '• Scale Factor = 1 = Image is SAME SIZE as original (congruent)',
      className: 'briefing-intel',
      delay: 8000,
      typewriter: true
    },
    {
      id: 'intel-4',
      content: '• ANGLES remain unchanged under scale transformations',
      className: 'briefing-intel',
      delay: 9000,
      typewriter: true
    },
    {
      id: 'intel-5',
      content: '• AREA changes by Scale Factor SQUARED (SF²)',
      className: 'briefing-intel-important',
      delay: 10000,
      typewriter: true
    },
    {
      id: 'intel-6',
      content: '• Copy dimensions = Original dimensions × Scale Factor',
      className: 'briefing-intel',
      delay: 11000,
      typewriter: true
    },
    {
      id: 'equipment',
      content: 'MISSION PARAMETERS:',
      className: 'briefing-section-title',
      delay: 12500
    },
    {
      id: 'equipment-text',
      content: '• 6 Vaults to crack\n• 10 Problems per vault\n• 3-Strike alarm system per vault\n• Timer tracking all movements',
      className: 'briefing-text',
      delay: 13000,
      typewriter: true
    },
    {
      id: 'warning',
      content: '⚠️ WARNING:',
      className: 'briefing-warning-title',
      delay: 14500
    },
    {
      id: 'warning-text',
      content: 'Three incorrect answers will trigger a SECURITY LOCKDOWN. The vault will seal and reset. Choose your answers carefully, agent.',
      className: 'briefing-warning-text',
      delay: 15000,
      typewriter: true
    },
    {
      id: 'final',
      content: 'This message will self-destruct in 5... 4... 3...',
      className: 'briefing-destruct',
      delay: 16500,
      typewriter: true
    }
  ];

  // Auto-scroll effect when typing
  useEffect(() => {
    if (dossierRef.current) {
      dossierRef.current.scrollTop = dossierRef.current.scrollHeight;
    }
  }, [displayedText, currentSection]);

  // Typewriter effect
  useEffect(() => {
    let timeoutId;
    let currentSectionIndex = 0;
    let charIndex = 0;
    let typingSection = null;

    const typeNextChar = () => {
      if (currentSectionIndex >= briefingSections.length) {
        setIsTyping(false);
        return;
      }

      const section = briefingSections[currentSectionIndex];
      
      if (section.typewriter) {
        if (charIndex === 0) {
          typingSection = section;
          setCurrentSection(currentSectionIndex);
        }

        if (charIndex < section.content.length) {
          setDisplayedText(section.content.substring(0, charIndex + 1));
          charIndex++;
          timeoutId = setTimeout(typeNextChar, 20); // Typing speed
        } else {
          charIndex = 0;
          currentSectionIndex++;
          timeoutId = setTimeout(typeNextChar, briefingSections[currentSectionIndex]?.delay - section.delay || 500);
        }
      } else {
        setCurrentSection(currentSectionIndex);
        currentSectionIndex++;
        timeoutId = setTimeout(typeNextChar, briefingSections[currentSectionIndex]?.delay - section.delay || 500);
      }
    };

    timeoutId = setTimeout(typeNextChar, briefingSections[0].delay);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="mission-briefing-container">
      {/* Background effects */}
      <div className="briefing-static"></div>
      <div className="briefing-scanlines"></div>
      
      {/* Main briefing content */}
      <div className="mission-briefing-content">
        {/* Top classified banner */}
        <div className="classified-banner">CLASSIFIED</div>
        
        {/* Briefing dossier with ref for auto-scroll */}
        <div className="briefing-dossier" ref={dossierRef}>
          {briefingSections.map((section, index) => {
            if (index > currentSection) return null;
            
            return (
              <div 
                key={section.id} 
                className={`${section.className} ${index === currentSection && section.typewriter ? 'typing' : ''}`}
                style={{ 
                  animationDelay: `${section.delay}ms`,
                  whiteSpace: section.content.includes('\n') ? 'pre-line' : 'normal'
                }}
              >
                {section.typewriter && index === currentSection 
                  ? displayedText 
                  : section.content}
                {section.typewriter && index === currentSection && isTyping && (
                  <span className="cursor">█</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Action buttons - appear after typing complete */}
        <div className={`briefing-actions ${!isTyping ? 'visible' : ''}`}>
          <button className="accept-mission-btn" onClick={onAccept}>
            <span className="btn-icon">🎯</span>
            ACCEPT MISSION
          </button>
        </div>

        {/* Skip button - always visible in corner */}
        <button className="skip-briefing-btn" onClick={onSkip}>
          SKIP BRIEFING ››
        </button>
      </div>
    </div>
  );
};

export default MissionBriefing;
