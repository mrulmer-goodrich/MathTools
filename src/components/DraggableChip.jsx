import React from 'react'

export default function Draggable({ id, label, data, inline=false }) {
  const onDragStart = (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(data || { id, label }))
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
