const KEY = 'oh_hell_v1'

export function loadSessions() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') }
  catch { return [] }
}

export function upsertSession(session) {
  const all = loadSessions()
  const idx = all.findIndex(s => s.id === session.id)
  if (idx >= 0) all[idx] = session
  else all.unshift(session)
  localStorage.setItem(KEY, JSON.stringify(all))
  return all
}

export function removeSession(id) {
  const all = loadSessions().filter(s => s.id !== id)
  localStorage.setItem(KEY, JSON.stringify(all))
  return all
}
