import express from 'express'
import axios from 'axios'
import path from 'path'
import http from 'http'
import { Server, Socket } from 'socket.io'
import dotenv from 'dotenv'

import { fileLogger } from './utils/logger'

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
	userId: string,
	amount: number,
	itemId: string,
	timestamp: Date,
	buyTime: Date
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
			buyTime: data.buyTime
		}
		sockets.forEach((socket) => socket.emit('bid', data))
		fileLogger('info', `Sent bid to other sockets: ${data}`)
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
				...bids[item.itemId]
			}
		else
			currentBid = {
				itemId: item.itemId,
				userId: item.userId,
				amount: item.startAmount,
				timestamp: null,
			}
		return {
			...item,
			currentBid,
		}
	})
)
app.use(express.static(path.resolve(__dirname, '../frontend/build')))

app.post('/api/bid', (req, _res) => {
	updateBid(req.body)
	fileLogger('info', `Received bid: ${req.body}`)
})

// Health check from master
app.get('/api/health-check', (_req, res) => {
	res.send('Healthy!')
})

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
	socket.on('bid', (data) => {
		updateBid(data)
		fileLogger('info', `Received bid from user: ${data}`)
		servers.forEach((server) => {
			axios.post(`${server}/api/bid`, data).catch(() => {
				console.error(`Error: could not send bid to ${server}`)
				fileLogger('error', `Error: could not send bid to ${server}`)
			})
		})
	})

	socket.on('disconnect', () => {
		console.log('user disconnected')
		fileLogger('info', 'User disconnected')
	})
})

server.listen(PORT, async () => {
	console.log(`Server running on port ${PORT}`)
	fileLogger('info', `Server running on port ${PORT}`)
	const masterUrl = `http://${process.env.MASTER_ADDRESS}:3000/api/servers`
	await fetchBidsFromPeers(masterUrl);
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
		promises.push(axios.get(itemUrl).catch(error => {
			console.log(`Error getting items from ${serverUrl}`, error);
			fileLogger('error', `Error getting items from ${serverUrl}: error: ${error}`)
			return null;
		}))
	}
	console.log(`Fetching bids from ${promises.length} peers...`)
	fileLogger('info', `Fetching bids from ${promises.length} peers...`)
	const reponses = await Promise.all(promises);

	// Merging bids
	for (const response of reponses) {
		if (!response)
			continue;
		const serverBids = response.data.map((item: any) => item.currentBid);
		mergeObjects(bids, recordify(serverBids), (bid: Bid, serverBid: Bid) => {
			if (bid.amount > serverBid.amount) return bid;
			if (bid.amount < serverBid.amount) return serverBid;
			// amount is equal, let's see who was first
			if (bid.timestamp > serverBid.timestamp) return serverBid;
			return bid; // It is very unlikely that two different bids share a timestamp :)
		})
	}
}

function recordify<V extends { itemId: string }>(arr: V[]): Record<string, V> {
	const returnValue: any = {};
	for (const v of arr) {
		returnValue[v.itemId] = v;
	}
	return returnValue
}

// merges rec2 into rec1 in-place 
function mergeObjects<V>(rec1: Record<string, V>, rec2: Record<string, V>, mf: (o1: V, o2: V) => V) {
	for (const [key, value] of Object.entries(rec2)) {
		rec1[key] = rec1[key] ? mf(rec1[key], value) : value;
	}
}

// Health check to master
setInterval(() => {
	axios
		.post(`http://${process.env.MASTER_ADDRESS}:3000/api/health-check`, { port: PORT })
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