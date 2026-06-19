import type { VideoMetadata } from '@subtify/types'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata> {
  const response = await fetch(`${API_BASE}/metadata/${videoId}`)
  const data = (await response.json()) as VideoMetadata | { error?: string; code?: string }

  if (!response.ok) {
    const message = 'error' in data ? (data.error ?? 'Unknown error') : 'Unknown error'
    const code = 'code' in data ? (data.code ?? 'FETCH_FAILED') : 'FETCH_FAILED'
    throw new Error(`${message}`, { cause: { code } })
  }

  if (!('videoId' in data)) {
    throw new Error('Malformed metadata response.', { cause: { code: 'FETCH_FAILED' } })
  }

  return data
}
