const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const batterySchema = new Schema({
  charge: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Battery', batterySchema);