/**
 * Shared types between apps/web and apps/api.
 *
 * This package is types-only — every export is erased at compile time.
 * No runtime values are exported, so it adds zero bytes to either bundle.
 */

/** A single subtitle line. Returned by the backend, consumed by the frontend. */
export interface SubtitleLine {
  text: string
  start: number // seconds (float)
  duration: number // seconds (float)
}

/** Error codes that GET /transcript/:videoId can return. */
export type TranscriptErrorCode = 'NO_TRANSCRIPT' | 'INVALID_VIDEO' | 'FETCH_FAILED'

/** Success response body from GET /transcript/:videoId. */
export interface TranscriptSuccessResponse {
  videoId: string
  lines: SubtitleLine[]
}

/** Video metadata returned by GET /metadata/:videoId (proxied from YouTube oEmbed). */
export interface VideoMetadata {
  videoId: string
  title: string
  author: string
  thumbnailUrl: string
}
