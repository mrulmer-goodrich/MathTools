// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import ScaleFactorModule from './modules/scalefactor/ScaleFactorModule.jsx'
import HTableModule from './modules/htable/HTableModule.jsx'
import Landing from './modules/landing/Landing.jsx'

export default function App(){
  return (
    <div className="app-shell">
      {/* Top header shared on all pages */}
      <header className="header">
        <nav className="nav">
          <span className="brand">UG Math Tools</span>
          <div className="spacer" />
          <Link to="/">Home</Link>
          <Link to="/scale">Scale Factor</Link>
          <Link to="/htable">H-Table</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/scale" element={<ScaleFactorModule/>} />
        <Route path="/htable" element={<HTableModule/>} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
