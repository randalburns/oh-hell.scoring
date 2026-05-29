import { useState } from 'react'
import { roundScore } from '../gameLogic'

export default function RoundEdit({ round, players, playerOrder, dealerIdx, onSave, onCancel }) {
  const [bids, setBids] = useState(round.bids.map(String))
  const [tricks, setTricks] = useState(round.tricks ? round.tricks.map(String) : Array(players.length).fill(''))

  function setBid(i, val) { const n = [...bids]; n[i] = val; setBids(n) }
  function setTrick(i, val) { const n = [...tricks]; n[i] = val; setTricks(n) }

  const parsedBids = bids.map(b => b === '' ? null : parseInt(b))
  const parsedTricks = tricks.map(t => t === '' ? null : parseInt(t))
  const cardCount = round.cardCount
  const trickSum = parsedTricks.reduce((s, t) => s + (t ?? 0), 0)
  const bidsOk = parsedBids.every(b => b !== null && !isNaN(b) && b >= 0 && b <= cardCount)
  const tricksOk = parsedTricks.every(t => t !== null && !isNaN(t) && t >= 0) && trickSum === cardCount

  function handleSave() {
    if (!bidsOk || !tricksOk) return
    onSave(parsedBids, parsedTricks)
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onCancel} />
      <div className="sheet sheet-tall">
        <div className="sheet-handle" />
        <h2 className="sheet-title">Edit Round — {cardCount} card{cardCount !== 1 ? 's' : ''}</h2>
        <div className="bid-grid">
          <div className="bid-grid-header">
            <span>Player</span><span>Bid</span><span>Tricks</span><span>Score</span>
          </div>
          {playerOrder.map(i => {
            const isDealer = i === dealerIdx
            const score = parsedBids[i] !== null && parsedTricks[i] !== null
              ? roundScore(parsedBids[i], parsedTricks[i]) : null
            const made = parsedTricks[i] === parsedBids[i]
            return (
              <div key={i} className={`bid-row bid-row-edit ${isDealer ? 'bid-row-dealer' : ''}`}>
                <span className="bid-player">
                  {players[i]}
                  {isDealer && <span className="dealer-tag">D</span>}
                </span>
                <input className="bid-input bid-input-sm" type="number" inputMode="numeric"
                  min="0" max={cardCount} value={bids[i]} onChange={e => setBid(i, e.target.value)} />
                <input className="bid-input bid-input-sm" type="number" inputMode="numeric"
                  min="0" max={cardCount} value={tricks[i]} onChange={e => setTrick(i, e.target.value)} />
                {score !== null
                  ? <span className={`trick-score ${made ? 'made' : 'missed'}`}>{score > 0 ? `+${score}` : '0'}</span>
                  : <span />
                }
              </div>
            )
          })}
        </div>
        {!tricksOk && parsedTricks.every(t => t !== null && !isNaN(t)) && (
          <div className="bid-summary bid-summary-error">Tricks must sum to {cardCount} (got {trickSum})</div>
        )}
        <div className="sheet-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" disabled={!bidsOk || !tricksOk} onClick={handleSave}>Save</button>
        </div>
      </div>
    </>
  )
}
