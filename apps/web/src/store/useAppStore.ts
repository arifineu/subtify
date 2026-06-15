import { create } from 'zustand'
import type { SearchResult, SubtitleLine, VideoSession } from '../types'
import { searchSubtitles } from '../utils/search'

interface AppStore {
  sessions: VideoSession[]
  currentVideoId: string | null
  currentTranscript: SubtitleLine[]
  currentQuery: string
  currentResults: SearchResult[]
  isTranscriptLoading: boolean
  loadTranscript: (videoId: string, transcript: SubtitleLine[]) => void
  setTranscriptLoading: (loading: boolean) => void
  searchSubtitles: (query: string) => void
  restoreSession: (videoId: string, query: string) => void
  clearHistory: () => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  sessions: [],
  currentVideoId: null,
  currentTranscript: [],
  currentQuery: '',
  currentResults: [],
  isTranscriptLoading: false,
  loadTranscript: (videoId, transcript) => {
    set((state) => {
      const existingSession = state.sessions.find((session) => session.videoId === videoId)
      const sessions = existingSession
        ? state.sessions.map((session) =>
            session.videoId === videoId ? { ...session, transcript } : session
          )
        : [...state.sessions, { videoId, transcript, searches: [] }]

      return {
        sessions,
        currentVideoId: videoId,
        currentTranscript: transcript,
        currentQuery: '',
        currentResults: [],
        isTranscriptLoading: false,
      }
    })
  },
  setTranscriptLoading: (loading) => set({ isTranscriptLoading: loading }),
  searchSubtitles: (query) => {
    const state = get()
    const normalizedQuery = query.trim()
    const results = searchSubtitles(state.currentTranscript, normalizedQuery)

    set((currentState) => {
      if (!currentState.currentVideoId) {
        return { currentQuery: normalizedQuery, currentResults: results }
      }

      return {
        currentQuery: normalizedQuery,
        currentResults: results,
        sessions: currentState.sessions.map((session) =>
          session.videoId === currentState.currentVideoId
            ? {
                ...session,
                searches: [
                  ...session.searches,
                  {
                    query: normalizedQuery,
                    results,
                    searchedAt: Date.now(),
                  },
                ],
              }
            : session
        ),
      }
    })
  },
  restoreSession: (videoId, query) => {
    const state = get()
    const session = state.sessions.find((entry) => entry.videoId === videoId)
    const transcript = session?.transcript ?? []
    const results = searchSubtitles(transcript, query)

    set({
      currentVideoId: videoId,
      currentTranscript: transcript,
      currentQuery: query,
      currentResults: results,
    })
  },
  clearHistory: () =>
    set({
      sessions: [],
      currentVideoId: null,
      currentTranscript: [],
      currentQuery: '',
      currentResults: [],
    }),
}))
