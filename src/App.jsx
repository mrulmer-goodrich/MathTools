// src/App.jsx – v9.0.0 (Unified Header with New Problem)
import React, { useState, useRef } from 'react'
import BigButton from './components/BigButton.jsx'
import ScaleFactorModule from './modules/scale/ScaleFactor.jsx'
import HTableModule from './modules/htable/HTableModule.jsx'
import ProportionalTablesModule from './modules/ptables/ProportionalTablesModule.jsx'
import ProportionalGraphsModule from './modules/pgraphs/ProportionalGraphsModule.jsx'

export default function App() {
  const [route, setRoute] = useState('home')
  const [showConfirmNew, setShowConfirmNew] = useState(false)
  const [isProblemComplete, setIsProblemComplete] = useState(false)
  
  // Refs to hold each module's reset function
 // const scaleResetRef = useRef(null)
  const htableResetRef = useRef(null)
  const ptablesResetRef = useRef(null)
  const pgraphsResetRef = useRef(null)

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
      case 'ptables':
        ptablesResetRef.current = resetFn
        break
      case 'pgraphs':
        pgraphsResetRef.current = resetFn
        break
    }
  }

  // Handle New Problem button click
  const handleNewProblem = () => {
    if (isProblemComplete) {
      // If the problem is finished, just start a new one with no warning
      resetCurrentModule();
    } else {
      // If not finished, show the warning modal
      setShowConfirmNew(true);
    }
  }


  // Reset the current module
  const resetCurrentModule = () => {
    setIsProblemComplete(false)
    setShowConfirmNew(false)
    
    // Call the appropriate reset function based on current route
    switch(route) {
      case 'scale':
        scaleResetRef.current?.()
        break
      case 'htable':
        htableResetRef.current?.()
        break
      case 'ptables':
        ptablesResetRef.current?.()
        break
      case 'pgraphs':
        pgraphsResetRef.current?.()
        break
    }
  }

  // Navigate to home and reset complete state
  const goHome = () => {
    setRoute('home')
    setIsProblemComplete(false)
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
            <BigButton className="tile-btn" onClick={() => setRoute('ptables')}>
              Proportional Tables
            </BigButton>
            <BigButton className="tile-btn" onClick={() => setRoute('pgraphs')}>
              Proportional Graphs
            </BigButton>
          </div>
        </>
      )}

      {/* Unified header for all modules */}
      {route !== 'home' && (
        <>
          <div className="module-header">
            <button 
              className="header-button gradient-button"
              onClick={goHome}
            >
              Home
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
              />
            )}

            {route === 'htable' && (
              <HTableModule 
                onProblemComplete={handleProblemComplete}
                registerReset={(fn) => registerReset('htable', fn)}
              />
            )}

            {route === 'ptables' && (
              <ProportionalTablesModule 
                onProblemComplete={handleProblemComplete}
                registerReset={(fn) => registerReset('ptables', fn)}
              />
            )}

            {route === 'pgraphs' && (
              <ProportionalGraphsModule 
                onProblemComplete={handleProblemComplete}
                registerReset={(fn) => registerReset('pgraphs', fn)}
              />
            )}
          </div>
        </>
      )}

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
