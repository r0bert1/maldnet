const router = require('express').Router()

router.post('/bid', (req,_res)=>{
  const bid = req.body.bid
  console.log(`bid received: ${bid}`)
})

export default router