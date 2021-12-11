import { insertItem, getAllItems } from '../MongoClient'

const itemRouter = require('express').Router()
const Item = require('../models/item')

//Gets all items from database. NOTE: not the bids
itemRouter.get('/', async (_req: any, res: any, next: any) => {
  try {
	const items = await getAllItems()
    res.json(items);
  } catch (exception) {
    next(exception)
  }
})

//Add a new item to database
itemRouter.post('/', async (req: any, res: any, next: any) => {
  const { body } = req

  const item = new Item({
    seller: body.seller,
    name: body.name,
    description: body.description,
    startAmount: body.startAmount
  })

  try {
    console.log('item received,', item.toJSON())
    res.json('item received')
	insertItem(item)
  } catch (exception) {
    next(exception)
  }

})

module.exports = itemRouter