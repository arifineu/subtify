import type {
  SubtitleLine,
  TranscriptErrorCode,
  TranscriptSuccessResponse,
} from '@subtify/types'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

/** Defensive parser-side shape; fields are optional until we inspect them. */
interface TranscriptErrorResponse {
  error?: string
  code?: TranscriptErrorCode
}

export class TranscriptError extends Error {
  code: TranscriptErrorCode
  constructor(message: string, code: TranscriptErrorCode) {
    super(message)
    this.code = code
  }
}

export async function fetchTranscript(
  videoId: string,
  options: { signal?: AbortSignal } = {}
): Promise<SubtitleLine[]> {
  const response = await fetch(`${API_BASE}/transcript/${videoId}`, {
    signal: options.signal,
  })
  const data = (await response.json()) as TranscriptSuccessResponse | TranscriptErrorResponse

  if (!response.ok) {
    const message = 'error' in data ? (data.error ?? 'Unknown error') : 'Unknown error'
    const code = 'code' in data ? (data.code ?? 'FETCH_FAILED') : 'FETCH_FAILED'
    throw new TranscriptError(message, code)
  }

  if (!('lines' in data)) {
    return []
  }

  return data.lines
}
