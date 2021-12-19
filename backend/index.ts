import express from 'express'
import axios from 'axios'
import path from 'path'
import http from 'http'
import { Server, Socket } from 'socket.io'
import dotenv from 'dotenv'
import { finalizeBid } from './MongoClient'

dotenv.config()

const cors = require('cors')
const bodyParser = require('body-parser')
const userRouter = require('./routers/user')
const getRouter = require('./routers/item')

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3001
const io = new Server(server, {
  cors: {
    origin: `*`,
    methods: ['GET', 'POST'],
    credentials: false,
  },
})

interface Bid {
  userId: string
  amount: number
  itemId: string
  timestamp: Date
  buyTime: Date
  sold: boolean
}

let servers: string[] = []
let sockets: Socket[] = []
let bids: Record<string, Bid> = {}

const updateBid = (data: Bid) => {
  if (!bids[data.itemId] || bids[data.itemId]['amount'] < data.amount) {
    bids[data.itemId] = {
      userId: data.userId,
      amount: data.amount,
      itemId: data.itemId,
      timestamp: data.timestamp,
      buyTime: data.buyTime,
      sold: false,
    }
    sockets.forEach((socket) => socket.emit('bid', data))
  }
}

app.use(cors())
//Parses body of posts to json
app.use(bodyParser.json())
app.use('/api/user', userRouter)
app.use(
  '/api/item',
  getRouter((item: any) => {
    var currentBid
    if (bids[item.itemId])
      currentBid = {
        ...bids[item.itemId],
      }
    else
      currentBid = {
        itemId: item.itemId,
        userId: item.userId,
        amount: item.startAmount,
        timestamp: null,
        buyTime: item.buyTime,
      }
    return {
      ...item,
      currentBid,
      buyTime: currentBid.buyTime,
    }
  })
)
app.use(express.static(path.resolve(__dirname, '../frontend/build')))

app.post('/api/bid', (req, _res) => {
  if (bids[req.body.itemId]?.sold) {
    return
  }
  updateBid(req.body)
})

// Health check from master
app.get('/api/health-check', (_req, res) => {
  res.send('Healthy!')
})

// 2PC Vote for bids to finalize
app.post('/api/finalize/vote', (req, res) => {
  const bidsToFinalize: Bid[] = req.body
  const currentTime = new Date()
  const confirmedBids = bidsToFinalize.filter(
    (bid) =>
      bid.buyTime < currentTime &&
      bid.amount === bids[bid.itemId].amount &&
      bid.userId === bids[bid.itemId].userId
  )
  res.json(confirmedBids)
})

// Finalize bids given
app.post('/api/finalize/commit', (req, _res) => {
  const bidsToCommit: Bid[] = req.body
  bidsToCommit.forEach((bid) => {
    bids[bid.itemId].sold = true
  })
})

setInterval(async () => {
  const currentTime = new Date()
  let bidsToFinalize = Object.values(bids).filter(
    (bid) => bid.buyTime < currentTime && !bid.sold
  )

  // Two phase commit :)
  // Let's make sure everyone agrees that the bid should be finalized
  // 1) Query to commit
  let promises = servers.map(
    (serverUrl) =>
      axios
        .post(`${serverUrl}/api/finalize/vote`, bidsToFinalize)
        .catch((error) => {
          console.log(`Error trying to initiate 2PC for ${serverUrl}`, error)
          return null
        })
    // TODO: what if two backends send the same 2PC?
  )
  const responses = await Promise.all(promises)

  // 3) Choose to commit or rollback
  let bidsToCommit = bidsToFinalize
  for (const response of responses) {
    if (!response) {
      bidsToCommit = []
      break
    }
    bidsToCommit = bidsToCommit.filter((value) => response.data.includes(value))
  }

  // 4) Commit, part 1
  if (bidsToCommit.length) {
    let promises = servers.map((serverUrl) =>
      axios.post(`${serverUrl}/api/finalize/commit`, bidsToCommit)
    )
    await Promise.all(promises)
  }
  // 5) Commit, part 2
  bidsToCommit.forEach(finalizeBid)
}, 10 * 1000)

app.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'))
})

io.on('connection', (socket) => {
  console.log('a user connected')
  for (var [id, value] of Object.entries(bids)) {
    socket.emit('bid', {
      _id: id,
      ...value,
    })
  }
  sockets.push(socket)
  socket.on('bid', (data) => {
    if (bids[data.itemId]?.sold) {
      return
    }
    updateBid(data)
    servers.forEach((server) => {
      axios.post(`${server}/api/bid`, data).catch(() => {
        console.error(`Error: could not send bid to ${server}`)
      })
    })
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  const masterUrl = `http://${process.env.MASTER_ADDRESS}:3000/api/servers`
  await fetchBidsFromPeers(masterUrl)
  console.log('Server started successfully')
})

async function fetchBidsFromPeers(url: string) {
  // Fetching list of peers
  const serverUrls = (await axios.get(url)).data

  // Fetching bids from peers
  const promises = []
  for (const serverUrl of serverUrls) {
    const itemUrl = `${serverUrl}/api/item`
    promises.push(
      axios.get(itemUrl).catch((error) => {
        console.log(`Error getting items from ${serverUrl}`, error)
        return null
      })
    )
  }
  console.log(`Fetching bids from ${promises.length} peers...`)
  const reponses = await Promise.all(promises)

  // Merging bids
  for (const response of reponses) {
    if (!response) continue
    const serverBids = response.data.map((item: any) => item.currentBid)
    mergeObjects(bids, recordify(serverBids), (bid: Bid, serverBid: Bid) => {
      if (bid.amount > serverBid.amount) return bid
      if (bid.amount < serverBid.amount) return serverBid
      // amount is equal, let's see who was first
      if (bid.timestamp > serverBid.timestamp) return serverBid
      return bid // It is very unlikely that two different bids share a timestamp :)
    })
  }
}

function recordify<V extends { itemId: string }>(arr: V[]): Record<string, V> {
  const returnValue: any = {}
  for (const v of arr) {
    returnValue[v.itemId] = v
  }
  return returnValue
}

// merges rec2 into rec1 in-place
function mergeObjects<V>(
  rec1: Record<string, V>,
  rec2: Record<string, V>,
  mf: (o1: V, o2: V) => V
) {
  for (const [key, value] of Object.entries(rec2)) {
    rec1[key] = rec1[key] ? mf(rec1[key], value) : value
  }
}

// Health check to master
setInterval(() => {
  axios
    .post(`http://${process.env.MASTER_ADDRESS}:3000/api/health-check`, {
      port: PORT,
    })
    .then((res) => {
      if (res.status === 201) console.log('Successfully registered by master')
      servers = res.data
    })
    .catch(() => {
      console.error('Failed to connect to master')
    })
}, 5 * 1000)
