const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
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
  image: {
    type: String,
    required: false
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
      index: {
        unique: true,
        partialFilterExpression: {
          houseId: {
            $type: Number
          }
        }
      }
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