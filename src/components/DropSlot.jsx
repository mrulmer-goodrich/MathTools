import React, { useState } from 'react'

function safeParse(dt) {
  try {
    const raw =
      dt.getData('application/json') ||
      dt.getData('text/plain') ||
      '{}'
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

  const onEnter = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setGlow(true)
  }

  const onOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const onLeave = () => setGlow(false)

  const onDrop = (e) => {
    e.preventDefault()
    setGlow(false)
    const data = safeParse(e.dataTransfer)
    let ok = false
    try { ok = !!test(data) } catch { ok = false }
    if (ok) {
      try { onDropContent(data) } catch { /* never crash */ }
    }
  }

  return (
    <div
      onDragEnter={onEnter}
      onDragOver={onOver}
      onDragLeave={onLeave}
      onDrop={onDrop}
      className={`slot ${glow ? 'glow' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
