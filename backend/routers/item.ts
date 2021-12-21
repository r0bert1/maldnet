import { insertItem, getAllItems } from '../MongoClient'

const Item = require('../models/item')
import { Item as FrontItem } from '../../frontend/src/Interfaces'
import { fileLogger } from '../utils/logger'

const getItemRouter = (itemMapper: (item: any) => FrontItem) => {
  const itemRouter = require('express').Router()

  //Gets all items from database. NOTE: not the bids
  itemRouter.get('/', async (_req: any, res: any, next: any) => {
    try {
      const items = await getAllItems()
      res.json(items.map(itemMapper));
      fileLogger('info', 'Fetched items')
    } catch (exception) {
      fileLogger('error', `Error while fetching items: ${exception}`)
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
      startAmount: body.startAmount,
      buyTime: body.buyTime,
      imageUrl: body.imageUrl
    })

    try {
      console.log('item received,', item.toJSON())
      res.json('item received')
      insertItem(item)
      fileLogger('info', `Item inserted: ${item}`)
    } catch (exception) {
      fileLogger('error', `Error while inserting item: ${exception}`)
      next(exception)
    }

  })

  return itemRouter;
}

module.exports = getItemRouter