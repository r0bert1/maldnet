import express from 'express'
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')

import http from 'http';
import { Server } from 'socket.io';

const itemRouter = require('./routers/item')

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
		credentials: true
	}
});


app.use(cors())
app.use(bodyParser.json())
app.use('/api/item', itemRouter)

app.get('/', (_req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.get('/ping', (_req, res) => {
	res.send('pong')
})

io.on('connection', (socket) => {
	console.log('a user connected');
	socket.on('bid', console.log);
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

const PORT = 3001

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
});