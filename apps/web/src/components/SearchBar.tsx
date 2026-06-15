import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'

export function SearchBar() {
  const searchSubtitles = useAppStore((state) => state.searchSubtitles)
  const hasTranscript = useAppStore(
    (state) => state.currentVideoId !== null && state.currentTranscript.length > 0
  )
  const [query, setQuery] = useState('')

  function handleSearch() {
    const trimmed = query.trim()
    if (!trimmed || !hasTranscript) return
    searchSubtitles(trimmed)
  }

  return (
    <section className="rounded-[8px] bg-[#1a1a1a] p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch()
          }}
          disabled={!hasTranscript}
          placeholder={hasTranscript ? 'Search subtitles…' : 'Load a transcript to start searching'}
          className="w-full rounded-[4px] border border-[#2a2a2a] bg-[#0f0f0f] px-3 py-2 text-sm text-[#f1f1f1] placeholder:text-[#aaaaaa] focus:border-[#ff0000] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={!hasTranscript || !query.trim()}
          className="shrink-0 rounded-[4px] bg-[#ff0000] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          Search
        </button>
      </div>
    </section>
  )
}
