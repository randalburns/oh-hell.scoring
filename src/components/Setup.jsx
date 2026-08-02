import { useState, useEffect } from 'react'

export default function Setup({ onStart, onBack }) {
  const [name, setName] = useState('')
  const [numPlayers, setNumPlayers] = useState(4)
  const [playerNames, setPlayerNames] = useState(Array(12).fill(''))
  const [maxCards, setMaxCards] = useState(7)
  const [downOnly, setDownOnly] = useState(false)

  const cardLimit = Math.min(10, Math.floor(52 / numPlayers))

  // Clamp maxCards when player count changes
  useEffect(() => {
    if (maxCards > cardLimit) setMaxCards(Math.max(4, cardLimit))
  }, [numPlayers, cardLimit])

  function setPlayer(i, val) {
    const next = [...playerNames]
    next[i] = val
    setPlayerNames(next)
  }

  function handleStart(e) {
    e.preventDefault()
    const gameName = name.trim() || `Game ${new Date().toLocaleDateString()}`
    const filled = playerNames.slice(0, numPlayers).map(n => n.trim()).filter(n => n.length > 0)
    const plrs = filled.length >= 2 ? filled : playerNames.slice(0, numPlayers).map((n, i) => n.trim() || `Player ${i + 1}`)
    onStart(gameName, plrs, maxCards, downOnly)
  }

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <button className="btn-ghost setup-back" onClick={onBack}>← Back</button>
        <div className="setup-icon">🃏</div>
        <h1 className="setup-title">New Game</h1>
        <form onSubmit={handleStart} className="setup-form">
          <div className="field-group">
            <label className="field-label">Game Name</label>
            <input className="field-input" type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Friday Night Oh Hell" autoCapitalize="words" autoComplete="off" />
          </div>

          <div className="field-group">
            <label className="field-label">Number of Players</label>
            <div className="num-selector">
              {[3,4,5,6,7,8,9,10,11,12].map(n => (
                <button key={n} type="button"
                  className={`num-btn ${numPlayers === n ? 'active' : ''}`}
                  onClick={() => setNumPlayers(n)}
                >{n}</button>
              ))}
            </div>
          </div>

          {Array.from({ length: numPlayers }, (_, i) => (
            <div className="field-group" key={i}>
              <label className="field-label">Player {i + 1}</label>
              <input className="field-input" type="text" value={playerNames[i]}
                onChange={e => setPlayer(i, e.target.value)}
                placeholder={`Player ${i + 1}`} autoCapitalize="words" autoComplete="off" />
            </div>
          ))}

          <div className="field-group">
            <label className="field-label">Max Cards per Hand</label>
            <div className="num-selector">
              {[4,5,6,7,8,9,10].map(n => {
                const feasible = n <= cardLimit
                return (
                  <button key={n} type="button"
                    className={`num-btn ${maxCards === n ? 'active' : ''} ${!feasible ? 'num-btn-disabled' : ''}`}
                    onClick={() => feasible && setMaxCards(n)}
                    disabled={!feasible}
                  >{n}</button>
                )
              })}
            </div>
            <div className="field-hint">
              Max {cardLimit} with {numPlayers} players
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Format</label>
            <div className="num-selector">
              <button type="button" className={`num-btn ${!downOnly ? 'active' : ''}`}
                onClick={() => setDownOnly(false)}>Down &amp; Up</button>
              <button type="button" className={`num-btn ${downOnly ? 'active' : ''}`}
                onClick={() => setDownOnly(true)}>Down Only</button>
            </div>
            <div className="field-hint">
              {downOnly ? `${maxCards} rounds (${maxCards} → 1)` : `${2 * maxCards - 1} rounds (${maxCards} → 1 → ${maxCards})`}
            </div>
          </div>

          <button type="submit" className="btn-primary btn-lg">Start Game</button>
        </form>
      </div>
    </div>
  )
}
