import { useState, useCallback, useEffect } from 'react'
import { useBidVoice } from '../useVoiceInput'

export default function BidEntry({ players, playerOrder, dealerIdx, cardCount, onConfirm, onCancel }) {
  const [bids, setBids] = useState(Array(players.length).fill(''))

  function setBid(pi, val) {
    const next = [...bids]
    next[pi] = val
    setBids(next)
  }

  const parsed = bids.map(b => b === '' ? null : parseInt(b))
  const allFilled = parsed.every(b => b !== null && !isNaN(b) && b >= 0 && b <= cardCount)
  const bidSum = parsed.reduce((s, b) => s + (b ?? 0), 0)

  const nonDealerSum = playerOrder.slice(0, -1).reduce((s, pi) => s + (parsed[pi] ?? 0), 0)
  const forbidden = cardCount - nonDealerSum
  const dealerParsed = parsed[dealerIdx]
  const dealerBlocked = dealerParsed !== null && !isNaN(dealerParsed) && dealerParsed === forbidden

  const handleVoiceNumbers = useCallback(nums => {
    const next = Array(players.length).fill('')
    nums.slice(0, players.length).forEach((n, i) => {
      if (i < playerOrder.length) next[playerOrder[i]] = String(n)
    })
    setBids(next)
  }, [players.length, playerOrder])

  const voice = useBidVoice({ onNumbers: handleVoiceNumbers })

  useEffect(() => {
    if (allFilled && !dealerBlocked && voice.listening) voice.stop()
  }, [allFilled, dealerBlocked, voice.listening])

  function handleConfirm() {
    if (!allFilled || dealerBlocked) return
    onConfirm(parsed)
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onCancel} />
      <div className="sheet sheet-tall">
        <div className="sheet-handle" />
        <h2 className="sheet-title">Round Bids — {cardCount} card{cardCount !== 1 ? 's' : ''}</h2>
        <p className="sheet-subtitle">Dealer: <strong>{players[dealerIdx]}</strong> (bids last)</p>

        <div className="voice-wrap">
          <button
            type="button"
            className={`voice-btn ${voice.listening ? 'voice-listening' : ''}`}
            onClick={voice.listening ? voice.stop : voice.start}
          >
            <span className="voice-icon">{voice.listening ? '⏹' : '🎤'}</span>
            <span className="voice-label">{voice.listening ? 'Listening…' : 'Voice'}</span>
          </button>
          {!voice.listening && !voice.transcript && (
            <span className="voice-hint">{"\"3 1 0\" · \"Alice 3 Bob 1\" · \"Alice bid 3 Bob bid 1\""}</span>
          )}
          {voice.listening && (
            <span className="voice-status voice-active">Names are ignored — only numbers count</span>
          )}
          {voice.transcript && !voice.listening && (
            <span className="voice-status">Heard: "{voice.transcript}"</span>
          )}
          {voice.error && !voice.listening && (
            <span className="voice-status voice-error">{voice.error}</span>
          )}
        </div>

        <div className="bid-grid">
          {playerOrder.map((pi, orderPos) => {
            const isDealer = pi === dealerIdx
            const isForbidden = isDealer && parsed[pi] !== null && !isNaN(parsed[pi]) && parsed[pi] === forbidden
            return (
              <div key={pi} className={`bid-row ${isDealer ? 'bid-row-dealer' : ''}`}>
                <span className="bid-player">
                  {players[pi]}
                  {isDealer && <span className="dealer-tag">D</span>}
                </span>
                <input
                  className={`bid-input ${isForbidden ? 'bid-input-error' : ''}`}
                  type="number" inputMode="numeric" min="0" max={cardCount}
                  value={bids[pi]} onChange={e => setBid(pi, e.target.value)}
                  placeholder="–"
                  autoFocus={orderPos === 0}
                />
                {isForbidden && <span className="bid-error-msg">Forbidden! ({forbidden})</span>}
              </div>
            )
          })}
        </div>

        {allFilled && !dealerBlocked && (
          <div className="bid-summary">
            Total bids: {bidSum} / {cardCount} — {bidSum < cardCount ? 'under' : 'over'} by {Math.abs(cardCount - bidSum)}
          </div>
        )}

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
