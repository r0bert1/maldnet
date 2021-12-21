import express from 'express'
import axios from 'axios'
import path from 'path'
import http from 'http'
import { Server, Socket } from 'socket.io'
import dotenv from 'dotenv'
import ip from 'ip'
import { finalizeBid } from './MongoClient'
import { Item } from '../frontend/src/Interfaces'

import { fileLogger } from './utils/logger'

dotenv.config()

const cors = require('cors')
const bodyParser = require('body-parser')
const userRouter = require('./routers/user')
const getItemRouter = require('./routers/item')

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

const updateBid = (bid: Bid) => {
  if (bids[bid.itemId]?.sold) {
    return false
  }
  if (!bids[bid.itemId] || bids[bid.itemId]['amount'] < bid.amount) {
    bids[bid.itemId] = bid
    sockets.forEach((socket) => socket.emit('bid', bid))
    fileLogger('info', `Sent bid to other sockets: ${bid}`)
    return true
  }
  return false
}

const maxDate = (d1: Date | undefined, d2: Date) => {
  return !d1 ? d2 : d1 > d2 ? d1 : d2
}

app.use(cors())
//Parses body of posts to json
app.use(bodyParser.json())
app.use('/api/user', userRouter)
app.use(
  '/api/item',
  getItemRouter((item: any) => {
    var currentBid = bids[item._id] ?? null
    return {
      ...item,
      currentBid,
      buyTime: currentBid?.buyTime ?? item.buyTime,
    }
  })
)
app.use(express.static(path.resolve(__dirname, '../frontend/build')))

// Backend to backend bid message
app.post('/api/bid', (req, _res) => {
  req.body.timestamp = new Date(req.body.timestamp)
  req.body.buyTime = new Date(req.body.buyTime)
  updateBid(req.body)
  fileLogger('info', `Received bid: ${req.body}`)
})

// Health check from master
app.get('/api/health-check', (_req, res) => {
  res.send('Healthy!')
})

// 2PC Vote for bids to finalize
app.post('/api/finalize/vote', (req, res) => {
  const bidsToFinalize: Bid[] = req.body
  const currentTime = new Date()
  const confirmedBidItemIds = bidsToFinalize
    .filter(
      (bid) =>
        new Date(bid.buyTime) <= currentTime &&
        bid.amount === bids[bid.itemId].amount &&
        bid.userId === bids[bid.itemId].userId
    )
    .map((bid) => bid.itemId)
  res.json(confirmedBidItemIds)
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
    (bid) => bid.buyTime <= currentTime && !bid.sold
  )

  if (!bidsToFinalize.length) {
    return
  }

  console.log(`Starting 2PC to finalize ${bidsToFinalize.length} bids...`)
  fileLogger(
    'info',
    `Starting 2PC to finalize ${bidsToFinalize.length} bids...`
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
          fileLogger(
            'error',
            `Error trying to initiate 2PC for ${serverUrl}. Error: ${error}`
          )
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
    bidsToCommit = bidsToCommit.filter((bid) =>
      response.data.includes(bid.itemId)
    )
  }
  console.log(`${bidsToCommit.length} bids are agreed to be commited`)
  fileLogger('info', `${bidsToCommit.length} bids are agreed to be commited`)

  // 4) Commit, part 1
  if (bidsToCommit.length) {
    let promises = servers.map((serverUrl) =>
      axios.post(`${serverUrl}/api/finalize/commit`, bidsToCommit)
    )
    await Promise.all(promises)
  }
  // 5) Commit, part 2
  bidsToCommit.forEach((bid) => {
    bids[bid.itemId].sold = true
  })
  bidsToCommit.forEach(finalizeBid)
}, 2.5 * 1000)

app.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'))
})

io.on('connection', (socket) => {
  console.log('a user connected')
  fileLogger('info', `A user has connected to node`)
  for (var [id, value] of Object.entries(bids)) {
    socket.emit('bid', {
      _id: id,
      ...value,
    })
  }
  sockets.push(socket)
  socket.on(
    'bid',
    ({
      userId,
      itemId,
      amount,
    }: {
      userId: string
      itemId: string
      amount: number
    }) => {
      // Convert strings to Dates
      const timestamp = new Date()
      // Auction can't end until one minute has passed of previous bid
      const buyTime = new Date(timestamp.getTime() + 60 * 1000)

      const bid: Bid = {
        userId,
        itemId,
        amount,
        timestamp,
        buyTime: maxDate(bids[itemId]?.buyTime, buyTime),
        sold: false, // Checked earlier
      }

      if (updateBid(bid)) {
        fileLogger('info', `Received bid from user: ${bid}`)
        servers.forEach((server) => {
          axios.post(`${server}/api/bid`, bid).catch((err) => {
            console.error(`Error: could not send bid to ${server}`, err)
            fileLogger('error', `Error: could not send bid to ${server}`)
          })
        })
      }
    }
  )

  socket.on('disconnect', () => {
    console.log('user disconnected')
    fileLogger('info', 'User disconnected')
  })
})

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  fileLogger('info', `Server running on port ${PORT}`)
  const masterUrl = `http://${process.env.MASTER_ADDRESS}:3000/api/servers`
  await fetchBidsFromPeers(masterUrl)
  console.log('Server started successfully')
  fileLogger('info', 'Server started successfully')
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
        fileLogger(
          'error',
          `Error getting items from ${serverUrl}: error: ${error}`
        )
        return null
      })
    )
  }
  console.log(`Fetching bids from ${promises.length} peers...`)
  fileLogger('info', `Fetching bids from ${promises.length} peers...`)
  const reponses = await Promise.all(promises)

  // Merging bids
  for (const response of reponses) {
    if (!response) continue
    const serverBids: Bid[] = response.data
      .map((item: Item) =>
        item.currentBid
          ? {
              ...item.currentBid,
              buyTime: new Date(item.currentBid.buyTime),
              timestamp: new Date(item.currentBid.timestamp),
            }
          : null
      )
      .filter((bid: Bid | null) => bid != null)

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

const ADDRESS = ip.address()

// Health check to master
setInterval(() => {
  axios
    .post(`http://${process.env.MASTER_ADDRESS}:3000/api/health-check`, {
      address: `${ADDRESS}:${PORT}`,
    })
    .then((res) => {
      if (res.status === 201) {
        console.log('Successfully registered by master')
        fileLogger('info', 'Successfully registed by master')
      }
      servers = res.data
    })
    .catch(() => {
      console.error('Failed to connect to master')
      fileLogger('error', 'Failed to connect to master')
    })
}, 5 * 1000)
