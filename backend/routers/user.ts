import { insertUser, getAllUsers, getUser } from '../MongoClient'
import { fileLogger } from '../utils/logger'

const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.get('/', async (_req: any, res: any, next: any) => {
  try {
    const users = await getAllUsers()
    const cleanedUsers = users.map((user: any) => {
      return {
        username: user.username,
        _id: user._id
      }
    })
    res.json(cleanedUsers)
    fileLogger('info', 'User list fetched')
  } catch (exception) {
    fileLogger('error', `Error while fetching user list: ${exception}`)
    next(exception)
  }
})

userRouter.post('/', async (req: any, res: any, next: any) => {
  const { body } = req

  const user = new User({
    username: body.username,
    pwd: body.pwd
  })

  try {
    console.log('user registered', user)
    insertUser(user)
    res.json('user registered')
    fileLogger('info', 'New user registered')
  } catch (exception) {
    fileLogger('error', `Error while creating user: ${exception}`)
    next(exception)
  }

})

userRouter.post('/login', async (req: any, res: any, next: any) => {
  try {
    const { body } = req
    const user = await getUser(body.username)

    if (!user[0]) {
      console.log('incorrect credentials')
      res.status(401).end()
      fileLogger('info', 'Login failed due to incorrect credentials')
      return
    }

    if (user[0].pwd === body.pwd) {
      console.log('correct credentials')
      const userInfo = { username: user[0].username, _id: user[0]._id }
      console.log(userInfo)
      res.json(userInfo)
      fileLogger('info', 'Login successful')
    } else {
      console.log('incorrect credentials')
      res.status(401).end()
      fileLogger('info', 'Login failed due to incorrect credentials')
    }

  } catch (exception) {
    res.status(500).end()
    fileLogger('error', `Error while logging in: ${exception}`)
    next(exception)
  }

})

module.exports = userRouter