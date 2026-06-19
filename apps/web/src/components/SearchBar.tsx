import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'

interface SearchBarProps {
  resultCount: number
  query: string
}

const DEBOUNCE_MS = 300

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

export function SearchBar({ resultCount, query }: SearchBarProps) {
  const runLiveSearch = useAppStore((s) => s.runLiveSearch)
  const commitSearch = useAppStore((s) => s.searchSubtitles)
  const hasTranscript = useAppStore(
    (s) => s.currentVideoId !== null && s.currentTranscript.length > 0
  )
  const currentVideoId = useAppStore((s) => s.currentVideoId)

  const [input, setInput] = useState('')
  const debouncedInput = useDebouncedValue(input, DEBOUNCE_MS)

  // Live search-as-you-type. Runs the lightweight path that does NOT push to history.
  useEffect(() => {
    if (!hasTranscript) return
    runLiveSearch(debouncedInput)
  }, [debouncedInput, hasTranscript, runLiveSearch])

  // Reset the local input field when a new video is loaded.
  useEffect(() => {
    setInput('')
  }, [currentVideoId])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const trimmed = input.trim()
    if (!trimmed || !hasTranscript) return
    // Enter runs the full search path that also saves the query to history.
    commitSearch(trimmed)
  }

  const hasQuery = query.length > 0

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={!hasTranscript}
        placeholder={
          hasTranscript ? 'Type to search subtitles…' : 'Load a transcript to start searching'
        }
        className="w-full rounded-[4px] border border-line bg-canvas/70 px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
      <p className="h-4 text-xs text-muted" aria-live="polite">
        {hasQuery
          ? `${resultCount} result${resultCount === 1 ? '' : 's'} for “${query}”`
          : hasTranscript
            ? 'Type to search · Enter saves to history'
            : ''}
      </p>
    </div>
  )
}
