import { Hono } from 'hono'
import type { VideoMetadata } from '@subtify/types'

export const metadataRoute = new Hono()

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/

interface OEmbedResponse {
  title?: string
  author_name?: string
  thumbnail_url?: string
}

metadataRoute.get('/:videoId', async (c) => {
  const videoId = c.req.param('videoId')

  if (!videoId || !VIDEO_ID_PATTERN.test(videoId)) {
    return c.json({ error: 'Invalid video ID.', code: 'INVALID_VIDEO' }, 400)
  }

  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  let res: Response
  try {
    res = await fetch(oembedUrl)
  } catch {
    return c.json({ error: 'Failed to fetch metadata.', code: 'FETCH_FAILED' }, 502)
  }

  if (!res.ok) {
    // 401/404 from oEmbed means the video is private, deleted, or doesn't exist.
    return c.json({ error: 'Video not found.', code: 'INVALID_VIDEO' }, 404)
  }

  const data = (await res.json()) as OEmbedResponse
  const body: VideoMetadata = {
    videoId,
    title: data.title ?? 'Untitled video',
    author: data.author_name ?? 'Unknown',
    thumbnailUrl:
      data.thumbnail_url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  }

  return c.json(body)
})
