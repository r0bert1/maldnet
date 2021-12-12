import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  pwd: {
    type: String,
    required: true
  }

})

userSchema.set('toJSON', {
  transform:(_document, retObj) => {
    retObj.id = retObj._id.toString()
    delete retObj._id
    delete retObj.__v
  }
})

module.exports = mongoose.model('User', userSchema)