import { useState, useEffect, useRef } from 'react'
import Home from './components/Home'
import Setup from './components/Setup'
import GameBoard from './components/GameBoard'
import { loadSessions, upsertSession, removeSession } from './storage'
import { buildRounds } from './gameLogic'
import { decodeGameState } from './share'
import { createLiveSession, updateLiveSession, subscribeLiveSession } from './liveSync'
import './App.css'

function App() {
  const [screen, setScreen] = useState('home')
  const [sessions, setSessions] = useState(() => loadSessions())
  const [activeId, setActiveId] = useState(null)
  const [sessionName, setSessionName] = useState('')
  const [players, setPlayers] = useState(null)
  const [maxCards, setMaxCards] = useState(7)
  const [rounds, setRounds] = useState([])
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)

  // Live sharing
  const liveIdRef = useRef(null)

  // Read-only / view mode (opened via a share link)
  const urlParams = new URLSearchParams(window.location.search)
  const liveViewId = urlParams.get('live')
  const staticViewParam = urlParams.get('view')
  const isViewMode = !!(liveViewId || staticViewParam)

  const [viewState, setViewState] = useState(() =>
    staticViewParam ? decodeGameState(staticViewParam) : null
  )
  const [viewLoading, setViewLoading] = useState(!!liveViewId)

  useEffect(() => {
    if (!liveViewId) return
    const unsub = subscribeLiveSession(liveViewId, data => {
      setViewState(data)
      setViewLoading(false)
    })
    return unsub
  }, [liveViewId])

  function persist(id, name, plrs, mc, rds, crIdx) {
    const session = {
      id, name, players: plrs, maxCards: mc,
      rounds: rds, currentRoundIdx: crIdx,
      updatedAt: Date.now(),
      completed: crIdx >= rds.length,
      liveId: liveIdRef.current || undefined,
    }
    setSessions(upsertSession(session))
    if (liveIdRef.current) {
      updateLiveSession(liveIdRef.current, { name, players: plrs, maxCards: mc, rounds: rds, currentRoundIdx: crIdx })
    }
  }

  async function handleShare() {
    const state = { name: sessionName, players, maxCards, rounds, currentRoundIdx }
    if (!liveIdRef.current) {
      liveIdRef.current = await createLiveSession(state)
      // Persist so liveId survives a refresh
      persist(activeId, sessionName, players, maxCards, rounds, currentRoundIdx)
    }
    const url = `${window.location.origin}${window.location.pathname}?live=${liveIdRef.current}`
    await navigator.clipboard.writeText(url)
  }

  function startNew(name, plrs, mc, downOnly = false) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const rds = buildRounds(mc, downOnly)
    liveIdRef.current = null
    setActiveId(id); setSessionName(name); setPlayers(plrs)
    setMaxCards(mc); setRounds(rds); setCurrentRoundIdx(0)
    persist(id, name, plrs, mc, rds, 0)
    setScreen('game')
  }

  function renamePlayer(idx, newName) {
    const newPlayers = players.map((p, i) => i === idx ? newName : p)
    setPlayers(newPlayers)
    persist(activeId, sessionName, newPlayers, maxCards, rounds, currentRoundIdx)
  }

  function renameGame(newName) {
    setSessionName(newName)
    persist(activeId, newName, players, maxCards, rounds, currentRoundIdx)
  }

  function resumeSession(s) {
    liveIdRef.current = s.liveId || null
    setActiveId(s.id); setSessionName(s.name); setPlayers(s.players)
    setMaxCards(s.maxCards); setRounds(s.rounds); setCurrentRoundIdx(s.currentRoundIdx)
    setScreen('game')
  }

  function submitBids(bids) {
    const newRounds = rounds.map((r, i) =>
      i === currentRoundIdx ? { ...r, bids } : r
    )
    setRounds(newRounds)
    persist(activeId, sessionName, players, maxCards, newRounds, currentRoundIdx)
  }

  function submitTricks(tricks) {
    const newRounds = rounds.map((r, i) =>
      i === currentRoundIdx ? { ...r, tricks } : r
    )
    const nextIdx = currentRoundIdx + 1
    setRounds(newRounds)
    setCurrentRoundIdx(nextIdx)
    persist(activeId, sessionName, players, maxCards, newRounds, nextIdx)
  }

  function editRound(idx, bids, tricks) {
    const newRounds = rounds.map((r, i) =>
      i === idx ? { ...r, bids, tricks } : r
    )
    const newCurrent = Math.max(currentRoundIdx, idx + (tricks ? 1 : 0))
    setRounds(newRounds)
    setCurrentRoundIdx(newCurrent)
    persist(activeId, sessionName, players, maxCards, newRounds, newCurrent)
  }

  function handleDelete(id) {
    setSessions(removeSession(id))
  }

  function exitViewMode() {
    window.history.replaceState({}, '', window.location.pathname)
    setViewState(null)
    setViewLoading(false)
  }

  // Read-only view (shared link)
  if (isViewMode) {
    if (viewLoading) return (
      <div className="view-loading">
        <div className="view-loading-text">Loading game…</div>
      </div>
    )
    if (viewState) return (
      <GameBoard
        players={viewState.players}
        sessionName={viewState.name}
        maxCards={viewState.maxCards}
        rounds={viewState.rounds}
        currentRoundIdx={viewState.currentRoundIdx}
        onSubmitBids={() => {}}
        onSubmitTricks={() => {}}
        onEditRound={() => {}}
        onExit={exitViewMode}
        readOnly
      />
    )
  }

  if (screen === 'home') return (
    <Home
      sessions={sessions}
      onNew={() => setScreen('setup')}
      onResume={resumeSession}
      onDelete={handleDelete}
    />
  )

  if (screen === 'setup') return (
    <Setup onStart={startNew} onBack={() => setScreen('home')} />
  )

  return (
    <GameBoard
      players={players}
      sessionName={sessionName}
      maxCards={maxCards}
      rounds={rounds}
      currentRoundIdx={currentRoundIdx}
      onSubmitBids={submitBids}
      onSubmitTricks={submitTricks}
      onEditRound={editRound}
      onExit={() => setScreen('home')}
      onShare={handleShare}
      onRenamePlayer={renamePlayer}
      onRenameGame={renameGame}
    />
  )
}

export default App
