const itemRouter = require('express').Router()
const Item = require('../models/item')

itemRouter.get('/', async (_req: any, res: any, next: any) => {
  try {
    const items = await Item.find({})
    res.json(items.map((item: any ) => item.toJSON()))
  } catch (exception) {
    next(exception)
  }
})

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
    res.json('item received', item.toJSON())
  } catch (exception) {
    next(exception)
  }

})

module.exports = itemRouter