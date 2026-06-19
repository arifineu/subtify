import type { VideoMetadata } from '@subtify/types'
import { create } from 'zustand'
import type { SearchResult, SubtitleLine, VideoSession } from '../types'
import { searchSubtitles } from '../utils/search'

export type Theme = 'light' | 'dark'

interface AppStore {
  sessions: VideoSession[]
  currentVideoId: string | null
  currentTranscript: SubtitleLine[]
  currentQuery: string
  currentResults: SearchResult[]
  isTranscriptLoading: boolean

  // Live preview state — pendingVideoId is parsed from the URL field before
  // "Load Subtitles" is clicked. VideoMetadata is fetched for whichever id is
  // currently in view (pendingVideoId ?? currentVideoId).
  pendingVideoId: string | null
  videoMetadata: VideoMetadata | null
  isMetadataLoading: boolean

  // UI preferences
  theme: Theme

  loadTranscript: (videoId: string, transcript: SubtitleLine[]) => void
  setTranscriptLoading: (loading: boolean) => void
  setPendingVideoId: (id: string | null) => void
  setVideoMetadata: (meta: VideoMetadata | null) => void
  setMetadataLoading: (loading: boolean) => void
  /** Live search: updates currentQuery + currentResults only (no history). Used by debounced type-ahead. */
  runLiveSearch: (query: string) => void
  /** Explicit search: updates results AND pushes a SearchEntry into history. Used on Enter. */
  searchSubtitles: (query: string) => void
  restoreSession: (videoId: string, query: string) => void
  clearHistory: () => void
  toggleTheme: () => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  sessions: [],
  currentVideoId: null,
  currentTranscript: [],
  currentQuery: '',
  currentResults: [],
  isTranscriptLoading: false,
  pendingVideoId: null,
  videoMetadata: null,
  isMetadataLoading: false,
  theme: 'light',

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
  setPendingVideoId: (id) =>
    set((state) => ({
      pendingVideoId: id,
      // Clear stale metadata if the id actually changed.
      videoMetadata:
        state.videoMetadata && state.videoMetadata.videoId === id ? state.videoMetadata : null,
    })),
  setVideoMetadata: (meta) => set({ videoMetadata: meta }),
  setMetadataLoading: (loading) => set({ isMetadataLoading: loading }),

  runLiveSearch: (query) => {
    const state = get()
    const normalizedQuery = query.trim()
    const results = searchSubtitles(state.currentTranscript, normalizedQuery)
    set({ currentQuery: normalizedQuery, currentResults: results })
  },
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
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}))
