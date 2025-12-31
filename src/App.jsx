// src/App.jsx — v12.2.0 (Added Multiplication Dojo) 
import React, { useState, useRef } from 'react' 
import BigButton from './components/BigButton.jsx'
import ScaleFactorModule from './modules/scale/ScaleFactor.jsx'
import HTableModule from './modules/htable/HTableModule.jsx'
import HTableBattleRoyaleModule from './modules/htablebattle/HTableBattleRoyaleModule.jsx'
import ProportionalTablesModule from './modules/ptables/ProportionalTablesModule.jsx'
import ProportionalGraphsModule from './modules/pgraphs/ProportionalGraphsModule.jsx'
import MixedNumbersModule from './modules/mixed/MixedNumbersModule.jsx'
import MultiplicationModule from './modules/multiply/MultiplicationModule.jsx'
import MultiplicationDojo from './modules/MultiplyDojo/MultiplyDojo.jsx'
import CirclesModule from './modules/circles/CirclesModule.jsx'
import VaultHeistModule from './vault-heist/VaultHeist.jsx'
import ZombieApocalypseModule from './zombie-apocalypse/ZombieApocalypse.jsx'
import AlgebraExpedition from './algebra/Algebra.jsx'
import zombietheme from './zombie-apocalypse/styles/zombietheme.css'
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
  const [turkeyStreak, setTurkeyStreak] = useState(0)
  const [isGoldenTurkey, setIsGoldenTurkey] = useState(false)
  
  console.log('🔧 Current stats state:', stats)
  console.log('🔧 About to define updateStats function')
  
  // Refs to hold each module's reset function
  const zombieResetRef = useRef(null)
  const scaleResetRef = useRef(null)
  const htableResetRef = useRef(null)
  const battleRoyaleResetRef = useRef(null)
  const ptablesResetRef = useRef(null)
  const pgraphsResetRef = useRef(null)
  const mixedResetRef = useRef(null)
  const multiplyResetRef = useRef(null)
  const multiplyDojoResetRef = useRef(null)
  const circlesResetRef = useRef(null)
  const vaultHeistResetRef = useRef(null)

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
      
      // ENHANCED TURKEY LOGIC: Show turkey every 3 perfect answers!
      // Check if streak is a multiple of 3 AND greater than 0
      if (newStats.currentStreak > 0 && newStats.currentStreak % 3 === 0) {
        // Check if it's a golden turkey (multiples of 9: 9, 18, 27, etc.)
        const isGolden = newStats.currentStreak % 9 === 0
        
        setTurkeyStreak(newStats.currentStreak)
        setIsGoldenTurkey(isGolden)
        setShowTurkey(true)
        
        // Hide turkey after 4 seconds (golden gets extra time)
        setTimeout(() => setShowTurkey(false), isGolden ? 5000 : 4000)
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
      case 'zombie':
        zombieResetRef.current = resetFn
        break
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
      case 'multiply':
        multiplyResetRef.current = resetFn
        break
      case 'multiply-dojo':
        multiplyDojoResetRef.current = resetFn
        break
      case 'circles':
        circlesResetRef.current = resetFn
        break
      case 'vault-heist':
        vaultHeistResetRef.current = resetFn
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
      case 'zombie':
        zombieResetRef.current?.()
        break
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
      case 'multiply':
        multiplyResetRef.current?.()
        break
      case 'multiply-dojo':
        multiplyDojoResetRef.current?.()
        break
      case 'circles':
        circlesResetRef.current?.()
        break
      case 'vault-heist':
        vaultHeistResetRef.current?.()
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
      case 'zombie': return 'Zombie Apocalypse'
      case 'scale': return 'Scale Factor'
      case 'htable': return 'H-Table'
      case 'battle-royale': return 'H-Table Battle Royale'
      case 'ptables': return 'Proportional Tables'
      case 'pgraphs': return 'Proportional Graphs'
      case 'mixed': return 'Mixed Numbers'
      case 'multiply': return 'Multiplication'
      case 'multiply-dojo': return 'Multiplication Dojo'
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
            <BigButton className="tile-btn" onClick={() => setRoute('algebra')}>
              Algebra Expedition
            </BigButton>
            <BigButton className="tile-btn" onClick={() => setRoute('zombie')}>
              Zombie Apocalypse
            </BigButton>
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
            <BigButton className="tile-btn" onClick={() => setRoute('circles')}>
              Circles
            </BigButton>
            <BigButton className="tile-btn" onClick={() => setRoute('vault-heist')}>
              Vault Heist
            </BigButton>
            <BigButton className="tile-btn" onClick={() => setRoute('multiply')}>
              Multiplication
            </BigButton>
            <BigButton className="tile-btn" onClick={() => setRoute('multiply-dojo')}>
              Multiplication Dojo
            </BigButton>
          </div>
        </>
      )}

      {/* Unified header for all modules EXCEPT battle royale and multiply-dojo */}
      {route !== 'home' && route !== 'battle-royale' && route !== 'multiply-dojo' && (
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
            {route === 'zombie' && (
              <ZombieApocalypseModule 
                onProblemComplete={handleProblemComplete}
                registerReset={(fn) => registerReset('zombie', fn)}
                updateStats={updateStats}
              />
            )}

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

            {route === 'circles' && (
              <CirclesModule 
                onProblemComplete={handleProblemComplete}
                registerReset={(fn) => registerReset('circles', fn)}
                updateStats={updateStats}
              />
            )}

            {route === 'vault-heist' && (
              <VaultHeistModule 
                onProblemComplete={handleProblemComplete}
                registerReset={(fn) => registerReset('vault-heist', fn)}
                updateStats={updateStats}
              />
            )}

            {route === 'multiply' && (
              <MultiplicationModule 
                onProblemComplete={handleProblemComplete}
                registerReset={(fn) => registerReset('multiply', fn)}
                updateStats={updateStats}
              />
            )}
          </div>
        </>
      )}

      {/* Algebra Expedition gets full screen (manages its own navigation) */}
      {route === 'algebra' && (
        <AlgebraExpedition />
      )}

      {/* Multiplication Dojo gets full screen (no header, manages its own navigation) */}
      {route === 'multiply-dojo' && (
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
          
          <MultiplicationDojo />
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

      {/* Enhanced Turkey Celebration - shows every 3, golden at 9! */}
      <TurkeyOverlay 
        show={showTurkey} 
        streak={turkeyStreak}
        isGolden={isGoldenTurkey}
      />

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
