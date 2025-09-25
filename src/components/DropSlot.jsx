import React, { useState } from 'react'

function safeParse(dt) {
  // Try JSON first; fall back to text; always return an object
  try {
    const raw = dt.getData('application/json') || dt.getData('text/plain') || '{}'
    const obj = JSON.parse(raw)
    return (obj && typeof obj === 'object') ? obj : {}
  } catch {
    return {}
  }
}

export default function DropSlot({
  children,
  test = () => true,
  onDropContent = () => {},
  className = ''
}) {
  const [glow, setGlow] = useState(false)

  const allow = (e) => {
    const data = safeParse(e.dataTransfer)
    let ok = false
    try { ok = !!test(data) } catch { ok = false }
    if (ok) {
      e.preventDefault()         // required so drop will fire
      setGlow(true)
    } else {
      setGlow(false)
    }
  }

  const clear = () => setGlow(false)

  const drop = (e) => {
    e.preventDefault()
    setGlow(false)
    const data = safeParse(e.dataTransfer)
    let ok = false
    try { ok = !!test(data) } catch { ok = false }
    if (ok) {
      try { onDropContent(data) } catch { /* no-op: never crash UI */ }
    }
  }

  return (
    <div
      onDragOver={allow}
      onDragEnter={allow}
      onDragLeave={clear}
      onDrop={drop}
      className={`slot ${glow ? 'glow' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
