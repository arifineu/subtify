import { useState } from 'react'
import type { SearchResult } from '../types'
import { ResultItem } from './ResultItem'

interface ResultListProps {
  results: SearchResult[]
  videoId: string | null
  query: string
}

const PREVIEW_LIMIT = 100

export function ResultList({ results, videoId, query }: ResultListProps) {
  const [showAll, setShowAll] = useState(false)

  if (results.length === 0) {
    return (
      <section className="rounded-[8px] border border-dashed border-[#2a2a2a] p-4 text-sm text-[#aaaaaa]">
        {query ? 'No results found.' : 'Search something to see results.'}
      </section>
    )
  }

  const visible = showAll ? results : results.slice(0, PREVIEW_LIMIT)
  const hiddenCount = results.length - PREVIEW_LIMIT

  return (
    <section className="space-y-2 transition-opacity duration-200">
      {visible.map((result) => (
        <ResultItem
          key={`${result.index}-${result.line.start}`}
          result={result}
          videoId={videoId ?? ''}
          query={query}
        />
      ))}
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="w-full rounded-[8px] border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-sm text-[#aaaaaa] transition-colors hover:text-[#f1f1f1]"
        >
          {showAll ? 'Show fewer' : `Show all ${results.length} results`}
        </button>
      ) : null}
    </section>
  )
}
