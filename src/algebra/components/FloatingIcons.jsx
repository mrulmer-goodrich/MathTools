// FloatingIcons.jsx - 4 persistent draggable/resizable icons
import React, { useState, useEffect } from 'react';
import '../styles/algebra.css';

const FloatingIcons = ({ 
  onOpenStory, 
  onOpenBadges, 
  onOpenStats, 
  onOpenMap,
  playerName 
}) => {
  
  const defaultPositions = {
    story: { x: 20, y: 120, size: 70 },
    badges: { x: 20, y: 210, size: 70 },
    stats: { x: window.innerWidth - 110, y: 20, size: 70 },
    map: { x: window.innerWidth - 110, y: 110, size: 70 }
  };

  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem('algebra_icon_positions');
    return saved ? JSON.parse(saved) : defaultPositions;
  });

  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    localStorage.setItem('algebra_icon_positions', JSON.stringify(positions));
  }, [positions]);

  const handleMouseDown = (icon, e) => {
    e.preventDefault();
    setDragging(icon);
    setDragOffset({
      x: e.clientX - positions[icon].x,
      y: e.clientY - positions[icon].y
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    
    setPositions(prev => ({
      ...prev,
      [dragging]: {
        ...prev[dragging],
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      }
    }));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, dragOffset]);

  const icons = [
    { id: 'story', emoji: '📖', label: 'Story', onClick: onOpenStory },
    { id: 'badges', emoji: '🏆', label: 'Badges', onClick: onOpenBadges },
    { id: 'stats', emoji: '📊', label: 'Stats', onClick: onOpenStats },
    { id: 'map', emoji: '🗺️', label: 'Map', onClick: onOpenMap }
  ];

  return (
    <>
      {icons.map((icon) => (
        <div
          key={icon.id}
          style={{
            position: 'fixed',
            left: `${positions[icon.id].x}px`,
            top: `${positions[icon.id].y}px`,
            width: `${positions[icon.id].size}px`,
            height: `${positions[icon.id].size}px`,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '50%',
            border: '3px solid #10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: dragging === icon.id ? 'grabbing' : 'grab',
            zIndex: 90,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: dragging === icon.id ? 'none' : 'transform 0.2s ease',
            userSelect: 'none'
          }}
          onMouseDown={(e) => {
            if (e.button === 0) { // Left click to drag
              handleMouseDown(icon.id, e);
            }
          }}
          onClick={(e) => {
            if (!dragging) {
              icon.onClick();
            }
          }}
          onMouseEnter={(e) => {
            if (!dragging) {
              e.currentTarget.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span style={{ fontSize: `${positions[icon.id].size * 0.5}px` }}>
            {icon.emoji}
          </span>
        </div>
      ))}
    </>
  );
};

export default FloatingIcons;
