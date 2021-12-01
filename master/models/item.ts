import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required:true
  },
  description: {
    type: String
  },
  startAmount: {
    type: Number,
    required: true
  },
  buyAmount: {
    type: Number
  },
  buyTime: {
    type: Date
  },
  imageUrl: {
    type: String
  }
})

itemSchema.set('toJSON', {
  transform:(_document, retObj) => {
    retObj.id = retObj._id.toString()
    delete retObj._id
    delete retObj.__v
  }
})

module.exports = mongoose.model('Item', itemSchema)