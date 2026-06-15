import { Hono } from 'hono'
import { fetchYouTubeTranscript, TranscriptError } from '../utils/youtube'

export const transcriptRoute = new Hono()

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/

transcriptRoute.get('/:videoId', async (c) => {
  const videoId = c.req.param('videoId')

  if (!videoId || !VIDEO_ID_PATTERN.test(videoId)) {
    return c.json({ error: 'Invalid video ID.', code: 'INVALID_VIDEO' }, 400)
  }

  try {
    const lines = await fetchYouTubeTranscript(videoId)
    return c.json({ videoId, lines })
  } catch (err) {
    if (err instanceof TranscriptError) {
      return c.json({ error: err.message, code: err.code }, 404)
    }
    return c.json({ error: 'Failed to fetch transcript.', code: 'FETCH_FAILED' }, 500)
  }
})
