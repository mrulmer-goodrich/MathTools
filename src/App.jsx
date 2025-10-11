// src/App.jsx — v8.5.0 (added Proportional Graphs)
import React, {useState} from 'react'
import BigButton from './components/BigButton.jsx'
import ScaleFactorModule from './modules/scale/ScaleFactor.jsx'
import HTableModule from './modules/htable/HTableModule.jsx'
import ProportionalTablesModule from './modules/ptables/ProportionalTablesModule.jsx'
import ProportionalGraphsModule from './modules/pgraphs/ProportionalGraphsModule.jsx'

export default function App(){
  const [route,setRoute] = useState('home')

  return (
    <div className="container">
      {route==='home' && (
        <>
          <div className="header landing-header">
            <div className="brand landing-title">UG Math Tools</div>
          </div>

          <div className="row home-buttons">
            <BigButton className="tile-btn" onClick={()=>setRoute('scale')}>Scale Factor</BigButton>
            <BigButton className="tile-btn" onClick={()=>setRoute('htable')}>H-Table</BigButton>
            <BigButton className="tile-btn" onClick={()=>setRoute('ptables')}>Proportional Tables</BigButton>
            <BigButton className="tile-btn" onClick={()=>setRoute('pgraphs')}>Proportional Graphs</BigButton>
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

      {route==='ptables' && (
        <>
          <div className="row" style={{ justifyContent: 'center', marginBottom: 12 }}>
            <BigButton onClick={() => setRoute('home')}>Home</BigButton>
          </div>
          <ProportionalTablesModule />
        </>
      )}

      {route==='pgraphs' && (
        <>
          <div className="row" style={{ justifyContent: 'center', marginBottom: 12 }}>
            <BigButton onClick={() => setRoute('home')}>Home</BigButton>
          </div>
          <ProportionalGraphsModule />
        </>
      )}
    </div>
  )
}
