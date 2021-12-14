import { insertItem, getAllItems } from '../MongoClient'

const Item = require('../models/item')
import { Item as FrontItem } from '../../frontend/src/Interfaces'

const getRouter = (itemMapper: (item: any) => FrontItem) => {
  const itemRouter = require('express').Router()

  //Gets all items from database. NOTE: not the bids
  itemRouter.get('/', async (_req: any, res: any, next: any) => {
    try {
      const items = await getAllItems()
      res.json(items.map(itemMapper));
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
      startAmount: body.startAmount,
      buyTime: body.buyTime,
      imageUrl: body.imageUrl
    })

    try {
      console.log('item received,', item.toJSON())
      res.json('item received')
      insertItem(item)
    } catch (exception) {
      next(exception)
    }

  })

  return itemRouter;
}

module.exports = getRouter