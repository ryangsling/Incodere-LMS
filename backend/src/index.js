import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { createClient } from '@supabase/supabase-js'
import { validationResult } from 'express-validator'
import courseRoutes from './routes/courses.js'
import organisationRoutes from './routes/organisations.js'

const app = express()
const PORT = process.env.PORT || 3000

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))

app.get('/', (req, res) => {
  res.json({ success: true, data: 'ILMS API running' })
})

app.use('/api/courses', courseRoutes)
app.use('/api/organisations', organisationRoutes)

app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: 'Request body too large' })
  }
  console.error(err)
  res.status(500).json({ success: false, error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`ILMS API running on port ${PORT}`)
})

export { app, supabase }
