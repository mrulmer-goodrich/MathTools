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
      {/* Keep components mounted so state persists across nav */}
      <div style={{ display: route === 'home' ? 'block' : 'none' }}>
        <div className="container">
          <div className="lp-hero">
            <div className="lp-title">UG Math Tools</div>
            <div className="lp-sub">Practice tools for proportions, scale factor, & tables</div>
          </div>
          <div className="lp-grid">
            <button className="lp-tile" onClick={() => setRoute('scale')}>Scale Factor</button>
            <button className="lp-tile" onClick={() => setRoute('htable')}>H-Table</button>
          </div>
        </div>
      </div>

      <div style={{ display: route === 'scale' ? 'block' : 'none' }}>
        <ScaleFactorModule />
      </div>

      <div style={{ display: route === 'htable' ? 'block' : 'none' }}>
        <HTableModule />
      </div>
    </div>
  )
}
