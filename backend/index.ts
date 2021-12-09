import express from 'express'
import axios from 'axios'
import config from './config.json'
import path from 'path'
import http from 'http'
import { Server, Socket } from 'socket.io'

const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const itemRouter = require('./routers/item')

const server = http.createServer(app)
const PORT = process.env.PORT || 3001
const io = new Server(server, {
  cors: {
    origin: `http://localhost:${Number(PORT) + 1}`,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

let sockets: Socket[] = []
let bids: Record<string, { userId: string; amount: number }> = {}

const updateBid = (data: {
  itemId: string
  userId: string
  amount: number
}) => {
  if (!bids[data.itemId] || bids[data.itemId]['amount'] < data.amount) {
    bids[data.itemId] = { userId: data.userId, amount: data.amount }
  }
}

app.use(cors())
app.use(bodyParser.json())
app.use('/api/item', itemRouter)
app.use(express.static(path.resolve(__dirname, '../frontend/build')))

app.post('/bid', (req, _res) => {
  updateBid(req.body)
})

app.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'))
})

io.on('connection', (socket) => {
  console.log('a user connected')
  sockets.push(socket)
  socket.on('bid', (data) => {
    updateBid(data)
    config.ports
      .filter((port) => port !== PORT)
      .forEach((port) => {
        axios
          .post(`http://localhost:${port}/bid`, data)
          .then((res) => {
            console.log(`statusCode: ${res.status}`)
          })
          .catch((error) => {
            console.error(error)
          })
      })
  })
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
