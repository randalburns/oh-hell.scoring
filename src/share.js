export function encodeGameState(state) {
  return btoa(encodeURIComponent(JSON.stringify(state)))
}

export function decodeGameState(encoded) {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)))
  } catch {
    return null
  }
}

export function buildShareUrl(state) {
  const encoded = encodeGameState(state)
  return `${window.location.origin}${window.location.pathname}?view=${encoded}`
}
