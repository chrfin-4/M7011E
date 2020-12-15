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
    ],
    required: false
  },
  prosumerData: {
    banned: {
      type: Boolean,
      required: true
    },
    houseId: {
      type: Number,
      required: true
    }
  },
  managerData: {
    
  }
});

module.exports = mongoose.model('User', userSchema);