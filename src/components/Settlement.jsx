export default function Settlement({ games, handLog, players }) {
  const [p1, p2] = players
  const streetNames = ['1st Street', '2nd Street', '3rd Street']

  // Accumulate totals across all 3 games
  let p1GameScore = 0, p2GameScore = 0
  let p1BoxPts = 0,    p2BoxPts = 0
  let p1WinPts = 0,    p2WinPts = 0
  const skunkedGames = []

  games.forEach((game, i) => {
    const skunked = game.p1 === 0 || game.p2 === 0
    const boxVal  = skunked ? 50 : 25
    const winVal  = skunked ? 200 : 100
    const p1Boxes = handLog.filter(h => h.activeSlots.includes(i) && h.winner === 0).length
    const p2Boxes = handLog.filter(h => h.activeSlots.includes(i) && h.winner === 1).length
    const gameWinner = game.p1 >= game.p2 ? 0 : 1

    p1GameScore += game.p1
    p2GameScore += game.p2
    p1BoxPts    += p1Boxes * boxVal
    p2BoxPts    += p2Boxes * boxVal
    if (gameWinner === 0) p1WinPts += winVal
    else                  p2WinPts += winVal

    if (skunked) skunkedGames.push(streetNames[i])
  })

  const p1Total = p1GameScore + p1BoxPts + p1WinPts
  const p2Total = p2GameScore + p2BoxPts + p2WinPts
  const net     = p1Total - p2Total
  const winner  = net > 0 ? p1 : net < 0 ? p2 : null
  const absNet  = Math.abs(net)

  return (
    <div className="settlement">
      <div className="settle-title">Settlement</div>

      <div className="settle-game">
        <div className="settle-grid">
          {/* Column headers */}
          <div className="settle-col-header" />
          <div className="settle-col-header p1-color">{p1}</div>
          <div className="settle-col-header p2-color">{p2}</div>

          {/* Game score row */}
          <div className="settle-row-label">Game score</div>
          <div className="settle-val p1-color">{p1GameScore}</div>
          <div className="settle-val p2-color">{p2GameScore}</div>

          {/* Boxes */}
          <div className="settle-row-label">Boxes</div>
          <div className="settle-val p1-color">{p1BoxPts}</div>
          <div className="settle-val p2-color">{p2BoxPts}</div>

          {/* Game wins */}
          <div className="settle-row-label">Game bonuses</div>
          <div className="settle-val p1-color">{p1WinPts}</div>
          <div className="settle-val p2-color">{p2WinPts}</div>

          {/* Total */}
          <div className="settle-row-label settle-total-label">Total</div>
          <div className="settle-val settle-total-val p1-color">{p1Total}</div>
          <div className="settle-val settle-total-val p2-color">{p2Total}</div>
        </div>

        {skunkedGames.length > 0 && (
          <div className="settle-skunk-note">
            {skunkedGames.join(', ')} skunked
            — boxes 50 pts, wins 200 pts
          </div>
        )}

        <div className="settle-net">
          {winner
            ? <><span className="settle-net-winner">{winner}</span>{' wins '}<span className="settle-net-pts">{absNet} pts</span></>
            : <span>Tied</span>
          }
        </div>
      </div>
    </div>
  )
}
