import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db'
import measureRoutes from './routes/measureRoutes'
import bodyParser from 'body-parser'
import path from 'path'

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' })
}
connectDB()

const app = express()
const PORT = process.env.PORT || 8080

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

app.use('/temp', express.static(path.join(__dirname, '..', 'temp')))

app.use('/api/measures', measureRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
