import { useState, useRef, Fragment } from 'react'

export default function BidEntry({ players, playerOrder, dealerIdx, cardCount, onConfirm, onCancel }) {
  const [bids, setBids] = useState(Array(players.length).fill(''))

  function setBid(pi, val) {
    const next = [...bids]
    next[pi] = val
    setBids(next)
  }

  const parsed = bids.map(b => b === '' ? null : parseInt(b))
  const allFilled = parsed.every(b => b !== null && !isNaN(b) && b >= 0 && b <= cardCount)
  const bidSum = parsed.reduce((s, b) => s + (b !== null && !isNaN(b) && b >= 0 ? b : 0), 0)
  const remaining = cardCount - bidSum
  const over = bidSum > cardCount

  const inputRefs = useRef([])

  const nonDealerOrder = playerOrder.slice(0, -1)
  const nonDealerSum = nonDealerOrder.reduce((s, pi) => s + (parsed[pi] ?? 0), 0)
  const forbidden = cardCount - nonDealerSum
  const nonDealerAllFilled = nonDealerOrder.every(pi => {
    const b = parsed[pi]; return b !== null && !isNaN(b) && b >= 0 && b <= cardCount
  })
  const dealerParsed = parsed[dealerIdx]
  const dealerBlocked = dealerParsed !== null && !isNaN(dealerParsed) && dealerParsed === forbidden

  function handleConfirm() {
    if (!allFilled || dealerBlocked) return
    onConfirm(parsed)
  }

  const fillPct = Math.min(100, (bidSum / cardCount) * 100)

  return (
    <>
      <div className="sheet-overlay" onClick={onCancel} />
      <div className="sheet sheet-flex">
        <div className="sheet-handle" />
        <h2 className="sheet-title">Round Bids — {cardCount} card{cardCount !== 1 ? 's' : ''}</h2>
        <p className="sheet-subtitle">Dealer: <strong>{players[dealerIdx]}</strong> (bids last)</p>

        <div className="bid-tally">
          <div className="bid-tally-track">
            <div className={`bid-tally-fill ${over ? 'bid-tally-over' : ''}`} style={{ width: `${fillPct}%` }} />
          </div>
          <div className={`bid-tally-text ${over ? 'bid-tally-text-over' : ''}`}>
            {bidSum} bid · {over ? `${bidSum - cardCount} over` : `${remaining} remaining`}
          </div>
        </div>

        <div className="bid-grid-scroll">
          <div className="bid-grid">
            {playerOrder.map((pi, orderPos) => {
              const isDealer = pi === dealerIdx
              const isForbidden = isDealer && parsed[pi] !== null && !isNaN(parsed[pi]) && parsed[pi] === forbidden
              return (
                <Fragment key={pi}>
                  {isDealer && nonDealerAllFilled && (
                    <div className="dealer-bid-hint">
                      {nonDealerSum} trick{nonDealerSum !== 1 ? 's' : ''} bid
                      {forbidden >= 0 && forbidden <= cardCount
                        ? ` — no ${forbidden}`
                        : ' — any bid OK'}
                    </div>
                  )}
                  <div className={`bid-row ${isDealer ? 'bid-row-dealer' : ''}`}>
                    <span className="bid-player">
                      {players[pi]}
                      {isDealer && <span className="dealer-tag">D</span>}
                    </span>
                    <input
                      ref={el => inputRefs.current[orderPos] = el}
                      className={`bid-input ${isForbidden ? 'bid-input-error' : ''}`}
                      type="number" inputMode="numeric" min="0" max={cardCount}
                      value={bids[pi]} onChange={e => setBid(pi, e.target.value)}
                      placeholder="–"
                      autoFocus={orderPos === 0}
                      onKeyDown={e => {
                        if (e.key === 'Tab' && !e.shiftKey) {
                          const next = inputRefs.current[orderPos + 1]
                          if (next) { e.preventDefault(); next.focus() }
                        }
                      }}
                    />
                    {isForbidden && <span className="bid-error-msg">No {forbidden}!</span>}
                  </div>
                </Fragment>
              )
            })}
          </div>
        </div>

        <div className="sheet-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" disabled={!allFilled || dealerBlocked} onClick={handleConfirm}>
            Lock Bids
          </button>
        </div>
      </div>
    </>
  )
}
