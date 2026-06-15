import { useEffect } from 'react'
import { ResultList } from '../components/ResultList'
import { SearchBar } from '../components/SearchBar'
import { VideoInput } from '../components/VideoInput'
import { useAppStore } from '../store/useAppStore'

function ResultSkeleton() {
  const opacities = ['opacity-100', 'opacity-90', 'opacity-80', 'opacity-70', 'opacity-60', 'opacity-50']
  return (
    <div className="space-y-2">
      {opacities.map((opacity, i) => (
        <div key={i} className={`h-10 animate-pulse rounded-[8px] bg-[#1a1a1a] ${opacity}`} />
      ))}
    </div>
  )
}

export function HomePage() {
  const currentResults = useAppStore((state) => state.currentResults)
  const currentQuery = useAppStore((state) => state.currentQuery)
  const currentVideoId = useAppStore((state) => state.currentVideoId)
  const currentTranscript = useAppStore((state) => state.currentTranscript)
  const isTranscriptLoading = useAppStore((state) => state.isTranscriptLoading)

  useEffect(() => {
    document.title = 'Subtify — Search'
    return () => {
      document.title = 'Subtify'
    }
  }, [])

  return (
    <div className="space-y-4">
      <VideoInput />
      <SearchBar />
      {currentVideoId ? (
        <p className="text-xs text-[#aaaaaa]">
          Loaded video:{' '}
          <span className="font-mono text-[#f1f1f1]">{currentVideoId}</span> ·{' '}
          {currentTranscript.length} lines
        </p>
      ) : null}
      {currentQuery ? (
        <p className="text-sm text-[#aaaaaa]">
          Found {currentResults.length} result{currentResults.length === 1 ? '' : 's'} for{' '}
          <span className="text-[#f1f1f1]">‘{currentQuery}’</span>
        </p>
      ) : null}
      {isTranscriptLoading ? (
        <ResultSkeleton />
      ) : (
        <ResultList results={currentResults} videoId={currentVideoId} query={currentQuery} />
      )}
    </div>
  )
}
