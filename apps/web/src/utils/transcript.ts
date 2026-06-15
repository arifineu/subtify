import type { SubtitleLine } from '../types'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

interface TranscriptSuccessResponse {
  videoId: string
  lines: SubtitleLine[]
}

interface TranscriptErrorResponse {
  error?: string
  code?: string
}

export class TranscriptError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}

export async function fetchTranscript(videoId: string): Promise<SubtitleLine[]> {
  const response = await fetch(`${API_BASE}/transcript/${videoId}`)
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
