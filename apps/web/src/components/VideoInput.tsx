import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { extractVideoId } from '../utils/youtube'
import { fetchTranscript, TranscriptError } from '../utils/transcript'

const ERROR_MESSAGES: Record<string, string> = {
  NO_TRANSCRIPT: 'This video has no available subtitles.',
  INVALID_VIDEO: 'That does not look like a valid video ID.',
  FETCH_FAILED: 'Failed to fetch transcript. Please try again.',
}

export function VideoInput() {
  const loadTranscript = useAppStore((state) => state.loadTranscript)
  const setTranscriptLoading = useAppStore((state) => state.setTranscriptLoading)
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLoad() {
    const trimmed = url.trim()
    if (!trimmed) {
      setError('Please paste a YouTube URL.')
      return
    }

    const videoId = extractVideoId(trimmed)
    if (!videoId) {
      setError('Please enter a valid YouTube URL.')
      return
    }

    setIsLoading(true)
    setTranscriptLoading(true)
    setError(null)

    try {
      const transcript = await fetchTranscript(videoId)
      loadTranscript(videoId, transcript)
    } catch (err) {
      if (err instanceof TranscriptError) {
        setError(ERROR_MESSAGES[err.code] ?? err.message)
      } else {
        setError('Could not connect to the subtitle service. Is the API running?')
      }
    } finally {
      setIsLoading(false)
      setTranscriptLoading(false)
    }
  }

  return (
    <section className="rounded-[8px] bg-[#1a1a1a] p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading) handleLoad()
          }}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full rounded-[4px] border border-[#2a2a2a] bg-[#0f0f0f] px-3 py-2 text-sm text-[#f1f1f1] placeholder:text-[#aaaaaa] focus:border-[#ff0000] focus:outline-none"
        />
        <button
          type="button"
          onClick={handleLoad}
          disabled={isLoading}
          className="shrink-0 rounded-[4px] bg-[#ff0000] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Loading…' : 'Load Subtitles'}
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-[#ff0000]">
          {error}
        </p>
      ) : null}
    </section>
  )
}
