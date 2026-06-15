import { cors } from 'hono/cors'
import { Hono } from 'hono'
import { transcriptRoute } from './routes/transcript'

interface Bindings {
  ENVIRONMENT?: string
  FRONTEND_URL?: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(
  '*',
  cors({
    origin: (origin, c) => {
      const allowed = ['http://localhost:5175']
      const frontendUrl = c.env.FRONTEND_URL
      if (frontendUrl) allowed.push(frontendUrl)
      return allowed.includes(origin) ? origin : null
    },
    allowMethods: ['GET'],
  })
)

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/transcript', transcriptRoute)

export default app
