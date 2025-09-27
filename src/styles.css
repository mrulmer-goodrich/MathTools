// src/App.jsx
import React, { useState } from 'react'
import BigButton from './components/BigButton.jsx'
import ScaleFactorModule from './modules/scale/ScaleFactor.jsx'
import HTableModule from './modules/htable/HTableModule.jsx'

export default function App() {
  const [route, setRoute] = useState('home')

  const Header = () => (
    <div className="header">
      <div className="brand">UG Math Tools</div>
      <div className="subtitle">Scale Factor + H-Table trainer (drag-and-drop)</div>
    </div>
  )

  return (
    <div className="container">
      <Header />

      {route === 'home' && (
        <>
          <div className="row" style={{ justifyContent: 'center', gap: 16 }}>
            <BigButton onClick={() => setRoute('scale')}>Scale Factor</BigButton>
            <BigButton onClick={() => setRoute('htable')}>H-Table</BigButton>
          </div>
        </>
      )}

      {route === 'scale' && (
        <>
          <div className="row" style={{ justifyContent: 'center', marginBottom: 12 }}>
            <BigButton onClick={() => setRoute('home')}>Home</BigButton>
          </div>
          <ScaleFactorModule />
        </>
      )}

      {route === 'htable' && (
        <>
          <div className="row" style={{ justifyContent: 'center', marginBottom: 12 }}>
            <BigButton onClick={() => setRoute('home')}>Home</BigButton>
          </div>
          <HTableModule />
        </>
      )}
    </div>
  )
}
