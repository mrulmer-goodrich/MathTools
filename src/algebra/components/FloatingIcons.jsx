// FloatingIcons.jsx - FIXED: Badge z-index properly layered
// Location: src/algebra/components/FloatingIcons.jsx

import React, { useState, useEffect, useRef } from 'react';
import '../styles/algebra.css';

const FloatingIcons = ({ 
  onOpenStory, 
  onOpenStats, 
  onOpenMap,
  playerName,
  crystalCount = 0
}) => {
  
  const playerAvatar = localStorage.getItem('algebra_player_avatar') || '1';
  
  // Default positions - VERTICAL STACK, TOP-LEFT (3 icons only - removed badges)
  // Order: User/Statistics (with crystals), Story, Map
  const defaultPositions = {
    stats: { x: 20, y: 100 },     // Top (below header) - shows crystal count
    story: { x: 20, y: 190 },     // 90px gap
    map: { x: 20, y: 280 }        // 90px gap
  };

  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem('algebra_icon_positions');
    return saved ? JSON.parse(saved) : defaultPositions;
  });

  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const draggedRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('algebra_icon_positions', JSON.stringify(positions));
  }, [positions]);

  const handleMouseDown = (icon, e) => {
    e.preventDefault();
    setDragging(icon);
    draggedRef.current = false;
    setDragOffset({
      x: e.clientX - positions[icon].x,
      y: e.clientY - positions[icon].y
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    
    draggedRef.current = true;
    
    setPositions(prev => ({
      ...prev,
      [dragging]: {
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
    { id: 'stats', image: `/algebra/avatar-${playerAvatar}.png`, label: 'Stats', onClick: onOpenStats, badge: crystalCount },
    { id: 'story', emoji: '📖', label: 'Story', onClick: onOpenStory },
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
            width: '70px',
            height: '70px',
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
            userSelect: 'none',
            overflow: 'visible'
          }}
          onMouseDown={(e) => {
            handleMouseDown(icon.id, e);
          }}
          onClick={(e) => {
            if (!draggedRef.current) {
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
          {icon.image ? (
            <img 
              src={icon.image} 
              alt={icon.label}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
                pointerEvents: 'none'
              }}
            />
          ) : (
            <span style={{ fontSize: '35px', pointerEvents: 'none' }}>
              {icon.emoji}
            </span>
          )}
          
          {icon.badge !== undefined && icon.badge > 0 && (
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#EF4444',
              color: 'white',
              borderRadius: '50%',
              minWidth: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'Poppins, sans-serif',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
              zIndex: 100,
              padding: '0 0.25rem'
            }}>
              {icon.badge}
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default FloatingIcons;
