import express from 'express'
import axios from 'axios'
import config from './config.json'
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')

import http from 'http'
import { Server } from 'socket.io'

const itemRouter = require('./routers/item')

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

app.use(cors())
app.use(bodyParser.json())
app.use('/api/item', itemRouter)

app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post('/bid', (req, _res) => {
  console.log(req.body)
})

app.get('/ping', async (_req, res) => {
  res.send('pong')
})

const PORT = process.env.PORT || 3001

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('bid', (data) => {
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
