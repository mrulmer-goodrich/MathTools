import React, { useState, useRef, useEffect } from 'react';

const Notepad = () => {
  const [content, setContent] = useState('');
  const [position, setPosition] = useState({ x: window.innerWidth - 500, y: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const notepadRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('.za-notepad-textarea')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleClear = () => {
    setContent('');
  };

  return (
    <div 
      ref={notepadRef}
      className="za-notepad"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="za-notepad-header">
        <span>Scratch Work</span>
        <button className="za-notepad-clear" onClick={handleClear}>Clear</button>
      </div>
      <textarea 
        className="za-notepad-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Scratch work here..."
      />
    </div>
  );
};

export default Notepad;
