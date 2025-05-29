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
  // Uncomment if needed:
  // payload: {
  //   type: String, // hexadecimal string from the device
  //   required: true,
  // },
  // fcount: {
  //   type: Number,
  //   default: 0, // number of events triggered by the device
  // },
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
