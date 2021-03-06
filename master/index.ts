import express from 'express'
import bodyParser from 'body-parser'
import axios from 'axios'

import { fileLogger } from './utils/logger'

const app = express()

let servers: string[] = []

app.use(bodyParser.json())

let current = 0

app.get('/', (_req, res) => {
  current === servers.length - 1 ? (current = 0) : current++
  res.redirect(servers[current])
})

app.post('/api/health-check', (req, res) => {
  const { address } = req.body
  const otherServers = servers

  if (!servers.includes(address)) {
    servers.push(address)
    console.log('Registered ', address)
    fileLogger('info', `Registered server: ${address}`)
    console.log('Registered servers:', servers)
    fileLogger('info', `Registered servers: ${servers}`)
    return res.status(201).send(otherServers)
  }

  return res.send(otherServers)
})

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  fileLogger('info', `Server running on port: ${PORT}`)
})

setInterval(() => {
  servers.forEach((current) => {
    axios.get(`${current}/api/health-check`).catch(() => {
      console.log(current, ' is not responding')
      fileLogger('error', `${current} is not responding`)
      servers = servers.filter((server) => server !== current)
      console.log('Registered servers:', servers)
      fileLogger('info', `Registered servers: ${servers}`)
    })
  })
}, 5000)

app.get('/api/servers', (_req, res) => {
  res.json(servers)
})
