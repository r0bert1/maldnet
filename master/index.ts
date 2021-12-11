import express from 'express'
import bodyParser from 'body-parser'
import bidRouter from './routers/bidRouter'
import axios from 'axios'

const app = express()

let servers: Array<string> = []

var frequency = 5000

setInterval(function () {
  servers.forEach((current) => {
    axios.get(`${current}/api/alive`).catch(() => {
      console.log(current, ' is not responding')
      servers = servers.filter((server) => server !== current)
    })
  })
  console.log('registered servers:')
  console.log(servers)
}, frequency)

app.use(bodyParser.json())

let current = 0

app.get('/', (_req, res) => {
  current === servers.length - 1 ? (current = 0) : current++
  res.redirect(servers[current])
})

app.post('/api/register', (req, res) => {
  const { port } = req.body
  const address = `http://localhost:${port}`
  if (!servers.includes(address)) {
    servers.push(`http://localhost:${port}`)
    res.send(`registered port ${port}`)
  }
})

app.use(bidRouter)

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
