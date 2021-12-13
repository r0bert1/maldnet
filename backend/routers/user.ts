import { insertUser, getAllUsers, getUser } from '../MongoClient'

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
  } catch (exception) {
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
  } catch (exception) {
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
      return
    }

    if (user[0].pwd === body.pwd) {
      console.log('correct credentials')
      const userInfo = { username: user[0].username, _id: user[0]._id }
      console.log(userInfo)
      res.json(userInfo)
    } else {
      console.log('incorrect credentials')
      res.status(401).end()
    }

  } catch (exception) {
    res.status(500).end()
    next(exception)
  }

})

module.exports = userRouter