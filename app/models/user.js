const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  type: {
    type: Number,
    required: true
  },
  consumerData: {
    required: false
  },
  prosumerData: {
    banned: {
      type: Boolean,
      default: false
    },
    houseId: {
      type: Number,
      required: false,
      unique: true
    },
  },
  managerData: {
    powerplants: [
      {
        powerplantId: {
          type: String,
          required: true
        },
        name: {
          type: String,
          required: true
        }
      }
    ]
  }
});

module.exports = mongoose.model('User', userSchema);