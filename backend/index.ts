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
    origin: `*`,
    methods: ['GET', 'POST'],
    credentials: false,
  },
})

let sockets: Socket[] = []
let bids: Record<string, { userId: string; amount: number; itemId: string }> =
  {}

const updateBid = (data: {
  itemId: string
  userId: string
  amount: number
}) => {
  if (!bids[data.itemId] || bids[data.itemId]['amount'] < data.amount) {
    bids[data.itemId] = {
      userId: data.userId,
      amount: data.amount,
      itemId: data.itemId,
    }
    sockets.forEach((socket) => socket.emit('bid', data))
  }
}

app.use(cors())
//Parses body of posts to json
app.use(bodyParser.json())
app.use('/api/item', itemRouter)
app.use(express.static(path.resolve(__dirname, '../frontend/build')))

app.post('/api/bid', (req, _res) => {
  updateBid(req.body)
  console.log(req.body)
})

app.get('api/alive', (_req, res) => {
  res.send(true)
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
        axios.post(`http://localhost:${port}/bid`, data).catch(() => {
          console.error(`Error: could not send bid to ${port}`)
        })
      })
  })
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)

  axios
    .post(`http://localhost:3000/api/register`, { port: PORT })
    .then(() => {
      console.log('Server successfully registered!')
    })
    .catch((error) => {
      console.error(error)
    })
})
