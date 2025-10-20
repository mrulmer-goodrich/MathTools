// src/App.jsx – v11.0.1 (Fixed questionsPerfect tracking)
import React, { useState, useRef } from 'react' 
import BigButton from './components/BigButton.jsx'
import ScaleFactorModule from './modules/scale/ScaleFactor.jsx'
import HTableModule from './modules/htable/HTableModule.jsx'
import HTableBattleRoyaleModule from './modules/htablebattle/HTableBattleRoyaleModule.jsx'
import ProportionalTablesModule from './modules/ptables/ProportionalTablesModule.jsx'
import ProportionalGraphsModule from './modules/pgraphs/ProportionalGraphsModule.jsx'
import MixedNumbersModule from './modules/mixed/MixedNumbersModule.jsx'
import { StatsReport, TurkeyOverlay } from './components/StatsSystem.jsx'

export default function App() {
  console.log('🚀 APP COMPONENT RENDERED')
  
  const [route, setRoute] = useState('home')
  const [showConfirmNew, setShowConfirmNew] = useState(false)
  const [isProblemComplete, setIsProblemComplete] = useState(false)
  
  // Stats tracking state
  const [stats, setStats] = useState({
    questionsAttempted: 0,
    questionsCorrect: 0,
    questionsPerfect: 0,
    totalErrors: 0,
    currentStreak: 0,
  })
  const [showStatsReport, setShowStatsReport] = useState(false)
  const [showTurkey, setShowTurkey] = useState(false)
  
  console.log('🔧 Current stats state:', stats)
  console.log('🔧 About to define updateStats function')
  
  // Refs to hold each module's reset function
  const scaleResetRef = useRef(null)
  const htableResetRef = useRef(null)
  const battleRoyaleResetRef = useRef(null)
  const ptablesResetRef = useRef(null)
  const pgraphsResetRef = useRef(null)
  const mixedResetRef = useRef(null)

  // Update stats when a problem is completed
  const updateStats = (problemErrors, wasCorrect) => {
    setStats(prev => {
      // Only count as correct if there were NO errors AND wasCorrect is true
      const isPerfect = wasCorrect && problemErrors === 0
      
      const newStats = {
        questionsAttempted: prev.questionsAttempted + 1,
        questionsCorrect: wasCorrect ? prev.questionsCorrect + 1 : prev.questionsCorrect,
        questionsPerfect: isPerfect ? prev.questionsPerfect + 1 : prev.questionsPerfect,
        totalErrors: prev.totalErrors + problemErrors,
        currentStreak: isPerfect ? prev.currentStreak + 1 : 0,
      }
      
      // Check for turkey (3 in a row with NO errors)
      if (newStats.currentStreak === 3) {
        setShowTurkey(true)
        setTimeout(() => setShowTurkey(false), 3000)
      }
      
      return newStats
    })
  }

  // Reset stats when changing modules
  const resetStats = () => {
    setStats({
      questionsAttempted: 0,
      questionsCorrect: 0,
      questionsPerfect: 0,
      totalErrors: 0,
      currentStreak: 0,
    })
  }

  // Called by modules when they complete a problem
  const handleProblemComplete = () => {
    setIsProblemComplete(true)
  }

  // Called by modules to register their reset function
  const registerReset = (moduleName, resetFn) => {
    switch(moduleName) {
      case 'scale':
        scaleResetRef.current = resetFn
        break
      case 'htable':
        htableResetRef.current = resetFn
        break
      case 'battle-royale':
        battleRoyaleResetRef.current = resetFn
        break
      case 'ptables':
        ptablesResetRef.current = resetFn
        break
      case 'pgraphs':
        pgraphsResetRef.current = resetFn
        break
      case 'mixed':
        mixedResetRef.current = resetFn
        break
    }
  }

  // Handle New Problem button click
  const handleNewProblem = () => {
    if (isProblemComplete) {
      resetCurrentModule();
    } else {
      setShowConfirmNew(true);
    }
  }

  // Reset the current module
  const resetCurrentModule = () => {
    setIsProblemComplete(false)
    setShowConfirmNew(false)
    
    switch(route) {
      case 'scale':
        scaleResetRef.current?.()
        break
      case 'htable':
        htableResetRef.current?.()
        break
      case 'battle-royale':
        battleRoyaleResetRef.current?.()
        break
      case 'ptables':
        ptablesResetRef.current?.()
        break
      case 'pgraphs':
        pgraphsResetRef.current?.()
        break
      case 'mixed':
        mixedResetRef.current?.()
        break
    }
  }

  // Navigate to home and reset complete state
  const goHome = () => {
    setRoute('home')
    setIsProblemComplete(false)
    resetStats() // Reset stats when going home
  }

  // Get module name for stats display
  const getModuleName = () => {
    switch(route) {
      case 'scale': return 'Scale Factor'
      case 'htable': return 'H-Table'
      case 'battle-royale': return 'H-Table Battle Royale'
      case 'ptables': return 'Proportional Tables'
      case 'pgraphs': return 'Proportional Graphs'
      case 'mixed': return 'Mixed Numbers'
      default: return 'Unknown Module'
    }
  }

  return (
    <div className="container">
      {/* Home page */}
      {route === 'home' && (
        <>
          <div className="header landing-header">
            <div className="brand landing-title">UG Math Tools</div>
          </div>

          <div className="row home-buttons">
            <BigButton className="tile-btn" onClick={() => setRoute('scale')}>
              Scale Factor
            </BigButton>
            <BigButton className="tile-btn" onClick={() => setRoute('htable')}>
              H-Table
            </BigButton>
            <BigButton className="tile-btn" onClick={() => setRoute('battle-royale')}>
              H-Table Battle Royale
            </BigButton>
            <BigButton className="tile-btn" onClick={() => setRoute('ptables')}>
              Proportional Tables
            </BigButton>
            <BigButton className="tile-btn" onClick={() => setRoute('pgraphs')}>
              Proportional Graphs
            </BigButton>
            <BigButton className="tile-btn" onClick={() => setRoute('mixed')}>
              Mixed Numbers
            </BigButton>
          </div>
        </>
      )}

      {/* Unified header for all modules EXCEPT battle royale (it has its own) */}
      {route !== 'home' && route !== 'battle-royale' && (
        <>
          <div className="module-header">
            <button 
              className="header-button gradient-button"
              onClick={goHome}
            >
              Home
            </button>
            <button 
              className="header-button gradient-button"
              onClick={() => setShowStatsReport(true)}
              style={{ position: 'relative' }}
            >
              📊 Report
              {stats.currentStreak > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}>
                  {stats.currentStreak}🔥
                </span>
              )}
            </button>
            <button 
              className={`header-button gradient-button ${isProblemComplete ? 'pulse-animation' : ''}`}
              onClick={handleNewProblem}
            >
              New Problem
            </button>
          </div>

          {/* Module content */}
          <div className="module-content">
            {route === 'scale' && (
              <ScaleFactorModule 
                onProblemComplete={handleProblemComplete}
                registerReset={(fn) => registerReset('scale', fn)}
                updateStats={updateStats}
              />
            )}

            {route === 'htable' && (
              <HTableModule 
                onProblemComplete={handleProblemComplete}
                registerReset={(fn) => registerReset('htable', fn)}
                updateStats={updateStats}
              />
            )}

            {route === 'ptables' && (
              <ProportionalTablesModule 
                onProblemComplete={handleProblemComplete}
                registerReset={(fn) => registerReset('ptables', fn)}
                updateStats={updateStats}
              />
            )}

            {route === 'pgraphs' && (
              <ProportionalGraphsModule 
                onProblemComplete={handleProblemComplete}
                registerReset={(fn) => registerReset('pgraphs', fn)}
                updateStats={updateStats}
              />
            )}

            {route === 'mixed' && (
              <MixedNumbersModule 
                onProblemComplete={handleProblemComplete}
                registerReset={(fn) => registerReset('mixed', fn)}
                updateStats={updateStats}
              />
            )}
          </div>
        </>
      )}

      {/* Battle Royale gets full screen (no header) */}
      {route === 'battle-royale' && (
        <>
          {/* Add a small back button in top-left */}
          <button 
            onClick={goHome}
            className="button secondary"
            style={{
              position: 'fixed',
              top: '1rem',
              left: '1rem',
              zIndex: 10000,
              padding: '0.75rem 1.5rem',
              fontSize: '1.1rem'
            }}
          >
            ← Back to Home
          </button>
          
          <HTableBattleRoyaleModule 
            onProblemComplete={handleProblemComplete}
            registerReset={(fn) => registerReset('battle-royale', fn)}
            updateStats={updateStats}
          />
        </>
      )}

      {/* Stats Report Modal */}
      {showStatsReport && (
        <StatsReport
          stats={stats}
          onClose={() => setShowStatsReport(false)}
          moduleName={getModuleName()}
        />
      )}

      {/* Turkey Celebration */}
      <TurkeyOverlay show={showTurkey} streak={3} />

      {/* Confirmation Modal */}
      {showConfirmNew && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">
              Start a new problem?
            </div>
            <div className="modal-message">
              You'll lose your progress on the current problem.
            </div>
            <div className="modal-buttons">
              <button 
                className="button primary gradient-button"
                onClick={resetCurrentModule}
              >
                Yes, New Problem
              </button>
              <button 
                className="button secondary"
                onClick={() => setShowConfirmNew(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
