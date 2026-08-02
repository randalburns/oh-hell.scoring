import { useState } from 'react'
import BidEntry from './BidEntry'
import TrickEntry from './TrickEntry'
import RoundEdit from './RoundEdit'
import { roundScore, cumulativeTotals, dealerForRound, bidOrder } from '../gameLogic'

export default function GameBoard({ players, sessionName, maxCards, rounds, currentRoundIdx, onSubmitBids, onSubmitTricks, onEditRound, onExit, onShare, onRenamePlayer, readOnly = false }) {
  const [showBids, setShowBids] = useState(false)
  const [showTricks, setShowTricks] = useState(false)
  const [editingIdx, setEditingIdx] = useState(null)
  const [copied, setCopied] = useState(false)
  const [editingNameIdx, setEditingNameIdx] = useState(null)
  const [editingNameVal, setEditingNameVal] = useState('')

  function startEditName(i) {
    setEditingNameIdx(i)
    setEditingNameVal(players[i])
  }

  function commitName() {
    const trimmed = editingNameVal.trim()
    if (trimmed && trimmed !== players[editingNameIdx]) onRenamePlayer(editingNameIdx, trimmed)
    setEditingNameIdx(null)
    setEditingNameVal('')
  }

  async function handleShare() {
    await onShare()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const done = currentRoundIdx >= rounds.length
  const currentRound = !done ? rounds[currentRoundIdx] : null
  const bidsLocked = currentRound?.bids !== null
  const currentDealer = !done ? dealerForRound(currentRoundIdx, players.length) : null
  const currentBidOrder = !done ? bidOrder(currentRoundIdx, players.length) : null
  const totals = cumulativeTotals(rounds, players.length)
  const leaderIdx = totals.indexOf(Math.max(...totals))

  function handleBidConfirm(bids) {
    setShowBids(false)
    onSubmitBids(bids)
  }

  function handleTrickConfirm(tricks) {
    setShowTricks(false)
    onSubmitTricks(tricks)
  }

  function handleEditSave(bids, tricks) {
    setEditingIdx(null)
    onEditRound(editingIdx, bids, tricks)
  }

  // Running cumulative totals per player after each completed round
  function getCumTotals(upToIdx) {
    let totals = Array(players.length).fill(0)
    for (let i = 0; i <= upToIdx; i++) {
      const r = rounds[i]
      if (!r.tricks) break
      for (let p = 0; p < players.length; p++) {
        const s = roundScore(r.bids[p], r.tricks[p])
        if (s !== null) totals[p] += s
      }
    }
    return totals
  }

  const shortNames = players.map(p => p.length > 7 ? p.slice(0, 7) : p)

  return (
    <div className="board">
      <header className="board-header">
        <button className="btn-ghost btn-exit" onClick={onExit}>← Exit</button>
        <span className="board-title">
          {sessionName}
          {readOnly && <span className="view-badge">view only</span>}
        </span>
        <div className="header-right">
          {!readOnly && (
            <button className="btn-ghost btn-share" onClick={handleShare}>
              {copied ? '✓' : '↗'} {copied ? 'Copied' : 'Share'}
            </button>
          )}
          <span className="hand-counter">{done ? 'Done' : `Rd ${currentRoundIdx + 1}/${rounds.length}`}</span>
        </div>
      </header>

      {/* Totals bar */}
      <div className="totals-bar">
        {players.map((p, i) => (
          <div key={i} className={`total-cell ${i === leaderIdx && done ? 'total-winner' : ''}`}>
            <span className="total-name">{shortNames[i]}</span>
            <span className="total-score">{totals[i]}</span>
          </div>
        ))}
      </div>

      {/* Scoresheet table */}
      <div className="scoresheet-wrap">
        <table className="scoresheet">
          <thead>
            <tr>
              <th className="col-round" rowSpan={2}>Rd</th>
              <th className="col-cards" rowSpan={2}>♠</th>
              {players.map((p, i) => (
                <th key={i} className={`col-player-name ${!readOnly ? 'col-player-name-editable' : ''}`}
                  colSpan={2} onClick={() => !readOnly && startEditName(i)}>
                  {!readOnly && editingNameIdx === i ? (
                    <input
                      className="name-header-input"
                      value={editingNameVal}
                      onChange={e => setEditingNameVal(e.target.value)}
                      onBlur={commitName}
                      onClick={e => e.stopPropagation()}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitName()
                        if (e.key === 'Escape') { setEditingNameIdx(null); setEditingNameVal('') }
                      }}
                      autoFocus
                    />
                  ) : shortNames[i]}
                </th>
              ))}
            </tr>
            <tr>
              {players.flatMap((_, i) => [
                <th key={`b${i}`} className="col-sub">Bid</th>,
                <th key={`s${i}`} className="col-sub">Pts</th>,
              ])}
            </tr>
          </thead>
          <tbody>
            {rounds.map((r, ri) => {
              const scored = r.tricks !== null
              const isCurrent = ri === currentRoundIdx
              const cumByPlayer = scored ? getCumTotals(ri) : null
              const rowDealer = dealerForRound(ri, players.length)
              const order = bidOrder(ri, players.length)
              return (
                <tr
                  key={ri}
                  className={`round-row ${r.bids && !readOnly ? 'round-tappable' : ''} ${scored ? 'round-past' : ''} ${isCurrent ? 'round-current' : ''}`}
                  onClick={() => r.bids && !readOnly && setEditingIdx(ri)}
                >
                  <td className="col-round">{ri + 1}</td>
                  <td className="col-cards">{r.cardCount}</td>
                  {players.map((_, pi) => {
                    const isDealer = pi === rowDealer
                    const hasBid = r.bids !== null
                    if (!scored) return [
                      <td key={`b${pi}`} className={`col-sub score-cell ${hasBid ? '' : 'score-empty'} ${isDealer ? 'col-dealer-player' : ''}`}>
                        {hasBid ? r.bids[pi] : '–'}
                      </td>,
                      <td key={`s${pi}`} className="col-sub score-cell score-empty">–</td>,
                    ]
                    const bid = r.bids[pi]
                    const trick = r.tricks[pi]
                    const made = trick === bid
                    return [
                      <td key={`b${pi}`} className={`col-sub score-cell ${made ? 'made' : 'missed'} ${isDealer ? 'col-dealer-player' : ''}`}>{bid}</td>,
                      <td key={`s${pi}`} className="col-sub score-cell score-cum">{cumByPlayer[pi]}</td>,
                    ]
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {done && (
        <div className="final-banner">
          <div className="final-title">🎉 Game Over!</div>
          <div className="final-winner">{players[leaderIdx]} wins with {totals[leaderIdx]} pts</div>
          <div className="final-scores">
            {players.map((p, i) => (
              <span key={i} className={i === leaderIdx ? 'final-score-winner' : 'final-score'}>
                {p}: {totals[i]}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: 88 }} />

      {!done && !readOnly && (
        <div className="bottom-bar">
          <div className="dealer-badge">Dealer: {players[currentDealer]}</div>
          {!bidsLocked ? (
            <button className="btn-primary btn-add-hand" onClick={() => setShowBids(true)}>
              Enter Bids — Round {currentRoundIdx + 1} ({currentRound.cardCount} cards)
            </button>
          ) : (
            <button className="btn-primary btn-add-hand" onClick={() => setShowTricks(true)}>
              Enter Tricks — Round {currentRoundIdx + 1}
            </button>
          )}
        </div>
      )}

      {showBids && (
        <BidEntry
          players={players}
          playerOrder={currentBidOrder}
          dealerIdx={currentDealer}
          cardCount={currentRound.cardCount}
          onConfirm={handleBidConfirm}
          onCancel={() => setShowBids(false)}
        />
      )}

      {showTricks && (
        <TrickEntry
          players={players}
          playerOrder={currentBidOrder}
          dealerIdx={currentDealer}
          cardCount={currentRound.cardCount}
          bids={currentRound.bids}
          onConfirm={handleTrickConfirm}
          onCancel={() => setShowTricks(false)}
        />
      )}

      {editingIdx !== null && !readOnly && (
        <RoundEdit
          round={rounds[editingIdx]}
          players={players}
          dealerIdx={dealerForRound(editingIdx, players.length)}
          playerOrder={bidOrder(editingIdx, players.length)}
          onSave={handleEditSave}
          onCancel={() => setEditingIdx(null)}
        />
      )}
    </div>
  )
}
