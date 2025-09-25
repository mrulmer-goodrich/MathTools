import React from 'react'

export default function Draggable({ id, label, data, inline=false }) {
  const payload = data || { id, label, kind: 'chip' }

  const onDragStart = (e) => {
    const json = JSON.stringify(payload)
    // Set both MIME types so all browsers provide something on drop
    e.dataTransfer.setData('application/json', json)
    e.dataTransfer.setData('text/plain', json)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <span
      draggable
      onDragStart={onDragStart}
      className={'chip' + (inline ? ' inline' : '')}
      aria-label={label}
      title={label}
    >
      {label}
    </span>
  )
}
