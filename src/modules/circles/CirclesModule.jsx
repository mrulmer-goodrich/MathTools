// CirclesModule.jsx — UG Math Tools
// Circles: One Shape, Two Formulas, Three Words

import React, { useEffect, useState } from "react";
import { ErrorOverlay } from "../../components/StatsSystem.jsx";
import BigButton from "../../components/BigButton.jsx";
import ugConfetti from "../../lib/confetti.js";

const PI = Math.PI;

const shuffle = (arr) => { 
  const a = [...arr]; 
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [a[i], a[j]] = [a[j], a[i]]; 
  } 
  return a; 
};

// Calculator
const Calculator = ({ show, onClose }) => {
  if (!show) return null;
  const [display, setDisplay] = useState('');
  
  const calculate = () => {
    try {
      const expr = display.replace(/π/g, Math.PI.toString());
      const result = eval(expr);
      setDisplay(result.toFixed(2));
    } catch {
      setDisplay('Error');
    }
  };
  
  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      background: 'white', borderRadius: '16px', padding: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 10001
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Calculator</h3>
        <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
      </div>
      <input 
        type="text" 
        value={display}
        onChange={(e) => setDisplay(e.target.value)}
        style={{ 
          width: '100%', 
          padding: '12px', 
          fontSize: '20px', 
          marginBottom: '12px',
          border: '2px solid #e5e7eb',
          borderRadius: '8px'
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {['7','8','9','÷','4','5','6','×','1','2','3','-','0','π','.','+',' '].map(btn => (
          <button
            key={btn}
            onClick={() => btn === ' ' ? calculate() : setDisplay(d => d + btn)}
            style={{
              padding: '16px',
              fontSize: '18px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              background: btn === ' ' ? '#3b82f6' : 'white',
              color: btn === ' ' ? 'white' : 'black',
              cursor: 'pointer'
            }}
          >
            {btn === ' ' ? '=' : btn}
          </button>
        ))}
        <button 
          onClick={() => setDisplay('')}
          style={{
            padding: '16px',
            fontSize: '18px',
            gridColumn: 'span 4',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            background: '#fee2e2',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

// Stage Unlock with coin animations - NOW WITH BONUS AMOUNT
const StageUnlockOverlay = ({ show, nextStage, coinsEarned }) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(59, 130, 246, 0.3)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 10000, pointerEvents: 'none'
    }}>
      <div style={{ 
        fontSize: '80px', 
        color: '#2563eb', 
        fontWeight: '900',
        textShadow: '0 8px 32px rgba(37, 99, 235, 0.5)',
        animation: 'stageUnlockPulse 2s ease-out',
        marginBottom: '20px'
      }}>
        🎉 STAGE {nextStage} UNLOCKED! 🎉
      </div>
      <div style={{ 
        fontSize: '48px', 
        color: '#f59e0b', 
        fontWeight: '900',
        textShadow: '0 4px 16px rgba(245, 158, 11, 0.5)',
        marginBottom: '20px'
      }}>
        +{coinsEarned} COINS! 💰
      </div>
      <div style={{ fontSize: '40px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{
            animation: `coinBounce ${1 + Math.random()}s ease-in-out ${i * 0.1}s infinite`,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            border: '3px solid #d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#78350f',
            boxShadow: '0 4px 8px rgba(217, 119, 6, 0.3)'
          }}>
            ¢
          </div>
        ))}
      </div>
      <style>{`
        @keyframes stageUnlockPulse {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); opacity: 1; }
          60% { transform: scale(0.9); }
          70% { transform: scale(1.1); }
          80% { transform: scale(0.95); }
          90% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes coinBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

// Success overlay
const SuccessOverlay = ({ show }) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(34, 197, 94, 0.2)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 10000, pointerEvents: 'none'
    }}>
      <div style={{ 
        fontSize: '280px', 
        color: '#16a34a', 
        fontWeight: '900',
        textShadow: '0 8px 32px rgba(22, 163, 74, 0.5)',
        animation: 'successPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        filter: 'drop-shadow(0 0 20px rgba(22, 163, 74, 0.8))'
      }}>
        ✓
      </div>
      <style>{`
        @keyframes successPop {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// Exploding coins
const FlyingCoins = ({ show }) => {
  if (!show) return null;
  const COUNT = 40;
  const coins = Array.from({ length: COUNT }).map((_, i) => {
    const angle = (i / COUNT) * 360;
    const distance = 200 + Math.random() * 100;
    const duration = 1.2 + Math.random() * 0.6;
    const delay = Math.random() * 0.2;
    const rotation = Math.random() * 720;
    
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          animation: `coinExplode ${duration}s ease-out ${delay}s forwards`,
          '--angle': `${angle}deg`,
          '--distance': `${distance}px`,
          '--rotation': `${rotation}deg`
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          border: '3px solid #d97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#78350f',
          boxShadow: '0 4px 8px rgba(217, 119, 6, 0.3)'
        }}>
          ¢
        </div>
      </div>
    );
  });
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999 }}>
      <style>{`
        @keyframes coinExplode {
          0% { 
            transform: translate(-50%, -50%) rotate(0deg) scale(0);
            opacity: 1;
          }
          60% { 
            transform: 
              translate(
                calc(-50% + cos(var(--angle)) * var(--distance)),
                calc(-50% + sin(var(--angle)) * var(--distance))
              )
              rotate(var(--rotation))
              scale(1.2);
            opacity: 1;
          }
          100% { 
            transform: 
              translate(
                calc(-50% + cos(var(--angle)) * var(--distance)),
                calc(-50% + sin(var(--angle)) * var(--distance))
              )
              rotate(var(--rotation))
              scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
      {coins}
    </div>
  );
};

const generateColors = () => {
  const colorSets = [
    { radius: '#ef4444', diameter: '#8b5cf6', circumference: '#3b82f6', area: '#f59e0b' },
    { radius: '#10b981', diameter: '#ec4899', circumference: '#f59e0b', area: '#06b6d4' },
    { radius: '#3b82f6', diameter: '#10b981', circumference: '#ef4444', area: '#8b5cf6' },
    { radius: '#f59e0b', diameter: '#06b6d4', circumference: '#8b5cf6', area: '#10b981' },
  ];
  return colorSets[Math.floor(Math.random() * colorSets.length)];
};

const generateProblem = (stage) => {
  const r = Math.floor(Math.random() * 20) + 1;
  const d = r * 2;
  const C = 2 * PI * r;
  const A = PI * r * r;
  
  const safeAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const radiusAngle = safeAngles[Math.floor(Math.random() * safeAngles.length)];
  const diameterAngle = (radiusAngle + 90) % 360;
  
  const colors = generateColors();
  return { r, d, C, A, radiusAngle, diameterAngle, colors, stage };
};

// EXPANDED SHAPE BANK - MORE VARIETY AND WILDNESS!
const SHAPE_BANK = [
  { type: 'circle', label: 'Circle', emoji: '⭕' },
  { type: 'square', label: 'Square', emoji: '⬜' },
  { type: 'triangle', label: 'Triangle', emoji: '🔺' },
  { type: 'rectangle', label: 'Rectangle', emoji: '▭' },
  { type: 'pentagon', label: 'Pentagon', emoji: '⬟' },
  { type: 'hexagon', label: 'Hexagon', emoji: '⬡' },
  { type: 'star', label: 'Star', emoji: '⭐' },
  { type: 'heart', label: 'Heart', emoji: '❤️' },
  { type: 'oval', label: 'Oval', emoji: '🥚' },
  { type: 'diamond', label: 'Diamond', emoji: '💎' },
  { type: 'octagon', label: 'Octagon', emoji: '🛑' },
  { type: 'crescent', label: 'Crescent', emoji: '🌙' },
  { type: 'cloud', label: 'Cloud', emoji: '☁️' },
  { type: 'flower', label: 'Flower', emoji: '🌸' },
  { type: 'snowflake', label: 'Snowflake', emoji: '❄️' },
  { type: 'sun', label: 'Sun', emoji: '☀️' },
  { type: 'lightning', label: 'Lightning', emoji: '⚡' },
  { type: 'leaf', label: 'Leaf', emoji: '🍃' },
  { type: 'butterfly', label: 'Butterfly', emoji: '🦋' },
  { type: 'balloon', label: 'Balloon', emoji: '🎈' },
  { type: 'donut', label: 'Donut', emoji: '🍩' },
  { type: 'pizza', label: 'Pizza', emoji: '🍕' },
  { type: 'cookie', label: 'Cookie', emoji: '🍪' },
  { type: 'watermelon', label: 'Watermelon', emoji: '🍉' },
  { type: 'apple', label: 'Apple', emoji: '🍎' },
  { type: 'strawberry', label: 'Strawberry', emoji: '🍓' },
  { type: 'cherry', label: 'Cherry', emoji: '🍒' },
  { type: 'avocado', label: 'Avocado', emoji: '🥑' },
  { type: 'eggplant', label: 'Eggplant', emoji: '🍆' },
  { type: 'carrot', label: 'Carrot', emoji: '🥕' },
  { type: 'corn', label: 'Corn', emoji: '🌽' },
  { type: 'broccoli', label: 'Broccoli', emoji: '🥦' },
  { type: 'mushroom', label: 'Mushroom', emoji: '🍄' },
  { type: 'peanut', label: 'Peanut', emoji: '🥜' },
  { type: 'bread', label: 'Bread', emoji: '🍞' },
  { type: 'pretzel', label: 'Pretzel', emoji: '🥨' },
  { type: 'croissant', label: 'Croissant', emoji: '🥐' },
  { type: 'hotdog', label: 'Hot Dog', emoji: '🌭' },
  { type: 'taco', label: 'Taco', emoji: '🌮' },
  { type: 'burrito', label: 'Burrito', emoji: '🌯' },
  { type: 'sushi', label: 'Sushi', emoji: '🍣' },
  { type: 'icecream', label: 'Ice Cream', emoji: '🍦' },
  { type: 'cake', label: 'Cake', emoji: '🍰' },
  { type: 'cupcake', label: 'Cupcake', emoji: '🧁' },
  { type: 'lollipop', label: 'Lollipop', emoji: '🍭' },
  { type: 'candy', label: 'Candy', emoji: '🍬' },
  { type: 'soccer', label: 'Soccer Ball', emoji: '⚽' },
  { type: 'basketball', label: 'Basketball', emoji: '🏀' },
  { type: 'football', label: 'Football', emoji: '🏈' },
  { type: 'baseball', label: 'Baseball', emoji: '⚾' },
  { type: 'tennis', label: 'Tennis Ball', emoji: '🎾' },
  { type: 'volleyball', label: 'Volleyball', emoji: '🏐' },
  { type: 'bowling', label: 'Bowling Ball', emoji: '🎳' },
  { type: 'guitar', label: 'Guitar', emoji: '🎸' },
  { type: 'microphone', label: 'Microphone', emoji: '🎤' },
  { type: 'headphones', label: 'Headphones', emoji: '🎧' },
  { type: 'bell', label: 'Bell', emoji: '🔔' },
  { type: 'drum', label: 'Drum', emoji: '🥁' },
  { type: 'saxophone', label: 'Saxophone', emoji: '🎷' },
  { type: 'trumpet', label: 'Trumpet', emoji: '🎺' },
  { type: 'violin', label: 'Violin', emoji: '🎻' },
  { type: 'rocket', label: 'Rocket', emoji: '🚀' },
  { type: 'airplane', label: 'Airplane', emoji: '✈️' },
  { type: 'helicopter', label: 'Helicopter', emoji: '🚁' },
  { type: 'boat', label: 'Boat', emoji: '⛵' },
  { type: 'car', label: 'Car', emoji: '🚗' },
  { type: 'bus', label: 'Bus', emoji: '🚌' },
  { type: 'train', label: 'Train', emoji: '🚂' },
  { type: 'bicycle', label: 'Bicycle', emoji: '🚲' },
  { type: 'scooter', label: 'Scooter', emoji: '🛴' },
  { type: 'skateboard', label: 'Skateboard', emoji: '🛹' },
  { type: 'house', label: 'House', emoji: '🏠' },
  { type: 'castle', label: 'Castle', emoji: '🏰' },
  { type: 'tent', label: 'Tent', emoji: '⛺' },
  { type: 'umbrella', label: 'Umbrella', emoji: '☂️' },
  { type: 'key', label: 'Key', emoji: '🔑' },
  { type: 'lock', label: 'Lock', emoji: '🔒' },
  { type: 'gift', label: 'Gift', emoji: '🎁' },
  { type: 'trophy', label: 'Trophy', emoji: '🏆' },
  { type: 'medal', label: 'Medal', emoji: '🏅' },
  { type: 'crown', label: 'Crown', emoji: '👑' },
  { type: 'glasses', label: 'Glasses', emoji: '👓' },
  { type: 'watch', label: 'Watch', emoji: '⌚' },
  { type: 'ring', label: 'Ring', emoji: '💍' },
  { type: 'gem', label: 'Gem', emoji: '💎' },
  { type: 'hourglass', label: 'Hourglass', emoji: '⏳' },
  { type: 'clock', label: 'Clock', emoji: '🕐' },
  { type: 'magnet', label: 'Magnet', emoji: '🧲' },
  { type: 'flashlight', label: 'Flashlight', emoji: '🔦' },
  { type: 'lightbulb', label: 'Light Bulb', emoji: '💡' },
  { type: 'candle', label: 'Candle', emoji: '🕯️' },
  { type: 'fire', label: 'Fire', emoji: '🔥' },
  { type: 'bomb', label: 'Bomb', emoji: '💣' },
  { type: 'pill', label: 'Pill', emoji: '💊' },
  { type: 'syringe', label: 'Syringe', emoji: '💉' },
  { type: 'thermometer', label: 'Thermometer', emoji: '🌡️' },
  { type: 'microscope', label: 'Microscope', emoji: '🔬' },
  { type: 'telescope', label: 'Telescope', emoji: '🔭' },
  { type: 'satellite', label: 'Satellite', emoji: '🛰️' },
  { type: 'anchor', label: 'Anchor', emoji: '⚓' },
  { type: 'shield', label: 'Shield', emoji: '🛡️' },
  { type: 'sword', label: 'Sword', emoji: '⚔️' },
  { type: 'bow', label: 'Bow and Arrow', emoji: '🏹' },
  { type: 'hammer', label: 'Hammer', emoji: '🔨' },
  { type: 'wrench', label: 'Wrench', emoji: '🔧' },
  { type: 'gear', label: 'Gear', emoji: '⚙️' },
  { type: 'nut', label: 'Nut and Bolt', emoji: '🔩' },
  { type: 'chain', label: 'Chain', emoji: '⛓️' },
  { type: 'axe', label: 'Axe', emoji: '🪓' },
  { type: 'pick', label: 'Pick', emoji: '⛏️' },
  { type: 'shovel', label: 'Shovel', emoji: '🪑' },
  { type: 'broom', label: 'Broom', emoji: '🧹' },
  { type: 'basket', label: 'Basket', emoji: '🧺' },
  { type: 'thread', label: 'Thread', emoji: '🧵' },
  { type: 'yarn', label: 'Yarn', emoji: '🧶' },
  { type: 'scissors', label: 'Scissors', emoji: '✂️' },
  { type: 'paperclip', label: 'Paperclip', emoji: '📎' },
  { type: 'pushpin', label: 'Pushpin', emoji: '📌' },
  { type: 'bookmark', label: 'Bookmark', emoji: '🔖' },
  { type: 'label', label: 'Label', emoji: '🏷️' },
];

// More circle variety - different fills and styles
const CIRCLE_VARIANTS = [
  { type: 'circle', label: 'Circle', emoji: '⭕' },      // Original hollow
  { type: 'circle', label: 'Circle', emoji: '🔴' },      // Red solid
  { type: 'circle', label: 'Circle', emoji: '🟠' },      // Orange solid
  { type: 'circle', label: 'Circle', emoji: '🟡' },      // Yellow solid
  { type: 'circle', label: 'Circle', emoji: '🟢' },      // Green solid
  { type: 'circle', label: 'Circle', emoji: '🔵' },      // Blue solid
  { type: 'circle', label: 'Circle', emoji: '🟣' },      // Purple solid
  { type: 'circle', label: 'Circle', emoji: '🟤' },      // Brown solid
  { type: 'circle', label: 'Circle', emoji: '⚫' },      // Black solid
  { type: 'circle', label: 'Circle', emoji: '⚪' },      // White solid
  { type: 'circle', label: 'Circle', emoji: '🔘' },      // Radio button
  { type: 'circle', label: 'Circle', emoji: '🎯' },      // Target/bullseye
];

// Circle visualization
const CircleVisualization = ({ problem, stage, placedTerms, givenValue, visibleValues, currentTargetValue, onCircleClick }) => {
  const { r, d, C, A, radiusAngle, diameterAngle, colors } = problem;
  
  const size = 400;
  const center = size / 2;
  const displayR = 120;
  
  const radAngle = (radiusAngle * Math.PI) / 180;
  const diamAngle = (diameterAngle * Math.PI) / 180;
  
  const radiusEnd = {
    x: center + displayR * Math.cos(radAngle),
    y: center + displayR * Math.sin(radAngle)
  };
  
  const diamStart = {
    x: center - displayR * Math.cos(diamAngle),
    y: center - displayR * Math.sin(diamAngle)
  };
  
  const diamEnd = {
    x: center + displayR * Math.cos(diamAngle),
    y: center + displayR * Math.sin(diamAngle)
  };
  
  // Label positioning - clearly associated with elements
  // Radius: along the radius line, slightly offset perpendicular to avoid overlap
  const radiusLabelPos = {
    x: center + (displayR * 0.5) * Math.cos(radAngle) + 25 * Math.cos(radAngle + Math.PI/2),
    y: center + (displayR * 0.5) * Math.sin(radAngle) + 25 * Math.sin(radAngle + Math.PI/2)
  };
  
  // Diameter: closer to center on the diameter line
  const diameterLabelPos = {
    x: center - (displayR * 0.4) * Math.cos(diamAngle),
    y: center - (displayR * 0.4) * Math.sin(diamAngle)
  };
  
  // Circumference: just outside the circle edge, in different quadrant from r and d
  const circumAngle = radAngle + (Math.PI * 0.6); // 108° from radius
  const circumferenceLabelPos = {
    x: center + (displayR + 35) * Math.cos(circumAngle),
    y: center + (displayR + 35) * Math.sin(circumAngle)
  };
  
  // Area: inside, in the open semicircle area (opposite side from radius)
  const areaAngle = radAngle + Math.PI; // 180° opposite from radius
  const areaLabelPos = {
    x: center + (displayR * 0.4) * Math.cos(areaAngle),
    y: center + (displayR * 0.4) * Math.sin(areaAngle)
  };
  
  const showCircle = stage >= 2;
  const showDiameter = stage >= 2;
  const showArea = stage >= 2;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      <rect width={size} height={size} fill="#ffffff" rx="12" />
      
      {showCircle ? (
        <>
          {showArea && (
            <g onClick={() => stage === 2 && onCircleClick?.('area')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
              <circle cx={center} cy={center} r={displayR} fill={colors.area} fillOpacity="0.3" />
              <circle cx={center} cy={center} r={displayR} fill="transparent" strokeWidth="20" stroke="transparent" />
            </g>
          )}
          
          <g onClick={() => stage === 2 && onCircleClick?.('circumference')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
            <circle cx={center} cy={center} r={displayR} fill="none" stroke={colors.circumference} strokeWidth="6" />
            <circle cx={center} cy={center} r={displayR} fill="none" strokeWidth="30" stroke="transparent" />
          </g>
          
          {showDiameter && (
            <g onClick={() => stage === 2 && onCircleClick?.('diameter')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
              <line x1={diamStart.x} y1={diamStart.y} x2={diamEnd.x} y2={diamEnd.y} stroke={colors.diameter} strokeWidth="5" />
              <line x1={diamStart.x} y1={diamStart.y} x2={diamEnd.x} y2={diamEnd.y} stroke="transparent" strokeWidth="25" />
            </g>
          )}
          
          <g onClick={() => stage === 2 && onCircleClick?.('radius')} style={{ cursor: stage === 2 ? 'pointer' : 'default' }}>
            <line x1={center} y1={center} x2={radiusEnd.x} y2={radiusEnd.y} stroke={colors.radius} strokeWidth="5" />
            <line x1={center} y1={center} x2={radiusEnd.x} y2={radiusEnd.y} stroke="transparent" strokeWidth="25" />
          </g>
          
          <circle cx={center} cy={center} r="5" fill="#1f2937" />
          
          {/* Stage 2: Only show labels AFTER they've been correctly placed */}
          {stage === 2 && (
            <>
              {placedTerms.radius && (
                <text x={radiusLabelPos.x} y={radiusLabelPos.y} fill={colors.radius} fontSize="32" fontWeight="bold" textAnchor="middle">
                  r
                </text>
              )}
              {placedTerms.diameter && showDiameter && (
                <text x={diameterLabelPos.x} y={diameterLabelPos.y} fill={colors.diameter} fontSize="32" fontWeight="bold" textAnchor="middle">
                  d
                </text>
              )}
              {placedTerms.circumference && (
                <text x={circumferenceLabelPos.x} y={circumferenceLabelPos.y} fill={colors.circumference} fontSize="32" fontWeight="bold" textAnchor="middle">
                  C
                </text>
              )}
              {placedTerms.area && showArea && (
                <text x={areaLabelPos.x} y={areaLabelPos.y} fill={colors.area} fontSize="32" fontWeight="bold" textAnchor="middle">
                  A
                </text>
              )}
            </>
          )}
          
          {/* Stage 3+: Show only given value, then reveal as calculated */}
          {stage >= 3 && (
            <>
              {visibleValues.r !== undefined && (
                <g>
                  <rect 
                    x={radiusLabelPos.x - 40} 
                    y={radiusLabelPos.y - 20} 
                    width="80" 
                    height="40" 
                    fill="white" 
                    stroke={colors.radius} 
                    strokeWidth="2" 
                    rx="6"
                  />
                  <text x={radiusLabelPos.x} y={radiusLabelPos.y + 6} fill={colors.radius} fontSize="20" fontWeight="bold" textAnchor="middle">
                    r = {visibleValues.r % 1 === 0 ? visibleValues.r : visibleValues.r.toFixed(1)}
                  </text>
                </g>
              )}
              
              {visibleValues.d !== undefined && (
                <g>
                  <rect 
                    x={diameterLabelPos.x - 40} 
                    y={diameterLabelPos.y - 20} 
                    width="80" 
                    height="40" 
                    fill="white" 
                    stroke={colors.diameter} 
                    strokeWidth="2" 
                    rx="6"
                  />
                  <text x={diameterLabelPos.x} y={diameterLabelPos.y + 6} fill={colors.diameter} fontSize="20" fontWeight="bold" textAnchor="middle">
                    d = {visibleValues.d % 1 === 0 ? visibleValues.d : visibleValues.d.toFixed(1)}
                  </text>
                </g>
              )}
              
              {visibleValues.C !== undefined && (
                <g>
                  <rect 
                    x={circumferenceLabelPos.x - 50} 
                    y={circumferenceLabelPos.y - 20} 
                    width="100" 
                    height="40" 
                    fill="white" 
                    stroke={colors.circumference} 
                    strokeWidth="2" 
                    rx="6"
                  />
                  <text x={circumferenceLabelPos.x} y={circumferenceLabelPos.y + 6} fill={colors.circumference} fontSize="18" fontWeight="bold" textAnchor="middle">
                    C = {visibleValues.C.toFixed(1)}
                  </text>
                </g>
              )}
              
              {visibleValues.A !== undefined && (
                <g>
                  <rect 
                    x={areaLabelPos.x - 50} 
                    y={areaLabelPos.y - 20} 
                    width="100" 
                    height="40" 
                    fill="white" 
                    stroke={colors.area} 
                    strokeWidth="2" 
                    rx="6"
                  />
                  <text x={areaLabelPos.x} y={areaLabelPos.y + 6} fill={colors.area} fontSize="18" fontWeight="bold" textAnchor="middle">
                    A = {visibleValues.A.toFixed(1)}
                  </text>
                </g>
              )}
            </>
          )}
        </>
      ) : (
        <text x={center} y={center} fill="#9ca3af" fontSize="18" textAnchor="middle" dominantBaseline="middle">
          Circle appears here...
        </text>
      )}
    </svg>
  );
};

// MAIN COMPONENT
export default function CirclesModule({ onProblemComplete, registerReset, updateStats }) {
  const [stage, setStage] = useState(null);
  const [problem, setProblem] = useState(() => generateProblem(1));
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMoveOnChoice, setShowMoveOnChoice] = useState(false);
  const [currentFormula, setCurrentFormula] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [problemWasCorrect, setProblemWasCorrect] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showStageUnlock, setShowStageUnlock] = useState(false);
  const [skippedToAdvanced, setSkippedToAdvanced] = useState(false);
  const [problemCompletedInStage, setProblemCompletedInStage] = useState(false);
  
  const [shapes, setShapes] = useState([]);
  const [termToPlace, setTermToPlace] = useState(null);
  const [placedTerms, setPlacedTerms] = useState({});
  const [givenValue, setGivenValue] = useState(null);
  const [visibleValues, setVisibleValues] = useState({});
  const [currentStep, setCurrentStep] = useState(null);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [questionQueue, setQuestionQueue] = useState([]);
  const [currentAnswerChoices, setCurrentAnswerChoices] = useState([]);
  const [selectedOperation, setSelectedOperation] = useState(null);

  useEffect(() => {
    registerReset?.(() => {
      setStage(null);
      setProblem(generateProblem(1));
      setTotalPoints(0);
      setShowError(false);
      setShowSuccess(false);
      setShowConfetti(false);
      setShowMoveOnChoice(false);
      setSkippedToAdvanced(false);
      resetStageState();
    });
  }, [registerReset]);

  const handleError = () => {
    setShowError(true);
    setProblemWasCorrect(false);
    
    // Point deduction logic
    let deduction;
    if (stage === 10 && skippedToAdvanced) {
      deduction = totalPoints; // Everything - back to zero
    } else if (stage === 10) {
      deduction = 5;
    } else {
      deduction = 1;
    }
    
    setTotalPoints(prev => Math.max(0, prev - deduction));
    setTimeout(() => setShowError(false), 1000);
  };

  const getStageConfig = (stageNum) => {
    switch(stageNum) {
      case 3: return { given: 'r', steps: [{ target: 'd', operation: '× 2', fromLabel: 'r' }] };
      case 4: return { given: 'd', steps: [{ target: 'r', operation: '÷ 2', fromLabel: 'd' }] };
      case 5: return { given: 'd', steps: [
        { target: 'r', operation: '÷ 2', fromLabel: 'd' },
        { target: 'C', operation: '× π', fromLabel: 'd' }
      ]};
      case 6: return { given: 'r', steps: [
        { target: 'd', operation: '× 2', fromLabel: 'r' },
        { target: 'C', operation: '× π', fromLabel: 'd' }
      ]};
      case 7: return { given: 'C', steps: [
        { target: 'd', operation: '÷ π', fromLabel: 'C' },
        { target: 'r', operation: '÷ 2', fromLabel: 'd' }
      ]};
      case 8: return { given: 'r', steps: [
        { target: 'd', operation: '× 2', fromLabel: 'r' },
        { target: 'A', operation: 'πr²', fromLabel: 'r' }
      ]};
      case 9: return { given: 'd', steps: [
        { target: 'r', operation: '÷ 2', fromLabel: 'd' },
        { target: 'A', operation: 'πr²', fromLabel: 'r' }
      ]};
      case 10: {
        const randomStage = Math.floor(Math.random() * 7) + 3;
        return getStageConfig(randomStage);
      }
      default: return { given: null, steps: [] };
    }
  };

  const resetStageState = (prob = problem) => {
    setPlacedTerms({});
    setVisibleValues({});
    setGivenValue(null);
    setCurrentStep(null);
    setCurrentTarget(null);
    setQuestionQueue([]);
    setCurrentFormula('');
    setCurrentAnswerChoices([]);
    setSelectedOperation(null);
    setShowMoveOnChoice(false);
    setProblemWasCorrect(true);
    setProblemCompletedInStage(false);
    
    if (stage === 1) {
      // Shuffle EVERYTHING including which circle variant to use
      const circleVariant = CIRCLE_VARIANTS[Math.floor(Math.random() * CIRCLE_VARIANTS.length)];
      const otherShapes = shuffle(SHAPE_BANK.filter(s => s.type !== 'circle')).slice(0, 5);
      const allShapes = shuffle([circleVariant, ...otherShapes]);
      setShapes(allShapes);
    }
    
    if (stage === 2) {
      const terms = shuffle(['radius', 'diameter', 'circumference', 'area']);
      setTermToPlace(terms[0]);
    }
    
    if (stage >= 3) {
      const config = getStageConfig(stage);
      setGivenValue(config.given);
      setVisibleValues({ [config.given]: prob[config.given] });
      setQuestionQueue(config.steps);
      setCurrentTarget(config.steps[0].target);
      setCurrentStep('operation');
    }
  };

  const resetAll = () => {
    const newProblem = generateProblem(stage);
    setProblem(newProblem);
    resetStageState(newProblem);
  };

  useEffect(() => {
    if (stage !== null) {
      resetAll();
    }
  }, [stage]);

  const handleCorrectAnswer = () => {
    // Mark that a problem was completed in this stage
    setProblemCompletedInStage(true);
    
    // Points logic - NO COINS FOR STAGE 1
    let pointsEarned = 0;
    if (stage !== 1) {
      if (stage === 10 && skippedToAdvanced) {
        pointsEarned = 20;
      } else {
        pointsEarned = stage;
      }
    }
    
    setTotalPoints(prev => prev + pointsEarned);
    setShowSuccess(true);
    setShowConfetti(true);
    
    try {
      ugConfetti?.burst?.();
    } catch {}
    
    onProblemComplete?.({ module: "circles", stage, correct: true });
    updateStats?.({ module: "circles", problemsSolved: 1, lastStage: stage });
    
    setTimeout(() => {
      setShowSuccess(false);
      setShowConfetti(false);
      
      if (problemWasCorrect) {
        const newStreak = correctStreak + 1;
        setCorrectStreak(newStreak);
        
        // CHANGED: Now requires 3 correct in a row
        if (newStreak >= 3 && stage < 10) {
          setShowMoveOnChoice(true);
        } else {
          resetAll();
        }
      } else {
        setCorrectStreak(0);
        resetAll();
      }
    }, 1500);
  };

  const handleShapeSelect = (shape) => {
    // CRITICAL FIX: Only allow clicks if problem hasn't been completed yet
    if (problemCompletedInStage) {
      return;
    }
    
    if (shape.type === 'circle') {
      handleCorrectAnswer();
    } else {
      handleError();
    }
  };

  const handleCircleClick = (term) => {
    if (term === termToPlace) {
      const newPlaced = { ...placedTerms, [term]: true };
      setPlacedTerms(newPlaced);
      
      const allTerms = ['radius', 'diameter', 'circumference', 'area'];
      const allPlaced = allTerms.every(t => newPlaced[t]);
      
      if (allPlaced) {
        handleCorrectAnswer();
      } else {
        const remaining = allTerms.filter(t => !newPlaced[t]);
        setTermToPlace(remaining[0]);
      }
    } else {
      handleError();
    }
  };

  const getOperationChoices = (target) => {
    const allOps = ['× 2', '÷ 2', '× π', '÷ π', 'πr²'];
    const currentQuestion = questionQueue.find(q => q.target === target);
    const correct = currentQuestion?.operation;
    const availableDistractors = allOps.filter(op => op !== correct);
    const selectedDistractors = shuffle(availableDistractors).slice(0, 3);
    return shuffle([correct, ...selectedDistractors]);
  };

  const getValueChoices = (target) => {
    const correct = problem[target];
    let distractors = [];
    
    // Generate pedagogically-sound distractors based on common errors
    if (target === 'd') {
      // d = r × 2, so if r=18, d=36
      // Common errors: forgot multiply (18), divided (9), added (20)
      distractors = [
        problem.r,          // forgot to multiply
        problem.r / 2,      // divided instead  
        problem.r + 2       // added instead
      ];
    } else if (target === 'r') {
      // r = d ÷ 2, so if d=36, r=18
      // Common errors: multiplied (72), forgot divide (36), subtracted (34)
      distractors = [
        problem.d * 2,      // multiplied instead
        problem.d,          // forgot to divide
        problem.d - 2       // subtracted instead
      ];
    } else if (target === 'C') {
      // C = d × π, so if d=36, C≈113.1
      // Common errors: used r (56.5), forgot π (72), divided (11.5)
      distractors = [
        problem.r * PI,     // used r instead of d
        problem.d * 2,      // forgot π
        problem.d / PI      // divided instead
      ];
    } else if (target === 'A') {
      // A = π r², so if r=18, A≈1017.9
      // Common errors: forgot square (56.5), used d (4071.5), forgot π (324)
      distractors = [
        PI * problem.r,           // forgot to square
        PI * problem.d * problem.d, // used d instead of r
        problem.r * problem.r     // forgot π
      ];
    }
    
    // DO NOT filter - keep all pedagogically important distractors
    const finalChoices = [correct, distractors[0], distractors[1], distractors[2]];
    
    return shuffle(finalChoices);
  };

  const handleOperationSelect = (operation) => {
    const currentQuestion = questionQueue.find(q => q.target === currentTarget);
    
    if (operation === currentQuestion.operation) {
      setSelectedOperation(operation);
      
      let formula;
      if (currentTarget === 'A') {
        formula = `${currentTarget} = ${operation}`;
      } else {
        formula = `${currentTarget} = ${currentQuestion.fromLabel} ${operation}`;
      }
      setCurrentFormula(formula);
      
      const choices = getValueChoices(currentTarget);
      setCurrentAnswerChoices(choices);
      
      setCurrentStep('value');
    } else {
      handleError();
    }
  };

  const handleValueSelect = (value) => {
    const correctValue = problem[currentTarget];
    
    if (Math.abs(value - correctValue) < 0.01) {
      const newVisible = { ...visibleValues, [currentTarget]: value };
      setVisibleValues(newVisible);
      
      const remainingQuestions = questionQueue.filter(q => newVisible[q.target] === undefined);
      
      if (remainingQuestions.length === 0) {
        handleCorrectAnswer();
      } else {
        setCurrentTarget(remainingQuestions[0].target);
        setCurrentStep('operation');
        setCurrentFormula('');
        setCurrentAnswerChoices([]);
        setSelectedOperation(null);
      }
    } else {
      handleError();
    }
  };

  const handlePracticeChoice = (moveOn) => {
    setShowMoveOnChoice(false);
    
    if (moveOn && stage < 10) {
      // Calculate bonus coins based on stage
      let bonusCoins = 50;
      if (stage === 9) {
        bonusCoins = 100; // SPECIAL BONUS FOR COMPLETING STAGE 9!
      }
      
      // Add bonus coins
      setTotalPoints(prev => prev + bonusCoins);
      
      setShowStageUnlock(true);
      setTimeout(() => {
        setShowStageUnlock(false);
        setStage(stage + 1);
        setCorrectStreak(0);
      }, 2500);
    } else {
      setCorrectStreak(0);
      resetAll();
    }
  };

  const getStageTitle = (stg) => {
    const titles = {
      1: 'Stage 1: Identify a Circle',
      2: 'Stage 2: Label Circle Parts',
      3: 'Stage 3: Find Diameter from Radius',
      4: 'Stage 4: Find Radius from Diameter',
      5: 'Stage 5: Find Radius and Circumference',
      6: 'Stage 6: Find Diameter and Circumference',
      7: 'Stage 7: Work Backwards from Circumference',
      8: 'Stage 8: Find Diameter and Area',
      9: 'Stage 9: Find Radius and Area',
      10: 'Stage 10: Mixed Practice'
    };
    return titles[stg] || `Stage ${stg}`;
  };

  const currentQuestion = questionQueue.find(q => q.target === currentTarget);

  // Entry screen - REDESIGNED BUTTONS
  if (stage === null) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '48px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '600px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⭕</div>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            Circles
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '48px' }}>
            One Shape, Two Formulas, Three Words
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* BEGIN PRACTICE BUTTON - LARGE, FRIENDLY, OBVIOUS */}
            <div>
              <BigButton 
                onClick={() => setStage(1)}
                className="ug-button"
                style={{ 
                  fontSize: '24px', 
                  padding: '24px 48px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderColor: '#059669',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              >
                🎯 Start Here: Begin Practice
              </BigButton>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px', fontStyle: 'italic' }}>
                Recommended for all users
              </p>
            </div>
            
            {/* DIVIDER */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              margin: '8px 0'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
              <span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: '500' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
            </div>
            
            {/* ADVANCED MODE BUTTON - SMALLER, WITH WARNING */}
            <div>
              <BigButton 
                onClick={() => { setStage(10); setSkippedToAdvanced(true); }}
                className="ug-button"
                style={{ 
                  fontSize: '18px', 
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderColor: '#dc2626',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              >
                ⚠️ Advanced Mode Only
              </BigButton>
              <p style={{ 
                fontSize: '13px', 
                color: '#ef4444', 
                marginTop: '8px', 
                fontWeight: '600',
                backgroundColor: '#fee2e2',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #fecaca'
              }}>
                ⚡ Expert users only! Skips all practice.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)', padding: '16px' }}>
      <ErrorOverlay show={showError} />
      <SuccessOverlay show={showSuccess} />
      <StageUnlockOverlay 
        show={showStageUnlock} 
        nextStage={stage + 1} 
        coinsEarned={stage === 9 ? 100 : 50}
      />
      <Calculator show={showCalculator} onClose={() => setShowCalculator(false)} />
      {showConfetti && <FlyingCoins show={true} />}
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
            {getStageTitle(stage)}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {stage >= 3 && (
              <button
                onClick={() => setShowCalculator(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'white',
                  border: '2px solid #3b82f6',
                  color: '#3b82f6',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🔢 Calculator
              </button>
            )}
            
            <div style={{
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '2px solid #f59e0b',
              fontSize: '22px',
              fontWeight: 'bold',
              color: '#78350f',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                border: '2px solid #d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#78350f'
              }}>
                ¢
              </div>
              <span>{totalPoints}</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* LEFT: Visual */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {stage === 1 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '20px' }}>
                {shapes.map((shape, i) => (
                  <button
                    key={i}
                    onClick={() => handleShapeSelect(shape)}
                    disabled={problemCompletedInStage}
                    style={{
                      fontSize: '60px', 
                      padding: '20px', 
                      border: '3px solid #e5e7eb',
                      borderRadius: '12px', 
                      background: problemCompletedInStage ? '#f3f4f6' : 'white',
                      cursor: problemCompletedInStage ? 'not-allowed' : 'pointer',
                      transition: 'transform 0.2s',
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: problemCompletedInStage ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => !problemCompletedInStage && (e.target.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    {shape.emoji}
                  </button>
                ))}
              </div>
            ) : (
              <CircleVisualization 
                problem={problem}
                stage={stage}
                placedTerms={placedTerms}
                givenValue={givenValue}
                visibleValues={visibleValues}
                currentTargetValue={termToPlace}
                onCircleClick={handleCircleClick}
              />
            )}
          </div>

          {/* RIGHT: Questions */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            
            {showMoveOnChoice ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px', color: '#1f2937' }}>
                  Great job! 3 in a row!
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handlePracticeChoice(false)}
                    className="ug-answer ug-answer--pill"
                    style={{ fontSize: '20px', padding: '14px 28px' }}
                  >
                    More practice
                  </button>
                  {stage < 10 && (
                    <button
                      onClick={() => handlePracticeChoice(true)}
                      className="ug-answer ug-answer--pill"
                      style={{ fontSize: '20px', padding: '14px 28px' }}
                    >
                      Move on → {stage === 9 ? '(+100 coins!)' : '(+50 coins!)'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {stage === 1 && (
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
                      Which one is a circle?
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '16px' }}>
                      Click on the circle shape on the left.
                    </p>
                  </div>
                )}

                {stage === 2 && (
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
                      Where is the {termToPlace}?
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '16px' }}>
                      Click on the {termToPlace} on the circle to the left.
                    </p>
                  </div>
                )}

                {stage >= 3 && currentTarget && currentQuestion && (
                  <div>
                    {currentStep === 'operation' ? (
                      <>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
                          {currentTarget === 'A' 
                            ? `${currentTarget} = _____`
                            : `${currentTarget} = ${currentQuestion.fromLabel} _____`
                          }
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {getOperationChoices(currentTarget).map((op, i) => (
                            <button
                              key={i}
                              onClick={() => handleOperationSelect(op)}
                              className="ug-answer ug-answer--pill"
                              style={{ fontSize: '22px', padding: '16px 28px' }}
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        {currentFormula && (
                          <div style={{ 
                            textAlign: 'center', 
                            marginBottom: '12px', 
                            padding: '16px 24px', 
                            background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)', 
                            borderRadius: '16px',
                            border: '2px solid #3b82f6',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            color: '#1e40af'
                          }}>
                            {currentFormula}
                          </div>
                        )}
                        
                        {selectedOperation && currentQuestion && (
                          <div style={{
                            textAlign: 'center',
                            marginBottom: '24px',
                            padding: '16px 24px',
                            background: '#fef3c7',
                            borderRadius: '16px',
                            border: '2px solid #f59e0b',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            color: '#78350f'
                          }}>
                            {currentTarget === 'A' 
                              ? `${currentTarget} = π × ${visibleValues.r || problem.r}²`
                              : `${currentTarget} = ${
                                  typeof (visibleValues[currentQuestion.fromLabel] || problem[currentQuestion.fromLabel]) === 'number' 
                                    ? ((visibleValues[currentQuestion.fromLabel] || problem[currentQuestion.fromLabel]) % 1 === 0 
                                        ? (visibleValues[currentQuestion.fromLabel] || problem[currentQuestion.fromLabel])
                                        : (visibleValues[currentQuestion.fromLabel] || problem[currentQuestion.fromLabel]).toFixed(1))
                                    : (visibleValues[currentQuestion.fromLabel] || problem[currentQuestion.fromLabel])
                                } ${selectedOperation}`
                            }
                          </div>
                        )}
                        
                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
                          What is {currentTarget}?
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {currentAnswerChoices.map((val, i) => (
                            <button
                              key={i}
                              onClick={() => handleValueSelect(val)}
                              className="ug-answer ug-answer--pill"
                              style={{ fontSize: '22px', padding: '16px 28px' }}
                            >
                              {val % 1 === 0 ? val : val.toFixed(1)}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
