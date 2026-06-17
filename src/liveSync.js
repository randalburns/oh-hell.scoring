import { db } from './firebase'
import { ref, set, onValue, push } from 'firebase/database'

// Firebase drops null values, so restore them on read
function normalize(data) {
  const players = Array.isArray(data.players)
    ? data.players
    : Object.values(data.players ?? {})
  const rounds = (Array.isArray(data.rounds) ? data.rounds : Object.values(data.rounds ?? {}))
    .map(r => ({ ...r, bids: r.bids ?? null, tricks: r.tricks ?? null }))
  return { ...data, players, rounds }
}

export async function createLiveSession(state) {
  const newRef = push(ref(db, 'games'))
  await set(newRef, state)
  return newRef.key
}

export function updateLiveSession(gameId, state) {
  set(ref(db, `games/${gameId}`), state)
}

// Returns an unsubscribe function
export function subscribeLiveSession(gameId, callback) {
  return onValue(ref(db, `games/${gameId}`), snapshot => {
    const data = snapshot.val()
    if (data) callback(normalize(data))
  })
}
