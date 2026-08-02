import { useState, useRef } from 'react'
import { roundScore } from '../gameLogic'

export default function TrickEntry({ players, playerOrder, dealerIdx, cardCount, bids, onConfirm, onCancel }) {
  const [tricks, setTricks] = useState(Array(players.length).fill(''))
  const inputRefs = useRef([])

  function setTrick(pi, val) {
    const next = [...tricks]
    next[pi] = val
    setTricks(next)
  }

  const parsed = tricks.map(t => t === '' ? null : parseInt(t))
  const trickSum = parsed.reduce((s, t) => s + (t ?? 0), 0)
  const allFilled = parsed.every(t => t !== null && !isNaN(t) && t >= 0)
  const sumOk = trickSum === cardCount

  function handleConfirm() {
    if (!allFilled || !sumOk) return
    onConfirm(parsed)
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onCancel} />
      <div className="sheet sheet-tall">
        <div className="sheet-handle" />
        <h2 className="sheet-title">Enter Tricks — {cardCount} card{cardCount !== 1 ? 's' : ''}</h2>
        <p className="sheet-subtitle">Total must equal {cardCount}</p>

        <div className="bid-grid">
          {playerOrder.map((pi, orderPos) => {
            const isDealer = pi === dealerIdx
            const t = parsed[pi]
            const score = t !== null && !isNaN(t) ? roundScore(bids[pi], t) : null
            const made = t !== null && t === bids[pi]
            return (
              <div key={pi} className={`bid-row ${isDealer ? 'bid-row-dealer' : ''}`}>
                <div className="bid-player-col">
                  <span className="bid-player">
                    {players[pi]}
                    {isDealer && <span className="dealer-tag">D</span>}
                  </span>
                  <span className="bid-label">bid {bids[pi]}</span>
                </div>
                <input
                  ref={el => inputRefs.current[orderPos] = el}
                  className="bid-input"
                  type="number" inputMode="numeric" min="0" max={cardCount}
                  value={tricks[pi]} onChange={e => setTrick(pi, e.target.value)}
                  placeholder="–"
                  autoFocus={orderPos === 0}
                  onKeyDown={e => {
                    if (e.key === 'Tab' && !e.shiftKey) {
                      const next = inputRefs.current[orderPos + 1]
                      if (next) { e.preventDefault(); next.focus() }
                    }
                  }}
                />
                {score !== null && (
                  <span className={`trick-score ${made ? 'made' : 'missed'}`}>
                    {made ? `+${score}` : score}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {allFilled && (
          <div className={`bid-summary ${sumOk ? '' : 'bid-summary-error'}`}>
            Total tricks: {trickSum} / {cardCount}{!sumOk ? ` — needs ${cardCount - trickSum > 0 ? '+' : ''}${cardCount - trickSum}` : ' ✓'}
          </div>
        )}

        <div className="sheet-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" disabled={!allFilled || !sumOk} onClick={handleConfirm}>
            Record Round
          </button>
        </div>
      </div>
    </>
  )
}
