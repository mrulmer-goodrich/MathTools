import React from 'react'

/**
 * DraggableChip
 * - Sets both 'application/json' and 'text/plain' with the same JSON payload.
 * - Uses effectAllowed/dropEffect for better UX signals.
 */
export default function Draggable({ id, label, data, inline = false }) {
  const payload = data || { id, label }

  const onDragStart = (e) => {
    const json = JSON.stringify(payload)
    try {
      e.dataTransfer.setData('application/json', json)
      // Some browsers only accept text/plain during dragover
      e.dataTransfer.setData('text/plain', json)
    } catch {}
    try {
      e.dataTransfer.effectAllowed = 'copyMove'
      e.dataTransfer.dropEffect = 'copy'
    } catch {}
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
