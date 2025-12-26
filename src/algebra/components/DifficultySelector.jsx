import React, { useState } from 'react';

const DifficultySelector = ({ onSelect }) => {
  const [showStory, setShowStory] = useState(true);

  if (showStory) {
    return (
      <div className="difficulty-selector story-intro">
        <div className="story-container">
          <div className="journal-entry">
            <div className="journal-header">
              <h2>Dr. Elena Martinez's Journal</h2>
              <p className="date">Entry 1 - Five Years Ago</p>
            </div>
            <div className="journal-content">
              <p>
                "Tomorrow we depart for the Algebraic Mountains. The legends speak of an ancient vault, 
                hidden deep in the peaks, containing mathematical secrets beyond our imagination. 
                My calculations suggest the coordinates are accurate. The team is ready."
              </p>
              <p>
                "If something goes wrong... if I don't return... I've left clues. Follow the path. 
                Solve the challenges. The mathematics will guide you."
              </p>
              <p className="signature">- Dr. E.M.</p>
            </div>
            <div className="present-day">
              <p className="present-label">Present Day</p>
              <p>
                You've discovered Dr. Martinez's journal in a dusty archive. She never returned from that expedition. 
                Her team vanished without a trace. But her notes are clear - the path forward requires mathematical skill.
              </p>
              <p><strong>It's time to retrace her steps and uncover the truth.</strong></p>
            </div>
          </div>
          
          <button 
            className="btn-continue"
            onClick={() => setShowStory(false)}
          >
            Begin the Expedition
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="difficulty-selector">
      <div className="selector-container">
        <h1>Choose Your Path</h1>
        <p className="selector-subtitle">
          Dr. Martinez left two sets of coordinates. Choose the path that matches your skill level.
        </p>

        <div className="difficulty-cards">
          <div 
            className="difficulty-card easy"
            onClick={() => onSelect('easy')}
          >
            <div className="card-icon">📊</div>
            <h2>Standard Route</h2>
            <div className="card-description">
              <p><strong>Best for:</strong> Building solid foundations</p>
              <ul>
                <li>Whole numbers only</li>
                <li>Clear, straightforward problems</li>
                <li>Variable always x</li>
                <li>Focus on core concepts</li>
              </ul>
            </div>
            <div className="card-example">
              <p className="example-label">Example:</p>
              <code>3(x + 5)</code>
              <code>2x + 7 = 15</code>
            </div>
            <button className="btn-select">Select Standard Route</button>
          </div>

          <div 
            className="difficulty-card challenging"
            onClick={() => onSelect('notEasy')}
          >
            <div className="card-icon">⚡</div>
            <h2>Advanced Route</h2>
            <div className="card-description">
              <p><strong>Best for:</strong> Seeking a challenge</p>
              <ul>
                <li>Fractions and decimals</li>
                <li>Multiple variables</li>
                <li>Complex problem types</li>
                <li>Grade-level rigor</li>
              </ul>
            </div>
            <div className="card-example">
              <p className="example-label">Example:</p>
              <code>(1/2)(n - 6)</code>
              <code>1.5y + 3 = 9</code>
            </div>
            <button className="btn-select btn-select-challenging">Select Advanced Route</button>
          </div>
        </div>

        <div className="selector-note">
          <p>
            <strong>Note:</strong> This choice applies to your entire expedition. 
            Choose the path that will challenge you without overwhelming you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DifficultySelector;
