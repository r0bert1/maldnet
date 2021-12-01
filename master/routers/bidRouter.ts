const router = require('express').Router()

router.post('/bid', (req: any, _res: any) => {
  const bid = req.body.bid
  console.log(`bid received: ${bid}`)
})

export default router
