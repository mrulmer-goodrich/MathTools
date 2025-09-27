// src/components/DraggableChip.jsx
import React from 'react'

export default function Draggable({
  id,
  label,
  data,
  inline = false,
  className = '',
  style,
  title,
  'aria-label': ariaLabel,
  ...rest
}) {
  const payload = data || { id, label, kind: 'chip' }

  const onDragStart = (e) => {
    const json = JSON.stringify(payload)
    // set both mime types for cross-browser drops
    e.dataTransfer.setData('application/json', json)
    e.dataTransfer.setData('text/plain', json)
    e.dataTransfer.effectAllowed = 'copy'
  }

  // IMPORTANT:
  // - we keep the "chip" class for styling
  // - we APPEND any incoming className (e.g., "side-tag top")
  // - we PASS THROUGH style so the --badge-* vars & absolute positioning apply
  return (
    <span
      draggable
      onDragStart={onDragStart}
      className={`chip${inline ? ' inline' : ''}${className ? ' ' + className : ''}`}
      style={style}
      title={title ?? String(label)}
      aria-label={ariaLabel ?? String(label)}
      {...rest}
    >
      {label}
    </span>
  )
}
