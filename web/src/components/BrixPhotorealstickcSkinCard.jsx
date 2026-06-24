import React from 'react'
import '../styles/brix-photorealstickc-skin.css'

/**
 * Prepared premium skin card for the Brix tile.
 * Intentionally not wired into the renderer yet.
 */
export default function BrixPhotorealstickcSkinCard({
  lead = 'ridge',
  title = 'brix',
  summary = 'surrogate-assisted engineering design and analysis.',
  onArrowClick,
  onReturnClick,
}) {
  return (
    <section className="photorealstickc-brix-card" aria-label="Brix photorealstickc skin preview">
      <div className="photorealstickc-brix-backplate" aria-hidden="true" />
      <div className="photorealstickc-brix-prism-layer" aria-hidden="true" />
      <div className="photorealstickc-brix-caustic-layer" aria-hidden="true" />

      <div className="photorealstickc-brix-content">
        <h1>{lead}</h1>
        <h2>{title}</h2>
        <p>{summary}</p>
      </div>

      <button
        type="button"
        className="photorealstickc-brix-arrow"
        aria-label="Open brix"
        onClick={onArrowClick}
      >
        →
      </button>

      <button
        type="button"
        className="photorealstickc-brix-return"
        aria-label="Return"
        onClick={onReturnClick}
      >
        ↵
      </button>
    </section>
  )
}
