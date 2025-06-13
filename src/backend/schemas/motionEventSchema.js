const mongoose = require('mongoose');

const motionEventSchema = new mongoose.Schema({
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
  payload: {
    type: String, // hexadecimal string from the device
    required: true,
  },
  fcount: {
    type: Number,
    default: 0, // number of events triggered by the device
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

const motionEvent = mongoose.model('motionEvent', motionEventSchema);

module.exports = motionEvent;
