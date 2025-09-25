import React, { useState } from 'react'
import BigButton from './components/BigButton.jsx'
import ScaleFactorModule from './modules/scale/ScaleFactor.jsx'
import HTableModule from './modules/htable/HTableModule.jsx'

export default function App() {
  const [route, setRoute] = useState('home')

  const Nav = () => (
    <div className="topnav centered">
      <button className={"link " + (route === 'home' ? 'active' : '')} onClick={() => setRoute('home')}>Home</button>
      <span className="sp">•</span>
      <button className={"link " + (route === 'scale' ? 'active' : '')} onClick={() => setRoute('scale')}>Scale Factor</button>
      <span className="sp">•</span>
      <button className={"link " + (route === 'htable' ? 'active' : '')} onClick={() => setRoute('htable')}>H-Table</button>
    </div>
  )

  return (
    <div>
      <Nav />
      {route === 'home' && (
        <div className="container">
          <header className="lp-header">
            <h1 className="lp-title">UG Math Tools</h1>
            <p className="lp-sub">Interactive practice for Scale Factors & H-Tables</p>
          </header>
          <section className="lp-grid">
            <button className="lp-tile" onClick={() => setRoute('scale')}>
              <div className="lp-tile-title">Scale Factor</div>
              <div className="lp-tile-sub">Copy ÷ Original • drag & drop</div>
            </button>
            <button className="lp-tile" onClick={() => setRoute('htable')}>
              <div className="lp-tile-title">H-Table</div>
              <div className="lp-tile-sub">Proportions • cross-multiply</div>
            </button>
          </section>
        </div>
      )}
      {route === 'scale' && <ScaleFactorModule />}
      {route === 'htable' && <HTableModule />}
    </div>
  )
}
