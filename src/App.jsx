import { useState } from 'react'
import Home from './components/Home'
import Setup from './components/Setup'
import GameBoard from './components/GameBoard'
import { loadSessions, upsertSession, removeSession } from './storage'
import { buildRounds } from './gameLogic'
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

  function persist(id, name, plrs, mc, rds, crIdx) {
    const session = {
      id, name, players: plrs, maxCards: mc,
      rounds: rds, currentRoundIdx: crIdx,
      updatedAt: Date.now(),
      completed: crIdx >= rds.length,
    }
    setSessions(upsertSession(session))
  }

  function startNew(name, plrs, mc) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const rds = buildRounds(mc)
    setActiveId(id); setSessionName(name); setPlayers(plrs)
    setMaxCards(mc); setRounds(rds); setCurrentRoundIdx(0)
    persist(id, name, plrs, mc, rds, 0)
    setScreen('game')
  }

  function resumeSession(s) {
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
    // rewind currentRoundIdx if editing a future-ish round
    const newCurrent = Math.max(currentRoundIdx, idx + (tricks ? 1 : 0))
    setRounds(newRounds)
    setCurrentRoundIdx(newCurrent)
    persist(activeId, sessionName, players, maxCards, newRounds, newCurrent)
  }

  function handleDelete(id) {
    setSessions(removeSession(id))
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
    />
  )
}

export default App
