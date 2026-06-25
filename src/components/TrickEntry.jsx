import { useState, useCallback, useEffect, useRef } from 'react'
import { roundScore } from '../gameLogic'
import { useTrickVoice } from '../useVoiceInput'

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

  const handleVoiceNumbers = useCallback(nums => {
    const next = Array(players.length).fill('')
    nums.slice(0, players.length).forEach((n, i) => {
      if (i < playerOrder.length) next[playerOrder[i]] = String(n)
    })
    setTricks(next)
  }, [players.length, playerOrder])

  const voice = useTrickVoice({ onNumbers: handleVoiceNumbers })

  useEffect(() => {
    if (allFilled && sumOk && voice.listening) voice.stop()
  }, [allFilled, sumOk, voice.listening])

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
            <span className="voice-hint">{"Say \"got 3 got 1 got 0\" or just \"3 1 0\" in deal order"}</span>
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
