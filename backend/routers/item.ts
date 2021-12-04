const itemRouter = require('express').Router()
const Item = require('../models/item')

itemRouter.get('/', async (_req: any, res: any, next: any) => {
  try {
    const items = [{
		id: '1',
		seller: '123781273126783',
		name: 'Wiggie',
		description: 'This wig is most wiggy thing on earth',
		startAmount: 10,
	},{
		id: '2',
		seller: '812371263781',
		name: 'Beruuggi',
		description: 'Onpas hyvännäköinen!',
		startAmount: 123,
	}] // await Item.find({})
    res.json(items);
  } catch (exception) {
    next(exception)
  }
})

itemRouter.get('/:id', async (_req: any, res: any, next: any) => {
	try {
	  const items = [{
		  id: '1',
		  seller: '123781273126783',
		  name: 'Wiggie',
		  description: 'This wig is most wiggy thing on earth',
		  startAmount: 10,
	  },{
		  id: '2',
		  seller: '812371263781',
		  name: 'Beruuggi',
		  description: 'Onpas hyvännäköinen!',
		  startAmount: 123,
	  }] // await Item.find({})
	  res.json(items[_req.params.id - 1]);
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
    res.json('item received')
  } catch (exception) {
    next(exception)
  }

})

module.exports = itemRouter