const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  authkey: {
    type: String,
    required: true
  },
  type: {
    type: Number,
    required: true
  },
  consumerData: {
    type: [
      {
        type: Number,
        required: true
      }
    ],
    required: false
  },
  prosumerData: {
    battery: {
      type: Schema.Types.ObjectId,
      ref: 'Battery'
    }
  },
  managerData: {
    
  }
});

module.exports = mongoose.model('User', userSchema);