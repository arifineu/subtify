import { useEffect } from 'react'
import { ResultList } from '../components/ResultList'
import { SearchBar } from '../components/SearchBar'
import { VideoInput } from '../components/VideoInput'
import { VideoPreview } from '../components/VideoPreview'
import { useAppStore } from '../store/useAppStore'

function ResultSkeleton() {
  const opacities = ['opacity-100', 'opacity-90', 'opacity-80', 'opacity-70', 'opacity-60']
  return (
    <div className="space-y-2">
      {opacities.map((opacity, i) => (
        <div key={i} className={`h-10 animate-pulse rounded-[8px] bg-surface ${opacity}`} />
      ))}
    </div>
  )
}

export function HomePage() {
  const currentResults = useAppStore((state) => state.currentResults)
  const currentQuery = useAppStore((state) => state.currentQuery)
  const currentVideoId = useAppStore((state) => state.currentVideoId)
  const isTranscriptLoading = useAppStore((state) => state.isTranscriptLoading)

  useEffect(() => {
    document.title = 'Subtify — Search'
    return () => {
      document.title = 'Subtify'
    }
  }, [])

  return (
    <div className="flex h-full flex-col gap-3">
      {/* URL bar — full width, always visible */}
      <VideoInput />

      {/* Studio split: preview locked left, results scroll right under a glass search bar */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[clamp(260px,28%,360px)_minmax(0,1fr)]">
        <VideoPreview />

        <div className="flex min-h-0 flex-col overflow-hidden rounded-[8px] border border-line bg-canvas/40">
          <div className="min-h-0 flex-1 overflow-y-auto">
            {/* Sticky liquid-glass search dock — results scroll beneath it */}
            <div className="sticky top-0 z-10 border-b border-line/60 bg-surface/55 backdrop-blur-xl backdrop-saturate-150">
              <div className="p-3">
                <SearchBar resultCount={currentResults.length} query={currentQuery} />
              </div>
            </div>

            <div className="p-3 pt-4">
              {isTranscriptLoading ? (
                <ResultSkeleton />
              ) : (
                <ResultList
                  results={currentResults}
                  videoId={currentVideoId}
                  query={currentQuery}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
