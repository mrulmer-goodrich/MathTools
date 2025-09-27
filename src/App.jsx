// src/App.jsx
import React, {useState} from 'react'
import BigButton from './components/BigButton.jsx'
import ScaleFactorModule from './modules/scale/ScaleFactor.jsx'
import HTableModule from './modules/htable/HTableModule.jsx'

export default function App(){
  const [route,setRoute] = useState('home')

  return (
    <div className="container">
      {route==='home' && (
        <>
          <div className="header landing-header">
            <div className="brand landing-title">UG Math Tools</div>
            <div className="subtitle landing-subtitle">Scale Factor + H‑Table Trainer</div>
          </div>

          <div className="row home-buttons">
            <BigButton onClick={()=>setRoute('scale')}>Scale Factor</BigButton>
            <BigButton onClick={()=>setRoute('htable')}>H‑Table</BigButton>
          </div>
        </>
      )}

      {route==='scale' && (
        <>
          <div className="row" style={{ justifyContent: 'center', marginBottom: 12 }}>
            <BigButton onClick={() => setRoute('home')}>Home</BigButton>
          </div>
          <ScaleFactorModule />
        </>
      )}

      {route==='htable' && (
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
