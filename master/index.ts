import express from 'express'
import bidRouter from './routers/bidRouter'
const app = express()

app.get('/ping', (_req,res)=> {
  res.send('pong')
})

app.get('/', (_req,res)=> {
  res.send('Hello world!')
})

app.use(bidRouter)

const PORT = 3001

app.listen(PORT, ()=> {
  console.log(`Server running on port ${PORT}`)
})