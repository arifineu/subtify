import { YoutubeTranscript } from 'youtube-transcript'

export class TranscriptError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}

export interface SubtitleLine {
  text: string
  start: number // seconds
  duration: number
}

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/

interface RawTranscriptLine {
  text: string
  duration: number // ms
  offset: number // ms
  lang?: string
}

function toTranscriptError(err: unknown, videoId: string): TranscriptError {
  const msg = err instanceof Error ? err.message : String(err)

  // youtube-transcript prefixes its errors with "[YoutubeTranscript] 🚨"
  if (/captcha|too many requests/i.test(msg)) {
    return new TranscriptError(
      'YouTube is rate-limitating transcript requests. Please try again shortly.',
      'FETCH_FAILED'
    )
  }
  if (/no longer available|video is unavailable/i.test(msg)) {
    return new TranscriptError('Video not found or is private.', 'INVALID_VIDEO')
  }
  if (/transcript is disabled|no transcripts are available|not available in/i.test(msg)) {
    return new TranscriptError('No subtitles available for this video.', 'NO_TRANSCRIPT')
  }
  if (/impossible to retrieve|video id/i.test(msg)) {
    return new TranscriptError('Invalid video ID.', 'INVALID_VIDEO')
  }
  // Fallback: surface the upstream message but keep it generic for the client.
  return new TranscriptError(
    `Failed to fetch transcript for ${videoId}.`,
    'FETCH_FAILED'
  )
}

export async function fetchYouTubeTranscript(videoId: string): Promise<SubtitleLine[]> {
  if (!VIDEO_ID_PATTERN.test(videoId)) {
    throw new TranscriptError('Invalid video ID.', 'INVALID_VIDEO')
  }

  let raw: RawTranscriptLine[]
  try {
    raw = (await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' })) as RawTranscriptLine[]
  } catch (err) {
    throw toTranscriptError(err, videoId)
  }

  const lines: SubtitleLine[] = raw
    .map((l) => ({
      // Collapse newlines/whitespace so each line is a single searchable string.
      text: l.text.replace(/\s+/g, ' ').trim(),
      start: (l.offset ?? 0) / 1000,
      duration: (l.duration ?? 0) / 1000,
    }))
    .filter((l) => l.text.length > 0)

  if (lines.length === 0) {
    throw new TranscriptError('No subtitles available for this video.', 'NO_TRANSCRIPT')
  }

  return lines
}
