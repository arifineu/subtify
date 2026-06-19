import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HistoryCard } from '../components/HistoryCard'
import { useAppStore } from '../store/useAppStore'

export function HistoryPage() {
  const navigate = useNavigate()
  const sessions = useAppStore((state) => state.sessions)
  const clearHistory = useAppStore((state) => state.clearHistory)
  const restoreSession = useAppStore((state) => state.restoreSession)
  const [confirming, setConfirming] = useState(false)
  const [justCleared, setJustCleared] = useState(false)

  useEffect(() => {
    document.title = 'Subtify — History'
    return () => {
      document.title = 'Subtify'
    }
  }, [])

  function handleClear() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    clearHistory()
    setConfirming(false)
    setJustCleared(true)
    window.setTimeout(() => setJustCleared(false), 2500)
  }

  if (sessions.length === 0) {
    return (
      <section className="rounded-[8px] border border-dashed border-line p-4 text-sm text-muted">
        {justCleared ? 'Session history cleared.' : 'No searches yet in this session.'}
      </section>
    )
  }

  return (
    <div className="h-full space-y-4 overflow-y-auto pr-1">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClear}
          onBlur={() => setConfirming(false)}
          className="rounded-[4px] bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:bg-accent-hover"
        >
          {confirming ? 'Click again to confirm' : 'Clear Session'}
        </button>
        {justCleared ? <span className="text-sm text-muted">Cleared.</span> : null}
      </div>
      {sessions.map((session) => (
        <HistoryCard
          key={session.videoId}
          session={session}
          onRestore={(videoId, query) => {
            restoreSession(videoId, query)
            navigate('/')
          }}
        />
      ))}
    </div>
  )
}
