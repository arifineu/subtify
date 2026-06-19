import type { SubtitleLine } from '@subtify/types'

export type { SubtitleLine }

export interface SearchResult {
  line: SubtitleLine
  index: number
}

export interface SearchEntry {
  query: string
  results: SearchResult[]
  searchedAt: number // Date.now()
}

export interface VideoSession {
  videoId: string
  transcript: SubtitleLine[]
  searches: SearchEntry[]
}
