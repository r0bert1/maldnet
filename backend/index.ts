import express from 'express'
import axios from 'axios'
// import config from './config.json'
const app = express()

import http from 'http'
import { Server } from 'socket.io'

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post('/announcement', (_req, _res) => {
  console.log('received')
})

app.get('/ping', async (_req, res) => {
  await axios
    .post('http://localhost:3003/announcement', {
      message: 'hello',
    })
    .then((res) => {
      console.log(`statusCode: ${res.status}`)
    })
    .catch((error) => {
      console.error(error)
    })

  res.send('pong')
})

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
