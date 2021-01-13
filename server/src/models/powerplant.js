const { modifyObjectFields } = require('graphql-tools');
const mongoose = require('mongoose');
const { model } = require('./battery');

const Schema = mongoose.Schema;

const powerplantSchema = new Schema({
  name: {
    type: String,
    required: true
  },

});

module.exports = powerplantSchema;