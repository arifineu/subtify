import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { extractVideoId } from '../utils/youtube'
import { fetchTranscript, TranscriptError } from '../utils/transcript'

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/

const ERROR_MESSAGES: Record<string, string> = {
  NO_TRANSCRIPT: 'This video has no available subtitles.',
  INVALID_VIDEO: 'That does not look like a valid video ID.',
  FETCH_FAILED: 'Failed to fetch transcript. Please try again.',
}

export function VideoInput() {
  const loadTranscript = useAppStore((state) => state.loadTranscript)
  const setTranscriptLoading = useAppStore((state) => state.setTranscriptLoading)
  const setPendingVideoId = useAppStore((state) => state.setPendingVideoId)
  const currentVideoId = useAppStore((state) => state.currentVideoId)

  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AbortController for the in-flight transcript request + the videoId it's for,
  // so a rapid second paste cancels the first and typing past 11 chars doesn't
  // re-trigger a load for the same id.
  const abortRef = useRef<AbortController | null>(null)
  const loadingIdRef = useRef<string | null>(null)

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  function handleChange(nextUrl: string) {
    setUrl(nextUrl)
    const id = extractVideoId(nextUrl)
    setPendingVideoId(id)

    if (!id) return
    setError(null)

    const isValidId = VIDEO_ID_PATTERN.test(id)
    const isStale = id === currentVideoId || id === loadingIdRef.current
    if (isValidId && !isStale) {
      void loadFromUrl(id)
    }
  }

  async function loadFromUrl(videoId: string) {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    loadingIdRef.current = videoId

    setIsLoading(true)
    setTranscriptLoading(true)
    setError(null)

    try {
      const transcript = await fetchTranscript(videoId, { signal: controller.signal })
      if (controller.signal.aborted) return
      loadTranscript(videoId, transcript)
    } catch (err) {
      if (controller.signal.aborted) return
      if (err instanceof TranscriptError) {
        setError(ERROR_MESSAGES[err.code] ?? err.message)
      } else if (err instanceof DOMException && err.name === 'AbortError') {
        return
      } else {
        setError('Could not connect to the subtitle service. Is the API running?')
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
        setTranscriptLoading(false)
      }
      if (abortRef.current === controller) {
        loadingIdRef.current = null
      }
    }
  }

  function handleButtonClick() {
    const trimmed = url.trim()
    if (!trimmed) {
      setError('Please paste a YouTube URL.')
      return
    }
    const videoId = extractVideoId(trimmed)
    if (!videoId || !VIDEO_ID_PATTERN.test(videoId)) {
      setError('Please enter a valid YouTube URL.')
      return
    }
    void loadFromUrl(videoId)
  }

  return (
    <section className="rounded-[8px] border border-line bg-surface/80 p-3 backdrop-blur-sm">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={url}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading) handleButtonClick()
          }}
          placeholder="Paste a YouTube URL — https://www.youtube.com/watch?v=…"
          className="w-full rounded-[4px] border border-line bg-canvas px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isLoading}
          className="shrink-0 rounded-[4px] bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Loading…' : 'Load Subtitles'}
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-accent">
          {error}
        </p>
      ) : null}
    </section>
  )
}
