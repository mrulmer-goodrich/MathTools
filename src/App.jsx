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
          <div className="header">
            <div className="brand">UG Math Tools</div>
          </div>
          <div className="row">
            <BigButton onClick={() => setRoute('scale')}>Scale Factor</BigButton>
            <BigButton onClick={() => setRoute('htable')}>H-Table</BigButton>
          </div>
        </div>
      )}
      {route === 'scale' && <ScaleFactorModule openHTable={() => setRoute('htable')} />}
      {route === 'htable' && <HTableModule openScale={() => setRoute('scale')} />}
    </div>
  )
}
