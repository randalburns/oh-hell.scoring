import { useState } from 'react'

export default function HandEntry({ players, onConfirm, onCancel }) {
  const [winner, setWinner] = useState(null)
  const [points, setPoints] = useState('')
  const [p1, p2] = players

  const canSubmit = winner !== null && parseInt(points) > 0

  function handleSubmit() {
    if (!canSubmit) return
    onConfirm(winner, parseInt(points))
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onCancel} />
      <div className="sheet">
        <div className="sheet-handle" />
        <h2 className="sheet-title">Add Hand</h2>

        <div className="entry-section">
          <div className="entry-label">Winner</div>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${winner === 0 ? 'active' : ''}`}
              onClick={() => setWinner(0)}
            >
              {p1}
            </button>
            <button
              className={`toggle-btn ${winner === 1 ? 'active' : ''}`}
              onClick={() => setWinner(1)}
            >
              {p2}
            </button>
          </div>
        </div>

        <div className="entry-section">
          <div className="entry-label">Points</div>
          <input
            className="points-input"
            type="number"
            inputMode="numeric"
            min="1"
            max="999"
            value={points}
            onChange={e => setPoints(e.target.value)}
            placeholder="0"
            autoFocus
          />
        </div>

        {canSubmit && (
          <div className="points-preview">
            <span>{players[winner]} wins</span>
            <span className="points-num">{points} pts</span>
          </div>
        )}

        <div className="sheet-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button
            className="btn-primary"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Record Hand
          </button>
        </div>
      </div>
    </>
  )
}
