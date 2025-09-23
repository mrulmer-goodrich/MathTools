import React, {useState} from 'react'
import BigButton from './components/BigButton.jsx'
import ScaleFactorModule from './modules/scale/ScaleFactor.jsx'
import HTableModule from './modules/htable/HTableModule.jsx'

export default function App(){
  const [route,setRoute] = useState('home')
  return (
    <div>
      {route==='home' && (
        <div className="container">
          <div className="header">
            <div className="brand">UG Math Tools</div>
            <div className="subtitle">Scale Factor + H‑Table trainer (drag‑and‑drop)</div>
          </div>
          <div className="row">
            <BigButton onClick={()=>setRoute('scale')}>Scale Factor</BigButton>
            <BigButton onClick={()=>setRoute('htable')}>H‑Table</BigButton>
          </div>
        </div>
      )}
      {route==='scale' && <ScaleFactorModule />}
      {route==='htable' && <HTableModule />}
    </div>
  )
}
