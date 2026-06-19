import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { buildYouTubeLink } from '../utils/youtube'
import { fetchVideoMetadata } from '../utils/metadata'

function MetadataSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 w-full rounded bg-line" />
      <div className="h-3 w-2/3 rounded bg-line" />
    </div>
  )
}

export function VideoPreview() {
  const pendingVideoId = useAppStore((s) => s.pendingVideoId)
  const currentVideoId = useAppStore((s) => s.currentVideoId)
  const currentTranscript = useAppStore((s) => s.currentTranscript)
  const isTranscriptLoading = useAppStore((s) => s.isTranscriptLoading)
  const metadata = useAppStore((s) => s.videoMetadata)
  const isMetadataLoading = useAppStore((s) => s.isMetadataLoading)
  const setMetadata = useAppStore((s) => s.setVideoMetadata)
  const setMetadataLoading = useAppStore((s) => s.setMetadataLoading)

  const effectiveId = pendingVideoId ?? currentVideoId
  const lastFetchedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!effectiveId) return
    if (lastFetchedRef.current === effectiveId) return
    if (metadata?.videoId === effectiveId) {
      lastFetchedRef.current = effectiveId
      return
    }

    let cancelled = false
    lastFetchedRef.current = effectiveId
    setMetadataLoading(true)

    fetchVideoMetadata(effectiveId)
      .then((meta) => {
        if (!cancelled) setMetadata(meta)
      })
      .catch(() => {
        if (!cancelled) setMetadata(null)
      })
      .finally(() => {
        if (!cancelled) setMetadataLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [effectiveId, metadata, setMetadata, setMetadataLoading])

  if (!effectiveId) {
    return (
      <aside className="flex h-full flex-col items-center justify-center rounded-[8px] border border-dashed border-line p-6 text-center">
        <div className="mb-3 text-3xl opacity-40">▶</div>
        <p className="text-sm text-muted">
          Paste a YouTube URL above to preview the video here.
        </p>
      </aside>
    )
  }

  const openUrl = buildYouTubeLink(effectiveId, 0)
  const title = metadata?.title ?? null
  const author = metadata?.author ?? null

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-[8px] border border-line bg-surface">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-inset">
        <img
          src={`https://i.ytimg.com/vi/${effectiveId}/hqdefault.jpg`}
          alt={title ?? `Thumbnail for ${effectiveId}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100"
          aria-label="Open video on YouTube"
        >
          <span className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white">
            ▶ Play on YouTube
          </span>
        </a>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
        {isMetadataLoading ? (
          <MetadataSkeleton />
        ) : title ? (
          <>
            <h2 className="line-clamp-3 text-sm font-medium leading-snug text-fg">{title}</h2>
            {author ? <p className="text-xs text-muted">{author}</p> : null}
          </>
        ) : (
          <h2 className="text-sm font-medium text-fg">Video preview</h2>
        )}

        <div className="mt-auto space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2 rounded-[4px] bg-inset px-2 py-1.5">
            <span className="text-muted">Video ID</span>
            <span className="font-mono text-fg">{effectiveId}</span>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-[4px] bg-inset px-2 py-1.5">
            <span className="text-muted">Status</span>
            <span className="text-fg">
              {isTranscriptLoading
                ? 'Loading transcript…'
                : currentVideoId === effectiveId && currentTranscript.length > 0
                  ? `${currentTranscript.length} lines loaded`
                  : 'Not loaded yet'}
            </span>
          </div>
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-[4px] bg-accent px-3 py-2 text-center text-xs font-medium text-white transition-opacity hover:bg-accent-hover"
          >
            Open on YouTube ↗
          </a>
        </div>
      </div>
    </aside>
  )
}
