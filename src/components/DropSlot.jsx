import React, { useState } from 'react'

/**
 * DropSlot
 * - Always prevents default on dragenter/dragover so the slot is droppable.
 * - Validates ONLY on drop using the provided `test(data)` function.
 * - Glows while a drag is over the slot; clears on leave/drop.
 */
export default function DropSlot({
  children,
  test = () => true,
  onDropContent = () => {},
  className = '',
}) {
  const [glow, setGlow] = useState(false)

  const onDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setGlow(true)
  }

  const onDragOver = (e) => {
    // IMPORTANT: preventDefault so drops are allowed (many browsers hide data during over)
    e.preventDefault()
    e.stopPropagation()
    setGlow(true)
  }

  const onDragLeave = (e) => {
    e.stopPropagation()
    setGlow(false)
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setGlow(false)

    // Try both types for compatibility
    const txt = e.dataTransfer.getData('application/json') ||
                e.dataTransfer.getData('text/plain') || ''
    let data = null
    try { data = JSON.parse(txt) } catch { /* ignore */ }

    if (data && test(data)) {
      onDropContent(data)
    }
  }

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`slot ${glow ? 'glow' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
