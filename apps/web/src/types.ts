export interface SubtitleLine {
  text: string
  start: number
  duration: number
}

export interface SearchResult {
  line: SubtitleLine
  index: number
}

export interface SearchEntry {
  query: string
  results: SearchResult[]
  searchedAt: number
}

export interface VideoSession {
  videoId: string
  transcript: SubtitleLine[]
  searches: SearchEntry[]
}
