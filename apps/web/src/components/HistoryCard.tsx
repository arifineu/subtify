import type { VideoSession } from '../types'

interface HistoryCardProps {
  session: VideoSession
  onRestore?: (videoId: string, query: string) => void
}

function formatSearchedAt(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  })
}

export function HistoryCard({ session, onRestore }: HistoryCardProps) {
  return (
    <section className="rounded-[8px] bg-[#1a1a1a] p-4">
      <div className="mb-3 flex items-center gap-3">
        <img
          src={`https://img.youtube.com/vi/${session.videoId}/hqdefault.jpg`}
          alt={`Thumbnail for ${session.videoId}`}
          className="h-14 w-24 rounded-[4px] object-cover"
        />
        <div>
          <p className="text-xs uppercase tracking-wide text-[#aaaaaa]">Video ID</p>
          <p className="font-mono text-sm text-[#f1f1f1]">{session.videoId}</p>
        </div>
      </div>
      <div className="space-y-2">
        {session.searches.length === 0 ? (
          <p className="text-sm text-[#aaaaaa]">No searches yet.</p>
        ) : (
          session.searches.map((search) => (
            <button
              key={`${search.query}-${search.searchedAt}`}
              type="button"
              onClick={() => onRestore?.(session.videoId, search.query)}
              className="flex w-full items-center justify-between gap-3 rounded-[4px] border border-[#2a2a2a] px-3 py-2 text-left text-sm text-[#f1f1f1] transition-colors hover:border-[#ff0000]"
            >
              <span className="truncate">“{search.query}”</span>
              <span className="shrink-0 text-xs text-[#aaaaaa]">
                {formatSearchedAt(search.searchedAt)} · {search.results.length} results
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  )
}
