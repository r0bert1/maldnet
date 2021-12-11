import { insertUser, getAllUsers } from '../MongoClient'

const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.get('/', async (_req: any, res: any, next: any) => {
  try {
    const users = await getAllUsers()
    res.json(users)
  } catch (exception) {
    next(exception)
  }
})

userRouter.post('/', async (req: any, res: any, next: any) => {
  const { body } = req

  const user = new User({
    username: body.userName,
    pwd: body.pwd
  })

  try {
    console.log('user registered')
    res.json('user registered')
    insertUser(user)
  } catch (exception) {
    next(exception)
  }

})

module.exports = userRouter