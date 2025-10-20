import React, { useState, useRef, useLayoutEffect, useEffect } from 'react'

// Error Overlay Component - EXACTLY like HTable
const ErrorOverlay = ({ show }) => {
  if (!show) return null
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(239, 68, 68, 0.2)',
      zIndex: 9999,
      pointerEvents: 'none'
    }}>
      <div style={{
        fontSize: '24rem',
        fontWeight: 900,
        color: '#ef4444',
        lineHeight: 1,
        textShadow: '0 0 60px rgba(239, 68, 68, 0.8)',
        animation: 'errorPulse 0.4s ease-out'
      }}>
        ✗
      </div>
      <style>{`
        @keyframes errorPulse {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// Confetti burst function
const confettiBurst = () => {
  const count = 100
  const defaults = { origin: { y: 0.7 } }
  
  function fire(particleRatio, opts) {
    const particles = Math.floor(count * particleRatio)
    // Simulate confetti - in real app this would use canvas-confetti
    console.log(`🎉 Confetti burst: ${particles} particles`, opts)
  }

  fire(0.25, { spread: 26, startVelocity: 55, ...defaults })
  fire(0.2, { spread: 60, ...defaults })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, ...defaults })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, ...defaults })
  fire(0.1, { spread: 120, startVelocity: 45, ...defaults })
}

const genProblem = () => {
  // Generate triplets from 2-12 where no two values are the same
  let whole, numer, denom
  do {
    whole = Math.floor(Math.random() * 11) + 2  // 2-12
    denom = Math.floor(Math.random() * 11) + 2  // 2-12
    numer = Math.floor(Math.random() * 11) + 2  // 2-12
  } while (whole === numer || whole === denom || numer === denom || numer >= denom)
  
  return { whole, numer, denom }
}

const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5)

export default function MixedNumbersModule({ onProblemComplete, registerReset, updateStats }) {
  const [problem, setProblem] = useState(genProblem())
  const [step, setStep] = useState(0)
  const [showError, setShowError] = useState(false)
  const [currentProblemErrors, setCurrentProblemErrors] = useState(0)
  const [selectedPair, setSelectedPair] = useState([])
  const [showMultiply, setShowMultiply] = useState(false)
  const [showProduct, setShowProduct] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [showDenominator, setShowDenominator] = useState(false)
  const [showCompute, setShowCompute] = useState(false)
  const [showFinalAnswer, setShowFinalAnswer] = useState(false)
  const [animatingNumbers, setAnimatingNumbers] = useState([])
  const [confettiOn, setConfettiOn] = useState(false)
  const confettiInterval = useRef(null)

  const stripRef = useRef(null)
  const wholeRef = useRef(null)
  const denomRef = useRef(null)
  const numerRef = useRef(null)
  const productRef = useRef(null)
  
  const [oval, setOval] = useState(null)
  const [highlightKeys, setHighlightKeys] = useState([])

  const { whole, numer, denom } = problem
  const correctProduct = whole * denom
  const correctFinalNumerator = correctProduct + numer

  const handleError = () => {
    setShowError(true)
    setCurrentProblemErrors(prev => prev + 1)
    setTimeout(() => setShowError(false), 1000)
  }

  const handleReset = () => {
    // Stop confetti
    if (confettiInterval.current) {
      clearInterval(confettiInterval.current)
      confettiInterval.current = null
    }
    
    setProblem(genProblem())
    setStep(0)
    setShowError(false)
    setCurrentProblemErrors(0)
    setSelectedPair([])
    setShowMultiply(false)
    setShowProduct(false)
    setShowAdd(false)
    setShowDenominator(false)
    setShowCompute(false)
    setShowFinalAnswer(false)
    setConfettiOn(false)
    setOval(null)
    setHighlightKeys([])
  }

  useEffect(() => {
    registerReset?.(handleReset)
  }, [])
  
  // Cleanup confetti on unmount
  useEffect(() => {
    return () => {
      if (confettiInterval.current) {
        clearInterval(confettiInterval.current)
        confettiInterval.current = null
      }
    }
  }, [])

  // Measure and draw oval
  useLayoutEffect(() => {
    if (!highlightKeys.length || highlightKeys.length !== 2) {
      setOval(null)
      return
    }
    
    const strip = stripRef.current
    if (!strip) return
    
    const stripRect = strip.getBoundingClientRect()
    const refs = { whole: wholeRef, denom: denomRef, numer: numerRef }
    
    const centers = highlightKeys.map(k => {
      const ref = refs[k]?.current
      if (!ref) return null
      const r = ref.getBoundingClientRect()
      return {
        x: (r.left + r.right) / 2 - stripRect.left,
        y: (r.top + r.bottom) / 2 - stripRect.top
      }
    }).filter(Boolean)
    
    if (centers.length !== 2) {
      setOval(null)
      return
    }
    
    const [a, b] = centers
    const midX = (a.x + b.x) / 2
    const midY = (a.y + b.y) / 2
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.sqrt(dx * dx + dy * dy) + 100
    const rot = Math.atan2(dy, dx) * 180 / Math.PI
    
    setOval({ left: midX, top: midY, len, rot })
  }, [highlightKeys])

  const steps = [
    {
      title: "How do we convert Mixed Numbers to Improper Fractions?",
      choices: shuffle(["Make it M.A.D.", "Make it CRY", "Make it SAD", "y = kx"]),
      correct: "Make it M.A.D.",
      action: (choice) => {
        if (choice !== "Make it M.A.D.") {
          handleError()
          return
        }
        setStep(1)
      }
    },
    {
      title: "What does the M stand for in M.A.D.?",
      choices: shuffle(["Multiply", "Mixed Number", "Mess Up", "Million"]),
      correct: "Multiply",
      action: (choice) => {
        if (choice !== "Multiply") {
          handleError()
          return
        }
        setStep(2)
      }
    },
    {
      title: "Which two numbers do we multiply?",
      choices: shuffle([
        { label: `${whole} × ${denom}`, values: ['whole', 'denom'], correct: true },
        { label: `${whole} × ${numer}`, values: ['whole', 'numer'], correct: false },
        { label: `${numer} × ${denom}`, values: ['numer', 'denom'], correct: false },
        { label: `${whole} × 1`, values: [], correct: false }
      ]),
      action: (choice) => {
        if (!choice.correct) {
          handleError()
          return
        }
        setHighlightKeys(choice.values)
        
        // Animate numbers flying
        setTimeout(() => {
          setAnimatingNumbers([
            { id: 'whole-fly', value: whole, from: 'whole' },
            { id: 'denom-fly', value: denom, from: 'denom' }
          ])
          
          setTimeout(() => {
            setShowMultiply(true)
            setShowProduct(true)
            setHighlightKeys([])
            setOval(null)
            setAnimatingNumbers([])
            setStep(3)
          }, 800)
        }, 1500)
      }
    },
    {
      title: "What does the A stand for in M.A.D.?",
      choices: shuffle(["Add", "Answer", "Always", "Array"]),
      correct: "Add",
      action: (choice) => {
        if (choice !== "Add") {
          handleError()
          return
        }
        setStep(4)
      }
    },
    {
      title: `What do we add?`,
      choices: shuffle([numer, denom, whole, 1].map(String)),
      correct: String(numer),
      action: (choice) => {
        if (choice !== String(numer)) {
          handleError()
          return
        }
        
        // Animate numerator flying
        setAnimatingNumbers([
          { id: 'numer-fly', value: numer, from: 'numer' }
        ])
        
        setTimeout(() => {
          setShowAdd(true)
          setAnimatingNumbers([])
          setStep(5)
        }, 800)
      }
    },
    {
      title: "What does the D stand for in M.A.D.?",
      choices: shuffle(["Denominator", "Divide", "Done", "Double"]),
      correct: "Denominator",
      action: (choice) => {
        if (choice !== "Denominator") {
          handleError()
          return
        }
        setStep(6)
      }
    },
    {
      title: "What goes in the denominator?",
      choices: shuffle([denom, numer, whole, correctFinalNumerator].map(String)),
      correct: String(denom),
      action: (choice) => {
        if (choice !== String(denom)) {
          handleError()
          return
        }
        
        // Animate denominator flying from original position
        setAnimatingNumbers([
          { id: 'denom-fly-2', value: denom, from: 'denomOriginal' }
        ])
        
        setTimeout(() => {
          setShowDenominator(true)
          setShowCompute(true)
          setAnimatingNumbers([])
          setStep(7)
        }, 800)
      }
    }
  ]

  const handleCompute = () => {
    setShowFinalAnswer(true)
    
    // Start continuous confetti like HTable
    setConfettiOn(true)
    confettiBurst()
    confettiInterval.current = setInterval(() => {
      confettiBurst()
    }, 2000)
    
    // Report stats
    updateStats?.(currentProblemErrors, true)
    onProblemComplete?.()
    setStep(8)
  }

  const currentStep = steps[step] || steps[steps.length - 1]

  return (
    <>
      <ErrorOverlay show={showError} />
      
      <div className="container" style={{ position: 'relative' }}>
        <style>{`
          .mixed-strip {
            position: relative;
            background: #f8fafc;
            border: 2px solid #cbd5e1;
            border-radius: 16px;
            padding: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
            font-size: 2.5rem;
            font-weight: 700;
            color: #0f172a;
            min-height: 200px;
            margin-bottom: 24px;
            font-family: inherit;
          }
          
          .mixed-value {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          
          .fraction-display {
            display: inline-grid;
            grid-template-rows: auto 3px auto;
            align-items: center;
            justify-items: center;
            gap: 8px;
            font-size: 2.5rem;
            font-weight: 700;
            font-family: inherit;
          }
          
          .fraction-display .bar {
            width: 100%;
            min-width: 60px;
            height: 3px;
            background: #0f172a;
          }
          
          .fraction-display .num,
          .fraction-display .den {
            min-height: 60px;
            min-width: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            font-weight: 700;
            font-family: inherit;
          }
          
          .empty-cell {
            min-height: 60px;
            min-width: 60px;
            background: #f1f5f9;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .math-op {
            font-size: 2.5rem;
            font-weight: 700;
            color: #0f172a;
            font-family: inherit;
          }
          
          .highlight-box {
            padding: 8px 16px;
            border-radius: 12px;
            transition: all 0.3s ease;
            font-size: 2.5rem;
            font-weight: 700;
            font-family: inherit;
          }
          
          .highlight-box.active {
            background: rgba(59, 130, 246, 0.15);
            transform: scale(1.05);
          }
          
          .answer-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 1.25rem;
            border: 0;
            color: #ffffff;
            background: linear-gradient(135deg, #0B4B8C, #0C6B4D);
            box-shadow: 0 8px 16px rgba(11, 75, 140, 0.18);
            transition: transform 150ms ease, filter 150ms ease;
            cursor: pointer;
            min-height: 60px;
            font-family: inherit;
          }
          
          .answer-btn:hover {
            transform: translateY(-2px);
            filter: brightness(1.05);
          }
          
          .answer-btn:active {
            transform: translateY(0);
          }
          
          .answers-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 16px;
          }
          
          @media (max-width: 600px) {
            .answers-grid {
              grid-template-columns: 1fr;
            }
            .mixed-strip {
              font-size: 2rem;
            }
            .fraction-display {
              font-size: 2rem;
            }
            .fraction-display .num,
            .fraction-display .den,
            .highlight-box {
              font-size: 2rem;
            }
          }
          
          .step-title {
            font-size: 1.5rem;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 16px;
            text-align: center;
            font-family: inherit;
          }
          
          .card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .blink-anim {
            animation: blink-kf 2s ease-in-out infinite;
          }
          
          @keyframes blink-kf {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          
          .fade-in {
            animation: fadeIn 0.5s ease-in;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          
          .flying-number {
            position: fixed;
            font-size: 2.5rem;
            font-weight: 700;
            color: #3b82f6;
            pointer-events: none;
            z-index: 1000;
            animation: flyToTarget 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
            text-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          }
          
          @keyframes flyToTarget {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            50% {
              transform: translate(var(--tx-mid), var(--ty-mid)) scale(1.3) rotate(10deg);
              opacity: 0.8;
            }
            100% {
              transform: translate(var(--tx), var(--ty)) scale(1);
              opacity: 0;
            }
          }
        `}</style>

        <div className="card">
          <div ref={stripRef} className="mixed-strip">
            {/* Flying numbers animation */}
            {animatingNumbers.map((num) => {
              const fromRef = num.from === 'whole' ? wholeRef : 
                             num.from === 'denom' ? denomRef : 
                             num.from === 'numer' ? numerRef :
                             num.from === 'denomOriginal' ? denomRef : null
              
              if (!fromRef?.current) return null
              
              const fromRect = fromRef.current.getBoundingClientRect()
              const stripRect = stripRef.current?.getBoundingClientRect()
              
              if (!stripRect) return null
              
              // Calculate position deltas
              const startX = fromRect.left
              const startY = fromRect.top
              const targetX = stripRect.left + stripRect.width * 0.65
              const targetY = stripRect.top + stripRect.height * 0.35
              
              const deltaX = targetX - startX
              const deltaY = targetY - startY
              
              return (
                <div
                  key={num.id}
                  className="flying-number"
                  style={{
                    left: startX,
                    top: startY,
                    '--tx': `${deltaX}px`,
                    '--ty': `${deltaY}px`,
                    '--tx-mid': `${deltaX * 0.5}px`,
                    '--ty-mid': `${deltaY * 0.5 - 50}px`
                  }}
                >
                  {num.value}
                </div>
              )
            })}

            {/* Original Mixed Number */}
            <div className="mixed-value">
              <span ref={wholeRef} className={`highlight-box ${highlightKeys.includes('whole') ? 'active' : ''}`}>
                {whole}
              </span>
              <div className="fraction-display">
                <div className="num">
                  <span ref={numerRef} className={`highlight-box ${highlightKeys.includes('numer') ? 'active' : ''}`}>{numer}</span>
                </div>
                <span className="bar"></span>
                <div className="den">
                  <span ref={denomRef} className={`highlight-box ${highlightKeys.includes('denom') ? 'active' : ''}`}>{denom}</span>
                </div>
              </div>
            </div>

            <span className="math-op">=</span>

            {/* Work Area - Building the answer step by step */}
            {!showProduct && (
              <div className="mixed-value">
                <div className="fraction-display">
                  <div className="empty-cell blink-anim"></div>
                  <span className="bar"></span>
                  <div className="empty-cell blink-anim"></div>
                </div>
              </div>
            )}

            {showProduct && !showFinalAnswer && (
              <div className="mixed-value fade-in">
                <div className="fraction-display">
                  <div className="num" style={{ fontSize: '2.5rem', fontWeight: 700 }}>
                    ({whole} × {denom}){showAdd ? ` + ${numer}` : ''}
                  </div>
                  <span className="bar"></span>
                  <div className={showDenominator ? "den" : "empty-cell blink-anim"} style={{ fontSize: '2.5rem', fontWeight: 700 }}>
                    {showDenominator ? denom : ''}
                  </div>
                </div>
                {showCompute && (
                  <button 
                    className="button action-blink-strong" 
                    onClick={handleCompute}
                    style={{
                      fontSize: '1.5rem',
                      padding: '12px 24px',
                      fontWeight: 700,
                      minHeight: 'auto',
                      lineHeight: 1.2,
                      marginLeft: '16px',
                      background: 'linear-gradient(135deg, #0B4B8C, #0C6B4D)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(11, 75, 140, 0.3)'
                    }}
                  >
                    Compute
                  </button>
                )}
              </div>
            )}

            {showFinalAnswer && (
              <div className="mixed-value fade-in">
                <div className="fraction-display">
                  <div className="num" style={{ fontSize: '2.5rem', fontWeight: 700 }}>{correctFinalNumerator}</div>
                  <span className="bar"></span>
                  <div className="den" style={{ fontSize: '2.5rem', fontWeight: 700 }}>{denom}</div>
                </div>
              </div>
            )}

            {/* Oval highlight */}
            {oval && (
              <div
                style={{
                  position: 'absolute',
                  left: oval.left,
                  top: oval.top,
                  width: oval.len,
                  height: 80,
                  transform: `translate(-50%, -50%) rotate(${oval.rot}deg)`,
                  border: '5px solid #ef4444',
                  borderRadius: 9999,
                  pointerEvents: 'none',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
                  animation: 'blink-kf 1s ease-in-out infinite'
                }}
              />
            )}
          </div>

          {step < 7 && (
            <>
              <div className="step-title">
                {currentStep.title}
              </div>
              
              <div className="answers-grid">
                {(currentStep.choices || []).map((choice, idx) => {
                  const label = typeof choice === 'object' ? choice.label : choice
                  return (
                    <button
                      key={idx}
                      className="answer-btn"
                      onClick={() => currentStep.action(choice)}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {step >= 8 && (
            <div className="step-title" style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 900 }}>
              🎉 Perfect!
            </div>
          )}
        </div>
      </div>
    </>
  )
}
