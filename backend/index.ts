import express from 'express'
const app = express()

import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
		credentials: true
	}
});

app.get('/', (_req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.get('/ping', (_req, res) => {
	res.send('pong')
})

io.on('connection', (socket) => {
	console.log('a user connected');
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

const PORT = 3001

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
});