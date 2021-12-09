import express from 'express'
import bidRouter from './routers/bidRouter'

const app = express()

const servers = ['http://localhost:3001', 'http://localhost:3003']
let current = 0

app.get('/', (_req, res) => {
  current === servers.length - 1 ? (current = 0) : current++
  res.redirect(servers[current])
})

app.use(bidRouter)

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
