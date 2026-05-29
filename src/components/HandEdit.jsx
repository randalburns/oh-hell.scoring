import { useState } from 'react'

export default function HandEdit({ hand, players, onSave, onDelete, onCancel }) {
  const [winner, setWinner] = useState(hand.winner)
  const [points, setPoints] = useState(String(hand.points))
  const [p1, p2] = players

  const canSubmit = parseInt(points) > 0

  return (
    <>
      <div className="sheet-overlay" onClick={onCancel} />
      <div className="sheet">
        <div className="sheet-handle" />
        <h2 className="sheet-title">Edit Hand {hand.handNum}</h2>

        <div className="entry-section">
          <div className="entry-label">Winner</div>
          <div className="toggle-group">
            <button className={`toggle-btn ${winner === 0 ? 'active' : ''}`} onClick={() => setWinner(0)}>{p1}</button>
            <button className={`toggle-btn ${winner === 1 ? 'active' : ''}`} onClick={() => setWinner(1)}>{p2}</button>
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
            autoFocus
          />
        </div>

        <div className="sheet-actions">
          <button className="btn-danger" onClick={onDelete}>Delete</button>
          <button className="btn-primary" disabled={!canSubmit} onClick={() => canSubmit && onSave(winner, parseInt(points))}>Save</button>
        </div>

        <button className="btn-ghost" style={{ width: '100%', marginTop: 4 }} onClick={onCancel}>Cancel</button>
      </div>
    </>
  )
}
