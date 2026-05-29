// Dealer for round ri: round 0 → last player, then rotates forward
export function dealerForRound(ri, numPlayers) {
  return (ri + numPlayers - 1) % numPlayers
}

// Player order for bids/tricks: player after dealer first, dealer last
export function bidOrder(ri, numPlayers) {
  const dealer = dealerForRound(ri, numPlayers)
  return Array.from({ length: numPlayers }, (_, i) => (dealer + 1 + i) % numPlayers)
}

// Build round card-count sequence: N → 1 → N  (valley shape)
export function buildRounds(maxCards) {
  const seq = []
  for (let c = maxCards; c >= 1; c--) seq.push(c)
  for (let c = 2; c <= maxCards; c++) seq.push(c)
  return seq.map(cardCount => ({ cardCount, bids: null, tricks: null }))
}

// Score a single player for a round
// bids/tricks are arrays indexed by player
export function roundScore(bid, actual) {
  if (bid === null || actual === null) return null
  return actual === bid ? 10 + actual : actual
}

// Cumulative totals per player up through round index (inclusive)
export function cumulativeTotals(rounds, numPlayers) {
  const totals = Array(numPlayers).fill(0)
  for (const r of rounds) {
    if (!r.tricks) break
    for (let p = 0; p < numPlayers; p++) {
      const s = roundScore(r.bids[p], r.tricks[p])
      if (s !== null) totals[p] += s
    }
  }
  return totals
}
