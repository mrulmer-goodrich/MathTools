import React, { useState } from 'react'

export default function DropSlot({ children, test = () => true, onDropContent = () => {}, className = '' }) {
  const [glow, setGlow] = useState(false)

  const allow = (e) => {
    try {
      const js = JSON.parse(e.dataTransfer.getData('application/json') || '{}')
      if (test(js)) { e.preventDefault(); setGlow(true) }
    } catch (_) {}
  }
  const clear = () => setGlow(false)
  const drop = (e) => {
    e.preventDefault(); setGlow(false)
    try {
      const js = JSON.parse(e.dataTransfer.getData('application/json') || '{}')
      if (test(js)) onDropContent(js)
    } catch (_) {}
  }

  return (
    <div
      onDragOver={allow} onDragEnter={allow} onDragLeave={clear} onDrop={drop}
      className={`slot ${glow ? 'glow' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
