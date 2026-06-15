import type { SearchResult, SubtitleLine } from '../types'

export function searchSubtitles(transcript: SubtitleLine[], query: string): SearchResult[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return []
  }

  return transcript
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => line.text.toLowerCase().includes(normalizedQuery))
}
