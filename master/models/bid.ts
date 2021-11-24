import mongoose from 'mongoose'

const bidSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  wig_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wig'
  }
})

bidSchema.set('toJSON', {
  transform:(document, retObj) => {
    retObj.id = retObj._id.toString()
    delete retObj._id
    delete retObj.__v
  }
})

module.exports = mongoose.model('Bid', bidSchema)