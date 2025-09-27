// src/components/DraggableChip.jsx
import React from 'react'

export default function Draggable({
  id,
  label,
  data,
  inline = false,
  className = 'chip',
  style
}) {
  const payload = data || { id, label, kind: 'chip' }

  const onDragStart = (e) => {
    const json = JSON.stringify(payload)
    e.dataTransfer.setData('application/json', json)
    e.dataTransfer.setData('text/plain', json)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <span
      draggable
      onDragStart={onDragStart}
      className={className + (inline ? ' inline' : '')}
      style={style}
      aria-label={label}
      title={label}
    >
      {label}
    </span>
  )
}
