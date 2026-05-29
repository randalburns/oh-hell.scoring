export default function Home({ sessions, onNew, onResume, onDelete }) {
  return (
    <div className="home-screen">
      <div className="home-hero">
        <div className="home-icon">🃏</div>
        <h1 className="home-title">Oh Hell!</h1>
        <p className="home-subtitle">Trick-taking bid scoring</p>
      </div>
      <div className="home-body">
        <button className="btn-primary btn-lg" onClick={onNew}>+ New Game</button>
        {sessions.length > 0 && (
          <div className="session-list">
            <div className="session-list-label">Saved Games</div>
            {sessions.map(s => (
              <SessionCard key={s.id} session={s} onResume={() => onResume(s)} onDelete={() => onDelete(s.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SessionCard({ session, onResume, onDelete }) {
  const { name, players, currentRoundIdx, rounds, completed, updatedAt } = session
  const date = new Date(updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  return (
    <div className="session-card" onClick={onResume}>
      <div className="session-info">
        <div className="session-name">{name}</div>
        <div className="session-players">{players.join(', ')}</div>
        <div className="session-meta">
          Round {Math.min(currentRoundIdx + 1, rounds.length)} of {rounds.length} · {date}
        </div>
      </div>
      <div className="session-right">
        <span className={`session-badge ${completed ? 'badge-done' : 'badge-active'}`}>
          {completed ? 'Done' : 'Active'}
        </span>
        <button className="session-delete" onClick={e => { e.stopPropagation(); onDelete() }} aria-label="Delete">×</button>
      </div>
    </div>
  )
}
