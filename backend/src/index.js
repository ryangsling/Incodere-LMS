import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import supabase from './db/supabase.js'
import { generalLimiter, writeLimiter, expensiveLimiter } from './middleware/rateLimiters.js'
import { validationResult } from 'express-validator'
import courseRoutes from './routes/courses.js'
import organisationRoutes from './routes/organisations.js'
import enrolmentRoutes from './routes/enrolments.js'
import progressRoutes from './routes/progress.js'
import certificateRoutes from './routes/certificates.js'
import statsRoutes from './routes/stats.js'
import verifyRoutes from './routes/verify.js'
import authRoutes from './routes/auth.js'

const app = express()
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

app.set('trust proxy', 1)

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://*.supabase.co', 'https://i.ytimg.com', 'https://img.youtube.com'],
        connectSrc: ["'self'", 'https://*.supabase.co'],
        frameSrc: ['https://www.youtube.com', 'https://www.youtube-nocookie.com'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
)

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [FRONTEND_URL]

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowedOrigins.includes(origin)) return cb(null, true)
      return cb(new Error('CORS: origin not allowed'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false, limit: '100kb' }))

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'ilms-api', uptime: process.uptime() } })
})

app.get('/', (_req, res) => {
  res.json({ success: true, data: 'ILMS API running' })
})

app.use(generalLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/verify', verifyRoutes)

app.use('/api/courses', courseRoutes)
app.use('/api/organisations', organisationRoutes)
app.use('/api/enrolments', enrolmentRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/certificates', certificateRoutes)
app.use('/api/stats', statsRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' })
})

app.use((err, req, res, _next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: 'Request body too large' })
  }
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ success: false, error: 'Origin not allowed' })
  }
  console.error(err)
  res.status(500).json({ success: false, error: 'Internal server error' })
})

const server = app.listen(PORT, () => {
  console.log(`ILMS API running on port ${PORT}`)
})

const shutdown = (signal) => {
  console.log(`Received ${signal}, shutting down gracefully`)
  server.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
  setTimeout(() => {
    console.error('Forced shutdown after 10s')
    process.exit(1)
  }, 10000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

export { app }
