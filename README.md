# Subtify

Search words and phrases inside YouTube subtitles. Paste a video URL, load the transcript, and find every match with a clickable timestamp that jumps to that moment in the video.

## What it does

- Input a YouTube URL → backend fetches the transcript
- Search any word/phrase → see timestamped matches with the matched text highlighted
- Click a result → opens YouTube at that exact second in a new tab
- Session history page tracks every video + query (in-memory only, cleared on refresh)

## Tech stack

| Layer | Tools |
|-------|-------|
| Frontend | React 18, TypeScript, Vite, Zustand, Tailwind CSS v4, React Router v6 |
| Backend | Hono, Cloudflare Workers, Wrangler |
| Transcript source | [`youtube-transcript`](https://www.npmjs.com/package/youtube-transcript) (innertube ANDROID client) |
| Monorepo | pnpm workspaces |

## Monorepo structure

```
subtify/
├── apps/
│   ├── web/                      # React + Vite frontend
│   │   └── src/
│   │       ├── components/       # Navbar, VideoInput, SearchBar, ResultItem, ResultList, HistoryCard
│   │       ├── pages/            # HomePage, HistoryPage
│   │       ├── store/            # useAppStore (Zustand)
│   │       ├── utils/            # youtube, transcript, search
│   │       └── types.ts
│   └── api/                      # Hono + Cloudflare Workers backend
│       └── src/
│           ├── index.ts          # Hono app entry, CORS, /health
│           ├── routes/transcript.ts
│           └── utils/youtube.ts  # fetchYouTubeTranscript
├── pnpm-workspace.yaml
└── package.json
```

## Prerequisites

- Node.js 20+
- pnpm 11+
- A Cloudflare account (free tier is fine — only needed to deploy the backend)

## Local development

Install dependencies from the repo root:

```bash
pnpm install
```

Run both apps in separate terminals:

```bash
# Terminal 1 — backend (Hono on Cloudflare Workers runtime)
pnpm dev:api          # → http://localhost:8787

# Terminal 2 — frontend (Vite)
pnpm dev:web          # → http://localhost:5173 (or next free port)
```

Open the frontend URL, paste a YouTube URL (e.g. `https://www.youtube.com/watch?v=dQw4w9WgXcQ`), and click **Load Subtitles**.

### Verify the backend independently

```bash
curl http://localhost:8787/health
curl http://localhost:8787/transcript/dQw4w9WgXcQ
```

## Environment variables

### Frontend (`apps/web`)

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | `.env.development`, `.env.production`, or host dashboard | Base URL of the backend API |

- `.env.development` defaults to `http://localhost:8787` (committed — safe to share).
- `.env.production` is blank by default; set it on your deploy host (Vercel, Netlify, etc.) to the Worker URL.
- Any `VITE_*` variable is **inlined into the browser bundle** — never put real secrets in it.

### Backend (`apps/api`)

| Variable | Where | Purpose |
|----------|-------|---------|
| `ENVIRONMENT` | `wrangler.toml` `[vars]` | Set to `production` |
| `FRONTEND_URL` | Wrangler secret (`wrangler secret put`) | Production frontend origin, added to the CORS allow-list |

Locally, CORS allows `http://localhost:5173` and `http://localhost:5175` automatically. `FRONTEND_URL` extends the allow-list for production.

## API reference

### `GET /health`

Returns `{ "status": "ok" }`.

### `GET /transcript/:videoId`

Fetches the English transcript for a YouTube video.

**Success (200):**
```json
{
  "videoId": "dQw4w9WgXcQ",
  "lines": [
    { "text": "Never gonna give you up", "start": 43.0, "duration": 2.12 }
  ]
}
```

**Errors:**

| Status | Code | Cause |
|--------|------|-------|
| 400 | `INVALID_VIDEO` | videoId isn't 11 chars / wrong format |
| 404 | `NO_TRANSCRIPT` | video has no English captions, or captions are disabled |
| 500 | `FETCH_FAILED` | upstream YouTube error or rate-limit |

## Building & deploying

### Backend → Cloudflare Workers

```bash
cd apps/api
npx wrangler login            # one-time
npx wrangler deploy
```

The deploy prints the Worker URL (e.g. `https://subtify-api.<subdomain>.workers.dev`). Then set the frontend origin so CORS allows your deployed site:

```bash
npx wrangler secret put FRONTEND_URL
# paste your production frontend URL, e.g. https://subtify.vercel.app
```

### Frontend → any static host

```bash
cd apps/web
pnpm build        # outputs to dist/
```

Deploy `dist/` to Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc. Set `VITE_API_URL` on the host to the Worker URL from the previous step.

## How transcript fetching actually works

YouTube's anonymous `timedtext` endpoint returns empty responses for most videos, and the watch-page caption URLs are gated behind a po-token. Subtify uses the [`youtube-transcript`](https://www.npmjs.com/package/youtube-transcript) package, which calls YouTube's innertube **ANDROID** player API to get a signed caption track URL, then parses the returned XML. This is currently the most reliable server-side approach, but it is a moving target — if YouTube changes the innertube contract, the package needs a bump.

Subtitles are fetched in English. If a video has no English track, the API returns `NO_TRANSCRIPT`.

## Conventions

- **No `any` types** — everything is typed, including the YouTube response shapes.
- **No `localStorage`** — session history lives only in Zustand memory.
- **No embedded player** — clicking a result opens YouTube in a new tab.
- **Only `VideoInput` calls the API** — every other component reads from the store.
- **Backend and frontend share no code** — types are duplicated by design at this scale.

## Disclaimer

Subtitles are sourced from YouTube's timedtext API. For personal and educational use only.
