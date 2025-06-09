const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deveui: {
    type: String,
    required: true,
  },
  creatorId: {
    type: String,
    required: true,
  },
  locationTags: {
    type: [String], 
    validate: [arr => arr.length <= 4, '{PATH} exceeds the limit of 4'],
    default: [],
  },
  device_type: {
    type: String,
    required: true,
  },
  record_type: {
    type: String,
    required: true,
  },
  createDate: {
    type: Date,
    default: Date.now,
  },
  updateDate: {
    type: Date,
    default: Date.now,
  }
});

const DeviceDC = mongoose.model('DeviceDC', deviceSchema);

module.exports = DeviceDC;
