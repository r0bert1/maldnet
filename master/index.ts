import express from 'express'
import bodyParser from 'body-parser'
import bidRouter from './routers/bidRouter'
import axios from 'axios'

const app = express()

let servers: string[] = []

app.use(bodyParser.json())

let current = 0

app.get('/', (_req, res) => {
  current === servers.length - 1 ? (current = 0) : current++
  res.redirect(servers[current])
})

app.post('/api/health-check', (req, res) => {
  const { port } = req.body
  const server = `http://localhost:${port}`
  const otherServers = servers

  if (!servers.includes(server)) {
    servers.push(server)
    console.log('Registered ', server)
    console.log('Registered servers:', servers)
    return res.status(201).send(otherServers)
  }

  return res.send(otherServers)
})

app.use(bidRouter)

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

setInterval(() => {
  servers.forEach((current) => {
    axios.get(`${current}/api/health-check`).catch(() => {
      console.log(current, ' is not responding')
      servers = servers.filter((server) => server !== current)
      console.log('Registered servers:', servers)
    })
  })
}, 5000)

app.get('/api/servers', (_req, res) => {
  res.json(servers)
})
